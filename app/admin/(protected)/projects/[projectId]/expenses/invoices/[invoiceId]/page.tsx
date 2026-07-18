import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InvoiceStatusActions } from "@/components/expenses/invoice-status-actions";
import { PrintButton } from "@/components/expenses/print-button";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORY_META, formatCurrency, formatCurrencyPrecise } from "@/lib/calculations";
import type { ExpenseCategory, InvoiceStatus } from "@/lib/types";

const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; variant: "outline" | "secondary" | "default" }> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
};

export default async function InvoiceReportPage({
  params,
}: {
  params: Promise<{ projectId: string; invoiceId: string }>;
}) {
  const { projectId, invoiceId } = await params;
  const supabase = await createClient();

  const [{ data: invoice }, { data: project }, { data: expenseRows }] = await Promise.all([
    supabase
      .from("monthly_invoices")
      .select(
        "id, project_id, period_start, period_end, status, subtotal, builder_fee_percent, builder_fee_amount, total, sent_at, paid_at"
      )
      .eq("id", invoiceId)
      .eq("project_id", projectId)
      .single(),
    supabase.from("projects").select("id, name, address").eq("id", projectId).single(),
    supabase
      .from("expenses")
      .select("id, expense_date, category, vendor_name, description, amount, invoice_file_path, invoice_file_name")
      .eq("invoice_id", invoiceId)
      .order("category")
      .order("expense_date"),
  ]);

  if (!invoice || !project) notFound();

  const expensesWithUrls = await Promise.all(
    (expenseRows ?? []).map(async (e) => {
      let fileUrl: string | null = null;
      if (e.invoice_file_path) {
        const { data } = await supabase.storage
          .from("expense-invoices")
          .createSignedUrl(e.invoice_file_path, 3600);
        fileUrl = data?.signedUrl ?? null;
      }
      return { ...e, fileUrl };
    })
  );

  const grouped = new Map<ExpenseCategory, typeof expensesWithUrls>();
  for (const e of expensesWithUrls) {
    const list = grouped.get(e.category) ?? [];
    list.push(e);
    grouped.set(e.category, list);
  }

  const periodLabel = new Date(`${invoice.period_start}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const statusMeta = INVOICE_STATUS_META[invoice.status];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href={`/admin/projects/${projectId}/expenses`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to expenses
        </Link>
        <div className="flex items-center gap-2">
          <PrintButton />
          <InvoiceStatusActions projectId={projectId} invoiceId={invoiceId} status={invoice.status} />
        </div>
      </div>

      <div className="flex flex-col gap-8 rounded-xl border bg-card p-8 print:border-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Willow Homes</h1>
            <p className="mt-1 text-sm text-muted-foreground">Monthly Progress Invoice</p>
          </div>
          <Badge variant={statusMeta.variant} className="print:hidden">
            {statusMeta.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Project</p>
            <p className="font-medium">{project.name}</p>
            {project.address && <p className="text-muted-foreground">{project.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Billing period</p>
            <p className="font-medium">{periodLabel}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {EXPENSE_CATEGORY_META[category].label}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 text-muted-foreground">{item.expense_date}</td>
                      <td className="py-2 pr-2">{item.vendor_name ?? "—"}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{item.description ?? ""}</td>
                      <td className="py-2 pr-2 print:hidden">
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" /> {item.invoice_file_name ?? "Invoice"}
                          </a>
                        )}
                      </td>
                      <td className="py-2 text-right font-medium">{formatCurrencyPrecise(Number(item.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {expensesWithUrls.length === 0 && (
            <p className="text-sm text-muted-foreground">No billable expenses were logged for this period.</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 border-t pt-4 text-sm">
          <div className="flex w-56 justify-between">
            <span className="text-muted-foreground">Cost of the Work</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex w-56 justify-between">
            <span className="text-muted-foreground">Builder Fee ({invoice.builder_fee_percent}%)</span>
            <span>{formatCurrency(invoice.builder_fee_amount)}</span>
          </div>
          <div className="flex w-56 justify-between border-t pt-1 text-base font-semibold">
            <span>Total Due</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
