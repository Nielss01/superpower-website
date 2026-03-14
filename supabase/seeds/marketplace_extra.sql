-- ── Extra marketplace seed data ───────────────────────────────────────────────
-- Adds 30 more business listings for testing infinite scroll and filters.
-- Spread across all 6 categories and all 8 locations. Idempotent.
--
-- User ID range:   10000000-0000-0000-0001-000000000001 → 0030  (new owners)
-- Profile ID range: a1000000-0000-0000-0001-000000000001 → 0030
-- Reviewers: reuses 20000000-…-0001 → 0030 from the original seed.


-- ── 1. Business owner auth users ─────────────────────────────────────────────

insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  is_sso_user, is_anonymous
) values
  ('10000000-0000-0000-0001-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','kasiphoto@example.com',       '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phonedoctor@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','auntybusi@example.com',       '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','glowprecious@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','codeacademy@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','spotlessclean@example.com',   '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','afrithreads@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','solarsolutions@example.com',  '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','kotaking@example.com',        '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated','nailartthandi@example.com',   '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000011','00000000-0000-0000-0000-000000000000','authenticated','authenticated','englishtutorhub@example.com', '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000012','00000000-0000-0000-0000-000000000000','authenticated','authenticated','twshiplumbing@example.com',   '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000013','00000000-0000-0000-0000-000000000000','authenticated','authenticated','vibezmedia@example.com',      '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000014','00000000-0000-0000-0000-000000000000','authenticated','authenticated','comptraining@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000015','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sowetoflavours@example.com',  '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000016','00000000-0000-0000-0000-000000000000','authenticated','authenticated','bodysoul@example.com',        '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000017','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hwheroes@example.com',        '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000018','00000000-0000-0000-0000-000000000000','authenticated','authenticated','gardenyard@example.com',      '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000019','00000000-0000-0000-0000-000000000000','authenticated','authenticated','printstitch@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000020','00000000-0000-0000-0000-000000000000','authenticated','authenticated','internetcafe@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000021','00000000-0000-0000-0000-000000000000','authenticated','authenticated','braaimasters@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000022','00000000-0000-0000-0000-000000000000','authenticated','authenticated','skincarenoma@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000023','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sciencelab@example.com',      '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000024','00000000-0000-0000-0000-000000000000','authenticated','authenticated','movingdelivery@example.com',  '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000025','00000000-0000-0000-0000-000000000000','authenticated','authenticated','twshipbeats@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000026','00000000-0000-0000-0000-000000000000','authenticated','authenticated','cctvinstall@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000027','00000000-0000-0000-0000-000000000000','authenticated','authenticated','vetkoekmore@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000028','00000000-0000-0000-0000-000000000000','authenticated','authenticated','fitnesstraining@example.com', '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000029','00000000-0000-0000-0000-000000000000','authenticated','authenticated','smmeaccounting@example.com',  '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0001-000000000030','00000000-0000-0000-0000-000000000000','authenticated','authenticated','carpentryct@example.com',     '$2a$10$placeholder',now(),now(),now(),false,false)
on conflict (id) do nothing;


-- ── 2. Marketplace profiles ───────────────────────────────────────────────────

insert into public.marketplace_profiles
  (id, user_id, business_name, tagline, description, locations, category,
   whatsapp_number, response_time, is_verified, is_published)
values

  -- Creative ──────────────────────────────────────────────────────────────────

  ('a1000000-0000-0000-0001-000000000001',
   '10000000-0000-0000-0001-000000000001',
   'Kasi Lens Photography',
   'Capturing your moments, honouring your story',
   'Professional photographer based in Gugulethu. Specialising in family portraits, matric farewell shoots, graduation days and community events. I believe every person deserves beautiful photos that reflect their real life. Affordable packages with same-week delivery of edited images.',
   ARRAY['Gugulethu', 'Langa'],
   'Creative',
   '0721000101', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000007',
   '10000000-0000-0000-0001-000000000007',
   'African Threads Fashion',
   'Wear your culture with pride',
   'I design and sew custom African print outfits from my studio in Khayelitsha. From traditional ibhayi to modern everyday wear, I blend heritage with contemporary style. Every garment is hand-stitched and made to your measurements. Perfect for Heritage Day, weddings, graduations and everyday excellence.',
   ARRAY['Khayelitsha'],
   'Creative',
   '0721000107', 'Usually replies within 1 hour', true, true),

  ('a1000000-0000-0000-0001-000000000013',
   '10000000-0000-0000-0001-000000000013',
   'Vibez Media Productions',
   'Your brand, amplified',
   'We produce short videos, reels and promotional content for small businesses across the Cape Flats. One person with a camera, a drone and serious editing skills. We have helped local spazas, hair salons and food stalls grow their WhatsApp and TikTok following from zero. Let us tell your story.',
   ARRAY['Mitchells Plain', 'Gugulethu', 'Khayelitsha'],
   'Creative',
   '0721000113', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000019',
   '10000000-0000-0000-0001-000000000019',
   'Print & Stitch Co',
   'Custom printing on anything you wear',
   'T-shirts, hoodies, caps and bags with your logo, slogan or design. We print for sports teams, school fundraisers, family reunions and businesses. Minimum order of 6 items. Based in Langa with courier delivery across Cape Town. Turnaround of 3 to 5 working days.',
   ARRAY['Langa', 'Nyanga'],
   'Creative',
   '0721000119', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000025',
   '10000000-0000-0000-0001-000000000025',
   'Township Beats Studio',
   'Record your hit from the comfort of the kasi',
   'Professional home recording studio in Nyanga. We record, mix and master Afrobeats, amapiano, gospel and hip-hop. High-quality sound at a fraction of city studio prices. We also offer beat production and music video cover design. Your sound deserves to be heard.',
   ARRAY['Nyanga', 'Philippi'],
   'Creative',
   '0721000125', 'Usually replies within a few hours', false, true),

  -- Tech ───────────────────────────────────────────────────────────────────────

  ('a1000000-0000-0000-0001-000000000002',
   '10000000-0000-0000-0001-000000000002',
   'Phone Doctor Nyanga',
   'Dead phone? We bring it back to life',
   'Specialising in phone repairs, battery replacements and software recovery across Nyanga and surrounding areas. Over 6 years of experience. We stock parts for most Samsung, Huawei and iPhone models. Home visits available for elderly customers. Free diagnosis before any repair.',
   ARRAY['Nyanga', 'Philippi'],
   'Tech',
   '0721000102', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000008',
   '10000000-0000-0000-0001-000000000008',
   'Solar Solutions Cape Flats',
   'Load shedding? Not anymore',
   'We install affordable solar panels and battery backup systems for homes and small businesses across Gugulethu and surrounding areas. Stop losing stock and income to load shedding. We offer flexible payment plans and all installations come with a 12-month workmanship guarantee.',
   ARRAY['Gugulethu', 'Langa', 'Nyanga'],
   'Tech',
   '0721000108', 'Usually replies within a few hours', true, true),

  ('a1000000-0000-0000-0001-000000000014',
   '10000000-0000-0000-0001-000000000014',
   'iLearn Computer Centre',
   'Digital skills for a digital world',
   'Computer and smartphone literacy training for adults and youth in Philippi. We teach Microsoft Office, email, online banking, job applications and social media for business. Classes run Monday to Saturday in small groups of 6. No experience needed — we start from scratch.',
   ARRAY['Philippi', 'Hanover Park', 'Bonteheuwel'],
   'Tech',
   '0721000114', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000020',
   '10000000-0000-0000-0001-000000000020',
   'Bonteheuwel Internet & Print',
   'Print, scan, email and more — all in one stop',
   'Community internet café and printing service in Bonteheuwel. We print CVs, school projects, forms and certificates. We also offer scanning, laminating, faxing and help with online applications for SASSA, UIF and government forms. Affordable per-page pricing.',
   ARRAY['Bonteheuwel', 'Hanover Park'],
   'Tech',
   '0721000120', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000026',
   '10000000-0000-0000-0001-000000000026',
   'SecureCam Installations',
   'Protect your home and business',
   'CCTV camera installation and security system setup for homes, spazas and small offices across Khayelitsha. We supply and install quality cameras with remote viewing via your smartphone. Monthly monitoring packages also available. All installations done by qualified electricians.',
   ARRAY['Khayelitsha', 'Mitchells Plain'],
   'Tech',
   '0721000126', 'Usually replies within a few hours', true, true),

  -- Food & Beverage ────────────────────────────────────────────────────────────

  ('a1000000-0000-0000-0001-000000000003',
   '10000000-0000-0000-0001-000000000003',
   'Aunty Busi''s Bakes',
   'Cakes baked with grandma''s love',
   'Custom celebration cakes, cupcakes and vetkoek from my home kitchen in Khayelitsha. Flavours include vanilla, chocolate, red velvet, lemon and carrot. I take orders 5 days in advance for custom cakes. I also supply church teas and school fundraisers with large baking orders. Every bite is made from scratch.',
   ARRAY['Khayelitsha', 'Gugulethu'],
   'Food & Beverage',
   '0721000103', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000009',
   '10000000-0000-0000-0001-000000000009',
   'Kota King',
   'The best kota in Mitchells Plain, guaranteed',
   'Famous for our loaded kotas, gatsby rolls and homemade chips. We have been feeding Mitchells Plain since 2019 and our regulars keep coming back. Everything is made fresh to order. We also cater for events with our township street food packages — a real crowd pleaser.',
   ARRAY['Mitchells Plain', 'Hanover Park'],
   'Food & Beverage',
   '0721000109', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000015',
   '10000000-0000-0000-0001-000000000015',
   'Soweto Flavours Kitchen',
   'Authentic Joburg flavours, straight to your door',
   'Bringing the taste of Soweto to the Cape Flats. Known for our pap en vleis, chakalaka, mogodu and beef stew. We offer daily lunch specials for delivery across Gugulethu and Langa, plus full event catering. Our food celebrates South African township culture on every plate.',
   ARRAY['Gugulethu', 'Langa'],
   'Food & Beverage',
   '0721000115', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000021',
   '10000000-0000-0000-0001-000000000021',
   'Braai Masters Catering',
   'We bring the fire to your event',
   'Professional braai catering for parties, corporate events and community gatherings across Khayelitsha and beyond. We supply the fire, the meat, the sides and the expertise. Packages for 20 to 200 guests. Specialities include boerewors, sosaties, chicken braai and whole lamb on the spit.',
   ARRAY['Khayelitsha', 'Mitchells Plain', 'Gugulethu'],
   'Food & Beverage',
   '0721000121', 'Usually replies within a few hours', true, true),

  ('a1000000-0000-0000-0001-000000000027',
   '10000000-0000-0000-0001-000000000027',
   'Vetkoek & More',
   'Hot, fresh vetkoek — the kasi staple done right',
   'We make the fluffiest vetkoek in Langa — mince-filled, jam-filled or plain. Also serving fat cakes, roosterkoek and homemade magwinya. Available for morning and afternoon orders. We also do community stokvel supply and school tuck shop restocking at bulk prices.',
   ARRAY['Langa', 'Gugulethu'],
   'Food & Beverage',
   '0721000127', 'Usually replies within 1 hour', false, true),

  -- Beauty & Wellness ──────────────────────────────────────────────────────────

  ('a1000000-0000-0000-0001-000000000004',
   '10000000-0000-0000-0001-000000000004',
   'Glow by Precious',
   'Healthy skin is always in',
   'Skincare and beauty treatments from my home studio in Langa. I offer facials, waxing, eyebrow threading and basic lash treatments using skin-safe products. I also sell my own range of natural face scrubs and moisturisers made from local ingredients. Book via WhatsApp — slots fill quickly.',
   ARRAY['Langa', 'Gugulethu'],
   'Beauty & Wellness',
   '0721000104', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000010',
   '10000000-0000-0000-0001-000000000010',
   'Nail Artistry by Thandi',
   'Your nails, your personality',
   'Gel nails, acrylics, nail art and pedicures from my fully equipped studio in Khayelitsha. I trained with a certified nail technician in Cape Town and have 4 years of experience. Specialising in detailed nail art designs. Send me your inspo pic and I will recreate it.',
   ARRAY['Khayelitsha', 'Mitchells Plain'],
   'Beauty & Wellness',
   '0721000110', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000016',
   '10000000-0000-0000-0001-000000000016',
   'Body & Soul Wellness',
   'Rest, relax, recover',
   'Mobile massage therapy and wellness treatments across Mitchells Plain and surrounding areas. I come to you. Offering Swedish massage, deep tissue, hot stone and pregnancy massage. All oils are natural and certified safe. Perfect for stress relief, muscle recovery and simply treating yourself.',
   ARRAY['Mitchells Plain', 'Hanover Park', 'Bonteheuwel'],
   'Beauty & Wellness',
   '0721000116', 'Usually replies within a few hours', true, true),

  ('a1000000-0000-0000-0001-000000000022',
   '10000000-0000-0000-0001-000000000022',
   'Skincare by Sis Noma',
   'Melanin-rich skin deserves specialised care',
   'Holistic skincare consultations and treatments designed specifically for darker skin tones. I help with hyperpigmentation, acne, uneven skin tone and dryness. I create personalised skincare routines and make product recommendations that actually work. Based in Gugulethu with online consultations available.',
   ARRAY['Gugulethu', 'Nyanga'],
   'Beauty & Wellness',
   '0721000122', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000028',
   '10000000-0000-0000-0001-000000000028',
   'Fit with Lungelo',
   'Your health is your wealth',
   'Personal training and group fitness classes in Bonteheuwel. I offer outdoor bootcamp sessions, home workout programmes and nutrition guidance. Qualified personal trainer with 5 years of experience transforming clients across the Cape Flats. First session is free — come try before you commit.',
   ARRAY['Bonteheuwel', 'Hanover Park', 'Mitchells Plain'],
   'Beauty & Wellness',
   '0721000128', 'Usually replies within 1 hour', false, true),

  -- Education ──────────────────────────────────────────────────────────────────

  ('a1000000-0000-0000-0001-000000000005',
   '10000000-0000-0000-0001-000000000005',
   'Code the Future Academy',
   'Learn to code, change your life',
   'Teaching basic coding, website building and app design to youth across Mitchells Plain. No computer needed — we start with mobile and work up. Ages 14 to 35 welcome. Courses run over 8 weeks in small cohorts. Our graduates have gone on to freelance work, internships and university bursaries.',
   ARRAY['Mitchells Plain', 'Philippi'],
   'Education',
   '0721000105', 'Usually replies within a few hours', true, true),

  ('a1000000-0000-0000-0001-000000000011',
   '10000000-0000-0000-0001-000000000011',
   'English Excellence Hub',
   'Speak, write and succeed in English',
   'English language tutoring for Grades 8 to 12, adult learners and job seekers across Langa and Gugulethu. I help with comprehension, essay writing, oral preparation and grammar. Many of my students are first-generation English users — I understand the challenges and meet you where you are.',
   ARRAY['Langa', 'Gugulethu'],
   'Education',
   '0721000111', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000017',
   '10000000-0000-0000-0001-000000000017',
   'Homework Heroes',
   'No child left behind in Hanover Park',
   'After-school homework help and tutoring for primary and high school students in Hanover Park and Bonteheuwel. We cover all subjects up to Grade 9 and specialise in Maths, English and Afrikaans for Grades 10 to 12. Safe, supervised study environment Monday to Thursday afternoons.',
   ARRAY['Hanover Park', 'Bonteheuwel'],
   'Education',
   '0721000117', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000023',
   '10000000-0000-0000-0001-000000000023',
   'Science Lab Tutoring',
   'Demystifying Physical Science one student at a time',
   'Specialised Physical Science tutoring for Grade 10 to 12 students across Philippi and Nyanga. I have a BSc degree and 7 years of teaching experience. My interactive approach uses real experiments and diagrams to make abstract concepts stick. Flexible online and in-person sessions available.',
   ARRAY['Philippi', 'Nyanga'],
   'Education',
   '0721000123', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000029',
   '10000000-0000-0000-0001-000000000029',
   'SMME Money Mastery',
   'Know your numbers, grow your business',
   'Basic accounting, bookkeeping and tax guidance for small business owners across Gugulethu. I help you understand cash flow, keep SARS compliant, register for VAT when the time comes and apply for business funding. I speak your language — no jargon, just practical money skills.',
   ARRAY['Gugulethu', 'Langa', 'Mitchells Plain'],
   'Education',
   '0721000129', 'Usually replies within a few hours', true, true),

  -- Services ───────────────────────────────────────────────────────────────────

  ('a1000000-0000-0000-0001-000000000006',
   '10000000-0000-0000-0001-000000000006',
   'Spotless Cleaning Co',
   'We clean so you don''t have to',
   'Domestic and commercial cleaning services across Philippi and surrounding areas. Offering once-off deep cleans, regular weekly cleaning and post-event cleanup. We bring our own eco-friendly products and equipment. All staff are vetted and punctual. Businesses and large homes our speciality.',
   ARRAY['Philippi', 'Gugulethu', 'Nyanga'],
   'Services',
   '0721000106', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000012',
   '10000000-0000-0000-0001-000000000012',
   'Township Plumbing & Repairs',
   'Leaking taps, blocked drains — we sort it fast',
   'Qualified plumber offering emergency and scheduled repairs for homes and businesses across Nyanga and Gugulethu. We handle leaking pipes, blocked drains, toilet repairs, geyser installation and bathroom fitting. Available 6 days a week with emergency call-outs on Sundays for urgent situations.',
   ARRAY['Nyanga', 'Gugulethu', 'Philippi'],
   'Services',
   '0721000112', 'Usually replies within 1 hour', true, true),

  ('a1000000-0000-0000-0001-000000000018',
   '10000000-0000-0000-0001-000000000018',
   'Green Thumb Garden Services',
   'Tidy garden, proud home',
   'Garden maintenance, lawn mowing, tree trimming and general yard cleaning across Khayelitsha and Mitchells Plain. We also offer refuse removal and light rubble clearing. Monthly and once-off packages available. Our team of two brothers works neatly, quickly and leaves no mess behind.',
   ARRAY['Khayelitsha', 'Mitchells Plain'],
   'Services',
   '0721000118', 'Usually replies within a few hours', false, true),

  ('a1000000-0000-0000-0001-000000000024',
   '10000000-0000-0000-0001-000000000024',
   'Cape Flats Moving Company',
   'We move your life, safely and affordably',
   'Local furniture removals and delivery across all Cape Flats townships. We have a 1-ton and a 1.5-ton bakkie available 7 days a week. Specialising in flat and house moves, single-item deliveries and furniture assembly. All items are wrapped and strapped — your belongings arrive in the same condition they left.',
   ARRAY['Khayelitsha', 'Mitchells Plain', 'Gugulethu', 'Langa', 'Nyanga', 'Philippi'],
   'Services',
   '0721000124', 'Usually replies within 1 hour', false, true),

  ('a1000000-0000-0000-0001-000000000030',
   '10000000-0000-0000-0001-000000000030',
   'Kasi Carpentry & Furniture',
   'Handcrafted furniture built to last',
   'Custom furniture design and carpentry from my workshop in Khayelitsha. I build beds, wardrobes, kitchen cupboards, shelving units and outdoor furniture to your exact specifications. Solid wood and melamine options. I also do furniture repairs and restorations. Delivery included within a 20 km radius.',
   ARRAY['Khayelitsha', 'Gugulethu'],
   'Services',
   '0721000130', 'Usually replies within a few hours', false, true)

on conflict (user_id) do nothing;


-- ── 3. Services ───────────────────────────────────────────────────────────────

insert into public.marketplace_services (profile_id, name, price, description, sort_order) values

  -- Kasi Lens Photography
  ('a1000000-0000-0000-0001-000000000001', 'Family Portrait Session',  '350', '1-hour shoot, 20 edited digital photos',              0),
  ('a1000000-0000-0000-0001-000000000001', 'Matric Farewell Package',  '500', 'Pre-farewell shoot + 30 edited photos',               1),
  ('a1000000-0000-0000-0001-000000000001', 'Event Coverage',           '800', 'Up to 3 hours, full gallery of edited photos',        2),
  ('a1000000-0000-0000-0001-000000000001', 'Headshot Session',         '200', '30-minute shoot, 5 professional edited headshots',    3),

  -- African Threads Fashion
  ('a1000000-0000-0000-0001-000000000007', 'Custom Dress',             '650', 'African print dress, made to your measurements',      0),
  ('a1000000-0000-0000-0001-000000000007', 'Custom Shirt (Men)',       '400', 'Tailored African print shirt',                        1),
  ('a1000000-0000-0000-0001-000000000007', 'Matching Family Set',      '1200','Set of 4 outfits for family portraits or Heritage Day',2),
  ('a1000000-0000-0000-0001-000000000007', 'Alterations & Repairs',    '150', 'Zip replacement, hemming, taking in or letting out',   3),

  -- Vibez Media
  ('a1000000-0000-0000-0001-000000000013', 'Business Promo Video',     '800', '60-90 second branded video for social media',         0),
  ('a1000000-0000-0000-0001-000000000013', 'Instagram Reels Package',  '500', '3 short reels edited and ready to post',              1),
  ('a1000000-0000-0000-0001-000000000013', 'Drone Footage',            '600', '20-minute aerial shoot, edited highlights clip',      2),
  ('a1000000-0000-0000-0001-000000000013', 'Event Highlight Video',    '1000','2 to 4 hour event, 3-minute highlight reel',          3),

  -- Print & Stitch
  ('a1000000-0000-0000-0001-000000000019', 'Custom T-Shirt (per unit)','85',  'Minimum order 6, full colour print',                  0),
  ('a1000000-0000-0000-0001-000000000019', 'Hoodie (per unit)',        '220', 'Minimum order 6, front and back print option',        1),
  ('a1000000-0000-0000-0001-000000000019', 'Branded Cap (per unit)',   '95',  'Embroidered or printed, minimum 6',                   2),
  ('a1000000-0000-0000-0001-000000000019', 'Tote Bag (per unit)',      '75',  'Cotton canvas, minimum order 10',                     3),

  -- Township Beats Studio
  ('a1000000-0000-0000-0001-000000000025', 'Recording Session (2 hrs)','300', 'Studio time, engineer included',                      0),
  ('a1000000-0000-0000-0001-000000000025', 'Full Track Mix & Master',  '500', 'Professional mix and master of 1 track',              1),
  ('a1000000-0000-0000-0001-000000000025', 'Beat Production',          '400', 'Custom beat produced to your genre and brief',        2),
  ('a1000000-0000-0000-0001-000000000025', 'EP Package (4 tracks)',    '1800','Record, mix and master 4 tracks + artwork',           3),

  -- Phone Doctor
  ('a1000000-0000-0000-0001-000000000002', 'Screen Replacement',       '220', 'Most Android models, parts included',                 0),
  ('a1000000-0000-0000-0001-000000000002', 'Battery Replacement',      '180', 'Original capacity restored',                          1),
  ('a1000000-0000-0000-0001-000000000002', 'Software Fix & Restore',   '150', 'Factory reset, virus removal, OS reinstall',          2),
  ('a1000000-0000-0000-0001-000000000002', 'Charging Port Repair',     '160', 'Includes parts and labour',                           3),

  -- Solar Solutions
  ('a1000000-0000-0000-0001-000000000008', 'Home Starter System',      '4500','100W panel + 100Ah battery, lights & phone charging', 0),
  ('a1000000-0000-0000-0001-000000000008', 'Business Backup System',   '8500','Keeps your fridge and 2 lights running all night',    1),
  ('a1000000-0000-0000-0001-000000000008', 'Solar Geyser Installation','6000','Heat your water for free with the sun',               2),
  ('a1000000-0000-0000-0001-000000000008', 'System Service & Check',   '350', 'Annual inspection and battery health check',          3),

  -- iLearn Computer Centre
  ('a1000000-0000-0000-0001-000000000014', 'Basic Computer Course',    '500', '4-week course, 3 sessions per week',                  0),
  ('a1000000-0000-0000-0001-000000000014', 'Microsoft Office Training','400', 'Word, Excel and PowerPoint basics, 2-week course',    1),
  ('a1000000-0000-0000-0001-000000000014', 'Online Job Applications',  '150', '1-on-1 session, profile setup and CV submission',     2),
  ('a1000000-0000-0000-0001-000000000014', 'Social Media for Business','300', 'Facebook, WhatsApp Business and TikTok basics',       3),

  -- Bonteheuwel Internet & Print
  ('a1000000-0000-0000-0001-000000000020', 'Printing (per page B&W)',  '3',   'A4 black and white printing',                         0),
  ('a1000000-0000-0000-0001-000000000020', 'Printing (per page colour)','6',  'A4 colour printing',                                  1),
  ('a1000000-0000-0000-0001-000000000020', 'CV Design & Print',        '80',  'Design a clean CV + 5 printed copies',                2),
  ('a1000000-0000-0000-0001-000000000020', 'Form Assistance',          '50',  'Help filling in SASSA, UIF or government forms',      3),

  -- SecureCam
  ('a1000000-0000-0000-0001-000000000026', '2-Camera CCTV Package',    '2800','Supply, install and setup for home viewing on phone',  0),
  ('a1000000-0000-0000-0001-000000000026', '4-Camera CCTV Package',    '4500','Full perimeter coverage for home or spaza',           1),
  ('a1000000-0000-0000-0001-000000000026', 'Electric Fence Install',   '3500','Per 10 metres, fully certified',                      2),
  ('a1000000-0000-0000-0001-000000000026', 'Monthly Monitoring',       '350', 'Remote monitoring + armed response coordination',     3),

  -- Aunty Busi's Bakes
  ('a1000000-0000-0000-0001-000000000003', 'Custom Birthday Cake',     '350', 'Up to 2kg, your design and flavour',                  0),
  ('a1000000-0000-0000-0001-000000000003', 'Cupcake Box (12)',          '180', 'Mixed flavours, decorated to order',                  1),
  ('a1000000-0000-0000-0001-000000000003', 'Vetkoek (per dozen)',       '60',  'Mince or plain, freshly fried',                       2),
  ('a1000000-0000-0000-0001-000000000003', 'Bulk Baking Order',         'POA', 'For church teas, funerals and school fundraisers',    3),

  -- Kota King
  ('a1000000-0000-0000-0001-000000000009', 'Classic Kota',              '35',  'Chips, polony, egg and atchar',                       0),
  ('a1000000-0000-0000-0001-000000000009', 'Loaded Kota',               '55',  'Chips, 2 proteins, cheese, egg, sauce',               1),
  ('a1000000-0000-0000-0001-000000000009', 'Gatsby Roll (half)',         '45',  'Chips and your choice of filling',                    2),
  ('a1000000-0000-0000-0001-000000000009', 'Street Food Event Catering', '150', 'Per person, minimum 20 people',                      3),

  -- Soweto Flavours
  ('a1000000-0000-0000-0001-000000000015', 'Daily Lunch Special',       '65',  'Pap, protein and vegetables, changes daily',          0),
  ('a1000000-0000-0000-0001-000000000015', 'Mogodu & Samp',             '80',  'Weekend special, order by Friday',                    1),
  ('a1000000-0000-0000-0001-000000000015', 'Event Catering (per head)', '120', 'Traditional menu, minimum 30 guests',                 2),
  ('a1000000-0000-0000-0001-000000000015', 'Weekly Meal Box',           '280', '5 days of lunches, freshly cooked and packed',        3),

  -- Braai Masters
  ('a1000000-0000-0000-0001-000000000021', 'Standard Braai Pack (pp)',  '120', 'Per person, boerewors, chicken and sides',            0),
  ('a1000000-0000-0000-0001-000000000021', 'Premium Braai Pack (pp)',   '180', 'Per person, includes lamb chops and salads',          1),
  ('a1000000-0000-0000-0001-000000000021', 'Whole Lamb on Spit',        '3500','Feeds 30 to 40 guests, setup included',               2),
  ('a1000000-0000-0000-0001-000000000021', 'Boerewors Rolls (per 50)', '350', 'With braai sauce and rolls, ideal for fundraisers',   3),

  -- Vetkoek & More
  ('a1000000-0000-0000-0001-000000000027', 'Mince Vetkoek (each)',      '12',  'Generously filled, freshly fried',                    0),
  ('a1000000-0000-0000-0001-000000000027', 'Jam Vetkoek (each)',        '8',   'Golden and fluffy with apricot jam',                  1),
  ('a1000000-0000-0000-0001-000000000027', 'Roosterkoek (per 6)',       '35',  'Braai bread, perfect with butter',                    2),
  ('a1000000-0000-0000-0001-000000000027', 'Bulk Order (school/stokvel)','POA','Contact for pricing on orders of 50+',                3),

  -- Glow by Precious
  ('a1000000-0000-0000-0001-000000000004', 'Classic Facial',            '250', '60-minute deep cleanse, tone and moisturise',         0),
  ('a1000000-0000-0000-0001-000000000004', 'Eyebrow Threading',         '60',  'Precise shaping and definition',                      1),
  ('a1000000-0000-0000-0001-000000000004', 'Full Leg Wax',              '180', 'Long-lasting smooth results',                         2),
  ('a1000000-0000-0000-0001-000000000004', 'Natural Skincare Set',      '220', 'Face scrub + moisturiser, made with local ingredients',3),

  -- Nail Artistry by Thandi
  ('a1000000-0000-0000-0001-000000000010', 'Acrylic Full Set',          '300', 'With basic colour, shaping included',                 0),
  ('a1000000-0000-0000-0001-000000000010', 'Gel Manicure',              '200', 'Long-lasting gel polish, your colour choice',         1),
  ('a1000000-0000-0000-0001-000000000010', 'Nail Art (per nail)',        '20',  'Custom designs, flowers, gems, gradients',            2),
  ('a1000000-0000-0000-0001-000000000010', 'Pedicure & Polish',         '180', 'Soak, scrub, shape and colour',                       3),

  -- Body & Soul Wellness
  ('a1000000-0000-0000-0001-000000000016', 'Swedish Massage (60 min)',  '350', 'Full body relaxation massage',                        0),
  ('a1000000-0000-0000-0001-000000000016', 'Deep Tissue (60 min)',      '400', 'Targets muscle knots and tension',                    1),
  ('a1000000-0000-0000-0001-000000000016', 'Hot Stone Massage',         '450', '75-minute treatment, deeply restorative',             2),
  ('a1000000-0000-0000-0001-000000000016', 'Pregnancy Massage',         '380', 'Safe and soothing for expecting mothers',             3),

  -- Skincare by Sis Noma
  ('a1000000-0000-0000-0001-000000000022', 'Skin Consultation',         '150', '45-minute session + personalised routine plan',       0),
  ('a1000000-0000-0000-0001-000000000022', 'Hyperpigmentation Treatment','300','3-step brightening facial, 4 sessions recommended',   1),
  ('a1000000-0000-0000-0001-000000000022', 'Acne Treatment Facial',     '280', 'Deep clean + extraction + calming mask',              2),
  ('a1000000-0000-0000-0001-000000000022', 'Monthly Skincare Box',      '350', 'Curated product kit for your skin type',              3),

  -- Fit with Lungelo
  ('a1000000-0000-0000-0001-000000000028', 'Personal Training (1 hr)', '150', '1-on-1 outdoor or home session',                     0),
  ('a1000000-0000-0000-0001-000000000028', 'Bootcamp Session (group)', '60',  'Per person, 6am Saturday mornings',                  1),
  ('a1000000-0000-0000-0001-000000000028', '4-Week Programme',         '500', 'Workout plan + nutrition guide + check-ins',          2),
  ('a1000000-0000-0000-0001-000000000028', 'Online Coaching (monthly)','400', 'Custom plan + weekly WhatsApp check-in',              3),

  -- Code the Future
  ('a1000000-0000-0000-0001-000000000005', '8-Week Coding Course',      '800', 'HTML, CSS and basic JavaScript on mobile',            0),
  ('a1000000-0000-0000-0001-000000000005', 'Website Building Workshop', '400', '1-day workshop, build a real website',                1),
  ('a1000000-0000-0000-0001-000000000005', '1-on-1 Mentorship Session', '150', 'Personalised help with your project or CV',           2),
  ('a1000000-0000-0000-0001-000000000005', 'Freelance Starter Package', '1200','Course + portfolio build + client pitch practice',    3),

  -- English Excellence
  ('a1000000-0000-0000-0001-000000000011', 'English Tutoring (1 hr)',   '90',  'Grades 8 to 12, 1-on-1 session',                     0),
  ('a1000000-0000-0000-0001-000000000011', 'Essay Writing Coaching',    '120', 'Plan, draft and polish one essay together',           1),
  ('a1000000-0000-0000-0001-000000000011', 'Oral Exam Preparation',     '100', 'Practice with feedback, 45-minute session',           2),
  ('a1000000-0000-0000-0001-000000000011', 'Adult Literacy Sessions',   '80',  'Reading, writing and comprehension for adults',       3),

  -- Homework Heroes
  ('a1000000-0000-0000-0001-000000000017', 'Afternoon Homework Help',   '60',  'Per session, all subjects up to Grade 9',             0),
  ('a1000000-0000-0000-0001-000000000017', 'Maths Catch-Up Sessions',   '80',  'Focused 1-on-1 for struggling students',              1),
  ('a1000000-0000-0000-0001-000000000017', 'Monthly Subscription',      '500', 'Unlimited afternoon sessions, Mon to Thu',            2),
  ('a1000000-0000-0000-0001-000000000017', 'Exam Preparation Block',    '300', '5 focused sessions before a big test or exam',        3),

  -- Science Lab
  ('a1000000-0000-0000-0001-000000000023', 'Physical Science (1 hr)',   '110', 'Grades 10 to 12, 1-on-1 session',                    0),
  ('a1000000-0000-0000-0001-000000000023', 'Group Study Session',       '70',  'Up to 4 students, 90 minutes',                       1),
  ('a1000000-0000-0000-0001-000000000023', 'Experiment Masterclass',    '120', 'Hands-on practicals before your lab assessment',      2),
  ('a1000000-0000-0000-0001-000000000023', 'Matric Exam Prep Day',      '400', 'Full-day revision with past papers',                  3),

  -- SMME Money Mastery
  ('a1000000-0000-0000-0001-000000000029', 'Business Bookkeeping (pm)', '600', 'Monthly books kept clean and tax-ready',              0),
  ('a1000000-0000-0000-0001-000000000029', 'Cash Flow Workshop',        '250', '2-hour group session, understand your money',         1),
  ('a1000000-0000-0000-0001-000000000029', 'Tax Return Assistance',     '350', 'Annual individual or business tax return',            2),
  ('a1000000-0000-0000-0001-000000000029', 'Funding Application Help',  '400', 'Prepare your SEDA or SEFA application',               3),

  -- Spotless Cleaning
  ('a1000000-0000-0000-0001-000000000006', 'Once-Off Deep Clean',       '450', '3 to 4 bedroom home, all supplies included',          0),
  ('a1000000-0000-0000-0001-000000000006', 'Weekly Domestic Clean',     '300', 'Per visit, regular slot available',                   1),
  ('a1000000-0000-0000-0001-000000000006', 'Post-Event Cleanup',        '600', 'After parties, funerals or gatherings',               2),
  ('a1000000-0000-0000-0001-000000000006', 'Office Cleaning (daily)',   '1200','Per month, Monday to Friday mornings',                3),

  -- Township Plumbing
  ('a1000000-0000-0000-0001-000000000012', 'Leak & Pipe Repair',        '250', 'Most standard repairs, parts extra if needed',        0),
  ('a1000000-0000-0000-0001-000000000012', 'Blocked Drain Clearance',   '200', 'Chemical or mechanical, same day',                    1),
  ('a1000000-0000-0000-0001-000000000012', 'Geyser Installation',       '800', 'Standard electric geyser, excludes unit cost',        2),
  ('a1000000-0000-0000-0001-000000000012', 'Full Bathroom Fitting',     'POA', 'Contact for quote based on your requirements',        3),

  -- Green Thumb
  ('a1000000-0000-0000-0001-000000000018', 'Lawn Mowing & Edge',        '200', 'Standard residential garden',                         0),
  ('a1000000-0000-0000-0001-000000000018', 'Full Garden Tidy',          '350', 'Mow, edge, trim shrubs and remove clippings',         1),
  ('a1000000-0000-0000-0001-000000000018', 'Monthly Garden Package',    '700', '2 visits per month, full maintenance',                2),
  ('a1000000-0000-0000-0001-000000000018', 'Rubble & Refuse Removal',   '400', 'Bakkie load, same day collection available',          3),

  -- Cape Flats Moving
  ('a1000000-0000-0000-0001-000000000024', 'Single-Item Delivery',      '150', 'Any large item within the Cape Flats',                0),
  ('a1000000-0000-0000-0001-000000000024', 'Room Move',                 '400', '1-ton bakkie, 2 helpers, within 15 km',               1),
  ('a1000000-0000-0000-0001-000000000024', 'Full House Move',           '900', '1.5-ton bakkie, 2 helpers, up to 3 hours',            2),
  ('a1000000-0000-0000-0001-000000000024', 'Furniture Assembly',        '200', 'Flat-pack or disassembled furniture',                 3),

  -- Kasi Carpentry
  ('a1000000-0000-0000-0001-000000000030', 'Custom Bed Frame',          '1800','Double or queen, solid wood or melamine',              0),
  ('a1000000-0000-0000-0001-000000000030', 'Built-In Wardrobe',         '3500','Per metre, sliding or hinged doors',                  1),
  ('a1000000-0000-0000-0001-000000000030', 'Kitchen Cupboards',         'POA', 'Measured, built and installed in your kitchen',       2),
  ('a1000000-0000-0000-0001-000000000030', 'Furniture Repair',          '200', 'Hinges, joints, surface repairs and refinishing',     3)

on conflict do nothing;


-- ── 4. Reviews (3–4 per listing, enough to show ratings) ─────────────────────

insert into public.reviews (profile_id, reviewer_id, reviewer_name, rating, title, body, created_at) values

  -- Kasi Lens Photography
  ('a1000000-0000-0000-0001-000000000001','20000000-0000-0000-0000-000000000001','Thabo M.',    5,'Stunning family photos',    'We had not taken proper family photos in years. He made us feel comfortable and the results were beautiful.','2026-02-10'),
  ('a1000000-0000-0000-0001-000000000001','20000000-0000-0000-0000-000000000002','Lerato N.',   4,'Great value for money',     'Matric farewell package was very affordable and the quality of editing was impressive. Friends asked for his number.','2026-02-18'),
  ('a1000000-0000-0000-0001-000000000001','20000000-0000-0000-0000-000000000003','Sipho D.',    5,'Professional and creative', 'Captured moments I did not even notice were happening. True talent with a camera.','2026-03-02'),

  -- African Threads Fashion
  ('a1000000-0000-0000-0001-000000000007','20000000-0000-0000-0000-000000000004','Nandi K.',    5,'My Heritage Day outfit was fire','Every person at the event asked who made my outfit. So proud to wear something made locally.','2026-02-20'),
  ('a1000000-0000-0000-0001-000000000007','20000000-0000-0000-0000-000000000005','Mpho R.',     5,'Perfect fit',               'She took my measurements once and the dress fit perfectly. No alterations needed.','2026-03-01'),
  ('a1000000-0000-0000-0001-000000000007','20000000-0000-0000-0000-000000000006','Ayanda B.',   4,'Beautiful craftsmanship',   'Attention to detail is incredible. You can feel the quality in the stitching.','2026-03-08'),

  -- Vibez Media
  ('a1000000-0000-0000-0001-000000000013','20000000-0000-0000-0000-000000000007','Zanele P.',   5,'Our reel went viral',       'He made a 60-second video for my braiding business and it got over 10 000 views on TikTok. Worth every cent.','2026-02-15'),
  ('a1000000-0000-0000-0001-000000000013','20000000-0000-0000-0000-000000000008','Bongani T.',  4,'Great drone footage',       'The aerial shots of our event were incredible. Guests could not believe we had a drone.','2026-03-05'),

  -- Print & Stitch
  ('a1000000-0000-0000-0001-000000000019','20000000-0000-0000-0000-000000000009','Nomvula S.',  5,'Team shirts look amazing',  'Ordered 20 shirts for our soccer team. Quality is great and they were ready 2 days early.','2026-02-22'),
  ('a1000000-0000-0000-0001-000000000019','20000000-0000-0000-0000-000000000010','Lungelo H.',  4,'Good quality printing',     'Colours came out exactly as shown on my design. No fading after several washes.','2026-03-07'),

  -- Township Beats
  ('a1000000-0000-0000-0001-000000000025','20000000-0000-0000-0000-000000000011','Kuhle M.',    5,'My track sounds professional','I was shocked at the quality of the mix. Sounds like it was recorded in a big studio.','2026-02-28'),
  ('a1000000-0000-0000-0001-000000000025','20000000-0000-0000-0000-000000000012','Palesa J.',   4,'Great beat producer',       'He understood my sound immediately and produced exactly what I was looking for.','2026-03-10'),

  -- Phone Doctor
  ('a1000000-0000-0000-0001-000000000002','20000000-0000-0000-0000-000000000013','Thandeka R.', 5,'Came to my house',          'He came to fix my phone at home which was perfect since I work from home. Screen looks brand new.','2026-02-14'),
  ('a1000000-0000-0000-0001-000000000002','20000000-0000-0000-0000-000000000014','Lwando N.',   4,'Honest diagnosis',          'Told me upfront what he could and could not fix. Did not charge me for the parts he did not use.','2026-03-03'),
  ('a1000000-0000-0000-0001-000000000002','20000000-0000-0000-0000-000000000015','Siyanda K.',  5,'Fast and reliable',         'Battery replaced within 45 minutes. Phone is holding charge like new again.','2026-03-09'),

  -- Solar Solutions
  ('a1000000-0000-0000-0001-000000000008','20000000-0000-0000-0000-000000000016','Ntombi D.',   5,'No more load shedding stress','My spaza stays open through load shedding now. The investment paid for itself in 2 months.','2026-01-28'),
  ('a1000000-0000-0000-0001-000000000008','20000000-0000-0000-0000-000000000017','Khulekani B.',4,'Professional installation',  'Clean, neat work. Explained everything to me so I understand how to maintain the system.','2026-02-16'),
  ('a1000000-0000-0000-0001-000000000008','20000000-0000-0000-0000-000000000018','Asanda P.',   5,'Changed my life at home',   'Lights and phone charging all night. My children can study even when there is load shedding.','2026-03-04'),

  -- iLearn Computer Centre
  ('a1000000-0000-0000-0001-000000000014','20000000-0000-0000-0000-000000000019','Mfundo L.',   5,'Got my first job from this', 'The course helped me apply for jobs online. I got an interview within 2 weeks of finishing the course.','2026-02-08'),
  ('a1000000-0000-0000-0001-000000000014','20000000-0000-0000-0000-000000000020','Yolanda S.',  4,'Patient with beginners',    'I had never touched a computer before. The instructor was so patient and I now use Excel at work.','2026-03-01'),

  -- SecureCam
  ('a1000000-0000-0000-0001-000000000026','20000000-0000-0000-0000-000000000021','Dumisani F.', 5,'Peace of mind at last',     'I can watch my shop from my phone anywhere. Installation was neat and professional.','2026-02-25'),
  ('a1000000-0000-0000-0001-000000000026','20000000-0000-0000-0000-000000000022','Nokwanda T.', 4,'Great deterrent',           'Since installing the cameras we have had zero incidents. Neighbours have noticed and are asking for his number.','2026-03-08'),

  -- Aunty Busi's Bakes
  ('a1000000-0000-0000-0001-000000000003','20000000-0000-0000-0000-000000000023','Sthembile W.',5,'Birthday cake was perfect',  'My daughter cried when she saw her cake — in a good way! Aunty Busi nailed the design exactly.','2026-02-12'),
  ('a1000000-0000-0000-0001-000000000003','20000000-0000-0000-0000-000000000024','Banele G.',   5,'Best vetkoek in Khaye',     'She brings a batch to our street stokvel every month. Everyone fights over the mince ones.','2026-03-05'),

  -- Kota King
  ('a1000000-0000-0000-0001-000000000009','20000000-0000-0000-0000-000000000025','Lungisa C.',  5,'The loaded kota is elite',  'R55 for a kota that fills you up until supper. Generous portions and everything is fresh.','2026-02-19'),
  ('a1000000-0000-0000-0001-000000000009','20000000-0000-0000-0000-000000000026','Zinhle A.',   4,'Great for events',          'Did the catering for my son''s birthday. 25 kids and every single one came back for seconds.','2026-03-06'),

  -- Soweto Flavours
  ('a1000000-0000-0000-0001-000000000015','20000000-0000-0000-0000-000000000027','Thabo M.',    5,'Taste of home',              'The mogodu took me straight back to Soweto. Real cooking, real flavour. My new weekly spot.','2026-02-24'),
  ('a1000000-0000-0000-0001-000000000015','20000000-0000-0000-0000-000000000028','Lerato N.',   4,'Reliable delivery',          'Lunch arrived hot and on time every day this week. Exactly what you want from a meal service.','2026-03-09'),

  -- Braai Masters
  ('a1000000-0000-0000-0001-000000000021','20000000-0000-0000-0000-000000000029','Sipho D.',    5,'Best braai I have ever had', 'Catered our company year-end. The lamb on the spit was the highlight of the entire year. Booked already for next year.','2026-02-05'),
  ('a1000000-0000-0000-0001-000000000021','20000000-0000-0000-0000-000000000030','Nandi K.',    5,'Stress-free event',          'They handled everything. I just enjoyed my own party. The meat was perfectly cooked and the service was outstanding.','2026-03-03'),

  -- Vetkoek & More
  ('a1000000-0000-0000-0001-000000000027','20000000-0000-0000-0000-000000000001','Mpho R.',     5,'Fluffy and delicious',       'The mince vetkoek are the best I have ever tasted. My kids ask for them every Saturday morning.','2026-03-04'),
  ('a1000000-0000-0000-0001-000000000027','20000000-0000-0000-0000-000000000002','Ayanda B.',   4,'Great for stokvel supply',   'She supplies our neighbourhood stokvel every month. Always fresh, always on time. Highly reliable.','2026-03-11'),

  -- Glow by Precious
  ('a1000000-0000-0000-0001-000000000004','20000000-0000-0000-0000-000000000003','Zanele P.',   5,'My skin is glowing',         'After just two facial sessions my skin has transformed. She recommended a routine that actually works for my skin type.','2026-02-17'),
  ('a1000000-0000-0000-0001-000000000004','20000000-0000-0000-0000-000000000004','Bongani T.',  4,'Great products too',         'Bought her natural moisturiser and it has been the best thing I have put on my face in years.','2026-03-07'),

  -- Nail Artistry by Thandi
  ('a1000000-0000-0000-0001-000000000010','20000000-0000-0000-0000-000000000005','Nomvula S.',  5,'Exactly what I wanted',      'Showed her a reference photo and she recreated it perfectly. Her attention to detail is incredible.','2026-02-21'),
  ('a1000000-0000-0000-0001-000000000010','20000000-0000-0000-0000-000000000006','Lungelo H.',  5,'Best nail tech in Khaye',    'Been going to Thandi for 8 months. She never disappoints. My nails are always the most complimented thing I wear.','2026-03-08'),
  ('a1000000-0000-0000-0001-000000000010','20000000-0000-0000-0000-000000000007','Kuhle M.',    4,'Great service',              'Clean studio, friendly atmosphere and she uses good quality products. No green nails here.','2026-03-12'),

  -- Body & Soul Wellness
  ('a1000000-0000-0000-0001-000000000016','20000000-0000-0000-0000-000000000008','Palesa J.',   5,'She comes to your house!',   'I could not believe a professional massage therapist would come to my home at this price. Total luxury.','2026-02-26'),
  ('a1000000-0000-0000-0001-000000000016','20000000-0000-0000-0000-000000000009','Thandeka R.', 5,'Pregnancy massage heaven',   'As someone who is 7 months pregnant with back pain, this was the most relief I have felt in months. Highly recommend.','2026-03-09'),

  -- Skincare by Sis Noma
  ('a1000000-0000-0000-0001-000000000022','20000000-0000-0000-0000-000000000010','Lwando N.',   5,'Finally cleared my acne',    'I have tried everything for my acne. Two sessions with Sis Noma and a routine she built for me and it is clearing up properly.','2026-03-01'),
  ('a1000000-0000-0000-0001-000000000022','20000000-0000-0000-0000-000000000011','Siyanda K.',  4,'Understands melanin skin',   'So refreshing to see someone who specialises in darker skin tones. She knows exactly what our skin needs.','2026-03-10'),

  -- Fit with Lungelo
  ('a1000000-0000-0000-0001-000000000028','20000000-0000-0000-0000-000000000012','Ntombi D.',   5,'Lost 8kg in 6 weeks',        'The combination of his training programme and the nutrition advice he gave me delivered real results. I feel incredible.','2026-02-23'),
  ('a1000000-0000-0000-0001-000000000028','20000000-0000-0000-0000-000000000013','Khulekani B.',4,'Motivating coach',           'He pushes you to go further than you think you can. Saturday bootcamps are tough but you always leave feeling proud.','2026-03-08'),

  -- Code the Future
  ('a1000000-0000-0000-0001-000000000005','20000000-0000-0000-0000-000000000014','Asanda P.',   5,'Built my first website!',    'I am 42 years old and had never written a line of code. I now have a working website for my business. Life-changing.','2026-02-16'),
  ('a1000000-0000-0000-0001-000000000005','20000000-0000-0000-0000-000000000015','Mfundo L.',   5,'Amazing instructor',         'Patient, encouraging and really knows how to explain technical concepts in simple language.','2026-03-03'),

  -- English Excellence
  ('a1000000-0000-0000-0001-000000000011','20000000-0000-0000-0000-000000000016','Yolanda S.',  5,'My daughter passed English', 'She went from 41% to 74% in one term. This tutor has a real skill for making English feel approachable.','2026-02-27'),
  ('a1000000-0000-0000-0001-000000000011','20000000-0000-0000-0000-000000000017','Dumisani F.', 4,'Great for oral preparation',  'Helped my son practice his oral presentation and he got 88%. He had been dreading it but left the session confident.','2026-03-10'),

  -- Homework Heroes
  ('a1000000-0000-0000-0001-000000000017','20000000-0000-0000-0000-000000000018','Nokwanda T.', 5,'Safe place for my kids',     'I know my children are being helped properly and are in a safe environment every afternoon. Worth every cent.','2026-03-02'),
  ('a1000000-0000-0000-0001-000000000017','20000000-0000-0000-0000-000000000019','Sthembile W.',4,'Noticeable improvement',     'My son''s maths marks have gone up consistently since starting here. The structured homework time makes a difference.','2026-03-11'),

  -- Science Lab
  ('a1000000-0000-0000-0001-000000000023','20000000-0000-0000-0000-000000000020','Banele G.',   5,'Finally understand physics', 'I have struggled with Physical Science since Grade 10. He explained Newton''s laws in a way that finally made sense.','2026-02-19'),
  ('a1000000-0000-0000-0001-000000000023','20000000-0000-0000-0000-000000000021','Lungisa C.',  4,'Thorough exam prep',         'The full-day exam prep session before my trial covered every topic. I felt prepared for the first time all year.','2026-03-07'),

  -- SMME Money Mastery
  ('a1000000-0000-0000-0001-000000000029','20000000-0000-0000-0000-000000000022','Zinhle A.',   5,'I understand my business now','She showed me where my money was leaking. I have saved over R2000 per month just by keeping proper books.','2026-02-22'),
  ('a1000000-0000-0000-0001-000000000029','20000000-0000-0000-0000-000000000023','Thabo M.',    5,'Got approved for funding',   'She helped me prepare my SEDA application and I was approved. Could not have done it without her guidance.','2026-03-09'),

  -- Spotless Cleaning
  ('a1000000-0000-0000-0001-000000000006','20000000-0000-0000-0000-000000000024','Lerato N.',   5,'My house has never been cleaner','They did a deep clean before my mom''s 70th birthday party. Every corner was spotless. The attention to detail was amazing.','2026-02-20'),
  ('a1000000-0000-0000-0001-000000000006','20000000-0000-0000-0000-000000000025','Sipho D.',    4,'Reliable and punctual',      'They arrive on time and work quickly without cutting corners. My regular cleaner every two weeks now.','2026-03-06'),

  -- Township Plumbing
  ('a1000000-0000-0000-0001-000000000012','20000000-0000-0000-0000-000000000026','Nandi K.',    5,'Emergency call-out hero',    'Pipe burst on a Sunday evening. He came within an hour and fixed it properly. Did not overcharge for the emergency call.','2026-02-18'),
  ('a1000000-0000-0000-0001-000000000012','20000000-0000-0000-0000-000000000027','Mpho R.',     4,'Honest tradesperson',        'Explained exactly what was wrong and what it would cost before starting. No surprises on the invoice.','2026-03-08'),

  -- Green Thumb
  ('a1000000-0000-0000-0001-000000000018','20000000-0000-0000-0000-000000000028','Ayanda B.',   5,'Garden looks incredible',    'They transformed my overgrown yard in 3 hours. Neighbours complimented me on the street.','2026-02-25'),
  ('a1000000-0000-0000-0001-000000000018','20000000-0000-0000-0000-000000000029','Zanele P.',   4,'Good monthly service',       'Two brothers who work hard and leave no mess. Been using them monthly for 4 months now.','2026-03-10'),

  -- Cape Flats Moving
  ('a1000000-0000-0000-0001-000000000024','20000000-0000-0000-0000-000000000030','Bongani T.',  5,'Stress-free house move',     'They wrapped everything carefully and nothing was scratched or broken. Faster than I expected and very friendly.','2026-03-01'),
  ('a1000000-0000-0000-0001-000000000024','20000000-0000-0000-0000-000000000001','Nomvula S.',  4,'Good value',                 'Cheaper than any other moving company I got quotes from and the service was professional.','2026-03-10'),

  -- Kasi Carpentry
  ('a1000000-0000-0000-0001-000000000030','20000000-0000-0000-0000-000000000002','Lungelo H.',  5,'Beautiful wardrobe',         'The built-in wardrobe he made is solid, fits perfectly and looks like it came from a furniture shop. Excellent craftsmanship.','2026-02-28'),
  ('a1000000-0000-0000-0001-000000000030','20000000-0000-0000-0000-000000000003','Kuhle M.',    5,'Kitchen cupboards are stunning','He measured, built and installed everything in 2 days. The quality is outstanding for the price.','2026-03-11')

on conflict (profile_id, reviewer_id) do nothing;
