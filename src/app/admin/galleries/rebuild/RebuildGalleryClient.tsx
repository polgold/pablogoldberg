"use client";

import { useCallback, useState } from "react";
import {
  rebuildProcessGallery,
  rebuildClearCategory,
  rebuildSanitizeCategory,
} from "./actions";
import type { ProcessWorkPhotographyResult } from "@/lib/work-photography-rebuild";

const IMAGE_EXT = /\.(jpe?g|png|webp|tiff?|avif|gif)$/i;

type Status = "idle" | "uploading" | "success" | "error" | "clearing";

export function RebuildGalleryClient({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const [categoryInput, setCategoryInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [rebuild, setRebuild] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessWorkPhotographyResult | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const sanitizedCategory = categoryInput.trim()
    ? categoryInput
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "gallery"
    : "";

  const addFiles = useCallback((newFiles: FileList | File[] | null) => {
    if (!newFiles?.length) return;
    const list = Array.from(newFiles).filter((f) => IMAGE_EXT.test(f.name) && !/^\./.test(f.name));
    setFiles((prev) => {
      const byName = new Map(prev.map((f) => [f.name, f]));
      list.forEach((f) => byName.set(f.name, f));
      return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list) addFiles(list);
    e.target.value = "";
  }, [addFiles]);

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const handleProcess = async () => {
    if (!sanitizedCategory) {
      setStatus("error");
      setMessage("Escribí o elegí una categoría.");
      return;
    }
    if (files.length === 0) {
      setStatus("error");
      setMessage("Agregá al menos una imagen.");
      return;
    }

    setStatus("uploading");
    setMessage(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("category", categoryInput.trim());
      formData.set("rebuild", rebuild ? "true" : "false");
      files.forEach((f) => formData.append("files", f));

      const res = await rebuildProcessGallery(formData);
      setResult(res);
      if (res.errors.length > 0 && res.processed === 0) {
        setStatus("error");
        setMessage(res.errors.join(". ") || "Error al procesar.");
      } else if (res.failed > 0) {
        setStatus("error");
        setMessage(`${res.processed} procesadas, ${res.failed} fallidas. ${res.errors.join(". ")}`);
      } else {
        setStatus("success");
        setMessage(`${res.processed} imagen${res.processed !== 1 ? "es" : ""} procesada${res.processed !== 1 ? "s" : ""}. Nombres: ${res.generatedNames.slice(0, 5).join(", ")}${res.generatedNames.length > 5 ? "…" : ""}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al procesar la galería.");
    }
  };

  const handleProcessWithRebuild = async () => {
    if (!sanitizedCategory) {
      setStatus("error");
      setMessage("Escribí o elegí una categoría.");
      return;
    }
    if (!clearConfirm) {
      setStatus("error");
      setMessage("Marcá la casilla para confirmar que querés vaciar thumb y large antes de regenerar.");
      return;
    }
    if (files.length === 0) {
      setStatus("error");
      setMessage("Agregá al menos una imagen.");
      return;
    }

    setStatus("uploading");
    setMessage(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("category", categoryInput.trim());
      formData.set("rebuild", "true");
      files.forEach((f) => formData.append("files", f));

      const res = await rebuildProcessGallery(formData);
      setResult(res);
      setClearConfirm(false);
      if (res.errors.length > 0 && res.processed === 0) {
        setStatus("error");
        setMessage(res.errors.join(". ") || "Error al procesar.");
      } else if (res.failed > 0) {
        setStatus("error");
        setMessage(`${res.processed} procesadas, ${res.failed} fallidas. ${res.errors.join(". ")}`);
      } else {
        setStatus("success");
        setMessage(`${res.processed} imagen${res.processed !== 1 ? "es" : ""} procesada${res.processed !== 1 ? "s" : ""} (categoría vaciada y regenerada).`);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al procesar la galería.");
    }
  };

  const handleClearOnly = async () => {
    if (!sanitizedCategory) {
      setStatus("error");
      setMessage("Escribí o elegí una categoría.");
      return;
    }
    if (!clearConfirm) {
      setStatus("error");
      setMessage("Marcá la casilla para confirmar el borrado.");
      return;
    }
    setStatus("clearing");
    setMessage(null);
    try {
      const res = await rebuildClearCategory(categoryInput.trim());
      setStatus("success");
      setMessage(`Se eliminaron ${res.removed} archivo${res.removed !== 1 ? "s" : ""} de thumb y large.`);
      if (res.errors.length) setMessage((m) => `${m} Errores: ${res.errors.join(", ")}`);
      setClearConfirm(false);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al vaciar.");
    }
  };

  return (
    <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Categoría
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            placeholder="ej. beasts o Fashion Week"
            className="min-w-[200px] rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {existingCategories.length > 0 && (
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Elegir existente…</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
        {sanitizedCategory && (
          <p className="mt-1 text-xs text-zinc-500">
            Slug: <strong>{sanitizedCategory}</strong> →{" "}
            public/uploads/work/photography/{sanitizedCategory}/thumb|large
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Imágenes (arrastrá una carpeta o varios archivos)
        </label>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-900/80 p-6 transition hover:border-zinc-500"
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,.avif,.gif"
            multiple
            onChange={onInputChange}
            className="sr-only"
            id="rebuild-file-input"
          />
          <label
            htmlFor="rebuild-file-input"
            className="cursor-pointer text-center text-sm text-zinc-400 hover:text-white"
          >
            Arrastrá archivos aquí o hacé clic para elegir
          </label>
          <p className="mt-1 text-xs text-zinc-500">
            JPG, PNG, WebP, TIFF, AVIF, GIF. Se convierten a JPG y se ordenan por nombre.
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-zinc-400">
            {files.length} archivo{files.length !== 1 ? "s" : ""} (orden alfabético)
          </p>
          <ul className="max-h-40 overflow-y-auto rounded border border-zinc-700 bg-zinc-900 p-2 text-sm">
            {files.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-2 py-1">
                <span className="truncate text-zinc-300">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(f.name)}
                  className="shrink-0 text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={rebuild}
            onChange={(e) => setRebuild(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-zinc-300">Vaciar thumb/large y regenerar</span>
        </label>
        {rebuild && (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={clearConfirm}
              onChange={(e) => setClearConfirm(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-amber-200/90">Confirmo que quiero borrar y regenerar</span>
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={rebuild ? handleProcessWithRebuild : handleProcess}
          disabled={status === "uploading" || !sanitizedCategory || files.length === 0}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {status === "uploading" ? "Procesando…" : "Procesar galería"}
        </button>
        {rebuild && clearConfirm && (
          <button
            type="button"
            onClick={handleClearOnly}
            disabled={status === "clearing"}
            className="rounded border border-red-600/60 bg-red-900/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900/50 disabled:opacity-50"
          >
            {status === "clearing" ? "Vacianto…" : "Solo vaciar (sin subir)"}
          </button>
        )}
      </div>

      {status !== "idle" && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            status === "success"
              ? "border-emerald-800/60 bg-emerald-900/20 text-emerald-200"
              : status === "error"
                ? "border-red-800/60 bg-red-900/20 text-red-200"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-300"
          }`}
        >
          {message}
          {result && (result.processed > 0 || result.generatedNames.length > 0) && (
            <details className="mt-2">
              <summary className="cursor-pointer text-zinc-400">Ver nombres generados</summary>
              <pre className="mt-1 overflow-x-auto text-xs text-zinc-500">
                {result.generatedNames.join("\n")}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
