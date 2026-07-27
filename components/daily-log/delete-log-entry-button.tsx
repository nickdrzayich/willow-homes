"use client";

import { Trash2 } from "lucide-react";
import { deleteLogEntry } from "@/lib/actions/daily-log";
import { Button } from "@/components/ui/button";

export function DeleteLogEntryButton({
  projectId,
  entryId,
  logDate,
}: {
  projectId: string;
  entryId: string;
  logDate: string;
}) {
  return (
    <form
      action={deleteLogEntry.bind(null, projectId, entryId)}
      onSubmit={(e) => {
        if (!confirm(`Delete the log entry for ${logDate}?`)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
