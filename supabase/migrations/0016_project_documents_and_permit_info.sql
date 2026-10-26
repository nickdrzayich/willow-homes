-- Permit number and inspection-request phone number: quick-reference info
-- the user wants visible under the project address on the detail page.
alter table projects add column permit_number text;
alter table projects add column inspection_phone text;

-- PDF uploads for the three selection/color documents collected during a
-- build (interior selections, exterior selections, interior colors).
-- Multiple files per category, same shape as trade_images (0011_trade_details.sql).
create table project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  category text not null check (category in ('interior_selections', 'exterior_selections', 'interior_colors')),
  storage_path text not null,
  file_name text not null,
  sort_order integer not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index project_documents_project_id_idx on project_documents (project_id);

alter table project_documents enable row level security;

create policy project_documents_select on project_documents for select
  using (is_project_member(project_id));

create policy project_documents_insert on project_documents for insert
  with check (is_project_member(project_id, 'editor'));

create policy project_documents_update on project_documents for update
  using (is_project_member(project_id, 'editor'));

create policy project_documents_delete on project_documents for delete
  using (is_project_member(project_id, 'editor'));

-- Storage: private bucket for the uploaded PDFs.
-- Path convention: {project_id}/{category}/{filename} -- storage.foldername(name)[1]
-- is the project_id, same convention as trade-images/bid-files.
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false);

create policy project_documents_storage_select on storage.objects for select
  using (
    bucket_id = 'project-documents'
    and is_project_member(((storage.foldername(name))[1])::uuid)
  );

create policy project_documents_storage_insert on storage.objects for insert
  with check (
    bucket_id = 'project-documents'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy project_documents_storage_update on storage.objects for update
  using (
    bucket_id = 'project-documents'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy project_documents_storage_delete on storage.objects for delete
  using (
    bucket_id = 'project-documents'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );
