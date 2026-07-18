"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database, ExpenseCategory, ExpensePaidStatus, InvoiceStatus } from "@/lib/types";

type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];
type InvoiceUpdate = Database["public"]["Tables"]["monthly_invoices"]["Update"];

const BUCKET = "expense-invoices";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadInvoiceFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  expenseId: string,
  file: File
) {
  const path = `${projectId}/${expenseId}/${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return { path, name: file.name };
}

export async function createExpense(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const category = String(formData.get("category") ?? "other") as ExpenseCategory;
  const vendorName = String(formData.get("vendorName") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const billable = formData.get("billable") === "on";
  const file = formData.get("invoiceFile");
  const hasFile = file instanceof File && file.size > 0;

  if (!amountRaw) return;

  const id = crypto.randomUUID();
  let invoiceFilePath: string | null = null;
  let invoiceFileName: string | null = null;

  if (hasFile) {
    const uploaded = await uploadInvoiceFile(supabase, projectId, id, file as File);
    invoiceFilePath = uploaded.path;
    invoiceFileName = uploaded.name;
  }

  await supabase.from("expenses").insert({
    id,
    project_id: projectId,
    expense_date: expenseDate || undefined,
    category,
    vendor_name: vendorName,
    description,
    amount: Number(amountRaw),
    billable,
    invoice_file_path: invoiceFilePath,
    invoice_file_name: invoiceFileName,
    created_by: user?.id,
  });

  revalidatePath(`/admin/projects/${projectId}/expenses`);
}

export async function updateExpense(projectId: string, expenseId: string, formData: FormData) {
  const supabase = await createClient();

  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const category = String(formData.get("category") ?? "other") as ExpenseCategory;
  const vendorName = String(formData.get("vendorName") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const billable = formData.get("billable") === "on";
  const file = formData.get("invoiceFile");
  const hasFile = file instanceof File && file.size > 0;

  const fields: ExpenseUpdate = {
    expense_date: expenseDate || undefined,
    category,
    vendor_name: vendorName,
    description,
    amount: amountRaw ? Number(amountRaw) : undefined,
    billable,
  };

  if (hasFile) {
    const { data: existing } = await supabase
      .from("expenses")
      .select("invoice_file_path")
      .eq("id", expenseId)
      .single();

    if (existing?.invoice_file_path) {
      await supabase.storage.from(BUCKET).remove([existing.invoice_file_path]);
    }

    const uploaded = await uploadInvoiceFile(supabase, projectId, expenseId, file as File);
    fields.invoice_file_path = uploaded.path;
    fields.invoice_file_name = uploaded.name;
  }

  await supabase.from("expenses").update(fields).eq("id", expenseId);

  revalidatePath(`/admin/projects/${projectId}/expenses`);
}

export async function deleteExpense(projectId: string, expenseId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("expenses")
    .select("invoice_file_path")
    .eq("id", expenseId)
    .single();

  if (existing?.invoice_file_path) {
    await supabase.storage.from(BUCKET).remove([existing.invoice_file_path]);
  }

  await supabase.from("expenses").delete().eq("id", expenseId);
  revalidatePath(`/admin/projects/${projectId}/expenses`);
}

export async function toggleExpensePaid(
  projectId: string,
  expenseId: string,
  currentStatus: ExpensePaidStatus
) {
  const supabase = await createClient();
  const nextStatus: ExpensePaidStatus = currentStatus === "paid" ? "unpaid" : "paid";

  await supabase
    .from("expenses")
    .update({
      paid_status: nextStatus,
      paid_date: nextStatus === "paid" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", expenseId);

  revalidatePath(`/admin/projects/${projectId}/expenses`);
}

export async function generateMonthlyInvoice(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const month = String(formData.get("month") ?? "").trim(); // "YYYY-MM"
  if (!month) return;

  const [year, monthNum] = month.split("-").map(Number);
  const periodStart = `${month}-01`;
  const lastDay = new Date(year, monthNum, 0).getDate();
  const periodEnd = `${month}-${String(lastDay).padStart(2, "0")}`;

  const { data: project } = await supabase
    .from("projects")
    .select("builder_fee_percent")
    .eq("id", projectId)
    .single();

  const feePercent = project?.builder_fee_percent ?? 20;

  const { data: unbilledExpenses } = await supabase
    .from("expenses")
    .select("id, amount")
    .eq("project_id", projectId)
    .eq("billable", true)
    .is("invoice_id", null)
    .gte("expense_date", periodStart)
    .lte("expense_date", periodEnd);

  const subtotal = (unbilledExpenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  const feeAmount = subtotal * (feePercent / 100);
  const total = subtotal + feeAmount;

  const { data: invoice, error } = await supabase
    .from("monthly_invoices")
    .insert({
      project_id: projectId,
      period_start: periodStart,
      period_end: periodEnd,
      subtotal,
      builder_fee_percent: feePercent,
      builder_fee_amount: feeAmount,
      total,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    redirect(
      `/admin/projects/${projectId}/expenses?error=${encodeURIComponent(error?.message ?? "Could not generate invoice")}`
    );
  }

  const ids = (unbilledExpenses ?? []).map((e) => e.id);
  if (ids.length > 0) {
    await supabase.from("expenses").update({ invoice_id: invoice.id }).in("id", ids);
  }

  revalidatePath(`/admin/projects/${projectId}/expenses`);
  redirect(`/admin/projects/${projectId}/expenses/invoices/${invoice.id}`);
}

export async function updateInvoiceStatus(projectId: string, invoiceId: string, status: InvoiceStatus) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const fields: InvoiceUpdate = { status };
  if (status === "sent") fields.sent_at = now;
  if (status === "paid") fields.paid_at = now;

  await supabase.from("monthly_invoices").update(fields).eq("id", invoiceId);

  revalidatePath(`/admin/projects/${projectId}/expenses`);
  revalidatePath(`/admin/projects/${projectId}/expenses/invoices/${invoiceId}`);
}

export async function deleteInvoice(projectId: string, invoiceId: string) {
  const supabase = await createClient();

  await supabase.from("expenses").update({ invoice_id: null }).eq("invoice_id", invoiceId);
  await supabase.from("monthly_invoices").delete().eq("id", invoiceId);

  revalidatePath(`/admin/projects/${projectId}/expenses`);
  redirect(`/admin/projects/${projectId}/expenses`);
}
