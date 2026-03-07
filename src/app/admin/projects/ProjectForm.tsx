"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminProject, updateAdminProject } from "../admin-actions";

type Project = {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  description_es: string | null;
  description_en: string | null;
  hero_video_id: string | null;
  hero_video_platform: string | null;
  website: string | null;
  instagram: string | null;
  published: boolean;
  sort_order: number;
  cover_image_path: string | null;
} | null;

type ActionResult = { id?: string; error?: string };

export function ProjectForm({
  projectId,
  project,
}: {
  projectId: string | null;
  project: Project;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = projectId
      ? await updateAdminProject(projectId, formData)
      : await createAdminProject(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    const createdId = !projectId && "id" in result ? (result as ActionResult).id : undefined;
    if (createdId) {
      router.push(`/admin/projects/${createdId}`);
      return;
    }
    router.refresh();
  }

  const heroUrl =
    project?.hero_video_platform && project?.hero_video_id
      ? project.hero_video_platform === "vimeo"
        ? `https://vimeo.com/${project.hero_video_id}`
        : `https://www.youtube.com/watch?v=${project.hero_video_id}`
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="title_es" className="mb-1 block text-sm text-zinc-400">
            Título (ES) *
          </label>
          <input
            id="title_es"
            name="title_es"
            defaultValue={project?.title_es ?? ""}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="title_en" className="mb-1 block text-sm text-zinc-400">
            Título (EN)
          </label>
          <input
            id="title_en"
            name="title_en"
            defaultValue={project?.title_en ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
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

      <div>
        <label htmlFor="description_es" className="mb-1 block text-sm text-zinc-400">
          Descripción (ES)
        </label>
        <textarea
          id="description_es"
          name="description_es"
          rows={4}
          defaultValue={project?.description_es ?? ""}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="description_en" className="mb-1 block text-sm text-zinc-400">
          Descripción (EN)
        </label>
        <textarea
          id="description_en"
          name="description_en"
          rows={4}
          defaultValue={project?.description_en ?? ""}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="hero_video_url" className="mb-1 block text-sm text-zinc-400">
          Video hero (Vimeo/YouTube URL)
        </label>
        <input
          id="hero_video_url"
          name="hero_video_url"
          type="url"
          defaultValue={heroUrl}
          placeholder="https://vimeo.com/..."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="website" className="mb-1 block text-sm text-zinc-400">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={project?.website ?? ""}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="instagram" className="mb-1 block text-sm text-zinc-400">
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            type="url"
            defaultValue={project?.instagram ?? ""}
            placeholder="https://instagram.com/..."
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="sort_order" className="mb-1 block text-sm text-zinc-400">
          Orden (mayor = más arriba)
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={project?.sort_order ?? 0}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {projectId && (
        <div>
          <label htmlFor="cover_file" className="mb-1 block text-sm text-zinc-400">
            Portada (imagen)
          </label>
          <input
            id="cover_file"
            name="cover_file"
            type="file"
            accept="image/*"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white file:mr-2 file:rounded file:border-0 file:bg-amber-600 file:px-3 file:py-1 file:text-white"
          />
          {project?.cover_image_path && (
            <p className="mt-1 text-xs text-zinc-500">Portada actual: subí otra para reemplazar</p>
          )}
          {!project?.cover_image_path && (
            <p className="mt-1 text-xs text-zinc-500">Opcional. También podés elegir una imagen de la galería como portada.</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={project?.published ?? false}
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
          {project ? "Guardar" : "Crear proyecto"}
        </button>
        <Link
          href="/admin"
          className="rounded border border-zinc-600 px-4 py-2 text-zinc-400 hover:border-zinc-500 hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
