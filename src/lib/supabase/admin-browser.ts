import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Cliente Supabase para el panel admin en el navegador (login, sesión en cookies).
 * Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createAdminBrowserClient() {
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
