-- Free-form spec details per product/service (trade): a paragraph
-- description plus a photo gallery, e.g. "Appliances: Bosch stainless
-- package, panel-ready fridge" with reference photos. Powers a project
-- spec sheet export that shows only this content -- no subcontractor/bid
-- info.

alter table trades add column description text;

create table trade_images (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  sort_order integer not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index trade_images_trade_id_idx on trade_images (trade_id);

alter table trade_images enable row level security;

-- trade_images: gated through trades -> project, same as bids.
create policy trade_images_select on trade_images for select
  using (is_project_member((select project_id from trades where trades.id = trade_images.trade_id)));

create policy trade_images_insert on trade_images for insert
  with check (is_project_member((select project_id from trades where trades.id = trade_images.trade_id), 'editor'));

create policy trade_images_update on trade_images for update
  using (is_project_member((select project_id from trades where trades.id = trade_images.trade_id), 'editor'));

create policy trade_images_delete on trade_images for delete
  using (is_project_member((select project_id from trades where trades.id = trade_images.trade_id), 'editor'));

-- Storage: private bucket for product/service spec photos.
-- Path convention: {project_id}/{trade_id}/{filename} -- storage.foldername(name)[1]
-- is the project_id, which lets these policies reuse is_project_member() directly.
insert into storage.buckets (id, name, public)
values ('trade-images', 'trade-images', false);

create policy trade_images_storage_select on storage.objects for select
  using (
    bucket_id = 'trade-images'
    and is_project_member(((storage.foldername(name))[1])::uuid)
  );

create policy trade_images_storage_insert on storage.objects for insert
  with check (
    bucket_id = 'trade-images'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy trade_images_storage_update on storage.objects for update
  using (
    bucket_id = 'trade-images'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy trade_images_storage_delete on storage.objects for delete
  using (
    bucket_id = 'trade-images'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );
