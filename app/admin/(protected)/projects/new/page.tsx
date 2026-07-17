import { createProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
        <p className="mt-1 text-sm text-muted-foreground">Set up a new home build to track bids for.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProject} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" name="name" required placeholder="e.g. Pescara Lot 8 Block 1" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="8439 Mediterranean Ct." />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sqft">Square feet</Label>
              <Input id="sqft" name="sqft" type="number" step="1" min="0" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              We&apos;ll pre-fill the standard products/services checklist for you, empty and ready for bids.
            </p>
            <Button type="submit">Create project</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
