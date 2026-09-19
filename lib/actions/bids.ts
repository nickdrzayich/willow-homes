"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateCompany } from "@/lib/company-helpers";
import type { BidStatus, Database } from "@/lib/types";

type BidUpdate = Database["public"]["Tables"]["bids"]["Update"];

const BID_FILES_BUCKET = "bid-files";

export async function upsertBid(
  projectId: string,
  tradeId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const bidId = String(formData.get("bidId") ?? "").trim() || null;
  const companyId = String(formData.get("companyId") ?? "").trim() || null;
  const newCompanyName = String(formData.get("companyName") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const status = String(formData.get("status") ?? "sent") as BidStatus;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const filePath = String(formData.get("filePath") ?? "").trim() || null;
  const fileName = String(formData.get("fileName") ?? "").trim() || null;

  const resolvedCompanyId =
    companyId ?? (newCompanyName ? await findOrCreateCompany(supabase, newCompanyName) : null);

  const fields: BidUpdate = {
    company_id: resolvedCompanyId,
    amount: amountRaw ? Number(amountRaw) : null,
    status,
    notes,
  };

  if (bidId) {
    if (filePath) {
      const { data: existing } = await supabase
        .from("bids")
        .select("file_path")
        .eq("id", bidId)
        .single();

      if (existing?.file_path && existing.file_path !== filePath) {
        await supabase.storage.from(BID_FILES_BUCKET).remove([existing.file_path]);
      }

      fields.file_path = filePath;
      fields.file_name = fileName;
    }

    const { error } = await supabase.from("bids").update(fields).eq("id", bidId);
    if (error) throw new Error(error.message);
  } else {
    const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
    const { error } = await supabase.from("bids").insert({
      id,
      ...fields,
      file_path: filePath,
      file_name: fileName,
      trade_id: tradeId,
      created_by: user?.id,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function removeBidFile(projectId: string, bidId: string, filePath: string) {
  const supabase = await createClient();
  await supabase.storage.from(BID_FILES_BUCKET).remove([filePath]);
  const { error } = await supabase.from("bids").update({ file_path: null, file_name: null }).eq("id", bidId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteBid(projectId: string, bidId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("bids").select("file_path").eq("id", bidId).single();
  if (existing?.file_path) {
    await supabase.storage.from(BID_FILES_BUCKET).remove([existing.file_path]);
  }

  const { error } = await supabase.from("bids").delete().eq("id", bidId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function toggleWinner(
  projectId: string,
  tradeId: string,
  bidId: string,
  isCurrentlyWinner: boolean
) {
  const supabase = await createClient();

  // Clear any existing winner on this trade first so the "one winner per
  // trade" partial unique index never sees two winners at once.
  const { error: clearError } = await supabase
    .from("bids")
    .update({ is_winner: false })
    .eq("trade_id", tradeId)
    .eq("is_winner", true);
  if (clearError) throw new Error(clearError.message);

  if (!isCurrentlyWinner) {
    const { error } = await supabase.from("bids").update({ is_winner: true }).eq("id", bidId);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/projects/${projectId}`);
}
