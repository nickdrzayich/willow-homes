-- Expense tracking + monthly owner invoices.
-- Two independent money flows, each with its own status:
--   expenses.paid_status    -- Willow Homes -> vendor/subcontractor (has the bill been paid?)
--   monthly_invoices.status -- Owner -> Willow Homes (has the monthly invoice been paid?)

alter table projects add column builder_fee_percent numeric not null default 20;

create type expense_category as enum (
  'subcontractor',
  'material',
  'permit_fee',
  'general_conditions',
  'change_order',
  'allowance_overage',
  'unforeseen_condition',
  'other'
);

create type expense_paid_status as enum ('unpaid', 'paid');

create type invoice_status as enum ('draft', 'sent', 'paid');

create table monthly_invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status invoice_status not null default 'draft',
  subtotal numeric not null default 0,
  builder_fee_percent numeric not null,
  builder_fee_amount numeric not null default 0,
  total numeric not null default 0,
  sent_at timestamptz,
  paid_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint monthly_invoices_period_unique unique (project_id, period_start)
);

create index monthly_invoices_project_id_idx on monthly_invoices (project_id);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  invoice_id uuid references monthly_invoices(id) on delete set null,
  expense_date date not null default current_date,
  category expense_category not null default 'other',
  vendor_name text,
  description text,
  amount numeric not null,
  billable boolean not null default true,
  paid_status expense_paid_status not null default 'unpaid',
  paid_date date,
  invoice_file_path text,
  invoice_file_name text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_project_id_idx on expenses (project_id);
create index expenses_invoice_id_idx on expenses (invoice_id);
create index expenses_date_idx on expenses (expense_date);

create trigger expenses_set_updated_at
  before update on expenses
  for each row execute function set_updated_at();

-- RLS: same shape as trades/bids in 0002_rls.sql.
alter table expenses enable row level security;
alter table monthly_invoices enable row level security;

create policy expenses_select on expenses for select
  using (is_project_member(project_id));

create policy expenses_insert on expenses for insert
  with check (is_project_member(project_id, 'editor'));

create policy expenses_update on expenses for update
  using (is_project_member(project_id, 'editor'));

create policy expenses_delete on expenses for delete
  using (is_project_member(project_id, 'editor'));

create policy monthly_invoices_select on monthly_invoices for select
  using (is_project_member(project_id));

create policy monthly_invoices_insert on monthly_invoices for insert
  with check (is_project_member(project_id, 'editor'));

create policy monthly_invoices_update on monthly_invoices for update
  using (is_project_member(project_id, 'editor'));

create policy monthly_invoices_delete on monthly_invoices for delete
  using (is_project_member(project_id, 'owner'));

-- Storage: private bucket for uploaded vendor invoices/receipts.
-- Path convention: {project_id}/{expense_id}/{filename} -- storage.foldername(name)[1]
-- is the project_id, which lets these policies reuse is_project_member() directly.
insert into storage.buckets (id, name, public)
values ('expense-invoices', 'expense-invoices', false);

create policy expense_invoices_select on storage.objects for select
  using (
    bucket_id = 'expense-invoices'
    and is_project_member(((storage.foldername(name))[1])::uuid)
  );

create policy expense_invoices_insert on storage.objects for insert
  with check (
    bucket_id = 'expense-invoices'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy expense_invoices_update on storage.objects for update
  using (
    bucket_id = 'expense-invoices'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy expense_invoices_delete on storage.objects for delete
  using (
    bucket_id = 'expense-invoices'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );
