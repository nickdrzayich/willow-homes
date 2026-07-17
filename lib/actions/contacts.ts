"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addContact(companyId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  if (!name) return;

  const { data: existing } = await supabase
    .from("company_contacts")
    .select("sort_order")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("company_contacts").insert({
    company_id: companyId,
    name,
    phone,
    email,
    sort_order: (existing?.sort_order ?? 0) + 1,
  });

  revalidatePath(`/admin/subcontractors/${companyId}`);
}

export async function updateContact(companyId: string, contactId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  await supabase.from("company_contacts").update({ name, phone, email }).eq("id", contactId);
  revalidatePath(`/admin/subcontractors/${companyId}`);
}

export async function deleteContact(companyId: string, contactId: string) {
  const supabase = await createClient();
  await supabase.from("company_contacts").delete().eq("id", contactId);
  revalidatePath(`/admin/subcontractors/${companyId}`);
}
