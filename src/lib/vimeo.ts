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

function parseVideos(
  data: Array<{
    uri: string;
    name: string;
    link: string;
    duration: number;
    release_time?: string;
    pictures?: { sizes?: Array<{ width: number; link: string }> };
  }>
): VimeoVideo[] {
  return (data ?? []).map((v) => ({
    id: idFromUri(v.uri),
    name: v.name ?? "",
    thumbnail: pickThumbnail(v.pictures?.sizes ?? []),
    link: v.link ?? `https://vimeo.com/${idFromUri(v.uri)}`,
    duration: v.duration ?? 0,
    releaseTime: v.release_time ?? "",
  }));
}

type VideosResponse = {
  data?: Array<{
    uri: string;
    name: string;
    link: string;
    duration: number;
    release_time?: string;
    pictures?: { sizes?: Array<{ width: number; link: string }> };
  }>;
};

/** Extrae ID numérico de /users/12345 */
function userIdFromUri(uri: string): string {
  const m = uri?.match(/\/users\/(\d+)/);
  return m ? m[1] : "";
}

/** Fetches raw list from API (same source as public work). Does not filter by hidden. */
async function fetchVimeoPortfolioVideosRaw(): Promise<VimeoVideo[]> {
  const token = getToken();
  if (!token) return [];

  const headers = { Authorization: `Bearer ${token}` };
  const opts = { headers, next: { revalidate: 300 } as const };

  try {
    let list: VimeoVideo[] = [];
    const meRes = await fetch(`${API}/me/videos?per_page=40&sort=date`, opts);
    if (meRes.ok) {
      const json = (await meRes.json()) as VideosResponse;
      const data = json.data ?? [];
      if (data.length > 0) list = parseVideos(data);
    }
    if (list.length === 0) {
      const searchRes = await fetch(`${API}/users?query=sunfactory&per_page=1`, opts);
      if (!searchRes.ok) return [];
      const searchJson = (await searchRes.json()) as { data?: Array<{ uri: string }> };
      const user = searchJson.data?.[0];
      const userId = user ? userIdFromUri(user.uri) : "";
      if (!userId) return [];
      const videosRes = await fetch(`${API}/users/${userId}/videos?per_page=40&sort=date`, opts);
      if (!videosRes.ok) return [];
      const videosJson = (await videosRes.json()) as VideosResponse;
      list = parseVideos(videosJson.data ?? []);
    }
    return list;
  } catch {
    return [];
  }
}

/**
 * Lista los últimos 40 videos de vimeo.com/sunfactory.
 * Excluye los IDs marcados como ocultos en admin (hidden_vimeo_ids).
 */
export async function getVimeoPortfolioVideos(): Promise<VimeoVideo[]> {
  const [list, hiddenIds] = await Promise.all([
    fetchVimeoPortfolioVideosRaw(),
    import("./hidden-vimeo").then((m) => m.getHiddenVimeoIds()),
  ]);
  return list.filter((v) => !hiddenIds.has(v.id));
}

/**
 * Lista TODOS los videos del portfolio Vimeo (sin filtrar ocultos).
 * Para uso en /admin/vimeo-hidden.
 */
export async function getVimeoPortfolioVideosAll(): Promise<VimeoVideo[]> {
  return fetchVimeoPortfolioVideosRaw();
}
