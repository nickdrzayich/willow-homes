"use client";

import { useMemo, useState } from "react";
import { Pencil, Search, X, NotebookText } from "lucide-react";
import { DailyLogForm, type EditableLogEntry } from "@/components/daily-log/daily-log-form";
import { DeleteLogEntryButton } from "@/components/daily-log/delete-log-entry-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function DailyLogList({
  projectId,
  entries,
  canEdit,
}: {
  projectId: string;
  entries: EditableLogEntry[];
  canEdit: boolean;
}) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.log_date.includes(query) ||
        entry.notes?.toLowerCase().includes(query) ||
        entry.tasks.some((task) => task.toLowerCase().includes(query))
    );
  }, [entries, query]);

  return (
    <div className="flex flex-col gap-4">
      {entries.length > 5 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dates, tasks, notes..."
            className="h-9 pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {!visible.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <NotebookText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {entries.length === 0 ? "No daily log entries yet." : "No entries match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium">{entry.log_date}</p>
                  {entry.tasks.length > 0 && (
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                      {entry.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  )}
                  {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-1">
                    <DailyLogForm
                      projectId={projectId}
                      entry={entry}
                      trigger={
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <DeleteLogEntryButton projectId={projectId} entryId={entry.id} logDate={entry.log_date} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
