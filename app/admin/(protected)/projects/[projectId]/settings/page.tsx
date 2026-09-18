import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProjectSettings, deleteProject } from "@/lib/actions/projects";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ProjectSettingsForm } from "@/components/projects/project-settings-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: project }, { data: membership }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, address, sqft, builder_fee_percent")
      .eq("id", projectId)
      .single(),
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .maybeSingle(),
  ]);

  if (!project) notFound();
  if (membership?.role !== "owner") redirect(`/admin/projects/${projectId}`);

  const updateAction = updateProjectSettings.bind(null, projectId);
  const deleteAction = deleteProject.bind(null, projectId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">{project.name}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectSettingsForm action={updateAction} project={project} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteProjectButton projectName={project.name} action={deleteAction} />
        </CardContent>
      </Card>
    </div>
  );
}
