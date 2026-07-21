"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const sqftRaw = String(formData.get("sqft") ?? "").trim();

  if (!name) {
    redirect(`/admin/projects/new?error=${encodeURIComponent("Project name is required")}`);
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      address,
      sqft: sqftRaw ? Number(sqftRaw) : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin/projects/new?error=${encodeURIComponent(error?.message ?? "Could not create project")}`);
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("name, sort_order")
    .order("sort_order");

  await supabase.from("trades").insert(
    (categories ?? []).map((category) => ({
      project_id: data.id,
      name: category.name,
      qty: 1,
      sort_order: category.sort_order,
    }))
  );

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${data.id}`);
}

export async function updateProjectSettings(projectId: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const sqftRaw = String(formData.get("sqft") ?? "").trim();
  const builderFeeRaw = String(formData.get("builderFeePercent") ?? "").trim();

  await supabase
    .from("projects")
    .update({
      name,
      address,
      sqft: sqftRaw ? Number(sqftRaw) : null,
      builder_fee_percent: builderFeeRaw ? Number(builderFeeRaw) : 20,
    })
    .eq("id", projectId);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/settings`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}
