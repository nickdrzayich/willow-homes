import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCompany } from "@/lib/actions/companies";
import { formatCurrencyPrecise } from "@/lib/calculations";
import { BidPill } from "@/components/trades/bid-pill";
import { ContactsSection } from "@/components/companies/contacts-section";
import { CategoryPicker } from "@/components/companies/category-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const [{ data: company }, { data: contacts }, { data: bids }] = await Promise.all([
    supabase.from("companies").select("id, name, notes, category_names").eq("id", companyId).single(),
    supabase
      .from("company_contacts")
      .select("id, name, phone, email")
      .eq("company_id", companyId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("bids")
      .select(
        "id, amount, status, is_winner, trade:trades(name, project:projects(id, name))"
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
  ]);

  if (!company) notFound();

  const updateAction = updateCompany.bind(null, companyId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Subcontractor details</p>
      </div>

      <ContactsSection companyId={companyId} contacts={contacts ?? []} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Company details</h2>
        <Card>
          <CardContent className="pt-6">
            <form action={updateAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Company name</Label>
                <Input id="name" name="name" defaultValue={company.name} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={company.notes ?? ""} rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Products/services</Label>
                <CategoryPicker defaultCategories={company.category_names} />
              </div>
              <Button type="submit" className="self-start">
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Bid history</h2>
        <div className="flex flex-col gap-2">
          {!bids?.length && (
            <p className="text-sm text-muted-foreground">No bids from this subcontractor yet.</p>
          )}
          {bids?.map((bid) =>
            bid.trade?.project ? (
              <Card key={bid.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <Link
                      href={`/admin/projects/${bid.trade.project.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {bid.trade.project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{bid.trade.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <BidPill status={bid.status} />
                    {bid.is_winner && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Trophy className="h-3 w-3" /> Winner
                      </span>
                    )}
                    <p className="w-24 text-right text-sm font-medium">
                      {formatCurrencyPrecise(bid.amount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
