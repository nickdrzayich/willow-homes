-- Tag each subcontractor with the product/service categories they do,
-- so the directory can be filtered by category (e.g. "show me all
-- Electrical subs") independent of bid history. Values are drawn from the
-- same standard checklist used to seed new projects (kept as a plain text
-- array rather than a foreign-key vocabulary table, matching the "fixed
-- list for now" approach used for that checklist).
alter table companies add column category_names text[] not null default '{}';
