-- Ensure service_role can INSERT into contact_messages (some setups need explicit WITH CHECK)
drop policy if exists "contact_messages service" on public.contact_messages;
create policy "contact_messages service_role all"
  on public.contact_messages
  for all
  to service_role
  using (true)
  with check (true);
