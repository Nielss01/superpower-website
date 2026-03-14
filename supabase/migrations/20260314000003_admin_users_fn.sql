-- Returns basic user info from auth.users for the CRM admin panel.
-- security definer runs as the function owner (postgres/superuser) so it can
-- read auth.users; access is then restricted to service_role only.
create or replace function public.get_admin_users()
returns table (
  id               uuid,
  email            text,
  created_at       timestamptz,
  last_sign_in_at  timestamptz,
  provider         text
)
security definer
set search_path = public
language sql
as $$
  select
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_app_meta_data->>'provider' as provider
  from auth.users
  order by created_at desc;
$$;

-- Restrict to service_role only — anon/authenticated cannot call this.
revoke execute on function public.get_admin_users() from public, anon, authenticated;
grant  execute on function public.get_admin_users() to service_role;
