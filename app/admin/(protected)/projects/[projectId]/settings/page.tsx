import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProjectSettings, deleteProject } from "@/lib/actions/projects";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ProjectSettingsForm } from "@/components/projects/project-settings-form";
import { ProjectDocumentsSection } from "@/components/projects/project-documents-section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectDocumentCategory } from "@/lib/types";

const DOCUMENT_CATEGORIES: { category: ProjectDocumentCategory; label: string }[] = [
  { category: "interior_selections", label: "Interior selections" },
  { category: "exterior_selections", label: "Exterior selections" },
  { category: "interior_colors", label: "Interior colors" },
];

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

  const [{ data: project }, { data: membership }, { data: documents }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, address, sqft, builder_fee_percent, permit_number, inspection_phone")
      .eq("id", projectId)
      .single(),
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("project_documents")
      .select("id, category, storage_path, file_name, sort_order")
      .eq("project_id", projectId)
      .order("sort_order"),
  ]);

  if (!project) notFound();
  if (membership?.role !== "owner") redirect(`/admin/projects/${projectId}`);

  const documentPaths = (documents ?? []).map((d) => d.storage_path);
  const signedUrlByPath = new Map<string, string>();
  if (documentPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("project-documents")
      .createSignedUrls(documentPaths, 3600);
    for (const entry of signedUrls ?? []) {
      if (entry.path && entry.signedUrl) signedUrlByPath.set(entry.path, entry.signedUrl);
    }
  }

  const updateAction = updateProjectSettings.bind(null, projectId);
  const deleteAction = deleteProject.bind(null, projectId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href={`/admin/projects/${projectId}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to project
      </Link>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {DOCUMENT_CATEGORIES.map(({ category, label }) => (
            <ProjectDocumentsSection
              key={category}
              projectId={projectId}
              category={category}
              label={label}
              documents={(documents ?? [])
                .filter((d) => d.category === category)
                .map((d) => ({
                  id: d.id,
                  file_name: d.file_name,
                  storage_path: d.storage_path,
                  url: signedUrlByPath.get(d.storage_path) ?? null,
                }))}
            />
          ))}
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
