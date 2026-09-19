"use client";

import { useState, type ReactElement } from "react";
import { toast } from "sonner";
import { createLogEntry, updateLogEntry } from "@/lib/actions/daily-log";
import { TaskListFields } from "@/components/shared/task-list-fields";
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

export interface EditableLogEntry {
  id: string;
  log_date: string;
  tasks: string[];
  notes: string | null;
}

export function DailyLogForm({
  projectId,
  entry,
  trigger,
}: {
  projectId: string;
  entry?: EditableLogEntry;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = entry
    ? updateLogEntry.bind(null, projectId, entry.id)
    : createLogEntry.bind(null, projectId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? "Edit entry" : "Add entry"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            try {
              await action(formData);
              toast.success(entry ? "Entry saved" : "Entry added");
              setOpen(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not save");
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="logDate">Date</Label>
            <Input id="logDate" name="logDate" type="date" defaultValue={entry?.log_date ?? today} required />
          </div>
          <TaskListFields defaultTasks={entry?.tasks} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={entry?.notes ?? ""} rows={3} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">{entry ? "Save entry" : "Add entry"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
