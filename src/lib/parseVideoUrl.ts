/** Parsea URL de video. Devuelve provider, id y embedUrl para iframe. Sin dependencias Node (usable en cliente). */
export function parseVideoUrl(url?: string): {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
} | null {
  if (!url) return null;

  const raw = url.trim();

  const shortMatch = raw.match(/^https?:\/\/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    const id = shortMatch[1];
    return { provider: "youtube", id, embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  const watchMatch = raw.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    const id = watchMatch[1];
    return { provider: "youtube", id, embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  const embedMatch = raw.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) {
    const id = embedMatch[1];
    return { provider: "youtube", id, embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return { provider: "vimeo", id, embedUrl: `https://player.vimeo.com/video/${id}` };
  }

  return null;
}
