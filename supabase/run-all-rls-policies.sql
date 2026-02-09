-- Aplica todas las políticas RLS para que el backend (service_role) pueda escribir.
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run
--
-- Requiere: SUPABASE_SERVICE_ROLE_KEY en Netlify con el valor "service_role" (secret) de Supabase.

-- projects
drop policy if exists "projects service_role all" on public.projects;
drop policy if exists "projects service_role insert" on public.projects;
drop policy if exists "projects service_role update" on public.projects;
drop policy if exists "projects service_role delete" on public.projects;
create policy "projects service_role all" on public.projects for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "projects service_role insert" on public.projects for insert with check (auth.role() = 'service_role');
create policy "projects service_role update" on public.projects for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "projects service_role delete" on public.projects for delete using (auth.role() = 'service_role');

-- pages
drop policy if exists "pages service_role all" on public.pages;
create policy "pages service_role all" on public.pages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- hidden_vimeo_ids
drop policy if exists "hidden_vimeo_ids service" on public.hidden_vimeo_ids;
drop policy if exists "hidden_vimeo_ids service insert" on public.hidden_vimeo_ids;
drop policy if exists "hidden_vimeo_ids service update" on public.hidden_vimeo_ids;
drop policy if exists "hidden_vimeo_ids service delete" on public.hidden_vimeo_ids;
create policy "hidden_vimeo_ids service" on public.hidden_vimeo_ids for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "hidden_vimeo_ids service insert" on public.hidden_vimeo_ids for insert with check (auth.role() = 'service_role');
create policy "hidden_vimeo_ids service update" on public.hidden_vimeo_ids for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "hidden_vimeo_ids service delete" on public.hidden_vimeo_ids for delete using (auth.role() = 'service_role');

-- custom_vimeo_ids: si usás videos por ID, ejecutá supabase/run-custom-vimeo.sql (crea tabla + políticas).
