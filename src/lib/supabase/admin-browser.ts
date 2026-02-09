import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

/**
 * Cliente Supabase para el panel admin en el navegador (login, sesión en cookies).
 */
export function createAdminBrowserClient() {
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
