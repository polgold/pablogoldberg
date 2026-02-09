-- Tablas para el sitio (Supabase). Ejecutar en SQL Editor del dashboard.
-- Bucket: crear en Storage con nombre igual a SUPABASE_STORAGE_BUCKET (ej: public) y hacerlo público si quieres URLs públicas.

-- Páginas (home, about, contact, etc.)
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'es',
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  unique(slug, locale)
);

-- Proyectos
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'es',
  title text not null,
  summary text default '',
  description text default '',
  credits text default '',
  year int,
  "order" int,
  client text,
  piece_type text,
  duration text,
  video_url text,
  external_link text,
  cover_image_path text,
  gallery_image_paths text[] default '{}',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  unique(slug, locale)
);

create index if not exists idx_projects_locale on public.projects(locale);
create index if not exists idx_projects_order_year on public.projects("order" desc nulls last, year desc nulls last);
create index if not exists idx_projects_featured on public.projects(is_featured) where is_featured = true;
create index if not exists idx_pages_locale on public.pages(locale);

-- RLS: permitir lectura pública (anon y service role pueden leer).
alter table public.pages enable row level security;
alter table public.projects enable row level security;

create policy "pages read" on public.pages for select using (true);
create policy "projects read" on public.projects for select using (true);

-- 3 filas demo en projects (es)
insert into public.pages (slug, locale, title, content) values
  ('home', 'es', 'Inicio', '<p>Bienvenido.</p>'),
  ('about', 'es', 'Sobre mí', '<p>Texto about.</p>'),
  ('contact', 'es', 'Contacto', '<p>Contacto.</p>')
on conflict (slug, locale) do update set title = excluded.title, content = excluded.content;

insert into public.projects (slug, locale, title, summary, year, "order", is_featured, cover_image_path, gallery_image_paths) values
  ('proyecto-a', 'es', 'Proyecto A', 'Resumen del proyecto A.', 2024, 10, true, 'demo/cover-a.jpg', array['demo/g1.jpg']),
  ('proyecto-b', 'es', 'Proyecto B', 'Resumen del proyecto B.', 2023, 9, true, null, '{}'),
  ('proyecto-c', 'es', 'Proyecto C', 'Resumen del proyecto C.', 2022, 8, false, null, '{}')
on conflict (slug, locale) do update set title = excluded.title, summary = excluded.summary, year = excluded.year, "order" = excluded."order", is_featured = excluded.is_featured;
