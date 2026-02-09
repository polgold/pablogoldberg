"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  summary: string | null;
  description: string | null;
  credits: string | null;
  year: number | null;
  order: number | null;
  client: string | null;
  piece_type: string | null;
  duration: string | null;
  video_url: string | null;
  external_link: string | null;
  cover_image_path: string | null;
  gallery_image_paths: string[] | null;
  gallery_video_paths: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  published: boolean;
} | null;

type SubmitFn = (formData: FormData) => Promise<void>;

export function ProjectForm({
  submit,
  project,
}: {
  submit: SubmitFn;
  project: Project;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await submit(formData);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-zinc-400">
            Título *
          </label>
          <input
            id="title"
            name="title"
            defaultValue={project?.title ?? ""}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm text-zinc-400">
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={project?.slug ?? ""}
            placeholder="mi-proyecto"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="locale" className="mb-1 block text-sm text-zinc-400">
            Locale
          </label>
          <select
            id="locale"
            name="locale"
            defaultValue={project?.locale ?? "es"}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="es">es</option>
            <option value="en">en</option>
          </select>
        </div>
        <div>
          <label htmlFor="year" className="mb-1 block text-sm text-zinc-400">
            Año
          </label>
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={project?.year ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="summary" className="mb-1 block text-sm text-zinc-400">
          Resumen
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={project?.summary ?? ""}
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
          rows={4}
          defaultValue={project?.description ?? ""}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="credits" className="mb-1 block text-sm text-zinc-400">
          Créditos
        </label>
        <textarea
          id="credits"
          name="credits"
          rows={2}
          defaultValue={project?.credits ?? ""}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="client" className="mb-1 block text-sm text-zinc-400">
            Cliente
          </label>
          <input
            id="client"
            name="client"
            defaultValue={project?.client ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="piece_type" className="mb-1 block text-sm text-zinc-400">
            Tipo
          </label>
          <input
            id="piece_type"
            name="piece_type"
            defaultValue={project?.piece_type ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className="mb-1 block text-sm text-zinc-400">
            Duración
          </label>
          <input
            id="duration"
            name="duration"
            defaultValue={project?.duration ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="order" className="mb-1 block text-sm text-zinc-400">
            Orden
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={project?.order ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="video_url" className="mb-1 block text-sm text-zinc-400">
          Video URL (Vimeo/YouTube)
        </label>
        <input
          id="video_url"
          name="video_url"
          type="url"
          defaultValue={project?.video_url ?? ""}
          placeholder="https://vimeo.com/..."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="external_link" className="mb-1 block text-sm text-zinc-400">
          Enlace externo
        </label>
        <input
          id="external_link"
          name="external_link"
          type="url"
          defaultValue={project?.external_link ?? ""}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="tags" className="mb-1 block text-sm text-zinc-400">
          Tags (separados por coma)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={project?.tags?.join(", ") ?? ""}
          placeholder="comercial, música, ficción"
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            defaultChecked={project?.is_featured ?? false}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="is_featured" className="text-sm text-zinc-400">
            Destacado
          </label>
        </div>
        {project && (
          <div className="flex items-center gap-2">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={project?.published ?? false}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="published" className="text-sm text-zinc-400">
              Publicado (visible en el sitio)
            </label>
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          className="rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500"
        >
          {project ? "Guardar" : "Crear proyecto"}
        </button>
      </div>
    </form>
  );
}
