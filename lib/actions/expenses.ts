"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database, ExpenseCategory, ExpensePaidStatus, InvoiceStatus } from "@/lib/types";

type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];
type InvoiceUpdate = Database["public"]["Tables"]["monthly_invoices"]["Update"];

const BUCKET = "expense-invoices";

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
  const invoiceFilePath = String(formData.get("invoiceFilePath") ?? "").trim() || null;
  const invoiceFileName = String(formData.get("invoiceFileName") ?? "").trim() || null;

  if (!amountRaw) return;

  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();

  const { error } = await supabase.from("expenses").insert({
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
  if (error) throw new Error(error.message);

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
  const invoiceFilePath = String(formData.get("invoiceFilePath") ?? "").trim() || null;
  const invoiceFileName = String(formData.get("invoiceFileName") ?? "").trim() || null;

  const fields: ExpenseUpdate = {
    expense_date: expenseDate || undefined,
    category,
    vendor_name: vendorName,
    description,
    amount: amountRaw ? Number(amountRaw) : undefined,
    billable,
  };

  if (invoiceFilePath) {
    const { data: existing } = await supabase
      .from("expenses")
      .select("invoice_file_path")
      .eq("id", expenseId)
      .single();

    if (existing?.invoice_file_path && existing.invoice_file_path !== invoiceFilePath) {
      await supabase.storage.from(BUCKET).remove([existing.invoice_file_path]);
    }

    fields.invoice_file_path = invoiceFilePath;
    fields.invoice_file_name = invoiceFileName;
  }

  const { error } = await supabase.from("expenses").update(fields).eq("id", expenseId);
  if (error) throw new Error(error.message);

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

  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${projectId}/expenses`);
}

export async function toggleExpensePaid(
  projectId: string,
  expenseId: string,
  currentStatus: ExpensePaidStatus
) {
  const supabase = await createClient();
  const nextStatus: ExpensePaidStatus = currentStatus === "paid" ? "unpaid" : "paid";

  const { error } = await supabase
    .from("expenses")
    .update({
      paid_status: nextStatus,
      paid_date: nextStatus === "paid" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", expenseId);
  if (error) throw new Error(error.message);

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
    const { error: linkError } = await supabase.from("expenses").update({ invoice_id: invoice.id }).in("id", ids);
    if (linkError) throw new Error(linkError.message);
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

  const { error } = await supabase.from("monthly_invoices").update(fields).eq("id", invoiceId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${projectId}/expenses`);
  revalidatePath(`/admin/projects/${projectId}/expenses/invoices/${invoiceId}`);
}

export async function deleteInvoice(projectId: string, invoiceId: string) {
  const supabase = await createClient();

  const { error: unlinkError } = await supabase
    .from("expenses")
    .update({ invoice_id: null })
    .eq("invoice_id", invoiceId);
  if (unlinkError) throw new Error(unlinkError.message);

  const { error } = await supabase.from("monthly_invoices").delete().eq("id", invoiceId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${projectId}/expenses`);
  redirect(`/admin/projects/${projectId}/expenses`);
}
