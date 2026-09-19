import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Subcontractors, categories, and the build schedule template aren't
// scoped to a single project, so there's no one project to check a role
// against -- this checks whether the user is an editor or owner on ANY
// project, matching the `is_editor_anywhere()` RLS check those tables use.
export async function canEditSharedData(supabase: SupabaseClient<Database>) {
  const { data } = await supabase.rpc("is_editor_anywhere");
  return data ?? false;
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
