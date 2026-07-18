"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/types";

export async function createTransaction(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const transactionDate = String(formData.get("transactionDate") ?? "").trim();
  const type = String(formData.get("type") ?? "deposit") as TransactionType;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!amountRaw) return;

  await supabase.from("account_transactions").insert({
    project_id: projectId,
    transaction_date: transactionDate || undefined,
    type,
    amount: Number(amountRaw),
    description,
    created_by: user?.id,
  });

  revalidatePath(`/admin/projects/${projectId}/ledger`);
}

export async function updateTransaction(projectId: string, transactionId: string, formData: FormData) {
  const supabase = await createClient();

  const transactionDate = String(formData.get("transactionDate") ?? "").trim();
  const type = String(formData.get("type") ?? "deposit") as TransactionType;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  await supabase
    .from("account_transactions")
    .update({
      transaction_date: transactionDate || undefined,
      type,
      amount: amountRaw ? Number(amountRaw) : undefined,
      description,
    })
    .eq("id", transactionId);

  revalidatePath(`/admin/projects/${projectId}/ledger`);
}

export async function deleteTransaction(projectId: string, transactionId: string) {
  const supabase = await createClient();
  await supabase.from("account_transactions").delete().eq("id", transactionId);
  revalidatePath(`/admin/projects/${projectId}/ledger`);
}
