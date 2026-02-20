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
  paging?: { next?: string | null };
};

/** Extrae ID numérico de /users/12345 */
function userIdFromUri(uri: string): string {
  const m = uri?.match(/\/users\/(\d+)/);
  return m ? m[1] : "";
}

/** Fetch a single video by ID (for custom IDs). Returns null if not found or no token. */
export async function fetchVimeoVideoById(videoId: string): Promise<VimeoVideo | null> {
  const token = getToken();
  const id = String(videoId).trim().replace(/\D/g, "");
  if (!token || !id) return null;
  const headers = { Authorization: `Bearer ${token}` };
  const opts = { headers, next: { revalidate: 300 } as const };
  try {
    const res = await fetch(`${API}/videos/${id}`, opts);
    if (!res.ok) return null;
    const v = (await res.json()) as {
      uri?: string;
      name?: string;
      link?: string;
      duration?: number;
      release_time?: string;
      pictures?: { sizes?: Array<{ width: number; link: string }> };
    };
    const normalized = {
      uri: v.uri ?? "",
      name: v.name ?? "",
      link: v.link ?? "",
      duration: v.duration ?? 0,
      release_time: v.release_time,
      pictures: v.pictures,
    };
    return parseVideos([normalized])[0] ?? null;
  } catch {
    return null;
  }
}

const PER_PAGE = 60;
const TARGET_VISIBLE = 40;
/** Cap pages to avoid edge/serverless timeout (Netlify ~10s). 2 pages = 120 videos max. */
const MAX_PAGES = 2;

/** Fetches one page of videos. Returns videos + whether there are more pages. */
async function fetchVimeoPortfolioPage(
  basePath: string,
  page: number,
  opts: RequestInit
): Promise<{ videos: VimeoVideo[]; hasMore: boolean }> {
  const url = `${API}${basePath}?per_page=${PER_PAGE}&sort=date&page=${page}`;
  const res = await fetch(url, opts);
  if (!res.ok) return { videos: [], hasMore: false };
  const json = (await res.json()) as VideosResponse;
  const data = json.data ?? [];
  const videos = data.length > 0 ? parseVideos(data) : [];
  const hasMore = Boolean(json.paging?.next);
  return { videos, hasMore };
}

/** Resolves the base path for portfolio videos: /me/videos or /users/{id}/videos. */
async function resolveVimeoBasePath(opts: RequestInit): Promise<string> {
  const meRes = await fetch(`${API}/me/videos?per_page=1&sort=date`, opts);
  if (meRes.ok) {
    const json = (await meRes.json()) as VideosResponse;
    if ((json.data ?? []).length > 0) return "/me/videos";
  }
  const searchRes = await fetch(`${API}/users?query=sunfactory&per_page=1`, opts);
  if (!searchRes.ok) return "/me/videos";
  const searchJson = (await searchRes.json()) as { data?: Array<{ uri: string }> };
  const user = searchJson.data?.[0];
  const userId = user ? userIdFromUri(user.uri) : "";
  return userId ? `/users/${userId}/videos` : "/me/videos";
}

/** Fetches raw list from API (same source as public work). Does not filter by hidden. Capped at MAX_PAGES to avoid edge timeout. */
async function fetchVimeoPortfolioVideosRaw(): Promise<VimeoVideo[]> {
  const token = getToken();
  if (!token) return [];

  const headers = { Authorization: `Bearer ${token}` };
  const opts = { headers, next: { revalidate: 300 } as const };

  try {
    const basePath = await resolveVimeoBasePath(opts);
    const all: VimeoVideo[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { videos, hasMore: more } = await fetchVimeoPortfolioPage(basePath, page, opts);
      all.push(...videos);
      if (!more || videos.length === 0) break;
    }
    return all;
  } catch {
    return [];
  }
}

/** Fetches enough pages until we have at least targetVisible videos after filtering hidden. Capped at MAX_PAGES to avoid edge timeout. */
async function fetchVimeoPortfolioVideosUntilEnough(
  hiddenIds: Set<string>,
  targetVisible: number,
  opts: RequestInit
): Promise<VimeoVideo[]> {
  const basePath = await resolveVimeoBasePath(opts);
  const all: VimeoVideo[] = [];
  const norm = (s: string) => String(s ?? "").replace(/\D/g, "");
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { videos, hasMore: more } = await fetchVimeoPortfolioPage(basePath, page, opts);
    all.push(...videos);
    const visible = all.filter((v) => !hiddenIds.has(norm(v.id)));
    if (visible.length >= targetVisible || !more || videos.length === 0) break;
  }
  return all;
}

/**
 * Lista hasta 40 videos visibles: custom por ID + portfolio, sin ocultos.
 * Sigue paginando en Vimeo hasta tener 40 visibles (para compensar ocultos).
 */
export async function getVimeoPortfolioVideos(): Promise<VimeoVideo[]> {
  const token = getToken();
  if (!token) return [];

  const [hiddenIds, customIds] = await Promise.all([
    import("./hidden-vimeo").then((m) => m.getHiddenVimeoIds()),
    import("./hidden-vimeo").then((m) => m.getCustomVimeoIds()),
  ]);

  const opts = { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } as const };

  const customVideos: VimeoVideo[] = [];
  for (const id of customIds) {
    const v = await fetchVimeoVideoById(id);
    if (v) customVideos.push(v);
  }
  const norm = (s: string) => String(s ?? "").replace(/\D/g, "");
  const customVisible = customVideos.filter((v) => !hiddenIds.has(norm(v.id)));
  const targetFromRaw = Math.max(0, TARGET_VISIBLE - customVisible.length);

  const rawList =
    targetFromRaw > 0
      ? await fetchVimeoPortfolioVideosUntilEnough(hiddenIds, targetFromRaw, opts)
      : [];

  const rawFiltered = rawList.filter((r) => !customIds.has(r.id));
  const merged = [...customVideos, ...rawFiltered];
  return merged.filter((v) => !hiddenIds.has(norm(v.id))).slice(0, TARGET_VISIBLE);
}

/**
 * Lista TODOS (custom + 60 del portfolio) para /admin/vimeo-hidden.
 */
export async function getVimeoPortfolioVideosAll(): Promise<VimeoVideo[]> {
  const [rawList, customIds] = await Promise.all([
    fetchVimeoPortfolioVideosRaw(),
    import("./hidden-vimeo").then((m) => m.getCustomVimeoIds()),
  ]);
  const rawIds = new Set(rawList.map((v) => v.id));
  const customVideos: VimeoVideo[] = [];
  for (const id of customIds) {
    if (rawIds.has(id)) continue;
    const v = await fetchVimeoVideoById(id);
    if (v) customVideos.push(v);
  }
  return [...customVideos, ...rawList];
}
