import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Finds a category by case-insensitive name match, creating it (at the end
// of the shared sort order) if it doesn't exist yet. Mirrors
// findOrCreateCompany -- used so typing a new product/service name while
// adding one to a project also grows the shared category list.
export async function findOrCreateCategory(
  supabase: SupabaseClient<Database>,
  name: string
): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  // Escape ilike wildcards so a literal "%" or "_" in a name can't turn
  // this exact-match lookup into a pattern match.
  const escaped = trimmed.replace(/[%_\\]/g, (c) => `\\${c}`);

  const { data: existing } = await supabase
    .from("categories")
    .select("name")
    .ilike("name", escaped)
    .maybeSingle();

  if (existing) return existing.name;

  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("categories")
    .insert({ name: trimmed, sort_order: (last?.sort_order ?? 0) + 1 })
    .select("name")
    .single();

  if (error) {
    // Unique index race: another request created the same category first.
    const { data: retry } = await supabase
      .from("categories")
      .select("name")
      .ilike("name", trimmed)
      .maybeSingle();
    return retry?.name ?? trimmed;
  }

  return created.name;
}
