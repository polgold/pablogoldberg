"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createFilm, updateFilm } from "../admin-actions";

type Film = {
  id: string;
  title: string;
  platform: string;
  video_id: string;
  url: string | null;
  custom_thumbnail: string | null;
  description: string | null;
  published: boolean;
  sort_order: number;
} | null;

type ActionResult = { id?: string; error?: string };

export function FilmForm({
  filmId,
  film,
}: {
  filmId: string | null;
  film: Film;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = filmId
      ? await updateFilm(filmId, formData)
      : await createFilm(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    const createdId = !filmId && "id" in result ? (result as ActionResult).id : undefined;
    if (createdId) router.push(`/admin/films/${createdId}`);
    else router.push("/admin/films");
    router.refresh();
  }

  const videoUrl =
    film?.platform && film?.video_id
      ? film.platform === "vimeo"
        ? `https://vimeo.com/${film.video_id}`
        : `https://www.youtube.com/watch?v=${film.video_id}`
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-zinc-400">
          Título *
        </label>
        <input
          id="title"
          name="title"
          defaultValue={film?.title ?? ""}
          required
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="url" className="mb-1 block text-sm text-zinc-400">
          URL de Vimeo o YouTube *
        </label>
        <input
          id="url"
          name="url"
          type="url"
          defaultValue={film?.url ?? videoUrl}
          placeholder="https://vimeo.com/... o https://youtube.com/watch?v=..."
          required
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="custom_thumbnail" className="mb-1 block text-sm text-zinc-400">
          Thumbnail custom (opcional, si falla Vimeo/YouTube)
        </label>
        <input
          id="custom_thumbnail"
          name="custom_thumbnail"
          type="url"
          defaultValue={film?.custom_thumbnail ?? ""}
          placeholder="https://..."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm text-zinc-400">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={film?.description ?? ""}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="sort_order" className="mb-1 block text-sm text-zinc-400">
          Orden (mayor = más arriba)
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={film?.sort_order ?? 0}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={film?.published ?? false}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="published" className="text-sm text-zinc-400">
          Publicado (visible en el sitio)
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500"
        >
          {film ? "Guardar" : "Crear film"}
        </button>
        <Link
          href="/admin/films"
          className="rounded border border-zinc-600 px-4 py-2 text-zinc-400 hover:border-zinc-500 hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
