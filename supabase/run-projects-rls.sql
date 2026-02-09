-- Solución al error: new row violates row-level security policy for table "projects"
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run
--
-- IMPORTANTE: En Netlify (o tu host) la variable debe ser SUPABASE_SERVICE_ROLE_KEY
-- con el valor "service_role" (secret) del dashboard de Supabase → Project Settings → API.
-- No uses la anon key ahí.

drop policy if exists "projects service_role all" on public.projects;
drop policy if exists "projects service_role insert" on public.projects;
drop policy if exists "projects service_role update" on public.projects;
drop policy if exists "projects service_role delete" on public.projects;
drop policy if exists "pages service_role all" on public.pages;

create policy "projects service_role all"
  on public.projects
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Políticas explícitas por operación (por si "for all" no aplica en tu versión)
create policy "projects service_role insert"
  on public.projects for insert
  with check (auth.role() = 'service_role');
create policy "projects service_role update"
  on public.projects for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
create policy "projects service_role delete"
  on public.projects for delete
  using (auth.role() = 'service_role');

create policy "pages service_role all"
  on public.pages
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
