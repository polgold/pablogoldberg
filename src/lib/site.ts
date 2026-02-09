/**
 * Base URL del sitio (sin trailing slash).
 * Usar para canonicals, OG URLs y JSON-LD.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://pablogoldberg.com";

/** Construye URL canónica evitando doble barra. */
export function getCanonicalUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${path}`;
}

/** URLs absolutas para hreflang es/en. pathWithoutLocale: "" | "/work" | "/about" | "/contact" | "/work/slug". */
export function getHreflangUrls(pathWithoutLocale: string): { es: string; en: string } {
  const p = pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;
  return {
    es: `${SITE_URL}/es${p}`,
    en: `${SITE_URL}/en${p}`,
  };
}

/** Sun Factory — productora (Organization schema + Footer). */
export const SUN_FACTORY_URL = "https://www.sunfactory.com.ar";

/** Enlaces sameAs para schema Person (debe coincidir con Footer). */
export const PERSON_SAME_AS = [
  "https://www.imdb.com/name/nm1328948",
  "https://vimeo.com/sunfactory",
  "https://www.youtube.com/@pablogoldberg",
  "https://www.instagram.com/polgold",
  "https://wa.me/5491136511204",
  "https://open.spotify.com/user/pablogoldberg",
  "https://x.com/pablogoldberg",
  "https://www.facebook.com/pablogoldberg",
] as const;
