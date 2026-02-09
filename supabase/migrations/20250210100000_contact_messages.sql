-- Contact/booking form messages (name, email or whatsapp, message)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email_or_whatsapp text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
create policy "contact_messages service" on public.contact_messages for all using (auth.role() = 'service_role');
