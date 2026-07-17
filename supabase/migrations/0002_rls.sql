-- Row Level Security: every table is gated through project_members.

-- Views run as their owner by default, which would bypass RLS on the
-- underlying tables. security_invoker makes it run as the querying user.
alter view project_totals set (security_invoker = on);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table companies enable row level security;
alter table trades enable row level security;
alter table bids enable row level security;

-- Role hierarchy: owner > editor > viewer.
create function role_rank(r member_role)
returns int
language sql
immutable
as $$
  select case r when 'owner' then 3 when 'editor' then 2 when 'viewer' then 1 end;
$$;

create function is_project_member(p_project_id uuid, min_role member_role default 'viewer')
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from project_members m
    where m.project_id = p_project_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and role_rank(m.role) >= role_rank(min_role)
  );
$$;

-- profiles: users can see their own profile and profiles of people they share a project with.
create policy profiles_select on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from project_members mine
      join project_members theirs on theirs.project_id = mine.project_id
      where mine.user_id = auth.uid() and mine.status = 'active'
        and theirs.user_id = profiles.id and theirs.status = 'active'
    )
  );

create policy profiles_update_self on profiles for update
  using (id = auth.uid());

-- projects
-- Members can see the full project; someone with a pending invite can see
-- just enough (via this same row-level policy) to identify the project
-- they're being invited to, before they've accepted. created_by = auth.uid()
-- is included directly (not just via is_project_member) because INSERT
-- ... RETURNING re-checks the SELECT policy against the just-inserted row,
-- and at that point it can't reliably see the owner project_members row
-- that the on_project_created trigger creates in the same statement --
-- checking the projects row's own created_by column sidesteps that.
create policy projects_select on projects for select
  using (
    created_by = auth.uid()
    or is_project_member(id)
    or exists (
      select 1 from project_members m
      where m.project_id = projects.id
        and m.invited_email = auth.email()
        and m.status = 'invited'
    )
  );

create policy projects_insert on projects for insert
  with check (created_by = auth.uid());

create policy projects_update on projects for update
  using (is_project_member(id, 'owner'));

create policy projects_delete on projects for delete
  using (is_project_member(id, 'owner'));

-- project_members
-- A user can see membership rows for projects they belong to, plus their
-- own pending invites (not yet active, so is_project_member wouldn't match).
create policy project_members_select on project_members for select
  using (is_project_member(project_id) or invited_email = auth.email());

create policy project_members_insert on project_members for insert
  with check (is_project_member(project_id, 'owner'));

create policy project_members_update_owner on project_members for update
  using (is_project_member(project_id, 'owner'));

create policy project_members_delete on project_members for delete
  using (is_project_member(project_id, 'owner'));

-- Invite acceptance goes through this function rather than a client-side
-- UPDATE policy, so an invitee can only flip their own row to active and
-- can never change the role they were invited with (no self-escalation).
create function accept_project_invite(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update project_members
  set user_id = auth.uid(), status = 'active'
  where project_id = p_project_id
    and invited_email = auth.email()
    and status = 'invited';

  if not found then
    raise exception 'No pending invite found for this project and account email';
  end if;
end;
$$;

-- companies: shared directory, readable/writable by any authenticated user.
create policy companies_select on companies for select
  using (auth.uid() is not null);

create policy companies_insert on companies for insert
  with check (auth.uid() is not null);

create policy companies_update on companies for update
  using (auth.uid() is not null);

-- trades: gated through the parent project.
create policy trades_select on trades for select
  using (is_project_member(project_id));

create policy trades_insert on trades for insert
  with check (is_project_member(project_id, 'editor'));

create policy trades_update on trades for update
  using (is_project_member(project_id, 'editor'));

create policy trades_delete on trades for delete
  using (is_project_member(project_id, 'editor'));

-- bids: gated through trades -> project.
create policy bids_select on bids for select
  using (is_project_member((select project_id from trades where trades.id = bids.trade_id)));

create policy bids_insert on bids for insert
  with check (is_project_member((select project_id from trades where trades.id = bids.trade_id), 'editor'));

create policy bids_update on bids for update
  using (is_project_member((select project_id from trades where trades.id = bids.trade_id), 'editor'));

create policy bids_delete on bids for delete
  using (is_project_member((select project_id from trades where trades.id = bids.trade_id), 'editor'));
