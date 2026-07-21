import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, FileStack } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseTable, type ExpenseListItem } from "@/components/expenses/expense-table";
import { GenerateInvoiceDialog } from "@/components/expenses/generate-invoice-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/calculations";
import type { InvoiceStatus } from "@/lib/types";

const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; variant: "outline" | "secondary" | "default" }> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
};

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: project }, { data: membership }, { data: expenseRows }, { data: invoices }] =
    await Promise.all([
      supabase.from("projects").select("id, name, builder_fee_percent").eq("id", projectId).single(),
      supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", user?.id ?? "")
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("expenses")
        .select(
          "id, expense_date, category, vendor_name, description, amount, billable, paid_status, invoice_file_path, invoice_file_name, invoice_id"
        )
        .eq("project_id", projectId)
        .order("expense_date", { ascending: false }),
      supabase
        .from("monthly_invoices")
        .select("id, period_start, period_end, status, subtotal, builder_fee_amount, total")
        .eq("project_id", projectId)
        .order("period_start", { ascending: false }),
    ]);

  if (!project) notFound();

  const canEdit = membership?.role === "owner" || membership?.role === "editor";

  const expenses: ExpenseListItem[] = await Promise.all(
    (expenseRows ?? []).map(async (e) => {
      let fileUrl: string | null = null;
      if (e.invoice_file_path) {
        const { data } = await supabase.storage
          .from("expense-invoices")
          .createSignedUrl(e.invoice_file_path, 3600);
        fileUrl = data?.signedUrl ?? null;
      }
      return {
        id: e.id,
        expense_date: e.expense_date,
        category: e.category,
        vendor_name: e.vendor_name,
        description: e.description,
        amount: Number(e.amount),
        billable: e.billable,
        paid_status: e.paid_status,
        invoice_file_name: e.invoice_file_name,
        fileUrl,
        invoiced: e.invoice_id !== null,
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin/projects/${projectId}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {project.name}
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.name} · Builder fee {project.builder_fee_percent}%
          </p>
        </div>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="invoices">Monthly Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4 flex flex-col gap-4">
          {canEdit && (
            <div className="flex justify-end">
              <ExpenseForm
                projectId={projectId}
                trigger={
                  <Button type="button">
                    <Plus className="h-4 w-4" /> Add expense
                  </Button>
                }
              />
            </div>
          )}
          <ExpenseTable projectId={projectId} expenses={expenses} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4 flex flex-col gap-4">
          {canEdit && (
            <div className="flex justify-end">
              <GenerateInvoiceDialog
                projectId={projectId}
                trigger={
                  <Button type="button">
                    <FileStack className="h-4 w-4" /> Generate invoice
                  </Button>
                }
              />
            </div>
          )}
          {!invoices?.length ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                <FileStack className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No monthly invoices generated yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {invoices.map((invoice) => {
                const meta = INVOICE_STATUS_META[invoice.status];
                return (
                  <Link key={invoice.id} href={`/admin/projects/${projectId}/expenses/invoices/${invoice.id}`}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                      <CardContent className="flex items-center justify-between gap-4 py-4">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(`${invoice.period_start}T00:00:00`).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(invoice.subtotal)} + {formatCurrency(invoice.builder_fee_amount)} fee
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                          <span className="text-sm font-semibold">{formatCurrency(invoice.total)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
