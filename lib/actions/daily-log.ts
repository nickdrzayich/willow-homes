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

  const { error } = await supabase.from("daily_log_entries").insert({
    project_id: projectId,
    log_date: logDate,
    tasks,
    notes,
    created_by: user?.id,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error("You already have an entry for this date -- edit it instead of adding a new one.");
    }
    throw new Error(error.message);
  }

  revalidatePath(`/admin/projects/${projectId}/daily-log`);
}

export async function updateLogEntry(projectId: string, entryId: string, formData: FormData) {
  const supabase = await createClient();

  const logDate = String(formData.get("logDate") ?? "").trim();
  const tasks = formData.getAll("tasks").map(String).map((t) => t.trim()).filter(Boolean);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase
    .from("daily_log_entries")
    .update({
      log_date: logDate || undefined,
      tasks,
      notes,
    })
    .eq("id", entryId);
  if (error) {
    if (error.code === "23505") {
      throw new Error("You already have an entry for this date -- edit that one instead.");
    }
    throw new Error(error.message);
  }

  revalidatePath(`/admin/projects/${projectId}/daily-log`);
}

export async function deleteLogEntry(projectId: string, entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_log_entries").delete().eq("id", entryId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${projectId}/daily-log`);
}
