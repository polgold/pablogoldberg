"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadGalleryFile } from "@/app/admin/actions";

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

/** Extrae archivos de un DataTransfer, incluyendo carpetas (webkitGetAsEntry). */
async function getFilesFromDrop(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];
  const items = Array.from(dataTransfer.items);

  async function processEntry(entry: FileSystemEntry | null): Promise<void> {
    if (!entry) return;
    if (entry.isFile) {
      const file = await new Promise<File>((res, rej) =>
        (entry as FileSystemFileEntry).file(res, rej)
      );
      if (isMedia(file.name)) files.push(file);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      let batch: FileSystemEntry[] = [];
      do {
        batch = await new Promise((res, rej) => reader.readEntries(res, rej));
        for (const e of batch) await processEntry(e);
      } while (batch.length > 0);
    }
  }

  for (const item of items) {
    const entry = (item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.() ?? null;
    if (entry) {
      await processEntry(entry);
    } else {
      const file = item.getAsFile();
      if (file && isMedia(file.name)) files.push(file);
    }
  }

  return files;
}

export function BulkLoader({
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
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = await getFilesFromDrop(e.dataTransfer);
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    setProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });
      const result = await uploadGalleryFile(projectId, slug, files[i]);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        setProgress(null);
        return;
      }
    }

    setFiles([]);
    setLoading(false);
    setProgress(null);
    router.refresh();
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const images = files.filter((f) => isImage(f.name));
  const videos = files.filter((f) => isVideo(f.name));

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="mb-3 text-sm text-zinc-400">
        Arrastra carpetas o archivos aquí. Imágenes → gallery/{slug}/, videos → videos/{slug}/.
        Soporta drag & drop de carpetas completas.
      </p>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`mb-4 rounded border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 bg-zinc-900/30"
        }`}
      >
        <p className="text-sm text-zinc-400">
          Suelta carpetas o archivos aquí
        </p>
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

      {progress && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm text-zinc-400">
            <span>Subiendo…</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-zinc-800">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && !loading && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-zinc-400">
            {images.length} imagen(es), {videos.length} video(s) — {files.length} archivo(s) en total
          </p>
          <div className="mb-4 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
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
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
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
                <span className="absolute bottom-0 left-0 right-0 truncate bg-black/70 px-1 py-0.5 text-xs text-zinc-300">
                  {f.name}
                </span>
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
      )}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
