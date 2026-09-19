-- Invited emails are lowercased on the way in (lib/actions/members.ts), but
-- every comparison against auth.email() was case-sensitive. If an account's
-- actual auth email has different casing than what was typed, the invitee
-- could never see or accept the invite, with zero error shown either way.
drop policy projects_select on projects;
create policy projects_select on projects for select
  using (
    created_by = auth.uid()
    or is_project_member(id)
    or exists (
      select 1 from project_members m
      where m.project_id = projects.id
        and lower(m.invited_email) = lower(auth.email())
        and m.status = 'invited'
    )
  );

drop policy project_members_select on project_members;
create policy project_members_select on project_members for select
  using (is_project_member(project_id) or lower(invited_email) = lower(auth.email()));

create or replace function accept_project_invite(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update project_members
  set user_id = auth.uid(), status = 'active'
  where project_id = p_project_id
    and lower(invited_email) = lower(auth.email())
    and status = 'invited';

  if not found then
    raise exception 'No pending invite found for this project and account email';
  end if;
end;
$$;
