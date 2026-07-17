import { createClient } from "@/lib/supabase/server";
import { createCompany } from "@/lib/actions/companies";
import { CategoryPicker } from "@/components/companies/category-picker";
import { SubcontractorList } from "@/components/companies/subcontractor-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default async function SubcontractorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, category_names, bids(count), company_contacts(id, name, phone, email)")
    .order("name");

  const items = (companies ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    categoryNames: c.category_names ?? [],
    bidCount: c.bids?.[0]?.count ?? 0,
    primaryContactName: c.company_contacts?.[0]?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subcontractors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your reusable directory of trade companies and their contacts.
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4" /> New subcontractor
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New subcontractor</DialogTitle>
            </DialogHeader>
            <form action={createCompany} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Company name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Products/services</Label>
                <CategoryPicker />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SubcontractorList companies={items} />
    </div>
  );
}
