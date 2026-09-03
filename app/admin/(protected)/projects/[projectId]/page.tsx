import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeProjectTotals } from "@/lib/calculations";
import { TotalsBar } from "@/components/trades/totals-bar";
import { TradeList } from "@/components/trades/trade-list";
import { AddTradeForm } from "@/components/trades/add-trade-form";
import { Button } from "@/components/ui/button";
import { ClipboardList, NotebookText, Receipt, Settings, Users, Wallet } from "lucide-react";

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

  const [
    { data: project },
    { data: membership },
    { data: trades },
    { data: companies },
    { data: totalsRow },
    { data: categories },
  ] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, address, sqft, use_custom_trade_order")
        .eq("id", projectId)
        .single(),
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
          "id, name, qty, sort_order, description, trade_images(id, storage_path, file_name, sort_order), bids(id, company_id, amount, status, is_winner, notes, file_path, file_name, company:companies(name, company_contacts(id, name, phone, email)))"
        )
        .eq("project_id", projectId),
      supabase.from("companies").select("id, name").is("archived_at", null).order("name"),
      supabase.from("project_totals").select("grand_total").eq("project_id", projectId).maybeSingle(),
      supabase.from("categories").select("id, name").order("name"),
    ]);

  if (!project) notFound();

  const sortedTrades = (trades ?? []).slice().sort((a, b) =>
    project.use_custom_trade_order ? a.sort_order - b.sort_order : a.name.localeCompare(b.name)
  );

  const allImagePaths = sortedTrades.flatMap((t) => (t.trade_images ?? []).map((img) => img.storage_path));
  const signedUrlByPath = new Map<string, string>();
  if (allImagePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage.from("trade-images").createSignedUrls(allImagePaths, 3600);
    for (const entry of signedUrls ?? []) {
      if (entry.path && entry.signedUrl) signedUrlByPath.set(entry.path, entry.signedUrl);
    }
  }

  const bidFilePaths = sortedTrades.flatMap((t) => (t.bids ?? []).flatMap((b) => (b.file_path ? [b.file_path] : [])));
  const bidFileUrlByPath = new Map<string, string>();
  if (bidFilePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage.from("bid-files").createSignedUrls(bidFilePaths, 3600);
    for (const entry of signedUrls ?? []) {
      if (entry.path && entry.signedUrl) bidFileUrlByPath.set(entry.path, entry.signedUrl);
    }
  }

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
            render={<Link href={`/admin/projects/${projectId}/spec-sheet`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <ClipboardList className="h-4 w-4" /> Spec Sheet
          </Button>
          <Button
            render={<Link href={`/admin/projects/${projectId}/daily-log`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <NotebookText className="h-4 w-4" /> Daily Log
          </Button>
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
        useCustomOrder={project.use_custom_trade_order}
        trades={sortedTrades.map((trade) => ({
          id: trade.id,
          name: trade.name,
          qty: trade.qty,
          description: trade.description,
          images: (trade.trade_images ?? [])
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => ({
              id: img.id,
              file_name: img.file_name,
              storage_path: img.storage_path,
              url: signedUrlByPath.get(img.storage_path) ?? null,
            })),
          bids: (trade.bids ?? []).map((b) => ({
            id: b.id,
            company_id: b.company_id,
            company_name: b.company?.name ?? null,
            company_contacts: b.company?.company_contacts ?? [],
            amount: b.amount,
            status: b.status,
            is_winner: b.is_winner,
            notes: b.notes,
            file_path: b.file_path,
            file_name: b.file_name,
            file_url: b.file_path ? (bidFileUrlByPath.get(b.file_path) ?? null) : null,
          })),
        }))}
        companies={companies ?? []}
        canEdit={canEdit}
      />

      {canEdit && <AddTradeForm projectId={projectId} categories={categories ?? []} />}
    </div>
  );
}
