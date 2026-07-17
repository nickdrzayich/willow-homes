-- Core schema: profiles, projects, project_members, companies, trades, bids

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  sqft numeric,
  tax_rate numeric not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type member_role as enum ('owner', 'editor', 'viewer');
create type member_status as enum ('invited', 'active');

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  invited_email text not null,
  role member_role not null default 'viewer',
  status member_status not null default 'invited',
  invited_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint project_members_user_unique unique (project_id, user_id),
  constraint project_members_email_unique unique (project_id, invited_email)
);

-- Auto-add the creator of a project as its owner.
create function handle_new_project()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, invited_email, role, status, invited_by)
  select new.id, new.created_by, p.email, 'owner', 'active', new.created_by
  from public.profiles p where p.id = new.created_by;
  return new;
end;
$$;

create trigger on_project_created
  after insert on projects
  for each row execute function handle_new_project();

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create unique index companies_name_unique_ci on companies (lower(trim(name)));

create table trades (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  qty numeric not null default 1,
  sort_order integer not null default 0,
  excluded_from_vertical boolean not null default false,
  created_at timestamptz not null default now()
);

create index trades_project_id_idx on trades (project_id);

create type bid_status as enum ('sent', 'estimate', 'actual');

create table bids (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades(id) on delete cascade,
  company_id uuid references companies(id),
  amount numeric,
  status bid_status not null default 'sent',
  is_winner boolean not null default false,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bids_trade_id_idx on bids (trade_id);
create index bids_company_id_idx on bids (company_id);

-- At most one winning bid per trade.
create unique index one_winner_per_trade on bids (trade_id) where (is_winner);

-- Aggregate view: sum of winning bid amounts per project.
create view project_totals as
select
  t.project_id,
  sum(b.amount) filter (where b.is_winner) as grand_total
from trades t
join bids b on b.trade_id = t.id
group by t.project_id;

-- Keep updated_at fresh on projects/bids.
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger bids_set_updated_at
  before update on bids
  for each row execute function set_updated_at();
