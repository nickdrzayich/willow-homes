import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DailyLogForm } from "@/components/daily-log/daily-log-form";
import { DailyLogList } from "@/components/daily-log/daily-log-list";
import { Button } from "@/components/ui/button";

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

      <DailyLogList projectId={projectId} entries={entries ?? []} canEdit={canEdit} />
    </div>
  );
}
