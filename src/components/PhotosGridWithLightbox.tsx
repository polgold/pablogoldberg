"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export interface GalleryImageItem {
  thumbUrl: string;
  largeUrl: string;
}

interface PhotosGridWithLightboxProps {
  items: GalleryImageItem[];
}

const SWIPE_THRESHOLD = 50;
const SWIPE_HORIZONTAL_MIN = 20;

export function PhotosGridWithLightbox({ items }: PhotosGridWithLightboxProps) {
  const [index, setIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (delta: number) => {
      if (index == null || items.length === 0) return;
      setIndex((idx) => {
        const next = (idx ?? 0) + delta;
        if (next < 0) return items.length - 1;
        if (next >= items.length) return 0;
        return next;
      });
    },
    [index, items.length]
  );

  const close = useCallback(() => setIndex(null), []);

  // Bloquear scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (index == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [index]);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
    isHorizontalSwipe.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    if (startX == null || startY == null) return;
    const x = e.touches[0]?.clientX ?? startX;
    const y = e.touches[0]?.clientY ?? startY;
    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_HORIZONTAL_MIN) {
      isHorizontalSwipe.current = true;
      e.preventDefault();
    }
  }, []);

  // Listener touchmove con passive: false para que preventDefault bloquee scroll
  useEffect(() => {
    const el = overlayRef.current;
    if (!el || index == null) return;
    const onTouchMove = (e: TouchEvent) => {
      const startX = touchStartX.current;
      const startY = touchStartY.current;
      if (startX == null || startY == null) return;
      const x = e.touches[0]?.clientX ?? startX;
      const y = e.touches[0]?.clientY ?? startY;
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_HORIZONTAL_MIN) {
        isHorizontalSwipe.current = true;
        e.preventDefault();
      }
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [index]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const startX = touchStartX.current;
      touchStartX.current = null;
      touchStartY.current = null;
      if (startX == null || index == null || items.length === 0) return;
      if (!isHorizontalSwipe.current) return;
      const endX = e.changedTouches[0]?.clientX ?? startX;
      const dx = endX - startX;
      if (dx <= -SWIPE_THRESHOLD) go(1);
      else if (dx >= SWIPE_THRESHOLD) go(-1);
    },
    [index, items.length, go]
  );

  if (items.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item, i) => (
          <li key={i} className="relative aspect-square overflow-hidden bg-white/5">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="relative h-full w-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
            >
              <Image
                src={item.thumbUrl}
                alt=""
                fill
                loading="lazy"
                decoding="async"
                className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </button>
          </li>
        ))}
      </ul>

      {index != null && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Botón cerrar (X): capa superior, safe area, tap >= 44px */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute z-[999] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/50 text-white/90 hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{
              top: "calc(12px + env(safe-area-inset-top))",
              right: "calc(12px + env(safe-area-inset-right))",
            }}
            aria-label="Cerrar"
          >
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
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
              src={items[index].largeUrl}
              alt=""
              fill
              className="object-contain"
              sizes="90vw"
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
            {index + 1} / {items.length}
          </span>
        </div>
      )}
    </>
  );
}
