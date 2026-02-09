-- Videos agregados por ID para que aparezcan en /work (aunque no estén en los 60 del portfolio)
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run

create table if not exists public.custom_vimeo_ids (
  vimeo_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.custom_vimeo_ids enable row level security;

drop policy if exists "custom_vimeo_ids service" on public.custom_vimeo_ids;
drop policy if exists "custom_vimeo_ids service insert" on public.custom_vimeo_ids;
drop policy if exists "custom_vimeo_ids service update" on public.custom_vimeo_ids;
drop policy if exists "custom_vimeo_ids service delete" on public.custom_vimeo_ids;

create policy "custom_vimeo_ids service"
  on public.custom_vimeo_ids
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "custom_vimeo_ids service insert"
  on public.custom_vimeo_ids for insert
  with check (auth.role() = 'service_role');
create policy "custom_vimeo_ids service update"
  on public.custom_vimeo_ids for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
create policy "custom_vimeo_ids service delete"
  on public.custom_vimeo_ids for delete
  using (auth.role() = 'service_role');
