"use client";

import { useId } from "react";

interface FilmGrainProps {
  className?: string;
}

/**
 * Subtle film-grain overlay. Use over hero video/image for a cinematic look.
 */
export function FilmGrain({ className = "" }: FilmGrainProps) {
  const id = useId().replace(/:/g, "");
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[2] opacity-[0.04] mix-blend-overlay ${className}`}
      aria-hidden
    >
      <svg className="h-full w-full">
        <filter id={`grain-${id}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
      </svg>
    </div>
  );
}
