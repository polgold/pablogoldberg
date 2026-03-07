-- Add hero_video_url to admin_projects (original URL for hero video)
-- Add custom_thumbnail to films and project_videos (fallback when platform thumbnail fails)

alter table public.admin_projects
  add column if not exists hero_video_url text;

alter table public.films
  add column if not exists custom_thumbnail text;

alter table public.project_videos
  add column if not exists custom_thumbnail text;

comment on column public.admin_projects.hero_video_url is 'Original URL of hero video (Vimeo/YouTube)';
comment on column public.films.custom_thumbnail is 'Fallback thumbnail URL when Vimeo/YouTube fetch fails';
comment on column public.project_videos.custom_thumbnail is 'Fallback thumbnail URL when Vimeo/YouTube fetch fails';
