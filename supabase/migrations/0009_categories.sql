-- Product/service categories, moved from a hardcoded source constant
-- (lib/default-products-services.ts) into a real, admin-managed table so
-- they can be renamed from the app -- a rename needs to touch three places
-- (the category itself, every existing trade with that name, and every
-- subcontractor tagged with it), which only a real table + RPC can do
-- atomically.

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index categories_name_unique_ci on categories (lower(trim(name)));

-- Seed with the existing standard checklist, in its current order.
insert into categories (name, sort_order) values
  ('Appliances', 0),
  ('Cabinets & hardware', 1),
  ('Central Vac', 2),
  ('Construction Doors', 3),
  ('Culverts', 4),
  ('Door Hardware', 5),
  ('Drywall Labor & Material', 6),
  ('Electrical', 7),
  ('Electrical Fixtures', 8),
  ('Engineering', 9),
  ('Excavation (including Culverts)', 10),
  ('Exterior & Interior Doors', 11),
  ('Exterior Masonry', 12),
  ('Exterior Paint', 13),
  ('Fencing', 14),
  ('Final Clean & Windows', 15),
  ('Financing Costs', 16),
  ('Finish Trim Labor', 17),
  ('Finish Trim Material', 18),
  ('Fireplace - Great Room', 19),
  ('Fireplace - Primary Bedroom', 20),
  ('Fireplace Mantle - Great Room', 21),
  ('Flatwork (Garage, Porch, Patio, Driveway)', 22),
  ('Floor Trusses', 23),
  ('Foundation/Footings', 24),
  ('Framing Labor', 25),
  ('Front Door', 26),
  ('Garage Doors', 27),
  ('Gutters', 28),
  ('HVAC', 29),
  ('Insulation', 30),
  ('Interior Doors', 31),
  ('Interior Masonry', 32),
  ('Interior Paint', 33),
  ('Landscaping', 34),
  ('Lot Cost', 35),
  ('Low Voltage', 36),
  ('Lumber', 37),
  ('Manual J', 38),
  ('Mirrors + Install', 39),
  ('Paint (Int. & Ext)', 40),
  ('Permits', 41),
  ('Plan Design', 42),
  ('Plumbing fixtures', 43),
  ('Plumbing Labor', 44),
  ('Plumbing Tubs, Toilets, Sinks', 45),
  ('Pool', 46),
  ('Power washing', 47),
  ('Realtor Fees', 48),
  ('Restroom', 49),
  ('Roof Trusses (included in lumber)', 50),
  ('Roofing', 51),
  ('Septic system', 52),
  ('Septic Permit', 53),
  ('Shower Doors', 54),
  ('Siding Labor & Material', 55),
  ('Siding Material', 56),
  ('Sport Court (floor and Hoop(s))', 57),
  ('Stairs, Railings, Newels', 58),
  ('Stucco', 59),
  ('Surfaces (flooring, countertops, tile)', 60),
  ('Towel Hangers, Toilet Paper Holders, Etc.', 61),
  ('Trash Box', 62),
  ('Wainscoting, Paneling', 63),
  ('Window Cleaning', 64),
  ('Window Tint / Smart Tint', 65),
  ('Windows & Sliding Doors', 66);

alter table categories enable row level security;

-- Shared directory, same permission model as companies (0002_rls.sql):
-- writable by any authenticated user, not project-scoped.
create policy categories_select on categories for select
  using (auth.uid() is not null);

create policy categories_insert on categories for insert
  with check (auth.uid() is not null);

create policy categories_update on categories for update
  using (auth.uid() is not null);

-- Renames a category everywhere it's used, atomically, so it's never left
-- partially applied (e.g. the category renamed but an existing trade or a
-- subcontractor's tag still holding the old string).
create function rename_category(p_old_name text, p_new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update categories set name = p_new_name where name = p_old_name;
  update trades set name = p_new_name where name = p_old_name;
  update companies set category_names = array_replace(category_names, p_old_name, p_new_name)
    where p_old_name = any(category_names);
end;
$$;
