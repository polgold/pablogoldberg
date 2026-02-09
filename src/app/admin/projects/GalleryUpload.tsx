"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadGallery } from "@/app/admin/actions";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function isImage(name: string): boolean {
  return IMAGE_EXTS.has(getExt(name));
}

function isVideo(name: string): boolean {
  return VIDEO_EXTS.has(getExt(name));
}

function isMedia(name: string): boolean {
  return isImage(name) || isVideo(name);
}

export function GalleryUpload({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const list = Array.from(e.dataTransfer.files).filter((f) => isMedia(f.name));
    setFiles((prev) => [...prev, ...list]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  async function handleUpload() {
    if (files.length === 0) return;
    setError("");
    setLoading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const result = await uploadGallery(projectId, slug, formData);
    setLoading(false);
    if (result.error) setError(result.error);
    else {
      setFiles([]);
      router.refresh();
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const images = files.filter((f) => isImage(f.name));
  const videos = files.filter((f) => isVideo(f.name));

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="mb-3 text-sm text-zinc-400">
        Arrastra archivos o selecciona. Imágenes → gallery/{slug}/, videos → videos/{slug}/.
      </p>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`mb-4 rounded border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 bg-zinc-900/30"
        }`}
      >
        <p className="text-sm text-zinc-400">Suelta archivos aquí</p>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="mt-2 block w-full text-sm text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-amber-600 file:px-3 file:py-1 file:text-white"
          onChange={(e) => {
            const added = Array.from(e.target.files ?? []).filter((f) => isMedia(f.name));
            setFiles((prev) => [...prev, ...added]);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-sm text-zinc-400">
            {images.length} imagen(es), {videos.length} video(s) — {files.length} archivo(s)
          </p>
          <div className="mb-4 grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {files.map((f, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded bg-zinc-800">
                {isImage(f.name) ? (
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-full w-full object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 rounded bg-red-600/90 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Subiendo…" : `Subir ${files.length} archivo(s)`}
          </button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
