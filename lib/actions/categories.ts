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

  const { error } = await supabase.from("categories").insert({
    name,
    sort_order: (existing?.sort_order ?? 0) + 1,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}

// Renames a category everywhere it's used (the category itself, every
// existing trade with that name, and every subcontractor tagged with it) in
// one atomic transaction -- see rename_category in 0009_categories.sql.
export async function renameCategory(oldName: string, formData: FormData) {
  const supabase = await createClient();
  const newName = String(formData.get("name") ?? "").trim();
  if (!newName || newName === oldName) return;

  const { error } = await supabase.rpc("rename_category", { p_old_name: oldName, p_new_name: newName });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}

// Only allowed when nothing currently uses this category -- deleting it out
// from under an in-progress project's trades or a subcontractor's tags
// would silently orphan that data.
export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  const { data: category } = await supabase.from("categories").select("name").eq("id", categoryId).single();
  if (!category) return;

  const [{ count: tradeCount }, { data: taggedCompanies }] = await Promise.all([
    supabase.from("trades").select("id", { count: "exact", head: true }).eq("name", category.name),
    supabase.from("companies").select("id").contains("category_names", [category.name]),
  ]);

  const companyCount = taggedCompanies?.length ?? 0;
  if ((tradeCount ?? 0) > 0 || companyCount > 0) {
    throw new Error(
      `"${category.name}" is still used by ${tradeCount ?? 0} product/service${tradeCount === 1 ? "" : "s"} and ${companyCount} subcontractor${companyCount === 1 ? "" : "s"} -- rename or remove those first.`
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}
