"use client";

import Image from "next/image";
import { FilmGrain } from "@/components/FilmGrain";

interface HeroReelProps {
  vimeoId: string;
  title?: string;
  /** Optional still image: shown behind the video (while loading) or as sole hero when vimeoId is empty */
  fallbackImageSrc?: string | null;
  className?: string;
}

/**
 * Full-viewport cinematic hero: muted autoplay Vimeo reel, optional still fallback, overlay + film grain.
 */
export function HeroReel({
  vimeoId,
  title = "Reel",
  fallbackImageSrc,
  className = "",
}: HeroReelProps) {
  const hasVideo = Boolean(vimeoId?.trim());
  const hasFallback = Boolean(fallbackImageSrc?.trim());

  return (
    <div className={`absolute inset-0 overflow-hidden bg-black ${className}`}>
      {/* Layer 1: optional still (background while video loads, or sole hero when no video) */}
      {hasFallback && (
        <div className="absolute inset-0">
          <Image
            src={fallbackImageSrc!}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Layer 2: Vimeo reel (covers still when playing) */}
      {hasVideo && (
        <div className="absolute inset-0">
          <iframe
            title={title}
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&quality=1080p`}
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-[100vh] w-[177.78vh] min-w-[100vw] -translate-x-1/2 -translate-y-1/2 object-cover"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* Layer 3: dark overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      {/* Layer 4: subtle film grain */}
      <FilmGrain />
    </div>
  );
}
