-- Contact form submissions (nombre, whatsapp o email, mensaje)
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email_or_whatsapp text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Vimeo video IDs to hide from portfolio (admin toggle)
create table if not exists public.hidden_vimeo_ids (
  vimeo_id text primary key,
  created_at timestamptz not null default now()
);

-- RLS: contact_submissions and hidden_vimeo_ids only via service role (API/admin)
alter table public.contact_submissions enable row level security;
alter table public.hidden_vimeo_ids enable row level security;

create policy "contact_submissions service" on public.contact_submissions for all using (auth.role() = 'service_role');
create policy "hidden_vimeo_ids service" on public.hidden_vimeo_ids for all using (auth.role() = 'service_role');
