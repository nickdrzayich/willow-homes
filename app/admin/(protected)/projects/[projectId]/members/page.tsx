import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inviteMember, updateMemberRole, removeMember } from "@/lib/actions/members";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MemberRoleForm, RemoveMemberButton } from "@/components/members/member-role-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: project }, { data: myMembership }, { data: members }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).single(),
    supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("project_members")
      .select(
        "id, invited_email, role, status, profile:profiles!project_members_user_id_fkey(display_name, email)"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  if (!project) notFound();
  const isOwner = myMembership?.role === "owner";

  const inviteAction = inviteMember.bind(null, projectId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">{project.name}</p>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite someone</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteMemberForm action={inviteAction} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {(members ?? []).map((member) => (
          <Card key={member.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">
                  {member.profile?.display_name ?? member.invited_email}
                </p>
                <p className="text-xs text-muted-foreground">{member.invited_email}</p>
              </div>
              <div className="flex items-center gap-2">
                {member.status === "invited" && (
                  <Badge variant="outline">Pending</Badge>
                )}
                {isOwner ? (
                  <MemberRoleForm
                    action={updateMemberRole.bind(null, projectId, member.id)}
                    role={member.role}
                  />
                ) : (
                  <Badge variant="secondary" className="capitalize">
                    {member.role}
                  </Badge>
                )}
                {isOwner && (
                  <RemoveMemberButton
                    action={removeMember.bind(null, projectId, member.id)}
                    label={member.profile?.display_name ?? member.invited_email}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
