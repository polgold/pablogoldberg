"use client";

interface VideoEmbedProps {
  type?: "vimeo" | "youtube";
  id?: string;
  /** When set, iframe src uses this directly (no manual ID extraction). */
  embedUrl?: string | null;
  /** When parsing fails, show link instead of iframe. */
  fallbackUrl?: string | null;
  title?: string;
  className?: string;
}

export function VideoEmbed({ type, id, embedUrl, fallbackUrl, title, className = "" }: VideoEmbedProps) {
  const src = embedUrl?.trim();
  if (src) {
    return (
      <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
        <iframe
          title={title || (type === "vimeo" ? "Vimeo video" : "YouTube video")}
          src={type === "vimeo" ? `${src}?dnt=1` : src}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (fallbackUrl?.trim()) {
    return (
      <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
        <div className="flex h-full w-full items-center justify-center">
          <a
            href={fallbackUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/80 underline hover:text-white"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  }
  if (id?.trim() && type) {
    const url = type === "vimeo"
      ? `https://player.vimeo.com/video/${id}?dnt=1`
      : `https://www.youtube.com/embed/${id}`;
    return (
      <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
        <iframe
          title={title || (type === "vimeo" ? "Vimeo video" : "YouTube video")}
          src={url}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
      <div className="flex h-full w-full items-center justify-center text-white/40 text-sm">Video no disponible</div>
    </div>
  );
}
