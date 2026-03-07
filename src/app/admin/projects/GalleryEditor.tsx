"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadProjectGalleryImages,
  setGalleryCover,
  toggleGalleryImageHidden,
  deleteGalleryImage,
} from "../admin-actions";
import { getProjectImageUrl } from "@/lib/admin-utils";

type Image = {
  id: string;
  path: string;
  thumb_path: string;
  is_cover: boolean;
  sort_order: number;
  hidden: boolean;
};

export function GalleryEditor({
  projectId,
  slug,
  images,
}: {
  projectId: string;
  slug: string;
  images: Image[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const files = Array.from(formData.entries())
      .filter(([, v]) => v instanceof File && (v as File).size > 0)
      .map(([, v]) => v as File);
    if (files.length === 0) {
      setError("Seleccioná al menos una imagen");
      return;
    }
    setUploading(true);
    const result = await uploadProjectGalleryImages(projectId, slug, formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  async function setCover(imageId: string) {
    const { error } = await setGalleryCover(projectId, imageId);
    if (error) setError(error);
    else router.refresh();
  }

  async function toggleHidden(imageId: string) {
    await toggleGalleryImageHidden(imageId);
    router.refresh();
  }

  async function remove(imageId: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    await deleteGalleryImage(imageId);
    router.refresh();
  }

  const visibleImages = images.filter((i) => !i.hidden);
  const hiddenImages = images.filter((i) => i.hidden);

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="gallery_files" className="mb-1 block text-sm text-zinc-400">
            Subir imágenes
          </label>
          <input
            id="gallery_files"
            name="gallery_files"
            type="file"
            accept="image/*"
            multiple
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white file:mr-2 file:rounded file:border-0 file:bg-amber-600 file:px-3 file:py-1 file:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : "Subir"}
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {visibleImages.map((img) => (
          <div
            key={img.id}
            className={`group relative overflow-hidden rounded-lg border ${
              img.is_cover ? "border-amber-500 ring-2 ring-amber-500/50" : "border-zinc-700"
            }`}
          >
            <img
              src={getProjectImageUrl(img.thumb_path)}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
              {!img.is_cover && (
                <button
                  type="button"
                  onClick={() => setCover(img.id)}
                  className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500"
                >
                  Portada
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleHidden(img.id)}
                className="rounded bg-zinc-600 px-2 py-1 text-xs text-white hover:bg-zinc-500"
              >
                Ocultar
              </button>
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
              >
                Eliminar
              </button>
            </div>
            {img.is_cover && (
              <span className="absolute left-2 top-2 rounded bg-amber-600 px-2 py-0.5 text-xs text-white">
                Portada
              </span>
            )}
          </div>
        ))}
      </div>

      {hiddenImages.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-zinc-500">Ocultas ({hiddenImages.length})</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {hiddenImages.map((img) => (
              <div key={img.id} className="relative overflow-hidden rounded-lg border border-zinc-800 opacity-60">
                <img
                  src={getProjectImageUrl(img.thumb_path)}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => toggleHidden(img.id)}
                    className="rounded bg-zinc-600 px-2 py-1 text-xs text-white"
                  >
                    Mostrar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-zinc-500">No hay imágenes. Subí algunas arriba.</p>
      )}
    </div>
  );
}
