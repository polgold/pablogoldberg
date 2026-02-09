-- Videos agregados por ID para que aparezcan en /work (aunque no estén en los 60 del portfolio)
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run

create table if not exists public.custom_vimeo_ids (
  vimeo_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.custom_vimeo_ids enable row level security;

drop policy if exists "custom_vimeo_ids service" on public.custom_vimeo_ids;
create policy "custom_vimeo_ids service"
  on public.custom_vimeo_ids
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
