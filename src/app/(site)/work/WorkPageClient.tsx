"use client";

import { useState, useCallback } from "react";
import type { WorkItem } from "@/types/work";
import { WorkGrid } from "@/components/WorkGrid";

interface WorkPageClientProps {
  items: WorkItem[];
  locale: string;
}

export function WorkPageClient({ items, locale }: WorkPageClientProps) {
  const [vimeoLightboxId, setVimeoLightboxId] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setVimeoLightboxId(null), []);

  return (
    <>
      <WorkGrid
        items={items}
        locale={locale}
        linkCards
        onVimeoClick={setVimeoLightboxId}
      />
      {vimeoLightboxId && (
        <div
          className="fixed inset-0 z-[100] relative flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reproducir video"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar"
          >
            ×
          </button>
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title="Video"
              src={`https://player.vimeo.com/video/${vimeoLightboxId}?autoplay=1`}
              className="absolute inset-0 h-full w-full rounded"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
