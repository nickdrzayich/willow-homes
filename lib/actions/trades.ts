"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateCategory } from "@/lib/category-helpers";

export async function createTrade(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const newCategoryName = String(formData.get("categoryName") ?? "").trim();
  const qtyRaw = String(formData.get("qty") ?? "").trim();

  let name: string | null = null;
  if (categoryId) {
    const { data } = await supabase.from("categories").select("name").eq("id", categoryId).maybeSingle();
    name = data?.name ?? null;
  } else if (newCategoryName) {
    name = await findOrCreateCategory(supabase, newCategoryName);
  }

  if (!name) return;

  const { data: existing } = await supabase
    .from("trades")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("trades").insert({
    project_id: projectId,
    name,
    qty: qtyRaw ? Number(qtyRaw) : 1,
    sort_order: (existing?.sort_order ?? 0) + 1,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteTrade(projectId: string, tradeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("trades").delete().eq("id", tradeId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function reorderTrades(projectId: string, orderedTradeIds: string[]) {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedTradeIds.map((id, index) => supabase.from("trades").update({ sort_order: index }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  revalidatePath(`/admin/projects/${projectId}`);
}

const TRADE_IMAGES_BUCKET = "trade-images";

export async function saveTradeDetails(projectId: string, tradeId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const description = String(formData.get("description") ?? "").trim() || null;
  const imagePaths = formData.getAll("imagePath").map(String);
  const imageNames = formData.getAll("imageName").map(String);

  const { error: descError } = await supabase.from("trades").update({ description }).eq("id", tradeId);
  if (descError) throw new Error(descError.message);

  if (imagePaths.length > 0) {
    const { data: existing } = await supabase
      .from("trade_images")
      .select("sort_order")
      .eq("trade_id", tradeId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSort = (existing?.sort_order ?? -1) + 1;

    const { error } = await supabase.from("trade_images").insert(
      imagePaths.map((path, i) => ({
        trade_id: tradeId,
        storage_path: path,
        file_name: imageNames[i] ?? path,
        sort_order: nextSort + i,
        created_by: user?.id,
      }))
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteTradeImage(
  projectId: string,
  imageId: string,
  storagePath: string
) {
  const supabase = await createClient();
  await supabase.storage.from(TRADE_IMAGES_BUCKET).remove([storagePath]);
  const { error } = await supabase.from("trade_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${projectId}`);
}
