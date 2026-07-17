import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeProjectTotals, formatCurrency } from "@/lib/calculations";
import { acceptInvite } from "@/lib/actions/members";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Home, MapPin, Plus } from "lucide-react";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: pendingInvites } = await supabase
    .from("project_members")
    .select("id, role, project:projects(id, name)")
    .eq("status", "invited")
    .order("created_at", { ascending: false });

  const { data: memberships } = await supabase
    .from("project_members")
    .select("role, project:projects(id, name, address, sqft)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const projectIds = (memberships ?? [])
    .map((m) => m.project?.id)
    .filter((id): id is string => Boolean(id));

  const { data: totals } = projectIds.length
    ? await supabase.from("project_totals").select("project_id, grand_total").in("project_id", projectIds)
    : { data: [] as { project_id: string; grand_total: number | null }[] };

  const totalsByProject = new Map((totals ?? []).map((t) => [t.project_id, t.grand_total]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your home-build bid tracking projects.</p>
        </div>
        <Button render={<Link href="/admin/projects/new" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {!!pendingInvites?.length && (
        <div className="flex flex-col gap-2">
          {pendingInvites.map((invite) =>
            invite.project ? (
              <Card key={invite.id} className="border-primary/30 bg-primary/5">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <p className="text-sm">
                    You&apos;ve been invited to <strong>{invite.project.name}</strong> as{" "}
                    <span className="capitalize">{invite.role}</span>.
                  </p>
                  <form action={acceptInvite.bind(null, invite.project.id)}>
                    <Button type="submit" size="sm">
                      Accept
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : null
          )}
        </div>
      )}

      {!memberships?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Home className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No projects yet. Create your first one to start tracking bids.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m) => {
            const project = m.project;
            if (!project) return null;
            const { grandTotal, costPerSqft } = computeProjectTotals(
              totalsByProject.get(project.id) ?? 0,
              project.sqft
            );
            return (
              <Link key={project.id} href={`/admin/projects/${project.id}`}>
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                          <Building className="h-4.5 w-4.5 text-accent-foreground" />
                        </span>
                        <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="capitalize shrink-0">
                        {m.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {project.address && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" /> {project.address}
                      </p>
                    )}
                    <div className="mt-1 flex items-baseline gap-2 border-t pt-2">
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(grandTotal)}
                      </p>
                      {costPerSqft && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(costPerSqft)}/sqft
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
