"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import type { VimeoVideo } from "@/lib/vimeo";

interface PortfolioVideoGridProps {
  videos: VimeoVideo[];
}

export function PortfolioVideoGrid({ videos }: PortfolioVideoGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const close = useCallback(() => setActiveId(null), []);

  if (videos.length === 0) return null;

  return (
    <>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {videos.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => setActiveId(v.id)}
              className="group relative block w-full aspect-video overflow-hidden rounded bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              {v.thumbnail ? (
                <Image
                  src={v.thumbnail}
                  alt={v.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/30 text-sm">Video</div>
              )}
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="line-clamp-2 text-left text-xs text-white">{v.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {activeId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reproducir video"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar"
          >
            ×
          </button>
          <div className="relative w-full max-w-4xl aspect-video">
            <iframe
              title="Video"
              src={`https://player.vimeo.com/video/${activeId}?autoplay=1`}
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
