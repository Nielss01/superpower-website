-- ── Marketplace seed data ─────────────────────────────────────────────────────
-- Creates 6 demo business listings across all categories, each with services
-- and realistic reviews. Some listings qualify as Top Hustler (≥20 reviews,
-- avg ≥4.25/5). All data is idempotent via ON CONFLICT DO NOTHING.
--
-- User ID ranges:
--   10000000-…-0001 → 0006  business owners (one per listing)
--   20000000-…-0001 → 0030  reviewer accounts (shared across listings)


-- ── 1. Fake auth users ────────────────────────────────────────────────────────

insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  is_sso_user, is_anonymous
) values
  -- Business owners
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','zara@example.com',         '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','techfix@example.com',       '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mamaskitchen@example.com',  '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','luxebraids@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mathstutor@example.com',    '$2a$10$placeholder',now(),now(),now(),false,false),
  ('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','speedycourier@example.com', '$2a$10$placeholder',now(),now(),now(),false,false),
  -- Reviewers
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer01@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer02@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer03@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer04@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer05@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer06@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer07@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer08@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer09@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer10@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer11@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer12@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer13@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer14@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer15@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer16@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000017','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer17@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000018','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer18@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000019','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer19@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer20@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer21@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer22@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer23@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer24@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer25@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer26@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer27@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer28@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer29@example.com','$2a$10$placeholder',now(),now(),now(),false,false),
  ('20000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer30@example.com','$2a$10$placeholder',now(),now(),now(),false,false)
on conflict (id) do nothing;


-- ── 2. Marketplace profiles ───────────────────────────────────────────────────

insert into public.marketplace_profiles
  (id, user_id, business_name, tagline, description, locations, category,
   whatsapp_number, response_time, is_verified, is_published)
values

  -- 1 · Zara Creative Studio — Creative · Khayelitsha · TOP HUSTLER + VERIFIED
  ('a1000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'Zara Creative Studio',
   'Bold African designs for bold people',
   'We are a creative design studio based in Khayelitsha, specialising in bold, Africa-inspired branding. From logos to full social media kits, we bring your vision to life using only a phone and years of passion. WhatsApp us to see our portfolio.',
   ARRAY['Khayelitsha'],
   'Creative',
   '0721234501',
   'Usually replies within 1 hour',
   true,
   true),

  -- 2 · TechFix Pro — Tech · Mitchells Plain & Gugulethu
  ('a1000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002',
   'TechFix Pro',
   'Your neighbourhood tech hero',
   'Cracked screen? WhatsApp setup problems? Google Maps not showing your shop? We fix it all. Operating across Mitchells Plain and Gugulethu with same-day turnaround on most repairs. No job too small.',
   ARRAY['Mitchells Plain', 'Gugulethu'],
   'Tech',
   '0831234502',
   'Usually replies within a few hours',
   false,
   true),

  -- 3 · Mama Thandiwe's Kitchen — Food & Beverage · Langa & Nyanga · TOP HUSTLER + VERIFIED
  ('a1000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000003',
   'Mama Thandiwe''s Kitchen',
   'Home-cooked meals with love from Langa',
   'I have been cooking for my community for over 10 years. Every meal is made from scratch with fresh ingredients from the market. I offer daily lunch specials, full catering for events, and weekly meal-prep boxes so you can eat well even on a busy week.',
   ARRAY['Langa', 'Nyanga'],
   'Food & Beverage',
   '0761234503',
   'Usually replies within 1 hour',
   true,
   true),

  -- 4 · Luxe Braids by Nomsa — Beauty & Wellness · Khayelitsha & Mitchells Plain
  ('a1000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000004',
   'Luxe Braids by Nomsa',
   'Where every braid tells your story',
   'Award-winning braiding specialist with 8 years of experience. I work from home in Khayelitsha and also travel to Mitchells Plain on weekends. Specialising in box braids, cornrows, loc maintenance and natural hair treatments. Book your slot early — I fill up fast!',
   ARRAY['Khayelitsha', 'Mitchells Plain'],
   'Beauty & Wellness',
   '0791234504',
   'Usually replies within 1 day',
   false,
   true),

  -- 5 · Maths Made Easy — Education · Philippi, Hanover Park & Bonteheuwel · TOP HUSTLER
  ('a1000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005',
   'Maths Made Easy',
   'Pass your matric with confidence',
   'I am a qualified Grade 12 Maths and Science tutor with a 94% matric pass rate among my students. I offer one-on-one sessions, small group study at the Philippi library, and WhatsApp voice note Q&A between sessions. Let''s turn your fear of maths into your strongest subject.',
   ARRAY['Philippi', 'Hanover Park', 'Bonteheuwel'],
   'Education',
   '0841234505',
   'Usually replies within a few hours',
   false,
   true),

  -- 6 · Speedy Courier Services — Services · Cape Flats-wide
  ('a1000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000006',
   'Speedy Courier Services',
   'Fast, reliable delivery across the Cape Flats',
   'Need something delivered today? We run routes across Khayelitsha, Mitchells Plain, Gugulethu, Langa and surrounding areas Monday to Saturday. Documents, parcels, groceries — if it fits on a bike, we deliver it.',
   ARRAY['Khayelitsha', 'Mitchells Plain', 'Gugulethu', 'Langa', 'Nyanga', 'Philippi'],
   'Services',
   '0711234506',
   'Usually replies within 1 hour',
   false,
   true)

on conflict (user_id) do nothing;


-- ── 3. Services ───────────────────────────────────────────────────────────────

insert into public.marketplace_services (profile_id, name, price, description, sort_order) values

  -- Zara Creative Studio
  ('a1000000-0000-0000-0000-000000000001', 'Logo Design',       '350',  'Primary logo + 2 variations, PNG & SVG files',         0),
  ('a1000000-0000-0000-0000-000000000001', 'Social Media Kit',  '500',  'Profile pic, cover, 5 post templates for your brand',  1),
  ('a1000000-0000-0000-0000-000000000001', 'Flyer Design',      '150',  'A5 event or promo flyer, print-ready PDF',              2),
  ('a1000000-0000-0000-0000-000000000001', 'Business Card',     '200',  'Double-sided card design, PDF + digital version',      3),

  -- TechFix Pro
  ('a1000000-0000-0000-0000-000000000002', 'Screen Repair',        '250', 'Most Android models, parts included',                   0),
  ('a1000000-0000-0000-0000-000000000002', 'WhatsApp Business Setup', '150', 'Catalogue, auto-reply & profile optimisation',       1),
  ('a1000000-0000-0000-0000-000000000002', 'Google Business Profile', '200', 'Create or fix your Google Maps listing',             2),
  ('a1000000-0000-0000-0000-000000000002', 'Data Backup & Transfer', '120', 'Save your contacts, photos & documents',             3),

  -- Mama Thandiwe's Kitchen
  ('a1000000-0000-0000-0000-000000000003', 'Daily Lunch Special', '60',  'Pap, protein & veg — changes daily',                   0),
  ('a1000000-0000-0000-0000-000000000003', 'Weekly Meal Prep Box','250',  '5 lunches, freshly cooked & packed',                   1),
  ('a1000000-0000-0000-0000-000000000003', 'Event Catering',      '800',  'Per 10 guests — full sit-down meal',                   2),
  ('a1000000-0000-0000-0000-000000000003', 'Braai Packs',         '180',  'Marinated meat & salads for 4 people',                 3),

  -- Luxe Braids by Nomsa
  ('a1000000-0000-0000-0000-000000000004', 'Box Braids',          '400', 'Waist length, includes hair',                           0),
  ('a1000000-0000-0000-0000-000000000004', 'Cornrows',            '200', 'Straight back or design cornrows',                      1),
  ('a1000000-0000-0000-0000-000000000004', 'Loc Maintenance',     '300', 'Retwist + moisturise, any length',                      2),
  ('a1000000-0000-0000-0000-000000000004', 'Natural Hair Treatment','250','Deep conditioning + blowout',                          3),

  -- Maths Made Easy
  ('a1000000-0000-0000-0000-000000000005', 'Maths Tutoring (1-on-1)', '100', 'Per 1-hour session, Grades 10–12',                  0),
  ('a1000000-0000-0000-0000-000000000005', 'Science Tutoring (1-on-1)','100', 'Physical Science, Grades 10–12',                   1),
  ('a1000000-0000-0000-0000-000000000005', 'Study Group Session', '60',   'Up to 4 students, 2 hours at Philippi library',        2),
  ('a1000000-0000-0000-0000-000000000005', 'Exam Crash Course',   '350',  'Full-day intensive before your trial or final exam',   3),

  -- Speedy Courier Services
  ('a1000000-0000-0000-0000-000000000006', 'Local Delivery',      '50',  'Within same township, under 5 km',                      0),
  ('a1000000-0000-0000-0000-000000000006', 'Cross-Area Delivery', '80',  'Between townships, same day',                           1),
  ('a1000000-0000-0000-0000-000000000006', 'Document Delivery',   '80',  'Secure, signed-for delivery',                           2),
  ('a1000000-0000-0000-0000-000000000006', 'Grocery Run',         '120', 'We shop & deliver — list + payment upfront',            3)

on conflict do nothing;


-- ── 4. Reviews ────────────────────────────────────────────────────────────────
-- Zara:  22 reviews (14×5 + 8×4  = avg 4.64) → Top Hustler ✓
-- Tech:  14 reviews (8×5  + 6×4  = avg 4.57) → not enough reviews
-- Mama:  26 reviews (20×5 + 6×4  = avg 4.77) → Top Hustler ✓
-- Nomsa:  9 reviews (7×5  + 2×4  = avg 4.78) → not enough reviews
-- Maths: 21 reviews (12×5 + 9×4  = avg 4.57) → Top Hustler ✓
-- Speedy: 5 reviews (3×5  + 2×4  = avg 4.60) → not enough reviews

insert into public.reviews (profile_id, reviewer_id, reviewer_name, rating, title, body, created_at) values

  -- ── Zara Creative Studio (22) ──────────────────────────────────────────────
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Thabo M.',        5,'Stunning logo!',          'Zara completely understood my vision. The logo she designed for my clothing brand is exactly what I had in mind — professional and uniquely African.','2025-11-03'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Lerato N.',       5,'Fast and talented',       'Needed a flyer for my event with only 2 days notice. She delivered within hours and it looked incredible. Will definitely use again.','2025-11-15'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','Sipho D.',        4,'Great value',             'Good quality work for the price. My business card design was clean and professional. Small revision requests were handled quickly.','2025-11-22'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Nandi K.',        5,'Best designer in Khaye',  'I have used three different designers this year and Zara is by far the best. She takes time to understand your brand before she even starts.','2025-12-01'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','Mpho R.',         4,'Solid work',              'My social media kit looks very professional now. Got compliments from customers who thought I had hired an agency.','2025-12-10'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000006','Ayanda B.',       5,'She just gets it',        'Explained my business in a few WhatsApp messages and she came back with a design that perfectly captured the vibe. Incredible skill.','2025-12-18'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','Zanele P.',       5,'Top-quality branding',    'Ordered a full branding package — logo, card and social kit. Everything was cohesive and delivered within 3 days. Highly recommend.','2026-01-05'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','Bongani T.',      4,'Very professional',       'Clean designs, good communication throughout the process. My logo stands out from competitors in the market.','2026-01-12'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','Nomvula S.',      5,'My business looks legit now','Before Zara, my branding looked homemade. Now people ask me if I am a big company. Worth every rand.','2026-01-20'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000010','Lungelo H.',      5,'Creative genius',         'She added design elements I had not even thought of that made the final product so much better. Exceeded my expectations.','2026-01-28'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000011','Kuhle M.',        4,'Good communication',      'Kept me updated throughout. A few back-and-forth revisions but the final result was worth it.','2026-02-04'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000012','Palesa J.',       5,'Repeat customer',         'This is my third project with Zara. She gets better every time and always makes me feel like a priority client.','2026-02-11'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000013','Thandeka R.',     5,'10/10 recommended',       'Showed her three reference images and she blended them into something totally original. My customers love the new look.','2026-02-18'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000014','Lwando N.',       4,'Decent turnaround',       'Took about 2 days which is reasonable for the level of detail. Price is fair for township rates.','2026-02-25'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000015','Siyanda K.',      5,'Transformed my brand',    'My spaza now has a proper logo, branded bags and a WhatsApp status template. Customers notice the difference.','2026-03-01'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000016','Ntombi D.',       5,'Reliable and talented',   'Second time using her for a flyer and she remembered my brand colours without me reminding her. That level of care is rare.','2026-03-04'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000017','Khulekani B.',    4,'Good quality',            'Delivered as promised. The design was clean and my clients noticed the upgrade immediately.','2026-03-06'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000018','Asanda P.',       5,'Goes the extra mile',     'She added a WhatsApp-optimised version of my flyer without me asking. Small things like that show she cares about your success.','2026-03-07'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000019','Mfundo L.',       5,'5 stars is not enough',   'I shared her contact with my whole community group. The best creative in Khayelitsha without question.','2026-03-08'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000020','Yolanda S.',      4,'Happy customer',          'Quick, professional and affordable. Exactly what a small business owner needs.','2026-03-09'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000021','Dumisani F.',     5,'Real talent',             'She turned a rough sketch I drew on paper into a beautiful digital logo. I was blown away.','2026-03-10'),
  ('a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000022','Nokwanda T.',     5,'My go-to designer',       'Any time I need anything design-related, Zara is my first call. Consistent quality every single time.','2026-03-11'),

  -- ── TechFix Pro (14) ───────────────────────────────────────────────────────
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Thabo M.',        5,'Screen fixed same day',   'Dropped my phone and cracked the screen. He fixed it within 2 hours for a fair price. Came to my house too.','2025-12-05'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Lerato N.',       4,'Solid repair work',       'Fixed my sister''s screen. Took slightly longer than expected but the repair is holding up well 3 months later.','2025-12-14'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','Sipho D.',        5,'Saved my business',       'Set up my WhatsApp Business catalogue and taught me how to use it. My orders doubled in the first month.','2025-12-22'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000004','Nandi K.',        5,'Google Maps sorted',      'My spaza was invisible on Google Maps. He sorted it out and now customers can find me easily.','2026-01-08'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000005','Mpho R.',         4,'Good service',            'Reasonable pricing and knew exactly what he was doing. Would use again for phone repairs.','2026-01-16'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000006','Ayanda B.',       5,'Data backup lifesaver',   'Thought I had lost all my photos when my phone died. He recovered everything. Could not believe it.','2026-01-24'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000007','Zanele P.',       5,'Highly recommend',        'Patient, knowledgeable and honest about what he can and cannot fix. Rare to find that.','2026-02-02'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000008','Bongani T.',      4,'Fair prices',             'Cheaper than any shop in town and the quality of work is just as good. Will tell my neighbors.','2026-02-09'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000009','Nomvula S.',      5,'Quick and reliable',      'WhatsApp Business set up within an hour. He even showed me how to set up away messages and quick replies.','2026-02-17'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000010','Lungelo H.',      4,'Good tech knowledge',     'Knows his stuff. Fixed a software issue on my phone that two other people could not solve.','2026-02-24'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000011','Kuhle M.',        4,'Trustworthy',             'Left my phone with him and everything was intact when I got it back. Trust is important in this business.','2026-03-02'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000012','Palesa J.',       5,'Community hero',          'He comes to your home which is amazing. Not everyone can travel far with a broken phone.','2026-03-06'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000013','Thandeka R.',     5,'5 stars',                 'Professional, friendly and fast. The screen on my Samsung looks brand new.','2026-03-09'),
  ('a1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000014','Lwando N.',       4,'Would use again',         'Second time using TechFix. Consistent service both times.','2026-03-11'),

  -- ── Mama Thandiwe's Kitchen (26) ───────────────────────────────────────────
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','Thabo M.',        5,'Best food in Langa',      'Mama Thandiwe''s food tastes like home. Her pap and oxtail is something I dream about. Order every Friday.','2025-10-12'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','Lerato N.',       5,'Catered my whole party',  'She catered my daughter''s 21st birthday for 40 guests. Every single plate was finished. Guests still talk about it.','2025-10-25'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','Sipho D.',        4,'Consistent quality',      'Order her lunch special almost every week. Always fresh, always warm, always delicious.','2025-11-03'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004','Nandi K.',        5,'My weekly meal prep',      'The meal prep box has changed my week. I eat properly even when I am too tired to cook. Worth every cent.','2025-11-14'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000005','Mpho R.',         5,'Feels like Sunday always', 'She puts real love into her food. You can taste the difference between someone who cooks for money and someone who cooks with heart.','2025-11-22'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000006','Ayanda B.',       4,'Great for the price',      'R60 for a proper hot meal with protein and vegetables is incredible value. Cannot cook cheaper at home.','2025-12-03'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000007','Zanele P.',       5,'Office favourite',         'I started ordering for my whole office. Now the team looks forward to Mama Thandiwe''s delivery days.','2025-12-12'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000008','Bongani T.',      5,'Authentic home cooking',   'Reminds me of my grandmother''s cooking. Proper umphokogo, proper umngqusho. She knows her roots.','2025-12-21'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000009','Nomvula S.',      5,'Five stars all day',       'Braai packs are phenomenal. The marinating alone shows she takes her craft seriously.','2026-01-04'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000010','Lungelo H.',      4,'Reliable delivery',        'Always on time and food arrives hot. She packs it properly so nothing spills. Small detail but it matters.','2026-01-11'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000011','Kuhle M.',        5,'Best catering in the area','My whole church committee agreed — best meal we have had at any church event. She managed 60 people flawlessly.','2026-01-18'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000012','Palesa J.',       5,'Reasonably priced',        'The event catering price is very fair for the quality you receive. I have used expensive caterers who cannot match this.','2026-01-26'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000013','Thandeka R.',     5,'A community treasure',     'Mama Thandiwe feeds our community with dignity. She deserves all the support she gets and more.','2026-02-03'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000014','Lwando N.',       4,'Good variety',             'The daily special changes each day so there is always something different. Keeps things exciting.','2026-02-10'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000015','Siyanda K.',      5,'10 out of 10',             'Ordered meal prep for the whole month. Every box was fresh and portions were generous. No complaints at all.','2026-02-16'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000016','Ntombi D.',       5,'My favourite cook',        'I have moved to Nyanga but I still order from Mama Thandiwe. The food is worth the delivery fee.','2026-02-22'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000017','Khulekani B.',    4,'Solid and consistent',     'Been ordering weekly for 4 months. Quality never drops. That kind of consistency is hard to find.','2026-03-01'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000018','Asanda P.',       5,'Proud of this business',   'It is great to see a local woman building something this strong. The food speaks for itself.','2026-03-04'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000019','Mfundo L.',       5,'Best in the Cape Flats',   'I have eaten at restaurants that charge triple the price for worse food. Mama Thandiwe is untouchable.','2026-03-06'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000020','Yolanda S.',      5,'Highly recommended',       'Everything from ordering to delivery was smooth and professional. And the food was exceptional.','2026-03-08'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000021','Dumisani F.',     4,'Great portion sizes',      'The value for money is unbelievable. I have been feeding my family of three on her specials all week.','2026-03-09'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000022','Nokwanda T.',     5,'Incredible food',          'The braai pack was the highlight of our weekend. Perfectly marinated, smelled amazing on the fire.','2026-03-10'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000023','Sthembile W.',    5,'Will order again',         'Friendly service and food that makes you feel at home. This is what community business looks like.','2026-03-11'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000024','Banele G.',       5,'My family loves it',       'My husband and kids were skeptical about ordering from someone they did not know. Now they ask me to order every week.','2026-03-12'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000025','Lungisa C.',      4,'Excellent catering',       'She catered a work lunch for 15 people and everyone was impressed. No leftovers — always a good sign.','2026-03-13'),
  ('a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000026','Zinhle A.',       5,'Truly special',            'Found her on Superpower Hub and so glad I did. This is exactly the kind of business this platform should be supporting.','2026-03-14'),

  -- ── Luxe Braids by Nomsa (9) ───────────────────────────────────────────────
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','Thabo M.',        5,'Did my wife''s hair',       'Nomsa did my wife''s box braids and she cried happy tears when she saw them. Her skill is remarkable.','2026-01-15'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','Lerato N.',       5,'Best braider I know',      'I have been going to Nomsa for 2 years. My hair has never been healthier. She uses proper techniques and does not rush.','2026-01-28'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000003','Sipho D.',        4,'Really good work',         'She did cornrows for my daughter and they lasted over a month with minimal frizz. Excellent technique.','2026-02-07'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','Nandi K.',        5,'Loc queen',                'My locs have never looked this good. She retwisted and styled them beautifully. Booked my next appointment before I left.','2026-02-17'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000005','Mpho R.',         5,'Gentle with natural hair',  'She understands that natural hair needs patience. No rough handling, no shortcuts. My scalp thanks her.','2026-02-26'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000006','Ayanda B.',       4,'Worth the wait',           'She fills up fast so you have to book ahead. But the quality makes the wait absolutely worth it.','2026-03-04'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000007','Zanele P.',       5,'Artistic talent',          'The braiding pattern she created for me was completely unique. People stop me in the street to ask who did my hair.','2026-03-07'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000008','Bongani T.',      5,'Professional and clean',   'Her home studio is spotless and welcoming. You feel pampered even though it is an affordable service.','2026-03-10'),
  ('a1000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000009','Nomvula S.',      4,'Great for the price',      'Box braids at R400 with hair included is a great deal compared to salons in town. And the quality is just as good.','2026-03-13'),

  -- ── Maths Made Easy (21) ───────────────────────────────────────────────────
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000001','Thabo M.',        5,'My son passed matric!',    'My son failed maths twice. After 3 months with this tutor he passed with a 68%. I am so proud. Worth every single rand.','2025-11-08'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000002','Lerato N.',       5,'Excellent teacher',        'Has a gift for breaking down complicated concepts. My daughter went from 32% to 71% in one term.','2025-11-19'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003','Sipho D.',        4,'Patient with slow learners','My son is not the fastest student but the tutor never made him feel stupid. That patience made all the difference.','2025-12-02'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000004','Nandi K.',        5,'Matric distinction',       'My daughter got 84% for maths final exam after attending crash courses here. Absolutely incredible results.','2025-12-16'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','Mpho R.',         4,'Good study groups',        'The group sessions at Philippi library are well organised. My daughter enjoys learning with peers in a structured environment.','2025-12-28'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000006','Ayanda B.',       5,'Real results',             'Not just theory — teaches exam technique too. My child knows how to structure answers under pressure now.','2026-01-09'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000007','Zanele P.',       5,'Passionate educator',      'You can feel the passion for teaching in every session. The tutor genuinely wants students to succeed.','2026-01-17'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000008','Bongani T.',      4,'WhatsApp support is great', 'Being able to send questions via WhatsApp voice notes between sessions is a game-changer. Very innovative.','2026-01-25'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000009','Nomvula S.',      5,'Transformed my child',     'My daughter used to cry before every maths test. Now she looks forward to them. That transformation is priceless.','2026-02-03'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000010','Lungelo H.',      4,'Good preparation',         'The exam crash course covered everything from the past 5 years of papers. Very thorough and organised.','2026-02-11'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000011','Kuhle M.',        5,'Best in Philippi',         'Has a reputation in the whole area for producing results. Spots fill up fast — book early.','2026-02-18'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000012','Palesa J.',       4,'Affordable and effective', 'R100 per session for Grade 12 maths tutoring is incredible value. Formal tutors charge 3x that.','2026-02-25'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000013','Thandeka R.',     5,'Our family''s secret weapon','Both my children use Maths Made Easy and both improved by at least 20 percentage points.','2026-03-01'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000014','Lwando N.',       5,'Highly recommend',         'Booked for the full year. The consistency and structure of sessions is excellent. My son is finally confident.','2026-03-04'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000015','Siyanda K.',      4,'Great group dynamic',      'The small group format is perfect. Students help each other and the tutor facilitates really well.','2026-03-06'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000016','Ntombi D.',       5,'Changed our future',       'My son is now considering engineering because of how much he loves maths now. That is a life changed.','2026-03-08'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000017','Khulekani B.',    4,'Very helpful tutor',       'Responds to WhatsApp questions even late at night before exams. That dedication means everything.','2026-03-09'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000018','Asanda P.',       5,'Proven results',           '4 out of 5 kids from my street who used this tutor passed matric maths. The results speak for themselves.','2026-03-10'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000019','Mfundo L.',       5,'Excellent crash course',   'Attended the day before my trial exam. Got 61% — my highest ever. Cannot thank this tutor enough.','2026-03-11'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000020','Yolanda S.',      4,'Good teacher',             'Clear explanations and lots of practice questions. My child always leaves sessions feeling confident.','2026-03-12'),
  ('a1000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000021','Dumisani F.',     5,'Community impact',         'This person is quietly changing lives in Philippi and Bonteheuwel. One student at a time.','2026-03-13'),

  -- ── Speedy Courier Services (5) ────────────────────────────────────────────
  ('a1000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000001','Thabo M.',        5,'Saved my day',             'Needed documents delivered urgently across town. They were at the destination within 90 minutes. Lifesaver.','2026-02-20'),
  ('a1000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000002','Lerato N.',       5,'Reliable and fast',        'Used for grocery deliveries twice this week. Arrived on time both times and everything was correct.','2026-02-28'),
  ('a1000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000003','Sipho D.',        4,'Good service',             'Reasonable prices and honest communication about delivery times. Would use regularly.','2026-03-05'),
  ('a1000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000004','Nandi K.',        5,'Community service',        'It is great having a local courier who knows all the streets. No getting lost, no delays.','2026-03-09'),
  ('a1000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000005','Mpho R.',         4,'Convenient',               'Much cheaper than big delivery apps. Supports a local hustle and does the job well.','2026-03-12')

on conflict (profile_id, reviewer_id) do nothing;
