"use client";

interface VideoEmbedProps {
  type: "vimeo" | "youtube";
  id: string;
  title?: string;
  className?: string;
}

export function VideoEmbed({ type, id, title, className = "" }: VideoEmbedProps) {
  if (!id?.trim()) {
    return (
      <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
        <div className="flex h-full w-full items-center justify-center text-white/40 text-sm">Video no disponible</div>
      </div>
    );
  }
  if (type === "vimeo") {
    return (
      <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
        <iframe
          title={title || "Vimeo video"}
          src={`https://player.vimeo.com/video/${id}?dnt=1`}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
      <iframe
        title={title || "YouTube video"}
        src={`https://www.youtube.com/embed/${id}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
