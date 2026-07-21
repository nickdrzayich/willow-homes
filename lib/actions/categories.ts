"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { data: existing } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("categories").insert({
    name,
    sort_order: (existing?.sort_order ?? 0) + 1,
  });

  revalidatePath("/admin/categories");
}

// Renames a category everywhere it's used (the category itself, every
// existing trade with that name, and every subcontractor tagged with it) in
// one atomic transaction -- see rename_category in 0009_categories.sql.
export async function renameCategory(oldName: string, formData: FormData) {
  const supabase = await createClient();
  const newName = String(formData.get("name") ?? "").trim();
  if (!newName || newName === oldName) return;

  await supabase.rpc("rename_category", { p_old_name: oldName, p_new_name: newName });

  revalidatePath("/admin/categories");
}
