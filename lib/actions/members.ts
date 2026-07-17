"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/types";

export async function inviteMember(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "viewer") as MemberRole;

  if (!email) return;

  await supabase.from("project_members").insert({
    project_id: projectId,
    invited_email: email,
    role,
    invited_by: user?.id,
  });

  revalidatePath(`/admin/projects/${projectId}/members`);
}

export async function updateMemberRole(projectId: string, memberId: string, formData: FormData) {
  const role = String(formData.get("role") ?? "viewer") as MemberRole;
  const supabase = await createClient();
  await supabase.from("project_members").update({ role }).eq("id", memberId);
  revalidatePath(`/admin/projects/${projectId}/members`);
}

export async function removeMember(projectId: string, memberId: string) {
  const supabase = await createClient();
  await supabase.from("project_members").delete().eq("id", memberId);
  revalidatePath(`/admin/projects/${projectId}/members`);
}

export async function acceptInvite(projectId: string) {
  const supabase = await createClient();
  await supabase.rpc("accept_project_invite", { p_project_id: projectId });
  revalidatePath("/admin/projects");
}
