-- Daily job-site log (per project) + shared build-schedule reference,
-- replacing the "actual" and "template" tabs of the process-documentation
-- spreadsheet.

-- Shared reference guide, keyed by relative build-day number (not real
-- dates) -- same permission shape as categories (0009_categories.sql).
create table build_schedule_template (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null unique,
  tasks text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

alter table build_schedule_template enable row level security;

create policy build_schedule_template_select on build_schedule_template for select
  using (auth.uid() is not null);

create policy build_schedule_template_insert on build_schedule_template for insert
  with check (auth.uid() is not null);

create policy build_schedule_template_update on build_schedule_template for update
  using (auth.uid() is not null);

-- Unlike categories, nothing references this table via foreign key, so
-- deleting a day (e.g. one added by mistake) carries no referential-
-- integrity risk.
create policy build_schedule_template_delete on build_schedule_template for delete
  using (auth.uid() is not null);

-- Seed with the 76 non-blank days extracted from the source spreadsheet's
-- "template" tab.
insert into build_schedule_template (day_number, tasks, notes) values
  (1, ARRAY['Layout House', 'Order Temp Power Pole', 'Order Windows & Trusses', 'Call Dasco for natural gas']::text[], 'Need to know foundation wall height. Elec. will need permit # to order pole. Cameron with Dasco  ‭(208) 941-9266 (boise area) Angel  (208) 505-7858‬ (eagle area). Dasco can''t really do anything until theres a hole in the ground.'),
  (2, ARRAY['Temp power meter', 'Request insurance']::text[], 'Idahopower.com → accounts & service → construction portal → Create new request → temp service request. you will need the number of temp amps and amps (not sure what this means), and the permit number from the electrician'),
  (3, ARRAY['Excavate']::text[], 'No steps in foundation is ideal -
1 day for dig
Then Concrete (3 days)
1 day for utilities
1 day for inspection
3 days of back fill/prep
Then flat work concrete (2 days)'),
  (4, ARRAY['Set footing forms']::text[], 'You''ll need to know where the grounding rod will go (this is where electrical meter will be on outside of house and panel in garage.'),
  (5, ARRAY['Form inspection']::text[], 'foundation co. calls this in. willow did this via eagle contractor portal'),
  (6, ARRAY['Pour footings']::text[], null),
  (7, ARRAY['strip footings']::text[], null),
  (8, ARRAY['set foundation forms']::text[], null),
  (9, ARRAY['pour foundation']::text[], null),
  (10, ARRAY['strip foundation']::text[], null),
  (11, ARRAY['Utilities', 'Order Lumber', 'Check on window order']::text[], 'Foundation forms can be stripped the same day they start utilities. noah needs 3-4 days lead time to drop lumber'),
  (12, ARRAY['Utility inspection', 'Call Dasco for gas hookup']::text[], 'Once utilities are in, inspected and backfilled dasco/int. Gas can get gas hooked up. Call them the day you''re getting utilities inspected.'),
  (13, ARRAY['Flatwork prep']::text[], null),
  (14, ARRAY['Flatwork pour']::text[], null),
  (15, ARRAY['lumber drop', 'framing']::text[], 'Be sure to leave several two by fours on site for electrical Rough and two by sixes for blocking'),
  (28, ARRAY['pocket door measure', 'construction door measure']::text[], 'when walls are up. door company (franklin, etc.)'),
  (29, ARRAY['Schedule plumbing rough', 'schedule fireplace rough']::text[], 'need to know your cabinet layout and fixture locations for plumber, plumbing co. orders inspection. fireplace co. orders inspetion'),
  (30, ARRAY['hvac tentative rough', 'vacuum tentative rough', 'electrical tentative rough', 'low volt tentative rough']::text[], 'need to know appliances that take gas, cabinet layout and gas stub locations. hvac co. orders inspection'),
  (31, ARRAY['Trusses delivered', 'deliver construction doors']::text[], null),
  (32, ARRAY['Order tubs']::text[], null),
  (42, ARRAY['Windows Delivered']::text[], 'typically framer likes windows after he has set trusses and sheeted the roof'),
  (43, ARRAY['Dry in roof', 'fireplace install', 'insulate tubs']::text[], 'fireplace co orders inspection. Please schedule installations after framing is complete and insulation (if needed) has been placed on exterior wall inside the firebox cavity (with tubs, showers, etc) - We like to be one of the first trades in the home if possible'),
  (44, ARRAY['shear wall/nail inspection']::text[], 'before you do any rough ins, call for a shear nailing inspection. not requied in Eagle. You CAN dry in the roof before this inspection.'),
  (45, ARRAY['plumbing rough in', 'septic system install', 'order garage doors']::text[], 'need to know your cabinet layout and fixture locations for plumber, plumbing co. orders inspection. make sure cleanouts are accessible based on cabinet drawings'),
  (48, ARRAY['plumbing inspection', 'calll for water meter']::text[], 'After plumbing passes call veolia(or whoever) to get the water meter set (veolio new const. = 208-362-7304) for eagle call City of eagle water dept.'),
  (49, ARRAY['hvac rough in']::text[], 'need to know appliances that take gas, cabinet layout and gas stub locations. hvac co. orders inspection'),
  (52, ARRAY['hvac inspection', 'gas meter set']::text[], 'You will need the MEC permit number and number of BTUs needed. (hvac guy will tell you this) also make sure gas line is connected, pressure tested and tagged.'),
  (53, ARRAY['Vacuum rough in']::text[], null),
  (54, ARRAY['Electrical rough in']::text[], 'You will need to know your cabinet layout and all appliances for electrical to get it right'),
  (58, ARRAY['electrial inspection']::text[], 'electrician orders inspection.'),
  (59, ARRAY['low voltage rough in', 'get power moved to house']::text[], 'After electrical rough in call and get temp power moved to permanent or do it through your idaho power portal'),
  (60, ARRAY['fire sprinkler rough in']::text[], null),
  (61, ARRAY['Water turned on', 'air seal', 'order siding/soffit/fascia']::text[], null),
  (62, ARRAY['framing inspection']::text[], null),
  (63, ARRAY['framing corrections']::text[], null),
  (64, ARRAY['framing re-inspection']::text[], null),
  (65, ARRAY['insulation', 'soffit/fascia/siding', 'Stucco lath']::text[], 'Soffit and fascia needs framing and electrical inspections passed'),
  (66, ARRAY['Shingle Roof']::text[], 'need fascia done first. at or before drywall starts'),
  (67, ARRAY['insulation inspection', 'fire furnace']::text[], 'builder orders this'),
  (68, ARRAY['drywall', 'farmhouse sink to cab shop']::text[], 'kyles cabs will bring sink with them when they install'),
  (82, ARRAY['cabinet measure', 'stucco brown coat']::text[], null),
  (83, ARRAY['Change furnace filter']::text[], null),
  (84, ARRAY['install garage doors']::text[], null),
  (85, ARRAY['Ext. paint']::text[], null),
  (92, ARRAY['deliver trim material']::text[], null),
  (93, ARRAY['Finish Carpentry']::text[], null),
  (101, ARRAY['interior paint']::text[], 'After tim carpenter paint comes in paint will prep prime trim and walls and finish them out.  I need interior colors including stain if you have stain material in house I am finishing.  Heat.  It''s cold so hopefully furnace is up and running.'),
  (108, ARRAY['deliver cabs']::text[], null),
  (109, ARRAY['cabinet install', 'sinks to granite shop', 'plumbing up through island']::text[], 'let plumber & electrician know when kitchen island base cabs are in so he can bring plumbing/electrical up through'),
  (110, ARRAY['change filter']::text[], null),
  (112, ARRAY['granite template', 'laminate install', 'tile floors', 'vinyl install']::text[], null),
  (113, ARRAY['Electrical switches and cans']::text[], null),
  (115, ARRAY['Stucco color coat']::text[], null),
  (121, ARRAY['Granite install', 'schedule hvac trim']::text[], null),
  (123, ARRAY['exterior masonry']::text[], null),
  (124, ARRAY['interior masonry']::text[], null),
  (127, ARRAY['measure shower doors/mirrors']::text[], null),
  (128, ARRAY['tile backsplashes']::text[], null),
  (130, ARRAY['plumbing trim']::text[], null),
  (132, ARRAY['appliance delivery']::text[], null),
  (134, ARRAY['hvac trim']::text[], 'hvac trim needs 2 week notice'),
  (135, ARRAY['order door hardware, etc']::text[], 'door hardware, closet rods, TP holders, towel rods/hooks'),
  (136, ARRAY['hardwood install', 'shower door install']::text[], null),
  (138, ARRAY['electrical fixtures', 'vaccum trim']::text[], null),
  (140, ARRAY['carpet install', 'Electrical final inspection', 'plumbing final inspection']::text[], null),
  (141, ARRAY['deliver Bump Pack', 'HVAC Final Inspection']::text[], null),
  (142, ARRAY['Paint Base']::text[], null),
  (143, ARRAY['Cabinet Bump Out', 'mirrors install', 'trim bump out']::text[], 'schedule trim bump 2 days after carpet so they can put doors on with carpet in'),
  (146, ARRAY['appliance install', 'fireplace trim']::text[], null),
  (147, ARRAY['Low Voltage Trim', 'Plumbing Final Inspection']::text[], null),
  (148, ARRAY['Drywall Touchups', 'Gutters', 'Rough Clean']::text[], null),
  (149, ARRAY['Cabinet Touchups', 'Landscaping', 'Paint Touchups']::text[], null),
  (150, ARRAY['C of O']::text[], null),
  (151, ARRAY['Final Clean', 'Final Ext. Clean & Wash', 'Fire Sprinkler - Finish']::text[], null),
  (152, ARRAY['duct cleaning']::text[], null),
  (153, ARRAY['punchlist']::text[], null);

-- Per-project daily job-site log -- same shape/permissions as expenses
-- (0006_expenses.sql).
create table daily_log_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  log_date date not null default current_date,
  tasks text[] not null default '{}',
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_log_entries_project_date_unique unique (project_id, log_date)
);

create index daily_log_entries_project_id_idx on daily_log_entries (project_id);

create trigger daily_log_entries_set_updated_at
  before update on daily_log_entries
  for each row execute function set_updated_at();

alter table daily_log_entries enable row level security;

create policy daily_log_entries_select on daily_log_entries for select
  using (is_project_member(project_id));

create policy daily_log_entries_insert on daily_log_entries for insert
  with check (is_project_member(project_id, 'editor'));

create policy daily_log_entries_update on daily_log_entries for update
  using (is_project_member(project_id, 'editor'));

create policy daily_log_entries_delete on daily_log_entries for delete
  using (is_project_member(project_id, 'editor'));
