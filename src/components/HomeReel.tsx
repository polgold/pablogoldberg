"use client";

interface HomeReelProps {
  vimeoId: string;
  title?: string;
}

export function HomeReel({ vimeoId, title = "Reel" }: HomeReelProps) {
  if (!vimeoId?.trim()) return null;

  return (
    <section
      id="reel"
      className="relative w-full border-b border-white/5 bg-black"
      aria-labelledby="reel-heading"
    >
      <h2 id="reel-heading" className="sr-only">
        {title}
      </h2>
      <div className="relative aspect-video w-full">
        <iframe
          title={title}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&loop=0&muted=0&quality=1080p`}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  );
}
