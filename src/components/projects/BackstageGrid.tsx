"use client";

import { useState, useCallback } from "react";
import type { BackstageImage } from "@/lib/projects-backstage";

/** Grid 12 backstage + lightbox. thumbUrl/largeUrl; fallback a originalUrl si falla. */
export function BackstageGrid({ images }: { images: BackstageImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square w-full overflow-hidden rounded bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <img
              src={img.thumbUrl}
              alt={img.alt}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== img.originalUrl) target.src = img.originalUrl;
              }}
            />
          </button>
        ))}
      </div>

      {openIndex != null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ver imagen"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={images[openIndex].largeUrl}
            alt={images[openIndex].alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== images[openIndex].originalUrl)
                target.src = images[openIndex].originalUrl;
            }}
          />
        </div>
      )}
    </>
  );
}
