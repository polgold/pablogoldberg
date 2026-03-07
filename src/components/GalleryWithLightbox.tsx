"use client";

import { useState, useCallback } from "react";
import { getWorkImageUrl, toLargeFromThumb } from "@/lib/work-images";

/** Paths relativos a uploads/work (ej. film/bestefar/thumb/foto.jpg). Se sirven desde /uploads/work/ */
function thumbSrc(path: string): string {
  return getWorkImageUrl(path);
}
function largeSrc(path: string): string {
  return getWorkImageUrl(toLargeFromThumb(path));
}

export type GalleryItem = string | { thumb: string; large: string };

function getThumbUrl(item: GalleryItem): string {
  return typeof item === "string" ? thumbSrc(item) : item.thumb;
}
function getLargeUrl(item: GalleryItem): string {
  return typeof item === "string" ? largeSrc(item) : item.large;
}

export function GalleryWithLightbox({ paths }: { paths: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  if (paths.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {paths.map((path, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square w-full overflow-hidden rounded bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <img
              src={getThumbUrl(path)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
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
            src={getLargeUrl(paths[openIndex])}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
