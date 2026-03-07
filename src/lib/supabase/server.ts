import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE KEY — solo en server, nunca en cliente.
 * Usa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 * Bypass RLS: permite INSERT/UPDATE/DELETE en tablas admin_projects, etc.
 * Si faltan env vars, devuelve null (ej. build sin DB).
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Cliente admin con SERVICE ROLE — exclusivo para operaciones de escritura.
 * Lanza error si SUPABASE_SERVICE_ROLE_KEY no está definida (evita fallback silencioso).
 */
export function createAdminSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está definida. Las operaciones admin requieren la service role key en el servidor. " +
        "Configurá SUPABASE_SERVICE_ROLE_KEY en .env (o variables de entorno del host) con la clave 'service_role' de Supabase → Project Settings → API."
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Cliente con clave anónima: respeta RLS. Usar para lecturas públicas
 * (ej. galería /photography) para que is_visible se aplique en DB.
 */
export function createSupabaseAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
