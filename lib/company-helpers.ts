import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Finds a company by case-insensitive name match, creating it if it doesn't
// exist yet. Used by both the bid form's inline "create new company" flow
// and the one-time xlsx import script.
export async function findOrCreateCompany(
  supabase: SupabaseClient<Database>,
  name: string
): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  // Escape ilike wildcards so a literal "%" or "_" in a company name can't
  // turn this exact-match lookup into a pattern match.
  const escaped = trimmed.replace(/[%_\\]/g, (c) => `\\${c}`);

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .ilike("name", escaped)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("companies")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (error) {
    // Unique index race: another request created the same company first.
    const { data: retry } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", trimmed)
      .maybeSingle();
    return retry?.id ?? null;
  }

  return created.id;
}
