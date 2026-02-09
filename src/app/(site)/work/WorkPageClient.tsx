"use client";

import { useState, useCallback, useEffect } from "react";
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
        <div
          className="relative w-full max-w-4xl"
          style={{ aspectRatio: "16/9", minHeight: "200px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            title="Video"
            src={`https://player.vimeo.com/video/${vimeoLightboxId}?autoplay=1`}
            className="absolute inset-0 h-full w-full rounded border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
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
