import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeProjectTotals } from "@/lib/calculations";
import { TotalsBar } from "@/components/trades/totals-bar";
import { TradeList } from "@/components/trades/trade-list";
import { AddTradeForm } from "@/components/trades/add-trade-form";
import { Button } from "@/components/ui/button";
import { Receipt, Settings, Users, Wallet } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: project }, { data: membership }, { data: trades }, { data: companies }, { data: totalsRow }] =
    await Promise.all([
      supabase.from("projects").select("id, name, address, sqft").eq("id", projectId).single(),
      supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", user?.id ?? "")
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("trades")
        .select(
          "id, name, qty, sort_order, bids(id, company_id, amount, status, is_winner, notes, company:companies(name))"
        )
        .eq("project_id", projectId)
        .order("name", { ascending: true }),
      supabase.from("companies").select("id, name").is("archived_at", null).order("name"),
      supabase.from("project_totals").select("grand_total").eq("project_id", projectId).maybeSingle(),
    ]);

  if (!project) notFound();

  const canEdit = membership?.role === "owner" || membership?.role === "editor";
  const totals = computeProjectTotals(totalsRow?.grand_total ?? 0, project.sqft);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          {project.address && <p className="mt-1 text-sm text-muted-foreground">{project.address}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/admin/projects/${projectId}/ledger`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Wallet className="h-4 w-4" /> Ledger
          </Button>
          <Button
            render={<Link href={`/admin/projects/${projectId}/expenses`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Receipt className="h-4 w-4" /> Expenses
          </Button>
          <Button
            render={<Link href={`/admin/projects/${projectId}/members`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Users className="h-4 w-4" /> Members
          </Button>
          {membership?.role === "owner" && (
            <Button
              render={<Link href={`/admin/projects/${projectId}/settings`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4" /> Settings
            </Button>
          )}
        </div>
      </div>

      <TotalsBar totals={totals} />

      <h2 className="text-sm font-medium text-muted-foreground">Products/Services</h2>

      <TradeList
        projectId={projectId}
        trades={(trades ?? []).map((trade) => ({
          id: trade.id,
          name: trade.name,
          qty: trade.qty,
          bids: (trade.bids ?? []).map((b) => ({
            id: b.id,
            company_id: b.company_id,
            company_name: b.company?.name ?? null,
            amount: b.amount,
            status: b.status,
            is_winner: b.is_winner,
            notes: b.notes,
          })),
        }))}
        companies={companies ?? []}
        canEdit={canEdit}
      />

      {canEdit && <AddTradeForm projectId={projectId} />}
    </div>
  );
}
