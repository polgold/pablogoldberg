-- URLs de reels/trailers (YouTube o Vimeo) por proyecto.
-- Ejecutar en SQL Editor del dashboard de Supabase si no usas migraciones automáticas.

alter table public.projects
  add column if not exists reel_urls text[] default '{}';

comment on column public.projects.reel_urls is 'URLs de reels o trailers (YouTube/Vimeo) para mostrar en la página del proyecto';
