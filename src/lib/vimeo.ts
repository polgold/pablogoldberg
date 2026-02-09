/**
 * Vimeo API: últimos videos del usuario autenticado (token = cuenta sunfactory).
 * Requiere VIMEO_ACCESS_TOKEN en .env (personal access token desde developer.vimeo.com/apps).
 */

export interface VimeoVideo {
  id: string;
  name: string;
  thumbnail: string;
  link: string;
  duration: number;
  releaseTime: string;
}

const API = "https://api.vimeo.com";

function getToken(): string | null {
  return process.env.VIMEO_ACCESS_TOKEN?.trim() || null;
}

/** Extrae el id numérico del video desde uri (ej. /videos/12345 → 12345). */
function idFromUri(uri: string): string {
  const m = uri?.match(/\/videos\/(\d+)/);
  return m ? m[1] : "";
}

/** Thumbnail: preferir 640 de ancho o la mayor disponible. */
function pickThumbnail(sizes: Array<{ width: number; link: string }>): string {
  if (!sizes?.length) return "";
  const sorted = [...sizes].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const w640 = sorted.find((s) => s.width >= 640);
  return (w640 ?? sorted[0])?.link ?? "";
}

/**
 * Lista los últimos 40 videos del usuario del token (vimeo.com/sunfactory).
 */
export async function getVimeoPortfolioVideos(): Promise<VimeoVideo[]> {
  const token = getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API}/me/videos?per_page=40&sort=date`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: Array<{
        uri: string;
        name: string;
        link: string;
        duration: number;
        release_time?: string;
        pictures?: { sizes?: Array<{ width: number; link: string }> };
      }>;
    };
    const data = json.data ?? [];
    return data.map((v) => ({
      id: idFromUri(v.uri),
      name: v.name ?? "",
      thumbnail: pickThumbnail(v.pictures?.sizes ?? []),
      link: v.link ?? `https://vimeo.com/${idFromUri(v.uri)}`,
      duration: v.duration ?? 0,
      releaseTime: v.release_time ?? "",
    }));
  } catch {
    return [];
  }
}
