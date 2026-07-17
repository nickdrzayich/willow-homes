-- Unlimited named contacts per company (subcontractor), e.g. multiple people
-- at the same electrical company with their own phone/email.

create table company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index company_contacts_company_id_idx on company_contacts (company_id);

alter table company_contacts enable row level security;

-- Same trust model as companies: shared directory, any authenticated user
-- can read/write.
create policy company_contacts_select on company_contacts for select
  using (auth.uid() is not null);

create policy company_contacts_insert on company_contacts for insert
  with check (auth.uid() is not null);

create policy company_contacts_update on company_contacts for update
  using (auth.uid() is not null);

create policy company_contacts_delete on company_contacts for delete
  using (auth.uid() is not null);
