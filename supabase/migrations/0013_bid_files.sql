-- Lets a bid carry an attached file -- a PDF or photo of the actual bid
-- document from the subcontractor. Same shape as expenses' invoice file
-- (0006_expenses.sql): a path + display name on the row, uploaded directly
-- from the browser to storage so it never touches the Server Action body.

alter table bids add column file_path text;
alter table bids add column file_name text;

-- Storage: private bucket for bid documents.
-- Path convention: {project_id}/{bid_id}/{filename} -- storage.foldername(name)[1]
-- is the project_id, which lets these policies reuse is_project_member()
-- directly, same as expense-invoices.
insert into storage.buckets (id, name, public)
values ('bid-files', 'bid-files', false);

create policy bid_files_select on storage.objects for select
  using (
    bucket_id = 'bid-files'
    and is_project_member(((storage.foldername(name))[1])::uuid)
  );

create policy bid_files_insert on storage.objects for insert
  with check (
    bucket_id = 'bid-files'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy bid_files_update on storage.objects for update
  using (
    bucket_id = 'bid-files'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );

create policy bid_files_delete on storage.objects for delete
  using (
    bucket_id = 'bid-files'
    and is_project_member(((storage.foldername(name))[1])::uuid, 'editor')
  );
