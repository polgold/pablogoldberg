-- Tabla para ocultar videos de Vimeo en el portfolio público
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run

create table if not exists public.hidden_vimeo_ids (
  vimeo_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.hidden_vimeo_ids enable row level security;

drop policy if exists "hidden_vimeo_ids service" on public.hidden_vimeo_ids;
drop policy if exists "hidden_vimeo_ids service insert" on public.hidden_vimeo_ids;
drop policy if exists "hidden_vimeo_ids service update" on public.hidden_vimeo_ids;
drop policy if exists "hidden_vimeo_ids service delete" on public.hidden_vimeo_ids;

create policy "hidden_vimeo_ids service"
  on public.hidden_vimeo_ids
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "hidden_vimeo_ids service insert"
  on public.hidden_vimeo_ids for insert
  with check (auth.role() = 'service_role');
create policy "hidden_vimeo_ids service update"
  on public.hidden_vimeo_ids for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
create policy "hidden_vimeo_ids service delete"
  on public.hidden_vimeo_ids for delete
  using (auth.role() = 'service_role');
