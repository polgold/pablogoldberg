-- Portfolio photos: visibility + order for images in projects/portfolio/
create table if not exists public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text,
  is_visible boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_photos_visible_order
  on public.portfolio_photos (is_visible, "order")
  where is_visible = true;

comment on table public.portfolio_photos is 'Photos from projects/portfolio/ with visibility and order control';

-- RLS: public can read visible photos only (server uses service_role and bypasses)
alter table public.portfolio_photos enable row level security;

create policy "portfolio_photos_public_read"
  on public.portfolio_photos for select
  to anon, authenticated
  using (is_visible = true);
