"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const categoryNames = formData.getAll("categories").map(String);

  if (!name) redirect(`/admin/subcontractors?error=${encodeURIComponent("Company name is required")}`);

  const { data, error } = await supabase
    .from("companies")
    .insert({ name, notes, category_names: categoryNames })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin/subcontractors?error=${encodeURIComponent(error?.message ?? "Could not create company")}`);
  }

  revalidatePath("/admin/subcontractors");
  redirect(`/admin/subcontractors/${data.id}`);
}

export async function updateCompany(companyId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const categoryNames = formData.getAll("categories").map(String);

  await supabase.from("companies").update({ name, notes, category_names: categoryNames }).eq("id", companyId);

  revalidatePath("/admin/subcontractors");
  revalidatePath(`/admin/subcontractors/${companyId}`);
}

export async function archiveCompany(companyId: string) {
  const supabase = await createClient();
  await supabase.from("companies").update({ archived_at: new Date().toISOString() }).eq("id", companyId);
  revalidatePath("/admin/subcontractors");
  revalidatePath(`/admin/subcontractors/${companyId}`);
}

export async function unarchiveCompany(companyId: string) {
  const supabase = await createClient();
  await supabase.from("companies").update({ archived_at: null }).eq("id", companyId);
  revalidatePath("/admin/subcontractors");
  revalidatePath(`/admin/subcontractors/${companyId}`);
}

// Only safe to call when the company has zero bids -- bids.company_id has no
// ON DELETE rule, so the database rejects this outright if any exist. The UI
// only shows the delete action in that case; archiving covers everything else.
export async function deleteCompany(companyId: string) {
  const supabase = await createClient();
  await supabase.from("companies").delete().eq("id", companyId);
  revalidatePath("/admin/subcontractors");
  redirect("/admin/subcontractors");
}
