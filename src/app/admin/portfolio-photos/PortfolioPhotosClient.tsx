"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  togglePortfolioPhotoVisibility,
  reorderPortfolioPhotos,
  listAdminPortfolioPhotos,
  createPortfolioGallery,
  uploadPortfolioPhotos,
  type PortfolioPhoto,
  type PortfolioGallery,
} from "../actions";

const IMAGE_EXTS = /\.(jpe?g|png|webp|gif|avif)$/i;

function isImageFile(file: File): boolean {
  return IMAGE_EXTS.test(file.name);
}

interface PortfolioPhotosClientProps {
  initialGalleries: PortfolioGallery[];
  initialPhotos: PortfolioPhoto[];
}

export function PortfolioPhotosClient({
  initialGalleries,
  initialPhotos,
}: PortfolioPhotosClientProps) {
  const [galleries, setGalleries] = useState<PortfolioGallery[]>(initialGalleries);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>(initialPhotos);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(
    initialGalleries[0]?.id ?? null
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newGalleryName, setNewGalleryName] = useState("");
  const [addingGallery, setAddingGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const loadPhotosForGallery = useCallback(async (galleryId: string | null) => {
    const list = await listAdminPortfolioPhotos(galleryId);
    setPhotos(list);
  }, []);

  const handleSelectGallery = useCallback(
    async (id: string | null) => {
      setSelectedGalleryId(id);
      await loadPhotosForGallery(id);
    },
    [loadPhotosForGallery]
  );

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

  const handleDragLeave = useCallback(() => setDragOverId(null), []);

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

  const onUploadDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.classList.remove("border-amber-500", "bg-amber-500/10");
      const files = Array.from(e.dataTransfer.files).filter(isImageFile);
      if (files.length === 0) {
        showToast("Solo se aceptan imágenes (jpg, png, webp, gif, avif)");
        return;
      }
      if (!selectedGalleryId) {
        showToast("Elegí una galería antes de subir");
        return;
      }
      doUpload(files, selectedGalleryId);
    },
    [selectedGalleryId, showToast]
  );

  const onUploadDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-amber-500", "bg-amber-500/10");
  }, []);

  const onUploadDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-amber-500", "bg-amber-500/10");
  }, []);

  const doUpload = useCallback(
    async (files: File[], galleryId: string) => {
      setUploading(true);
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));
      const { uploaded, error } = await uploadPortfolioPhotos(formData, galleryId);
      setUploading(false);
      if (error) {
        showToast(error);
        return;
      }
      showToast(`${uploaded ?? 0} foto(s) subida(s)`);
      await loadPhotosForGallery(selectedGalleryId);
    },
    [selectedGalleryId, showToast, loadPhotosForGallery]
  );

  const onSelectFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter(isImageFile);
      e.target.value = "";
      if (files.length === 0) return;
      if (!selectedGalleryId) {
        showToast("Elegí una galería antes de subir");
        return;
      }
      doUpload(files, selectedGalleryId);
    },
    [selectedGalleryId, showToast, doUpload]
  );

  const handleCreateGallery = useCallback(async () => {
    const name = newGalleryName.trim();
    if (!name) return;
    setAddingGallery(true);
    const { gallery, error } = await createPortfolioGallery(name);
    setAddingGallery(false);
    setNewGalleryName("");
    if (error) {
      showToast(error);
      return;
    }
    if (gallery) {
      setGalleries((prev) => [...prev, gallery]);
      showToast(`Galería "${gallery.name}" creada`);
    }
  }, [newGalleryName, showToast]);

  const currentGallery = galleries.find((g) => g.id === selectedGalleryId);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Sidebar: galleries (Elementor-style) */}
      <aside className="w-full shrink-0 rounded border border-zinc-800 bg-zinc-900/60 p-4 lg:w-56">
        <h2 className="mb-3 text-sm font-medium text-zinc-400">Galerías</h2>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => handleSelectGallery(null)}
              className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                selectedGalleryId === null
                  ? "bg-amber-600/30 text-amber-200"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              Todas
            </button>
          </li>
          {galleries.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => handleSelectGallery(g.id)}
                className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                  selectedGalleryId === g.id
                    ? "bg-amber-600/30 text-amber-200"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {g.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <input
            type="text"
            value={newGalleryName}
            onChange={(e) => setNewGalleryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGallery()}
            placeholder="Nueva galería"
            className="mb-2 w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-white placeholder-zinc-500"
          />
          <button
            type="button"
            onClick={handleCreateGallery}
            disabled={addingGallery || !newGalleryName.trim()}
            className="w-full rounded bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600 disabled:opacity-50"
          >
            {addingGallery ? "…" : "Crear galería"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Upload zone (Elementor-style) */}
        <div
          onDrop={onUploadDrop}
          onDragOver={onUploadDragOver}
          onDragLeave={onUploadDragLeave}
          className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-8 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={onSelectFiles}
          />
          <p className="mb-2 text-sm text-zinc-400">
            {currentGallery
              ? `Subir a «${currentGallery.name}»`
              : "Elegí una galería a la izquierda para subir fotos"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !selectedGalleryId}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {uploading ? "Subiendo…" : "Seleccionar archivos"}
          </button>
          <p className="mt-2 text-xs text-zinc-500">
            o arrastrá imágenes aquí · JPG, PNG, WebP, GIF, AVIF
          </p>
        </div>

        {/* Photo grid */}
        {reorderLoading && (
          <p className="mb-2 text-xs text-amber-500">Guardando orden...</p>
        )}
        {photos.length === 0 ? (
          <p className="rounded border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-500">
            {selectedGalleryId
              ? "No hay fotos en esta galería. Subí imágenes arriba."
              : "Elegí una galería o subí fotos en una galería."}
          </p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
