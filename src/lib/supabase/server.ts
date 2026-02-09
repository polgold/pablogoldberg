import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Cliente Supabase para uso solo en server (SSR, API routes, Netlify functions).
 * Usa SERVICE_ROLE_KEY: nunca exponer al cliente.
 * Si faltan env vars, devuelve null para que el sitio cargue (p. ej. en build sin DB).
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
