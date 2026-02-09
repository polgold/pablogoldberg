import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Cliente Supabase para uso en el navegador.
 * Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export const supabaseClient =
  url && anon
    ? createClient(url, anon)
    : (null as unknown as ReturnType<typeof createClient>);
