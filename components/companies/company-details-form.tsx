"use client";

import { toast } from "sonner";
import { CategoryPicker } from "@/components/companies/category-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CompanyDetailsForm({
  action,
  company,
  categoryNames,
}: {
  action: (formData: FormData) => Promise<void>;
  company: { name: string; notes: string | null; category_names: string[] };
  categoryNames: string[];
}) {
  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success("Company saved");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save");
        }
      }}
      className="flex flex-col gap-4"
    >
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
        <CategoryPicker categories={categoryNames} defaultCategories={company.category_names} />
      </div>
      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
