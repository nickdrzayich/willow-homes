-- Simple deposits/withdrawals ledger per project (the dedicated project bank
-- account) -- fully manual record-keeping, independent of the expenses table.

create type transaction_type as enum ('deposit', 'withdrawal');

create table account_transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  transaction_date date not null default current_date,
  type transaction_type not null,
  amount numeric not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index account_transactions_project_id_idx on account_transactions (project_id);
create index account_transactions_date_idx on account_transactions (transaction_date);

create trigger account_transactions_set_updated_at
  before update on account_transactions
  for each row execute function set_updated_at();

alter table account_transactions enable row level security;

create policy account_transactions_select on account_transactions for select
  using (is_project_member(project_id));

create policy account_transactions_insert on account_transactions for insert
  with check (is_project_member(project_id, 'editor'));

create policy account_transactions_update on account_transactions for update
  using (is_project_member(project_id, 'editor'));

create policy account_transactions_delete on account_transactions for delete
  using (is_project_member(project_id, 'editor'));
