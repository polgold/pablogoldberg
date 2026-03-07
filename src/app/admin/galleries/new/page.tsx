"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GALLERY_SECTIONS } from "@/lib/galleries/config";
import { galleryCreate } from "../actions";

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "gallery";
}

export default function NewGalleryPage() {
  const router = useRouter();
  const [section, setSection] = useState<string>("photography");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateSlug = (t: string) => {
    setTitle(t);
    setSlug(slugFromTitle(t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const finalSlug = (slug || slugFromTitle(title)).trim() || "gallery";
      const finalTitle = (title || finalSlug).trim();
      const g = await galleryCreate(section, finalSlug, finalTitle);
      router.push(`/admin/galleries/${g.section}/${g.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear galería");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/galleries" className="text-zinc-400 hover:text-white">← Galerías</Link>
      </div>
      <h1 className="text-2xl font-semibold text-white">Nueva galería</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Sección</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {GALLERY_SECTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => updateSlug(e.target.value)}
            placeholder="ej. People"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="people"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <p className="mt-1 text-xs text-zinc-500">Ruta: /{section}/{slug || "…"}</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !(slug || title)}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Creando…" : "Crear galería"}
          </button>
          <Link href="/admin/galleries" className="rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
