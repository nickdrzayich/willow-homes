"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PRODUCTS_SERVICES } from "@/lib/default-products-services";

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

  await supabase.from("trades").insert(
    DEFAULT_PRODUCTS_SERVICES.map((itemName, index) => ({
      project_id: data.id,
      name: itemName,
      qty: 1,
      sort_order: index,
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

  await supabase
    .from("projects")
    .update({
      name,
      address,
      sqft: sqftRaw ? Number(sqftRaw) : null,
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
