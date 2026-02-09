-- Portfolio: storage policies for bucket "projects" + gallery visibility
-- 1) Storage: permitir lectura pública y escritura para service_role/authenticated en bucket projects
-- 2) Galerías: columna is_visible para la página pública
-- 3) RLS en portfolio_galleries y políticas de lectura pública

-- Storage policies (storage.objects) para bucket 'projects'
-- SELECT: público para que /gallery muestre imágenes sin signed URLs
-- INSERT/UPDATE/DELETE: authenticated (admin) y service_role (API/server)
drop policy if exists "projects_storage_public_read" on storage.objects;
create policy "projects_storage_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'projects');

drop policy if exists "projects_storage_authenticated_write" on storage.objects;
create policy "projects_storage_authenticated_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'projects');

drop policy if exists "projects_storage_authenticated_update" on storage.objects;
create policy "projects_storage_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'projects')
  with check (bucket_id = 'projects');

drop policy if exists "projects_storage_authenticated_delete" on storage.objects;
create policy "projects_storage_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'projects');

drop policy if exists "projects_storage_service_role" on storage.objects;
create policy "projects_storage_service_role"
  on storage.objects for all
  to service_role
  using (bucket_id = 'projects')
  with check (bucket_id = 'projects');

-- Galerías: visibilidad en página pública (sort_order ya existe como "order")
alter table public.portfolio_galleries
  add column if not exists is_visible boolean not null default true;

comment on column public.portfolio_galleries.is_visible is 'Si false, la galería no se muestra en /gallery';

-- RLS en portfolio_galleries (lectura pública solo visibles)
alter table public.portfolio_galleries enable row level security;

drop policy if exists "portfolio_galleries_public_read" on public.portfolio_galleries;
create policy "portfolio_galleries_public_read"
  on public.portfolio_galleries for select
  to anon, authenticated
  using (is_visible = true);
