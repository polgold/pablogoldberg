-- Solución al error: new row violates row-level security policy for table "projects"
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run

drop policy if exists "projects service_role all" on public.projects;
drop policy if exists "pages service_role all" on public.pages;

create policy "projects service_role all"
  on public.projects
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "pages service_role all"
  on public.pages
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
