"use client";

import { toast } from "sonner";
import { archiveCompany, unarchiveCompany, deleteCompany } from "@/lib/actions/companies";
import { Button } from "@/components/ui/button";

export function CompanyDangerZone({
  companyId,
  companyName,
  archived,
  canDelete,
}: {
  companyId: string;
  companyName: string;
  archived: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{archived ? "Archived" : "Archive this subcontractor"}</p>
          <p className="text-sm text-muted-foreground">
            {archived
              ? "Hidden from the active subcontractor directory and bid picker. Past bids are unaffected."
              : "Hides them from the active directory and bid picker without deleting their bid history."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await (archived ? unarchiveCompany : archiveCompany)(companyId);
              toast.success(archived ? "Unarchived" : "Archived");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not update");
            }
          }}
        >
          {archived ? "Unarchive" : "Archive"}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <div>
          <p className="text-sm font-medium">Delete permanently</p>
          <p className="text-sm text-muted-foreground">
            {canDelete
              ? "Removes this subcontractor and its contacts for good. This can't be undone."
              : "Not available -- this subcontractor has bid history. Archive them instead to preserve it."}
          </p>
        </div>
        <form
          action={deleteCompany.bind(null, companyId)}
          onSubmit={(e) => {
            if (!confirm(`Permanently delete "${companyName}" and its contacts?`)) e.preventDefault();
          }}
        >
          <Button type="submit" variant="destructive" disabled={!canDelete}>
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
}
