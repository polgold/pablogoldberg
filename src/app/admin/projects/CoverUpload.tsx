"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadCover } from "@/app/admin/actions";
import { getPublicImageUrl } from "@/lib/supabase/storage";

export function CoverUpload({
  projectId,
  slug,
  currentPath,
}: {
  projectId: string;
  slug: string;
  currentPath: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadCover(projectId, slug, formData);
    setLoading(false);
    if (result.error) setError(result.error);
    else {
      setFile(null);
      router.refresh();
    }
  }

  const previewUrl = currentPath ? getPublicImageUrl(currentPath) : null;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-4">
      {previewUrl ? (
        <div className="mb-4">
          <img
            src={previewUrl}
            alt="Cover"
            className="max-h-48 rounded object-cover"
          />
          <p className="mt-1 text-xs text-zinc-500">{currentPath}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Subir 1 imagen</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-amber-600 file:px-3 file:py-1 file:text-white"
          />
        </label>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          {loading ? "Subiendo…" : "Subir"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
