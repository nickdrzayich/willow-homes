import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus, NotebookText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DailyLogForm } from "@/components/daily-log/daily-log-form";
import { DeleteLogEntryButton } from "@/components/daily-log/delete-log-entry-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DailyLogPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: project }, { data: membership }, { data: entries }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).single(),
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("daily_log_entries")
      .select("id, log_date, tasks, notes")
      .eq("project_id", projectId)
      .order("log_date", { ascending: false }),
  ]);

  if (!project) notFound();

  const canEdit = membership?.role === "owner" || membership?.role === "editor";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin/projects/${projectId}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {project.name}
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.name} · Job-site progress log</p>
        </div>
        {canEdit && (
          <DailyLogForm
            projectId={projectId}
            trigger={
              <Button type="button">
                <Plus className="h-4 w-4" /> Add entry
              </Button>
            }
          />
        )}
      </div>

      {!entries?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <NotebookText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No daily log entries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
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
