-- Columnas para el panel admin y galería de videos.
-- Ejecutar en SQL Editor del dashboard de Supabase.

-- Publicación: solo proyectos con published=true se muestran en el sitio público
alter table public.projects
  add column if not exists published boolean not null default false;

-- Galería de videos (paths en bucket)
alter table public.projects
  add column if not exists gallery_video_paths text[] default '{}';

-- Tags (opcional para filtros/SEO)
alter table public.projects
  add column if not exists tags text[] default '{}';

-- Índice para listar solo publicados en el sitio
create index if not exists idx_projects_published on public.projects(published) where published = true;

-- Comentarios
comment on column public.projects.published is 'Si false, el proyecto no se muestra en el sitio público';
comment on column public.projects.gallery_video_paths is 'Rutas en Storage (bucket) para videos de la galería';
comment on column public.projects.tags is 'Etiquetas del proyecto';
