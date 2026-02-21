import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Cliente Supabase para uso solo en server (SSR, API routes).
 * Usa SUPABASE_SERVICE_ROLE_KEY si existe; si no, NEXT_PUBLIC_SUPABASE_ANON_KEY (lectura pública con RLS).
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const key = serviceRoleKey || anonKey;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
