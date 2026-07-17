"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateCompany } from "@/lib/company-helpers";
import type { BidStatus } from "@/lib/types";

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

  const resolvedCompanyId =
    companyId ?? (newCompanyName ? await findOrCreateCompany(supabase, newCompanyName) : null);

  const fields = {
    company_id: resolvedCompanyId,
    amount: amountRaw ? Number(amountRaw) : null,
    status,
    notes,
  };

  if (bidId) {
    await supabase.from("bids").update(fields).eq("id", bidId);
  } else {
    await supabase.from("bids").insert({ ...fields, trade_id: tradeId, created_by: user?.id });
  }

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteBid(projectId: string, bidId: string) {
  const supabase = await createClient();
  await supabase.from("bids").delete().eq("id", bidId);
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
  await supabase.from("bids").update({ is_winner: false }).eq("trade_id", tradeId).eq("is_winner", true);

  if (!isCurrentlyWinner) {
    await supabase.from("bids").update({ is_winner: true }).eq("id", bidId);
  }

  revalidatePath(`/admin/projects/${projectId}`);
}
