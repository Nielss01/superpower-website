-- Helper function used by the CRM API to make room when inserting a new item
-- at a specific sort position. Shifts all existing items at or above p_from up by 1.
create or replace function public.shift_sort_order_up(
  p_table text,
  p_from  integer
) returns void language plpgsql security definer as $$
begin
  if p_table = 'marketplace_categories' then
    update public.marketplace_categories
    set sort_order = sort_order + 1
    where sort_order >= p_from;
  elsif p_table = 'marketplace_locations' then
    update public.marketplace_locations
    set sort_order = sort_order + 1
    where sort_order >= p_from;
  end if;
end;
$$;
