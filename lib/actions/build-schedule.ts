"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createScheduleDay(formData: FormData) {
  const supabase = await createClient();

  const dayNumberRaw = String(formData.get("dayNumber") ?? "").trim();
  const tasks = formData.getAll("tasks").map(String).map((t) => t.trim()).filter(Boolean);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!dayNumberRaw) return;

  await supabase.from("build_schedule_template").insert({
    day_number: Number(dayNumberRaw),
    tasks,
    notes,
  });

  revalidatePath("/admin/build-schedule");
}

export async function updateScheduleDay(dayId: string, formData: FormData) {
  const supabase = await createClient();

  const dayNumberRaw = String(formData.get("dayNumber") ?? "").trim();
  const tasks = formData.getAll("tasks").map(String).map((t) => t.trim()).filter(Boolean);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await supabase
    .from("build_schedule_template")
    .update({
      day_number: dayNumberRaw ? Number(dayNumberRaw) : undefined,
      tasks,
      notes,
    })
    .eq("id", dayId);

  revalidatePath("/admin/build-schedule");
}

export async function deleteScheduleDay(dayId: string) {
  const supabase = await createClient();
  await supabase.from("build_schedule_template").delete().eq("id", dayId);
  revalidatePath("/admin/build-schedule");
}
