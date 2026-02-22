"use client";

import { useState, useCallback } from "react";

type GalleryItem = { thumbUrl: string; largeUrl: string };

function proxyUrl(url: string): string {
  if (url.includes("supabase")) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  return url;
}

export function GalleryWithLightbox({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square w-full overflow-hidden rounded bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <img
              src={proxyUrl(item.thumbUrl)}
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
            src={proxyUrl(items[openIndex].largeUrl)}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
