"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProjectVideo, removeProjectVideo } from "../admin-actions";
import { getVideoThumbnailUrl } from "@/lib/admin-utils";

type Video = {
  id: string;
  platform: string;
  video_id: string;
  url: string | null;
  custom_thumbnail?: string | null;
  sort_order: number;
};

export function ProjectVideosEditor({ projectId, videos }: { projectId: string; videos: Video[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [customThumb, setCustomThumb] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setAdding(true);
    const result = await addProjectVideo(projectId, url.trim(), customThumb.trim() || undefined);
    setAdding(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUrl("");
    setCustomThumb("");
    router.refresh();
  }

  async function remove(videoId: string) {
    await removeProjectVideo(videoId);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1">
            <label htmlFor="video_url" className="mb-1 block text-sm text-zinc-400">
              URL de Vimeo o YouTube
            </label>
            <input
              id="video_url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://vimeo.com/... o https://youtube.com/watch?v=..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label htmlFor="custom_thumb" className="mb-1 block text-sm text-zinc-400">
              Thumbnail custom (opcional)
            </label>
            <input
              id="custom_thumb"
              type="url"
              value={customThumb}
              onChange={(e) => setCustomThumb(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
          type="submit"
          disabled={adding || !url.trim()}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {adding ? "Agregando…" : "Agregar"}
        </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <div
            key={v.id}
            className="group relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900"
          >
            <img
              src={getVideoThumbnailUrl(v.platform, v.video_id, v.custom_thumbnail)}
              alt=""
              className="aspect-video w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => remove(v.id)}
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500"
              >
                Eliminar
              </button>
            </div>
            <p className="p-2 text-xs text-zinc-500">
              {v.platform} • {v.video_id}
            </p>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="text-sm text-zinc-500">No hay videos adicionales. Agregá URLs de Vimeo o YouTube arriba.</p>
      )}
    </div>
  );
}
