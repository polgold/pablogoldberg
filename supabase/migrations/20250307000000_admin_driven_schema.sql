-- Admin-driven schema for Hostinger (no Supabase Storage, persistent local uploads).
-- Projects: bilingual, hero video, website, instagram.
-- Gallery: separate table with thumbnails, cover, ordering.
-- Project videos: Vimeo/YouTube per project.
-- Films: standalone section.

-- 1) Projects (new schema - we add columns to existing or create view)
-- Add new columns to projects for backward compatibility, then we use a unified approach.
-- Actually: create NEW tables to avoid breaking existing data. Old projects can be migrated manually.

create table if not exists public.admin_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_es text not null default '',
  title_en text not null default '',
  description_es text default '',
  description_en text default '',
  hero_video_platform text check (hero_video_platform in ('vimeo', 'youtube', '')),
  hero_video_id text,
  website text,
  instagram text,
  published boolean not null default false,
  sort_order int not null default 0,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_projects_published on public.admin_projects(published) where published = true;
create index if not exists idx_admin_projects_sort on public.admin_projects(sort_order desc nulls last);

-- 2) Project gallery images (uploaded to persistent storage)
create table if not exists public.project_gallery_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.admin_projects(id) on delete cascade,
  path text not null,
  thumb_path text not null,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_gallery_project on public.project_gallery_images(project_id);
create index if not exists idx_project_gallery_sort on public.project_gallery_images(project_id, sort_order);

-- 3) Project additional videos (Vimeo/YouTube)
create table if not exists public.project_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.admin_projects(id) on delete cascade,
  platform text not null check (platform in ('vimeo', 'youtube')),
  video_id text not null,
  url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_videos_project on public.project_videos(project_id);

-- 4) Films section
create table if not exists public.films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null check (platform in ('vimeo', 'youtube')),
  video_id text not null,
  url text,
  description text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_films_published on public.films(published) where published = true;
create index if not exists idx_films_sort on public.films(sort_order desc nulls last);

-- RLS
alter table public.admin_projects enable row level security;
alter table public.project_gallery_images enable row level security;
alter table public.project_videos enable row level security;
alter table public.films enable row level security;

create policy "admin_projects read" on public.admin_projects for select using (true);
create policy "admin_projects service_role" on public.admin_projects for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "project_gallery read" on public.project_gallery_images for select using (true);
create policy "project_gallery service_role" on public.project_gallery_images for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "project_videos read" on public.project_videos for select using (true);
create policy "project_videos service_role" on public.project_videos for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "films read" on public.films for select using (true);
create policy "films service_role" on public.films for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
