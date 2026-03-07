"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { WorkItem } from "@/types/work";
import { WorkGrid } from "@/components/WorkGrid";

interface WorkPageClientProps {
  items: WorkItem[];
  locale: string;
}

type VideoItem = WorkItem & { vimeoId?: string; youtubeId?: string };

export function WorkPageClient({ items, locale }: WorkPageClientProps) {
  const [videoLightbox, setVideoLightbox] = useState<{ type: "vimeo" | "youtube"; id: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeLightbox = useCallback(() => setVideoLightbox(null), []);

  const videoItems = useMemo(
    () => items.filter((i): i is VideoItem => Boolean(i.vimeoId || i.youtubeId)),
    [items]
  );
  const currentIndex = videoLightbox
    ? videoItems.findIndex(
        (i) =>
          (videoLightbox.type === "vimeo" && i.vimeoId === videoLightbox.id) ||
          (videoLightbox.type === "youtube" && i.youtubeId === videoLightbox.id)
      )
    : -1;
  const currentItem = currentIndex >= 0 ? videoItems[currentIndex] ?? null : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < videoItems.length - 1;

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const prevItem = videoItems[currentIndex - 1];
      if (hasPrev && prevItem) {
        if (prevItem.vimeoId) setVideoLightbox({ type: "vimeo", id: prevItem.vimeoId });
        else if (prevItem.youtubeId) setVideoLightbox({ type: "youtube", id: prevItem.youtubeId });
      }
    },
    [hasPrev, currentIndex, videoItems]
  );
  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextItem = videoItems[currentIndex + 1];
      if (hasNext && nextItem) {
        if (nextItem.vimeoId) setVideoLightbox({ type: "vimeo", id: nextItem.vimeoId });
        else if (nextItem.youtubeId) setVideoLightbox({ type: "youtube", id: nextItem.youtubeId });
      }
    },
    [hasNext, currentIndex, videoItems]
  );

  useEffect(() => setMounted(true), []);

  const lightbox =
    mounted &&
    videoLightbox &&
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
            {videoLightbox.type === "vimeo" ? (
              <iframe
                key={videoLightbox.id}
                title="Video"
                src={`https://player.vimeo.com/video/${videoLightbox.id}?autoplay=1`}
                className="absolute inset-0 h-full w-full rounded border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                key={videoLightbox.id}
                title="Video"
                src={`https://www.youtube.com/embed/${videoLightbox.id}?autoplay=1`}
                className="absolute inset-0 h-full w-full rounded border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
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

  const onVimeoClick = useCallback((id: string) => setVideoLightbox({ type: "vimeo", id }), []);
  const onYouTubeClick = useCallback((id: string) => setVideoLightbox({ type: "youtube", id }), []);

  return (
    <>
      <WorkGrid
        items={items}
        locale={locale}
        linkCards
        onVimeoClick={onVimeoClick}
        onYouTubeClick={onYouTubeClick}
      />
      {lightbox}
    </>
  );
}
