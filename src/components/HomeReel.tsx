"use client";

interface HomeReelProps {
  vimeoId: string;
  title?: string;
}

/** ID numérico para la URL del iframe (evita caracteres que rompan la URL). */
function normalizeVimeoId(id: string): string {
  const num = String(id ?? "").trim().replace(/\D/g, "");
  return num || "";
}

export function HomeReel({ vimeoId, title = "Reel" }: HomeReelProps) {
  const id = normalizeVimeoId(vimeoId);
  if (!id) return null;

  const embedSrc = `https://player.vimeo.com/video/${id}?dnt=1&autoplay=0&loop=0&muted=0&badge=0`;

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
          key={id}
          title={title}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
