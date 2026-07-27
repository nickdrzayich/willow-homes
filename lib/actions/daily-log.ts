"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLogEntry(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const logDate = String(formData.get("logDate") ?? "").trim();
  const tasks = formData.getAll("tasks").map(String).map((t) => t.trim()).filter(Boolean);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!logDate) return;

  await supabase.from("daily_log_entries").insert({
    project_id: projectId,
    log_date: logDate,
    tasks,
    notes,
    created_by: user?.id,
  });

  revalidatePath(`/admin/projects/${projectId}/daily-log`);
}

export async function updateLogEntry(projectId: string, entryId: string, formData: FormData) {
  const supabase = await createClient();

  const logDate = String(formData.get("logDate") ?? "").trim();
  const tasks = formData.getAll("tasks").map(String).map((t) => t.trim()).filter(Boolean);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await supabase
    .from("daily_log_entries")
    .update({
      log_date: logDate || undefined,
      tasks,
      notes,
    })
    .eq("id", entryId);

  revalidatePath(`/admin/projects/${projectId}/daily-log`);
}

export async function deleteLogEntry(projectId: string, entryId: string) {
  const supabase = await createClient();
  await supabase.from("daily_log_entries").delete().eq("id", entryId);
  revalidatePath(`/admin/projects/${projectId}/daily-log`);
}
