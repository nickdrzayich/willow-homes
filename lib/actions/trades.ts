"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTrade(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const qtyRaw = String(formData.get("qty") ?? "").trim();

  if (!name) return;

  const { data: existing } = await supabase
    .from("trades")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("trades").insert({
    project_id: projectId,
    name,
    qty: qtyRaw ? Number(qtyRaw) : 1,
    sort_order: (existing?.sort_order ?? 0) + 1,
  });

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function updateTrade(projectId: string, tradeId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const qtyRaw = String(formData.get("qty") ?? "").trim();

  await supabase
    .from("trades")
    .update({ name, qty: qtyRaw ? Number(qtyRaw) : 1 })
    .eq("id", tradeId);

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteTrade(projectId: string, tradeId: string) {
  const supabase = await createClient();
  await supabase.from("trades").delete().eq("id", tradeId);
  revalidatePath(`/admin/projects/${projectId}`);
}
