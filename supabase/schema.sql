-- ══════════════════════════════════════════════════════════════════════════════
-- SUPERPOWER HUB — COMBINED SCHEMA
-- Generated from migrations:
--   - 20260313000001_complete_schema.sql
--   - 20260313000002_crm_write_policies.sql
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 0. Extensions ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;


-- ── 1. Shared utility ─────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


-- ── 2. Marketplace categories (CRM-managed) ───────────────────────────────────

create table if not exists public.marketplace_categories (
  id         uuid    primary key default gen_random_uuid(),
  key        text    not null unique,
  name       text    not null,
  emoji      text    not null default '🏪',
  color      text    not null default '#22A06B',
  wash       text    not null default '#EDF8F2',
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists marketplace_categories_updated_at on public.marketplace_categories;
create trigger marketplace_categories_updated_at
  before update on public.marketplace_categories
  for each row execute function public.set_updated_at();

alter table public.marketplace_categories enable row level security;

drop policy if exists "Public read marketplace_categories" on public.marketplace_categories;
create policy "Public read marketplace_categories"
  on public.marketplace_categories for select using (true);

-- CRM write policy (auth enforced at Next.js API layer)
drop policy if exists "CRM write marketplace_categories" on public.marketplace_categories;
create policy "CRM write marketplace_categories"
  on public.marketplace_categories for all
  using (true) with check (true);


-- ── 3. Marketplace locations (CRM-managed) ────────────────────────────────────

create table if not exists public.marketplace_locations (
  id         uuid    primary key default gen_random_uuid(),
  name       text    not null unique,
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists marketplace_locations_updated_at on public.marketplace_locations;
create trigger marketplace_locations_updated_at
  before update on public.marketplace_locations
  for each row execute function public.set_updated_at();

alter table public.marketplace_locations enable row level security;

drop policy if exists "Public read marketplace_locations" on public.marketplace_locations;
create policy "Public read marketplace_locations"
  on public.marketplace_locations for select using (true);

-- CRM write policy (auth enforced at Next.js API layer)
drop policy if exists "CRM write marketplace_locations" on public.marketplace_locations;
create policy "CRM write marketplace_locations"
  on public.marketplace_locations for all
  using (true) with check (true);


-- ── 4. Ideas library ──────────────────────────────────────────────────────────

create table if not exists public.idea_categories (
  id         text    primary key,
  label      text    not null,
  label_sa   text    not null,
  emoji      text    not null default '⚡',
  color      text    not null default '#22A06B',
  wash       text    not null default '#EDF8F2',
  sort_order integer not null default 0
);

alter table public.idea_categories enable row level security;
drop policy if exists "Public read idea_categories" on public.idea_categories;
create policy "Public read idea_categories"
  on public.idea_categories for select using (true);

create table if not exists public.ideas (
  id             text    primary key,
  category_id    text    not null references public.idea_categories(id),
  emoji          text    not null default '⚡',
  name           text    not null,
  name_sa        text    not null,
  description    text    not null,
  description_sa text    not null,
  earning        text    not null default 'R50–R300/day',
  active         boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default timezone('utc', now()),
  updated_at     timestamptz not null default timezone('utc', now())
);

drop trigger if exists ideas_updated_at on public.ideas;
create trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

alter table public.ideas enable row level security;
drop policy if exists "Public read ideas" on public.ideas;
create policy "Public read ideas"
  on public.ideas for select using (true);


-- ── 5. Business plans ─────────────────────────────────────────────────────────

create table if not exists public.business_plans (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  idea_id             text references public.ideas(id),
  idea_name           text not null,
  business_name       text not null,
  founder_name        text not null,
  neighborhood        text,
  problem             text not null default '',
  solution            text not null default '',
  target_customers    text not null default '',
  marketing_and_sales text not null default '',
  startup_costs       text not null default '',
  pricing_and_revenue text not null default '',
  mvp                 text not null default '',
  created_at          timestamptz not null default timezone('utc', now()),
  updated_at          timestamptz not null default timezone('utc', now())
);

drop trigger if exists business_plans_updated_at on public.business_plans;
create trigger business_plans_updated_at
  before update on public.business_plans
  for each row execute function public.set_updated_at();

create index if not exists business_plans_user_id_idx on public.business_plans(user_id);

alter table public.business_plans enable row level security;

drop policy if exists "Users can view their own business plans" on public.business_plans;
create policy "Users can view their own business plans"
  on public.business_plans for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own business plans" on public.business_plans;
create policy "Users can insert their own business plans"
  on public.business_plans for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own business plans" on public.business_plans;
create policy "Users can update their own business plans"
  on public.business_plans for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own business plans" on public.business_plans;
create policy "Users can delete their own business plans"
  on public.business_plans for delete to authenticated
  using (auth.uid() = user_id);


-- ── 6. Builder profiles ───────────────────────────────────────────────────────

create table if not exists public.profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  business_plan_id uuid references public.business_plans(id) on delete set null,
  idea_id          text references public.ideas(id),
  slug             text unique,
  name             text not null,
  business_name    text,
  wijk             text,
  bio              text,
  tagline          text,
  story            text,
  availability     text,
  promise          text,
  photo_url        text,
  services         jsonb    not null default '[]'::jsonb,
  plan             text[]   not null default '{}',
  lang             text     not null default 'sa' check (lang in ('en', 'sa')),
  is_published     boolean  not null default false,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create index if not exists profiles_slug_idx    on public.profiles(slug);
create index if not exists profiles_user_id_idx on public.profiles(user_id);

alter table public.profiles enable row level security;

drop policy if exists "Public can view published builder profiles" on public.profiles;
create policy "Public can view published builder profiles"
  on public.profiles for select
  using (is_published = true or auth.uid() = user_id);

drop policy if exists "Users can insert their own builder profiles" on public.profiles;
create policy "Users can insert their own builder profiles"
  on public.profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own builder profiles" on public.profiles;
create policy "Users can update their own builder profiles"
  on public.profiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own builder profiles" on public.profiles;
create policy "Users can delete their own builder profiles"
  on public.profiles for delete to authenticated
  using (auth.uid() = user_id);


-- ── 7. Marketplace profiles ───────────────────────────────────────────────────

create table if not exists public.marketplace_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  business_name      text not null,
  tagline            text,
  description        text,
  locations          text[]  not null default '{}',
  category           text references public.marketplace_categories(key)
                       on update cascade on delete set null,
  website            text,
  whatsapp_number    text,
  profile_photo_url  text,
  service_photo_urls text[]  not null default '{}',
  response_time      text,
  is_verified        boolean not null default false,
  is_published       boolean not null default true,
  created_at         timestamptz not null default timezone('utc', now()),
  updated_at         timestamptz not null default timezone('utc', now())
);

drop trigger if exists marketplace_profiles_updated_at on public.marketplace_profiles;
create trigger marketplace_profiles_updated_at
  before update on public.marketplace_profiles
  for each row execute function public.set_updated_at();

create index if not exists marketplace_profiles_category_idx  on public.marketplace_profiles(category);
create index if not exists marketplace_profiles_locations_idx on public.marketplace_profiles using gin(locations);

alter table public.marketplace_profiles enable row level security;

drop policy if exists "Anyone can view marketplace profiles" on public.marketplace_profiles;
create policy "Anyone can view marketplace profiles"
  on public.marketplace_profiles for select using (true);

drop policy if exists "Users can insert their own marketplace profile" on public.marketplace_profiles;
create policy "Users can insert their own marketplace profile"
  on public.marketplace_profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own marketplace profile" on public.marketplace_profiles;
create policy "Users can update their own marketplace profile"
  on public.marketplace_profiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own marketplace profile" on public.marketplace_profiles;
create policy "Users can delete their own marketplace profile"
  on public.marketplace_profiles for delete to authenticated
  using (auth.uid() = user_id);


-- ── 8. Marketplace services ───────────────────────────────────────────────────

create table if not exists public.marketplace_services (
  id          uuid    primary key default gen_random_uuid(),
  profile_id  uuid    not null references public.marketplace_profiles(id) on delete cascade,
  name        text    not null,
  price       text,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default timezone('utc', now())
);

create index if not exists marketplace_services_profile_idx on public.marketplace_services(profile_id);

alter table public.marketplace_services enable row level security;

drop policy if exists "Anyone can view marketplace services" on public.marketplace_services;
create policy "Anyone can view marketplace services"
  on public.marketplace_services for select using (true);

drop policy if exists "Profile owners can manage their services" on public.marketplace_services;
create policy "Profile owners can manage their services"
  on public.marketplace_services for all to authenticated
  using (
    auth.uid() = (select user_id from public.marketplace_profiles where id = profile_id)
  )
  with check (
    auth.uid() = (select user_id from public.marketplace_profiles where id = profile_id)
  );


-- ── 9. Reviews ────────────────────────────────────────────────────────────────

create table if not exists public.reviews (
  id            uuid    primary key default gen_random_uuid(),
  profile_id    uuid    not null references public.marketplace_profiles(id) on delete cascade,
  reviewer_id   uuid    not null references auth.users(id) on delete cascade,
  reviewer_name text    not null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  title         text,
  body          text,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now()),
  unique (profile_id, reviewer_id)
);

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create index if not exists reviews_profile_idx  on public.reviews(profile_id);
create index if not exists reviews_reviewer_idx on public.reviews(reviewer_id);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews"
  on public.reviews for select using (true);

drop policy if exists "Authenticated users can insert reviews" on public.reviews;
create policy "Authenticated users can insert reviews"
  on public.reviews for insert to authenticated
  with check (
    auth.uid() = reviewer_id
    and auth.uid() != (
      select user_id from public.marketplace_profiles where id = profile_id
    )
  );

drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update their own reviews"
  on public.reviews for update to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

drop policy if exists "Users can delete their own reviews" on public.reviews;
create policy "Users can delete their own reviews"
  on public.reviews for delete to authenticated
  using (auth.uid() = reviewer_id);


-- ── 10. Storage ───────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('marketplace', 'marketplace', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('builder', 'builder', true)
  on conflict (id) do nothing;

-- marketplace bucket
drop policy if exists "Anyone can view marketplace images"           on storage.objects;
drop policy if exists "Users can upload their own marketplace images" on storage.objects;
drop policy if exists "Users can update their own marketplace images" on storage.objects;
drop policy if exists "Users can delete their own marketplace images" on storage.objects;

create policy "Anyone can view marketplace images"
  on storage.objects for select
  using (bucket_id = 'marketplace');

create policy "Users can upload their own marketplace images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'marketplace'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own marketplace images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'marketplace'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own marketplace images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'marketplace'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- builder bucket
drop policy if exists "Anyone can view builder images"           on storage.objects;
drop policy if exists "Users can upload their own builder images" on storage.objects;
drop policy if exists "Users can update their own builder images" on storage.objects;
drop policy if exists "Users can delete their own builder images" on storage.objects;

create policy "Anyone can view builder images"
  on storage.objects for select
  using (bucket_id = 'builder');

create policy "Users can upload their own builder images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'builder'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own builder images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'builder'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own builder images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'builder'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ── 11. Seed data ─────────────────────────────────────────────────────────────

-- Marketplace categories
insert into public.marketplace_categories (key, name, emoji, color, wash, sort_order) values
  ('Creative',          'Creative',          '🎨', '#D4497A', '#FFF0F7', 1),
  ('Tech',              'Tech',              '💻', '#2B8FCC', '#EFF9FF', 2),
  ('Education',         'Education',         '📚', '#F59E0B', '#FFFBF0', 3),
  ('Food & Beverage',   'Food & Beverage',   '🍱', '#D4763C', '#FFFBF0', 4),
  ('Beauty & Wellness', 'Beauty & Wellness', '💇', '#F472B6', '#FFF0F7', 5),
  ('Services',          'Services',          '🛵', '#22A06B', '#EDF8F2', 6)
on conflict (key) do nothing;

-- Marketplace locations
insert into public.marketplace_locations (name, sort_order) values
  ('Khayelitsha',     1),
  ('Mitchells Plain', 2),
  ('Gugulethu',       3),
  ('Langa',           4),
  ('Nyanga',          5),
  ('Manenberg',       6),
  ('Philippi',        7),
  ('Hanover Park',    8),
  ('Bonteheuwel',     9),
  ('Delft',          10),
  ('Bellville South',11),
  ('Kraaifontein',   12),
  ('Blue Downs',     13),
  ('Atlantis',       14)
on conflict (name) do nothing;

-- Idea categories
insert into public.idea_categories (id, label, label_sa, emoji, color, wash, sort_order) values
  ('business',  'Business',  'Besigheid',  '💼', '#22A06B', '#EDF8F2', 1),
  ('community', 'Community', 'Gemeenskap', '🤝', '#38BDF8', '#EFF9FF', 2),
  ('learn',     'Learn',     'Leer',       '📚', '#D4763C', '#FFFBF0', 3),
  ('creative',  'Creative',  'Kreatief',   '🎨', '#F472B6', '#FFF0F7', 4),
  ('tech',      'Tech',      'Tegnologie', '💻', '#2B8FCC', '#EFF9FF', 5)
on conflict (id) do nothing;

-- 50 zero-rand business ideas
insert into public.ideas
  (id, category_id, emoji, name, name_sa, description, description_sa, earning, sort_order)
values
  -- Business (10)
  ('sneaker-rescue',     'business',  '👟', 'Sneaker Rescue',         'Sneaker-redding',
   'Premium sneaker cleaning. Advertise via WhatsApp status with before/after photos.',
   'Premium sneaker-skoonmaak. Adverteer via WhatsApp-status met voor/na-foto''s.',
   'R50–R200/day',   1),

  ('thrift-flipper',     'business',  '👗', 'Thrift Flipper',         'Tweedehandse Mode',
   'Buy second-hand clothes, wash and style them, sell on Instagram with cool photos.',
   'Koop tweedehandse klere, was en style dit, verkoop op Instagram.',
   'R80–R300/day',   2),

  ('spaza-restock',      'business',  '🛒', 'Spaza Restock Helper',   'Spaza Hervoorraad',
   'Help local Spaza shops order stock online in bulk, saving them a trip to the wholesaler.',
   'Help plaaslike Spaza-winkels om voorraad aanlyn in grootmaat te bestel.',
   'R100–R250/day',  3),

  ('queue-standin',      'business',  '🛵', 'Queue Stand-in',         'Ry-staan Diens',
   'Get paid to stand in long lines at clinics or SASSA offices for people who have to work.',
   'Kry betaal om in lang rye by klinieke of SASSA-kantore te staan.',
   'R50–R150/day',   4),

  ('late-night-bites',   'business',  '🍔', 'Late Night Bites',       'Aandete Happies',
   'Sell warm snacks like vetkoek or fries to people walking home late. Promote via WhatsApp.',
   'Verkoop warm happies soos vetkoek aan mense wat laat huis toe stap.',
   'R80–R250/day',   5),

  ('mobile-laundry',     'business',  '🧺', 'Mobile Laundry',         'Mobiele Wasgoed',
   'Collect laundry, wash it at home or a laundromat, deliver it folded the next day.',
   'Versamel wasgoed, was dit tuis of by ''n wasserette, lewer dit gevou af.',
   'R60–R200/day',   6),

  ('braiding-booker',    'business',  '💇', 'Braiding Booker',        'Vlegsel Boeking',
   'WhatsApp catalog where people can see hairstyles and book appointments with local braiders.',
   'WhatsApp-katalogus waar mense haarstyle kan sien en afsprake maak.',
   'R100–R400/day',  7),

  ('eco-car-wash',       'business',  '🚗', 'Eco Car Wash',           'Eko Motorwas',
   'Water-saving car wash service that comes to the client''s house on weekends.',
   'Waterbesparende motorwasdiens wat naweke by die kliënt se huis kom.',
   'R80–R300/day',   8),

  ('fresh-veggie-box',   'business',  '🍅', 'Fresh Veggie Box',       'Vars Groenteboks',
   'Buy veggies in bulk from the city market and deliver mixed, affordable veggie boxes locally.',
   'Koop groente in grootmaat en lewer bekostigbare groentebokse plaaslik af.',
   'R100–R350/day',  9),

  ('airtime-reseller',   'business',  '📱', 'Airtime/Data Reseller',  'Lugtyd/Data Herverkoper',
   'Buy airtime/data in bulk and resell it to neighbors late at night when shops are closed.',
   'Koop lugtyd/data in grootmaat en herverkoop dit laat snags.',
   'R40–R150/day',  10),

  -- Community (10)
  ('clinic-tracker',     'community', '🏥', 'Clinic Line Tracker',    'Kliniek Ry-tracker',
   'WhatsApp group with live updates on how long the line is at the local clinic.',
   'WhatsApp-groep met regstreekse opdaterings oor die ry by die plaaslike kliniek.',
   'R30–R80/day',   11),

  ('lost-found-bot',     'community', '🔍', 'Lost & Found Bot',       'Verloor & Gevind',
   'A page or WhatsApp group dedicated to finding lost ID books and keys in your area.',
   '''n Bladsy of groep gewy om verlore ID-boeke en sleutels te vind.',
   'R20–R60/day',   12),

  ('safety-alert',       'community', '🚨', 'Safety Alert Network',   'Veiligheid Waarskuwings',
   'Fast-alert WhatsApp system for your street to warn about crime or emergencies.',
   'Vinnige WhatsApp-waarskuwingstelsel vir jou straat oor misdaad of noodgevalle.',
   'R40–R100/day',  13),

  ('water-power-update', 'community', '💧', 'Water/Power Updates',    'Water/Krag Opdaterings',
   'Be the reliable source for loadshedding and water outage updates for your neighborhood.',
   'Wees die betroubare bron vir beurtkrag- en wateronderbrekings-opdaterings.',
   'R30–R80/day',   14),

  ('fix-it-match',       'community', '🛠', 'Local Fix-it Match',     'Plaaslike Herstel-diens',
   'Connect people who fix pipes or roofs with neighbors who need help, for a finder''s fee.',
   'Verbind mense wat pype of dakke herstel met bure wat hulp nodig het.',
   'R50–R200/day',  15),

  ('trusted-babysitters','community', '👶', 'Trusted Babysitters',    'Betroubare Oppassers',
   'Create a network of trusted, verified teenagers who can watch kids when parents work late.',
   'Skep ''n netwerk van betroubare tieners wat kinders kan oppas.',
   'R50–R150/day',  16),

  ('walking-school-bus', 'community', '🚶', 'Walking School Bus',     'Loop-skoolbus',
   'Safely walk a group of younger kids to and from school every day.',
   'Loop veilig ''n groep jonger kinders skool toe en terug.',
   'R40–R120/day',  17),

  ('street-clean-crew',  'community', '🧹', 'Street Clean Crew',      'Straat Skoonmaak Span',
   'Organize weekend clean-ups. Sell the recyclable plastic, glass, and cans for profit.',
   'Organiseer naweek-skoonmaak. Verkoop herwinbare plastiek, glas en blikkies.',
   'R60–R180/day',  18),

  ('weekend-tournament', 'community', '⚽', 'Weekend Tournament',     'Naweek Toernooi',
   'Organize local 5-a-side soccer or netball tournaments. Charge entry and get a sponsor.',
   'Organiseer plaaslike 5-a-kant sokker- of netbaltoernooie.',
   'R100–R400/day', 19),

  ('community-garden',   'community', '🌱', 'Community Garden',       'Gemeenskap Tuin',
   'Turn an empty patch into a veggie garden. Sell the fresh produce to neighbors.',
   'Maak ''n leë stuk grond ''n groentetuin. Verkoop vars produkte aan bure.',
   'R50–R200/day',  20),

  -- Learn (10)
  ('math-ai-buddy',      'learn',     '🤖', 'Math AI Buddy',          'Wiskunde AI Maat',
   'Set up a free WhatsApp bot using ChatGPT that explains difficult math homework to students.',
   'Stel ''n gratis WhatsApp-bot op wat moeilike wiskunde-huiswerk verduidelik.',
   'R30–R100/day',  21),

  ('cv-creator',         'learn',     '📄', 'CV Creator',             'CV Skepper',
   'Help older folks or school leavers create professional CVs on your phone using Canva.',
   'Help ouer mense of skoolverlaters om professionele CV''s op jou foon te maak.',
   'R40–R150/day',  22),

  ('textbook-swap',      'learn',     '📚', 'Textbook Swap',          'Handboek Ruil',
   'Run a platform where students can swap or buy cheap second-hand school books.',
   'Bestuur ''n platform waar studente tweedehandse skoolboeke kan ruil of koop.',
   'R30–R100/day',  23),

  ('bursary-finder',     'learn',     '🎓', 'Bursary Finder',         'Beurs Soeker',
   'Find scholarships online and help local students fill out applications.',
   'Vind beurse aanlyn en help plaaslike studente met aansoeke.',
   'R50–R200/day',  24),

  ('language-tutor',     'learn',     '🗣', 'English/Xhosa Tutor',    'Taal Tutor',
   'Offer 30-minute language practice sessions over WhatsApp voice notes for beginners.',
   'Bied 30-minuut taaloefensessies oor WhatsApp-stemnote aan.',
   'R40–R120/day',  25),

  ('phone-coding-club',  'learn',     '💻', 'Phone Coding Club',      'Foon Kodeerklas',
   'Teach younger kids how to build basic websites using just their smartphone browsers.',
   'Leer jonger kinders hoe om basiese webwerwe op hul slimfone te bou.',
   'R50–R150/day',  26),

  ('interview-prep',     'learn',     '🎤', 'Interview Prep',         'Onderhoud Voorbereiding',
   'Do mock job interviews via video call to help people gain confidence.',
   'Doen skyn-onderhoude via video-oproep om mense selfvertroue te gee.',
   'R40–R120/day',  27),

  ('story-time',         'learn',     '📖', 'Story Time App',         'Storietyd',
   'Record audio of yourself reading children''s books and share with busy parents.',
   'Neem oudio op van jouself wat kinderboeke lees en deel met besige ouers.',
   'R20–R80/day',   28),

  ('local-tour-guide',   'learn',     '🌍', 'Local Tour Guide',       'Plaaslike Toergids',
   'Learn the deep history of your township and offer safe, authentic walking tours to tourists.',
   'Leer die diep geskiedenis van jou township en bied veilige toere vir toeriste.',
   'R100–R400/day', 29),

  ('study-group-boss',   'learn',     '🧠', 'Study Group Boss',       'Studiegroep Leier',
   'Organize quiet, focused study sessions in a local church or hall before exams.',
   'Organiseer stil, gefokusde studiesessies in ''n plaaslike kerk of saal.',
   'R30–R100/day',  30),

  -- Creative (10)
  ('phone-photographer', 'creative',  '📸', 'Phone Photographer',     'Foon Fotograaf',
   'Shoot portraits and events for clients using only your smartphone. Edit with free apps.',
   'Skiet portrette en geleenthede met slegs jou slimfoon. Redigeer met gratis programme.',
   'R80–R300/day',  31),

  ('resin-crafter',      'creative',  '💎', 'Resin Crafter',          'Hars Kunstenaar',
   'Make and sell resin jewellery, bookmarks or keychains. Sell on Instagram or Takealot.',
   'Maak en verkoop harssierrade, boekmerkies of sleutelhangers.',
   'R100–R400/day', 32),

  ('custom-t-shirts',    'creative',  '👕', 'Custom T-Shirts',        'Pasgemaakte T-hemde',
   'Design and print custom T-shirts using an iron-on printer at home.',
   'Ontwerp en druk pasgemaakte T-hemde met ''n strykyster-drukker tuis.',
   'R80–R300/day',  33),

  ('mural-artist',       'creative',  '🎨', 'Mural Artist',           'Muurskildery',
   'Paint murals on walls, schools, and businesses using low-cost paint.',
   'Skilder muurskilderye op mure, skole en besighede met goedkoop verf.',
   'R200–R800/day', 34),

  ('digital-flyers',     'creative',  '🖼', 'Digital Flyer Designer', 'Digitale Pamflet-Ontwerper',
   'Design flyers and event posters for local businesses using Canva. Share on WhatsApp.',
   'Ontwerp pamflette vir plaaslike besighede met Canva. Deel op WhatsApp.',
   'R50–R200/day',  35),

  ('event-mc',           'creative',  '🎙', 'Event MC',               'Seremoniemeester',
   'Host local events, graduations, and weddings as MC. Build a reputation via social media.',
   'Lei plaaslike geleenthede, graduasies en troues as seremoniemeester.',
   'R300–R1500/day',36),

  ('voice-over-artist',  'creative',  '🎧', 'Voice-Over Artist',      'Stem-Kunstenaar',
   'Record voice-overs for ads, podcasts, or videos from home using your phone.',
   'Neem stem-oor-klanke op vir advertensies, podcasts of video''s van die huis af.',
   'R100–R500/day', 37),

  ('candle-maker',       'creative',  '🕯', 'Candle Maker',           'Kersiemaker',
   'Make scented candles from soy wax at home and sell online or at markets.',
   'Maak geurkerse van sojakersvet tuis en verkoop aanlyn of by markte.',
   'R80–R300/day',  38),

  ('face-painter',       'creative',  '🎭', 'Face Painter',           'Gesigskilder',
   'Offer face painting at birthday parties, schools, and local events.',
   'Bied gesigskildery aan by verjaardagpartytjies, skole en plaaslike geleenthede.',
   'R200–R600/day', 39),

  ('content-creator',    'creative',  '🎬', 'Content Creator',        'Inhoud Skepper',
   'Create short video content for local businesses on TikTok or Instagram Reels.',
   'Skep kort video-inhoud vir plaaslike besighede op TikTok of Instagram Reels.',
   'R100–R500/day', 40),

  -- Tech (10)
  ('whatsapp-setup',     'tech',      '📲', 'WhatsApp Business Setup', 'WhatsApp Besigheidsprofiel',
   'Help local business owners set up and optimize their WhatsApp Business profiles.',
   'Help plaaslike besighede om hul WhatsApp Besigheidsprofiel op te stel.',
   'R50–R200/day',  41),

  ('google-maps-fixer',  'tech',      '🗺', 'Google Maps Fixer',      'Google Maps Plotter',
   'Help local businesses create or fix their Google Maps / Google Business Profile listings.',
   'Help plaaslike besighede om hul Google Maps-lyste te skep of reg te stel.',
   'R80–R300/day',  42),

  ('phone-repair-101',   'tech',      '🔧', 'Phone Screen Repair',    'Foon Skermherstelling',
   'Learn to replace cracked phone screens. Source parts from Takealot and offer a local service.',
   'Leer om gebreekte foonskerm te vervang. Kry onderdele van Takealot.',
   'R100–R400/day', 43),

  ('wifi-helper',        'tech',      '📡', 'WiFi Setup Helper',      'WiFi Opstel Hulp',
   'Help elderly residents or local businesses configure their routers and devices.',
   'Help bejaardes of plaaslike besighede om hul routers en toestelle op te stel.',
   'R50–R200/day',  44),

  ('online-store-setup', 'tech',      '🛍', 'Online Store Setup',     'Aanlyn Winkel Opstel',
   'Build simple WooCommerce or Shopify stores for township vendors who want to sell online.',
   'Bou eenvoudige WooCommerce- of Shopify-winkels vir handelaars wat aanlyn wil verkoop.',
   'R150–R500/day', 45),

  ('pdf-form-filler',    'tech',      '📋', 'PDF Form Filler',        'PDF Vorm Invuller',
   'Help people fill in digital government forms, UIF applications, or lease agreements.',
   'Help mense om digitale staatsvorms, WVF-aansoeke of huurooreenkomste in te vul.',
   'R30–R100/day',  46),

  ('social-media-mgr',   'tech',      '📊', 'Social Media Manager',   'Sosiale Media Bestuurder',
   'Manage Instagram, Facebook and TikTok for a local business. Post daily content.',
   'Bestuur Instagram, Facebook en TikTok vir ''n plaaslike besigheid.',
   'R100–R400/day', 47),

  ('data-recovery',      'tech',      '💾', 'Data Recovery Helper',   'Data Herwinning',
   'Help people recover photos, contacts, or files from broken or wiped phones.',
   'Help mense om foto''s, kontakte of lêers van gebreekte fone te herwin.',
   'R80–R300/day',  48),

  ('qr-code-creator',    'tech',      '🔲', 'QR Code Creator',        'QR Kode Skepper',
   'Create custom QR codes for menus, payment links, and social profiles for local businesses.',
   'Skep pasgemaakte QR-kodes vir spyskaarte, betaalskakelinge en sosiale profiele.',
   'R40–R150/day',  49),

  ('basic-website',      'tech',      '🌐', 'Basic Website Builder',  'Basiese Webwerf Bouer',
   'Build one-page websites for local businesses using free tools like Carrd or Google Sites.',
   'Bou een-bladsy-webwerwe vir plaaslike besighede met gratis gereedskap.',
   'R150–R600/day', 50)

on conflict (id) do nothing;
