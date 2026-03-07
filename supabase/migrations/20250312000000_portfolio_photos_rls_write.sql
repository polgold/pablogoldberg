-- Fix: add INSERT, UPDATE, DELETE policies for service_role on portfolio_photos and portfolio_galleries.
-- Without these, writes fail when "Force Row Level Security" is enabled in Supabase dashboard.

-- portfolio_photos: service_role full access
drop policy if exists "portfolio_photos_service_role_all" on public.portfolio_photos;
create policy "portfolio_photos_service_role_all"
  on public.portfolio_photos for all
  to service_role
  using (true)
  with check (true);

-- portfolio_galleries: service_role full access
drop policy if exists "portfolio_galleries_service_role_all" on public.portfolio_galleries;
create policy "portfolio_galleries_service_role_all"
  on public.portfolio_galleries for all
  to service_role
  using (true)
  with check (true);
