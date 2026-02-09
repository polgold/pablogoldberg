-- Portfolio minimal schema for projects table.
-- New columns: cover_image, gallery (jsonb).
-- Storage: crear bucket "projects" en Supabase Storage (público si quieres URLs públicas).
-- Estructura: <slug>/cover.*, <slug>/gallery/*

alter table public.projects
  add column if not exists cover_image text;

alter table public.projects
  add column if not exists gallery jsonb not null default '[]'::jsonb;

-- Gallery item shape: { path, url, order }
comment on column public.projects.cover_image is 'Path in projects bucket: <slug>/cover.*';
comment on column public.projects.gallery is 'Array of { path, url, order }';
