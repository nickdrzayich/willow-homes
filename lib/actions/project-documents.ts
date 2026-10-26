"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectDocumentCategory } from "@/lib/types";

const BUCKET = "project-documents";

export async function addProjectDocument(
  projectId: string,
  category: ProjectDocumentCategory,
  storagePath: string,
  fileName: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("project_documents").insert({
    project_id: projectId,
    category,
    storage_path: storagePath,
    file_name: fileName,
    created_by: user?.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${projectId}/settings`);
}

export async function deleteProjectDocument(projectId: string, documentId: string, storagePath: string) {
  const supabase = await createClient();

  await supabase.storage.from(BUCKET).remove([storagePath]);

  const { error } = await supabase.from("project_documents").delete().eq("id", documentId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${projectId}/settings`);
}
