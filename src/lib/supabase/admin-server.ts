import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/** Para mensajes de error cuando auth no está configurado */
export function getAuthConfigError(): string | null {
  if (!url && !anon) return "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY";
  if (!url) return "Falta NEXT_PUBLIC_SUPABASE_URL";
  if (!anon) return "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY";
  return null;
}

/**
 * Cliente Supabase para server (admin): lee sesión desde cookies.
 * Usar en layout/páginas del admin para verificar usuario.
 */
export async function createAdminServerClient() {
  const err = getAuthConfigError();
  if (err) {
    if (process.env.NODE_ENV === "development") console.warn("[admin-server]", err, "Reinicia el servidor (npm run dev) tras cambiar .env");
    return null;
  }
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // En Server Component puede fallar; el middleware refresca la sesión
        }
      },
    },
  });
}

/**
 * Emails permitidos para /admin (env ADMIN_EMAILS="a@b.com,c@d.com").
 */
export function getAdminWhitelist(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Comprueba si el email está en la whitelist de admin.
 */
export function isAllowedAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const list = getAdminWhitelist();
  if (list.length === 0) return false; // Sin whitelist = nadie permitido
  return list.includes(email.trim().toLowerCase());
}
