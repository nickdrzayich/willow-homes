"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProjectSettingsForm({
  action,
  project,
}: {
  action: (formData: FormData) => Promise<void>;
  project: { name: string; address: string | null; sqft: number | null; builder_fee_percent: number };
}) {
  return (
    <form
      action={async (formData) => {
        await action(formData);
        toast.success("Settings saved");
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" defaultValue={project.name} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={project.address ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sqft">Square feet</Label>
        <Input id="sqft" name="sqft" type="number" step="1" min="0" defaultValue={project.sqft ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="builderFeePercent">Builder fee %</Label>
        <Input
          id="builderFeePercent"
          name="builderFeePercent"
          type="number"
          step="0.1"
          min="0"
          defaultValue={project.builder_fee_percent}
        />
        <p className="text-xs text-muted-foreground">
          Applied to the Cost of the Work on generated monthly invoices.
        </p>
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
