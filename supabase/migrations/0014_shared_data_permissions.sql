-- Shared reference data (subcontractors/contacts, categories, the build
-- schedule template) was writable by ANY authenticated user, including a
-- viewer with no edit rights on any project. Restrict writes to users who
-- are an editor or owner on at least one project -- there's no single
-- project to check a role against for this cross-project data, so this
-- checks membership globally instead.
create function is_editor_anywhere()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from project_members m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and role_rank(m.role) >= role_rank('editor')
  );
$$;

drop policy companies_insert on companies;
drop policy companies_update on companies;
drop policy companies_delete on companies;

create policy companies_insert on companies for insert
  with check (is_editor_anywhere());

create policy companies_update on companies for update
  using (is_editor_anywhere());

create policy companies_delete on companies for delete
  using (is_editor_anywhere());

drop policy company_contacts_insert on company_contacts;
drop policy company_contacts_update on company_contacts;
drop policy company_contacts_delete on company_contacts;

create policy company_contacts_insert on company_contacts for insert
  with check (is_editor_anywhere());

create policy company_contacts_update on company_contacts for update
  using (is_editor_anywhere());

create policy company_contacts_delete on company_contacts for delete
  using (is_editor_anywhere());

drop policy categories_insert on categories;
drop policy categories_update on categories;

create policy categories_insert on categories for insert
  with check (is_editor_anywhere());

create policy categories_update on categories for update
  using (is_editor_anywhere());

-- Categories previously had no delete policy at all (the checklist could
-- only grow). Blocking-if-in-use is enforced in the app layer (it needs to
-- check both trades.name and companies.category_names, which isn't a single
-- FK), so this just gates who is allowed to attempt it.
create policy categories_delete on categories for delete
  using (is_editor_anywhere());

drop policy build_schedule_template_insert on build_schedule_template;
drop policy build_schedule_template_update on build_schedule_template;
drop policy build_schedule_template_delete on build_schedule_template;

create policy build_schedule_template_insert on build_schedule_template for insert
  with check (is_editor_anywhere());

create policy build_schedule_template_update on build_schedule_template for update
  using (is_editor_anywhere());

create policy build_schedule_template_delete on build_schedule_template for delete
  using (is_editor_anywhere());

-- rename_category matched category/trade names case-sensitively even though
-- categories.name is only unique case-insensitively (categories_name_unique_ci
-- in 0009_categories.sql), so renaming e.g. "hvac" to fix its casing to "HVAC"
-- wouldn't actually touch any trade or subcontractor tag using a different
-- casing of the old name.
create or replace function rename_category(p_old_name text, p_new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update categories set name = p_new_name where lower(trim(name)) = lower(trim(p_old_name));
  update trades set name = p_new_name where lower(trim(name)) = lower(trim(p_old_name));
  update companies set category_names =
    (select array_agg(case when lower(trim(c)) = lower(trim(p_old_name)) then p_new_name else c end)
     from unnest(category_names) as c)
    where exists (select 1 from unnest(category_names) as c where lower(trim(c)) = lower(trim(p_old_name)));
end;
$$;

-- is_project_member() and accept_project_invite() filter project_members by
-- user_id and invited_email on nearly every request; neither had an index.
create index project_members_user_id_idx on project_members (user_id);
create index project_members_invited_email_idx on project_members (invited_email);
