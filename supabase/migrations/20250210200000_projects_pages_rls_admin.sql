-- Permitir al backend (service_role) crear/editar/borrar proyectos y páginas.
-- Sin esto, "new row violates row-level security policy for table projects" al crear proyecto en /admin.

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
