-- Portfolio galleries: separate collections for portfolio photos
create table if not exists public.portfolio_galleries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.portfolio_galleries is 'Galleries for portfolio photos (e.g. Portfolio, Personal)';

-- Add gallery_id to portfolio_photos (null = default/legacy gallery)
alter table public.portfolio_photos
  add column if not exists gallery_id uuid references public.portfolio_galleries(id) on delete set null;

create index if not exists idx_portfolio_photos_gallery
  on public.portfolio_photos (gallery_id);

-- Default gallery so existing photos can stay in "Portfolio"
insert into public.portfolio_galleries (id, name, slug, "order")
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Portfolio',
  'portfolio',
  0
)
on conflict (slug) do nothing;

-- Assign existing photos to default gallery
update public.portfolio_photos
set gallery_id = '00000000-0000-0000-0000-000000000001'::uuid
where gallery_id is null;
