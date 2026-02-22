"use client";

import { useState, useCallback } from "react";

/** Paths en Storage (ej. bestefar/thumbs/foto.jpg). Se sirven por /api/proxy-image?path=... */
function thumbSrc(path: string): string {
  return `/api/proxy-image?path=${encodeURIComponent(path)}`;
}
function largeSrc(path: string): string {
  const large = path.replace(/\/thumbs?\//, "/large/");
  return `/api/proxy-image?path=${encodeURIComponent(large)}`;
}

export function GalleryWithLightbox({ paths }: { paths: string[] }) {
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
              src={thumbSrc(path)}
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
            src={largeSrc(paths[openIndex])}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
