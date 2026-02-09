"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
  togglePortfolioPhotoVisibility,
  reorderPortfolioPhotos,
  type PortfolioPhoto,
} from "../actions";

interface PortfolioPhotosClientProps {
  initialPhotos: PortfolioPhoto[];
}

export function PortfolioPhotosClient({ initialPhotos }: PortfolioPhotosClientProps) {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>(initialPhotos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleToggle = useCallback(
    async (id: string) => {
      setLoadingId(id);
      const { error } = await togglePortfolioPhotoVisibility(id);
      setLoadingId(null);
      if (error) {
        showToast(error);
        return;
      }
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_visible: !p.is_visible } : p))
      );
      showToast("Actualizado");
    },
    [showToast]
  );

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= photos.length) return;
      const next = [...photos];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      const updates = next.map((p, i) => ({ id: p.id, order: i }));
      setPhotos(next.map((p, i) => ({ ...p, order: i })));
      setReorderLoading(true);
      reorderPortfolioPhotos(updates).then(({ error }) => {
        setReorderLoading(false);
        if (error) showToast(error);
      });
    },
    [photos, showToast]
  );

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDraggedId(null);
      setDragOverId(null);
      const fromId = e.dataTransfer.getData("text/plain");
      if (!fromId || fromId === targetId) return;
      const fromIndex = photos.findIndex((p) => p.id === fromId);
      const toIndex = photos.findIndex((p) => p.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      moveItem(fromIndex, toIndex);
    },
    [photos, moveItem]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  if (photos.length === 0) {
    return (
      <p className="rounded border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-500">
        No hay fotos. Subí imágenes en Supabase Storage: bucket <strong>projects</strong>, carpeta <strong>portfolio/</strong>.
      </p>
    );
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-4 right-4 rounded bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
      {reorderLoading && (
        <p className="mb-2 text-xs text-amber-500">Guardando orden...</p>
      )}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            draggable
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragOver={(e) => handleDragOver(e, photo.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, photo.id)}
            onDragEnd={handleDragEnd}
            className={`group relative flex flex-col overflow-hidden rounded border bg-zinc-900 transition-opacity ${
              draggedId === photo.id ? "opacity-50" : ""
            } ${dragOverId === photo.id ? "ring-2 ring-amber-500" : "border-zinc-800"}`}
          >
            <div className="relative aspect-square bg-zinc-800">
              <Image
                src={photo.public_url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                unoptimized={photo.public_url.includes("supabase")}
              />
              {!photo.is_visible && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <span className="text-sm font-medium text-zinc-400">Oculta</span>
                </div>
              )}
              <div
                className="absolute left-1 top-1 cursor-grab rounded bg-black/60 px-1.5 py-0.5 text-xs text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100"
                title="Arrastrar para reordenar"
              >
                ⋮⋮
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-800 p-2">
              <span className="truncate text-xs text-zinc-500">#{index + 1}</span>
              <button
                type="button"
                onClick={() => handleToggle(photo.id)}
                disabled={loadingId === photo.id}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  photo.is_visible
                    ? "bg-green-900/50 text-green-400 hover:bg-green-800/50"
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                } ${loadingId === photo.id ? "opacity-50" : ""}`}
              >
                {loadingId === photo.id ? "…" : photo.is_visible ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
