"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface PhotosGridWithLightboxProps {
  urls: string[];
}

export function PhotosGridWithLightbox({ urls }: PhotosGridWithLightboxProps) {
  const [index, setIndex] = useState<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (index == null || urls.length === 0) return;
      setIndex((idx) => {
        const next = (idx ?? 0) + delta;
        if (next < 0) return urls.length - 1;
        if (next >= urls.length) return 0;
        return next;
      });
    },
    [index, urls.length]
  );

  const close = useCallback(() => setIndex(null), []);

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, go]);

  if (urls.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {urls.map((url, i) => (
          <li key={i} className="relative aspect-square overflow-hidden bg-white/5">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="relative h-full w-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </button>
          </li>
        ))}
      </ul>

      {index != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 md:left-4"
            aria-label="Anterior"
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl">
            <Image
              src={urls[index]}
              alt=""
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized={urls[index].includes("supabase")}
            />
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 md:right-4"
            aria-label="Siguiente"
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
            {index + 1} / {urls.length}
          </span>
        </div>
      )}
    </>
  );
}
