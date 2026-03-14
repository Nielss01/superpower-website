-- ── CRM write policies for config tables ──────────────────────────────────────
-- marketplace_categories and marketplace_locations are non-sensitive display
-- config (names, colours, emoji, township names). Real authorization is enforced
-- at the Next.js API layer via CRM cookie authentication — these policies simply
-- allow the server-side anon client to perform the writes.

drop policy if exists "CRM write marketplace_categories" on public.marketplace_categories;
create policy "CRM write marketplace_categories"
  on public.marketplace_categories for all
  using (true) with check (true);

drop policy if exists "CRM write marketplace_locations" on public.marketplace_locations;
create policy "CRM write marketplace_locations"
  on public.marketplace_locations for all
  using (true) with check (true);
