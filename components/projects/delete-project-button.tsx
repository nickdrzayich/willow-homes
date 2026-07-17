"use client";

import { Button } from "@/components/ui/button";

export function DeleteProjectButton({
  projectName,
  action,
}: {
  projectName: string;
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Permanently delete "${projectName}" and all its products/services and bids?`)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive">
        Delete project
      </Button>
    </form>
  );
}
