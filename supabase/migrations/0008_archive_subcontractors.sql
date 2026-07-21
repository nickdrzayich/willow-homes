-- Subcontractors with bid history can't be hard-deleted (bids.company_id has
-- no ON DELETE rule, protecting bid attribution) -- archiving hides them from
-- the active directory/picker instead. True delete stays available for
-- subcontractors with zero bids.

alter table companies add column archived_at timestamptz;

-- Matches the existing companies_select/insert/update policies: shared
-- directory, writable by any authenticated user, no project-scoped role check.
create policy companies_delete on companies for delete
  using (auth.uid() is not null);
