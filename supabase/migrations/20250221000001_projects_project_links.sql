-- Enlaces externos por proyecto (web de la película, prensa, etc.).
-- Ejecutar en SQL Editor del dashboard de Supabase si no usas migraciones automáticas.

alter table public.projects
  add column if not exists project_links jsonb default '[]';

comment on column public.projects.project_links is 'Lista de enlaces externos: [{ "url": "https://...", "label": "Web de la película" }]. label opcional.';
