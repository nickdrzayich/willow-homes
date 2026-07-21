import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/ledger/transaction-form";
import { TransactionTable } from "@/components/ledger/transaction-table";
import { Button } from "@/components/ui/button";

export default async function LedgerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: project }, { data: membership }, { data: transactions }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).single(),
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("account_transactions")
      .select("id, transaction_date, type, amount, description")
      .eq("project_id", projectId)
      .order("transaction_date", { ascending: false }),
  ]);

  if (!project) notFound();

  const canEdit = membership?.role === "owner" || membership?.role === "editor";

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
          <h1 className="text-2xl font-semibold tracking-tight">Deposits &amp; Withdrawals</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.name} · Project bank account</p>
        </div>
        {canEdit && (
          <TransactionForm
            projectId={projectId}
            trigger={
              <Button type="button">
                <Plus className="h-4 w-4" /> Add entry
              </Button>
            }
          />
        )}
      </div>

      <TransactionTable projectId={projectId} transactions={transactions ?? []} canEdit={canEdit} />
    </div>
  );
}
