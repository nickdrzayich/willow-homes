import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inviteMember, updateMemberRole, removeMember } from "@/lib/actions/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <form action={inviteAction} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-1 min-w-[200px] flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="viewer">
                  <SelectTrigger id="role" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Invite</Button>
            </form>
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
                  <form
                    action={updateMemberRole.bind(null, projectId, member.id)}
                    className="flex items-center gap-2"
                  >
                    <Select name="role" defaultValue={member.role}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" variant="ghost" size="sm">
                      Save
                    </Button>
                  </form>
                ) : (
                  <Badge variant="secondary" className="capitalize">
                    {member.role}
                  </Badge>
                )}
                {isOwner && (
                  <form action={removeMember.bind(null, projectId, member.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
                      Remove
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
