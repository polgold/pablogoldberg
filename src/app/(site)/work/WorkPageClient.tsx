"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { WorkItem } from "@/types/work";
import { WorkGrid } from "@/components/WorkGrid";

interface WorkPageClientProps {
  items: WorkItem[];
  locale: string;
}

export function WorkPageClient({ items, locale }: WorkPageClientProps) {
  const [vimeoLightboxId, setVimeoLightboxId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeLightbox = useCallback(() => setVimeoLightboxId(null), []);

  const vimeoItems = useMemo(
    () => items.filter((i): i is WorkItem & { vimeoId: string } => Boolean(i.vimeoId)),
    [items]
  );
  const currentIndex = vimeoLightboxId
    ? vimeoItems.findIndex((i) => i.vimeoId === vimeoLightboxId)
    : -1;
  const currentItem = currentIndex >= 0 ? vimeoItems[currentIndex] ?? null : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < vimeoItems.length - 1;

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPrev && vimeoItems[currentIndex - 1]) {
        setVimeoLightboxId(vimeoItems[currentIndex - 1].vimeoId);
      }
    },
    [hasPrev, currentIndex, vimeoItems]
  );
  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasNext && vimeoItems[currentIndex + 1]) {
        setVimeoLightboxId(vimeoItems[currentIndex + 1].vimeoId);
      }
    },
    [hasNext, currentIndex, vimeoItems]
  );

  useEffect(() => setMounted(true), []);

  const lightbox =
    mounted &&
    vimeoLightboxId &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Reproducir video"
        onClick={closeLightbox}
        style={{ isolation: "isolate" }}
      >
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Navegación lateral izquierda */}
        {hasPrev ? (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 md:left-4 md:h-14 md:w-14"
            aria-label={locale === "es" ? "Video anterior" : "Previous video"}
          >
            ←
          </button>
        ) : (
          <div className="absolute left-2 md:left-4 w-12 md:w-14 shrink-0" aria-hidden />
        )}

        {/* Contenedor central: video + descripción */}
        <div
          className="flex flex-col items-center gap-3 max-w-4xl w-full mx-14 md:mx-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full"
            style={{ aspectRatio: "16/9", minHeight: "200px" }}
          >
            <iframe
              key={vimeoLightboxId}
              title="Video"
              src={`https://player.vimeo.com/video/${vimeoLightboxId}?autoplay=1`}
              className="absolute inset-0 h-full w-full rounded border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          {currentItem?.title && (
            <div
              className="w-full rounded bg-white/10 px-4 py-3 text-sm text-white/80"
              style={{ opacity: 0.5 }}
            >
              <p className="line-clamp-3">{currentItem.title}</p>
            </div>
          )}
        </div>

        {/* Navegación lateral derecha */}
        {hasNext ? (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 md:right-4 md:h-14 md:w-14"
            aria-label={locale === "es" ? "Siguiente video" : "Next video"}
          >
            →
          </button>
        ) : (
          <div className="absolute right-2 md:right-4 w-12 md:w-14 shrink-0" aria-hidden />
        )}
      </div>,
      document.body
    );

  return (
    <>
      <WorkGrid
        items={items}
        locale={locale}
        linkCards
        onVimeoClick={setVimeoLightboxId}
      />
      {lightbox}
    </>
  );
}
