"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProjectsImageUrl } from "@/lib/supabase/storage";
import {
  createProject,
  updateProject,
  deleteProject,
  uploadProjectCover,
  uploadProjectGalleryFile,
  updateProjectGallery,
  setProjectCover,
  listProjectStorageFiles,
  type GalleryItem,
} from "../actions";
import { VideoEmbed } from "@/components/VideoEmbed";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif"]);

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function isImage(name: string): boolean {
  return IMAGE_EXTS.has(getExt(name));
}

function parseVideoUrl(url: string | null | undefined): { type: "vimeo" | "youtube"; id: string } | null {
  if (!url || typeof url !== "string") return null;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: "vimeo", id: vimeo[1] };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { type: "youtube", id: yt[1] };
  return null;
}

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = {
  project: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    video_url: string | null;
    external_link?: string | null;
    reel_urls?: string[];
    project_links?: ProjectLinkItem[];
    cover_image: string | null;
    gallery: GalleryItem[];
    is_featured?: boolean;
    published?: boolean;
    piece_type?: string | null;
  } | null;
  submitLabel?: string;
};

type ProjectLinkItem = { url: string; label?: string };

export function PortfolioEditor({ project, submitLabel = "Guardar" }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.video_url ?? "");
  const [externalLink, setExternalLink] = useState(project?.external_link ?? "");
  const [reelUrls, setReelUrls] = useState<string[]>(project?.reel_urls ?? []);
  const [projectLinks, setProjectLinks] = useState<ProjectLinkItem[]>(project?.project_links ?? []);
  const [coverImage, setCoverImage] = useState<string | null>(project?.cover_image ?? null);
  const [gallery, setGallery] = useState<GalleryItem[]>(project?.gallery ?? []);
  const [isFeatured, setIsFeatured] = useState(project?.is_featured ?? false);
  const [published, setPublished] = useState(project?.published ?? false);
  const [pieceType, setPieceType] = useState(project?.piece_type ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [storageFiles, setStorageFiles] = useState<{ path: string; url: string }[]>([]);
  const [browseOpen, setBrowseOpen] = useState(false);

  const isNew = !project;

  useEffect(() => {
    if (title && !project) {
      setSlug(slugFromTitle(title));
    }
  }, [title, project]);

  const primaryVideo = parseVideoUrl(videoUrl);

  const onTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      if (isNew) setSlug(slugFromTitle(e.target.value));
    },
    [isNew]
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files).filter((f) => isImage(f.name));
    setGalleryFiles((prev) => [...prev, ...list]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveGalleryItem = (index: number, dir: "up" | "down") => {
    const next = [...gallery];
    const j = dir === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    next.forEach((it, i) => (it.order = i));
    setGallery(next);
  };

  const handleSetCover = (path: string) => {
    setCoverImage(path);
    setCoverFile(null);
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      if (isNew) {
        const formData = new FormData();
        formData.set("title", title);
        formData.set("slug", slug);
        if (description) formData.set("description", description);
        if (videoUrl) formData.set("video_url", videoUrl);
        if (externalLink) formData.set("external_link", externalLink);
        formData.set("reel_urls", JSON.stringify(reelUrls));
        formData.set("project_links", JSON.stringify(projectLinks));
        if (coverFile) formData.set("cover_file", coverFile);
        formData.set("is_featured", isFeatured ? "on" : "off");
        formData.set("published", published ? "on" : "off");
        if (pieceType) formData.set("piece_type", pieceType);
        formData.set("gallery_json", JSON.stringify(gallery));
        galleryFiles.forEach((f) => formData.append("gallery_files", f));

        const result = await createProject(formData);
        if (result.error) throw new Error(result.error);
        if (result.id) router.push(`/admin/projects/${result.id}`);
      } else {
        const formData = new FormData();
        formData.set("title", title);
        formData.set("slug", slug);
        formData.set("description", description || "");
        formData.set("video_url", videoUrl || "");
        formData.set("external_link", externalLink || "");
        formData.set("reel_urls", JSON.stringify(reelUrls));
        formData.set("project_links", JSON.stringify(projectLinks));
        formData.set("cover_image", coverImage || "");
        formData.set("gallery_json", JSON.stringify(gallery));
        formData.set("is_featured", isFeatured ? "on" : "off");
        formData.set("published", published ? "on" : "off");
        if (pieceType) formData.set("piece_type", pieceType);

        const result = await updateProject(project.id, formData);
        if (result.error) throw new Error(result.error);

        if (coverFile) {
          const fd = new FormData();
          fd.set("file", coverFile);
          const coverRes = await uploadProjectCover(project.id, slug, fd);
          if (coverRes.error) throw new Error(coverRes.error);
        }
        for (const file of galleryFiles) {
          const up = await uploadProjectGalleryFile(project.id, slug, file);
          if (up.error) throw new Error(up.error);
        }
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const openBrowse = async () => {
    setBrowseOpen(true);
    const files = await listProjectStorageFiles(slug || slugFromTitle(title));
    setStorageFiles(files);
  };

  const attachFromStorage = (path: string) => {
    const url = getProjectsImageUrl(path);
    const order = gallery.length;
    const item: GalleryItem = { path, url, order };
    setGallery((prev) => [...prev, item]);
    setStorageFiles((prev) => prev.filter((f) => f.path !== path));
  };

  const handleDelete = async () => {
    if (!project?.id) return;
    if (!confirm("¿Eliminar este proyecto? No se puede deshacer.")) return;
    setError("");
    setDeleting(true);
    try {
      const { error: err } = await deleteProject(project.id);
      if (err) throw new Error(err);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-zinc-400">
            Título *
          </label>
          <input
            id="title"
            value={title}
            onChange={onTitleChange}
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
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm text-zinc-400">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="video_url" className="mb-1 block text-sm text-zinc-400">
            Video (YouTube / Vimeo)
          </label>
          <input
            id="video_url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://vimeo.com/... o https://youtube.com/..."
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {primaryVideo && (
            <div className="mt-3 aspect-video max-w-md overflow-hidden rounded bg-black">
              <VideoEmbed type={primaryVideo.type} id={primaryVideo.id} title={title} />
            </div>
          )}
        </div>

        {/* Links y enlaces externos — sección visible */}
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-400/90">
            Links y enlaces externos
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="external_link" className="mb-1 block text-sm text-zinc-400">
                Link principal (web, IMDb, etc.)
              </label>
              <input
                id="external_link"
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://ejemplo.com o https://imdb.com/..."
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="mt-1 text-xs text-zinc-500">Se muestra como &quot;Ver proyecto →&quot; en la página</p>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Reels / Trailers (YouTube o Vimeo)
              </label>
              <p className="mb-2 text-xs text-zinc-500">
                URLs adicionales de YouTube/Vimeo. Se muestran en la página del proyecto.
              </p>
              <div className="space-y-2">
            {reelUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const next = [...reelUrls];
                    next[i] = e.target.value;
                    setReelUrls(next);
                  }}
                  placeholder="https://vimeo.com/... o https://youtube.com/..."
                  className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setReelUrls((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded bg-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-600"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setReelUrls((prev) => [...prev, ""])}
              className="rounded border border-dashed border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400 hover:border-amber-500 hover:text-amber-500"
            >
              + Añadir reel / trailer
            </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Enlaces (web, prensa, redes sociales, etc.)
              </label>
              <p className="mb-2 text-xs text-zinc-500">
                URL + etiqueta opcional (ej. &quot;Web oficial&quot;, &quot;Instagram&quot;, &quot;Prensa&quot;).
              </p>
          <div className="space-y-3">
            {projectLinks.map((link, i) => (
              <div key={i} className="flex flex-wrap gap-2 rounded border border-zinc-700 bg-zinc-900/50 p-2">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => {
                    const next = [...projectLinks];
                    next[i] = { ...next[i], url: e.target.value };
                    setProjectLinks(next);
                  }}
                  placeholder="https://..."
                  className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={link.label ?? ""}
                  onChange={(e) => {
                    const next = [...projectLinks];
                    next[i] = { ...next[i], label: e.target.value.trim() || undefined };
                    setProjectLinks(next);
                  }}
                  placeholder="Etiqueta (opcional)"
                  className="w-36 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setProjectLinks((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded bg-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-600"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setProjectLinks((prev) => [...prev, { url: "" }])}
              className="rounded border border-dashed border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400 hover:border-amber-500 hover:text-amber-500"
            >
              + Añadir enlace
            </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-zinc-400">Destacado (Featured Work)</span>
          </label>
          {!isNew && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-zinc-400">Publicado (visible en sitio)</span>
            </label>
          )}
        </div>
        <div>
          <label htmlFor="piece_type" className="mb-1 block text-sm text-zinc-400">
            Tipo (work/project/video o photo/photography/fotografia/gallery)
          </label>
          <input
            id="piece_type"
            value={pieceType}
            onChange={(e) => setPieceType(e.target.value)}
            placeholder="work, video, photo, etc."
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">Portada</label>
          {coverImage ? (
            <div className="flex flex-wrap items-start gap-4">
              <img
                src={getProjectsImageUrl(coverImage?.includes("/") ? coverImage : `${project?.slug ?? ""}/${coverImage}`)}
                alt="Cover"
                className="max-h-40 rounded object-cover"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="rounded bg-zinc-700 px-3 py-1 text-sm text-white hover:bg-zinc-600"
                >
                  Quitar
                </button>
              </div>
            </div>
          ) : null}
          <label className="mt-2 block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-amber-600 file:px-3 file:py-1 file:text-white"
            />
          </label>
          {coverFile && (
            <p className="mt-1 text-xs text-zinc-500">
              Subir: {coverFile.name} — se guardará al guardar el proyecto
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">Galería</label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="rounded border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center transition-colors hover:border-zinc-600"
          >
            <p className="mb-2 text-sm text-zinc-500">Arrastra imágenes o selecciona</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const added = Array.from(e.target.files ?? []).filter((f) => isImage(f.name));
                setGalleryFiles((prev) => [...prev, ...added]);
                e.target.value = "";
              }}
              className="block w-full text-sm text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-amber-600 file:px-3 file:py-1 file:text-white"
            />
          </div>
          {slug && (
            <button
              type="button"
              onClick={openBrowse}
              className="mt-2 rounded bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600"
            >
              Adjuntar desde Storage
            </button>
          )}
          {browseOpen && storageFiles.length > 0 && (
            <div className="mt-4 rounded border border-zinc-700 bg-zinc-900/50 p-4">
              <p className="mb-2 text-sm text-zinc-400">Archivos en {slug}/large y {slug}/thumb</p>
              <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
                {storageFiles.map((f) => (
                  <button
                    key={f.path}
                    type="button"
                    onClick={() => attachFromStorage(f.path)}
                    className="relative aspect-square overflow-hidden rounded bg-zinc-800 hover:ring-2 hover:ring-amber-500"
                  >
                    <img src={f.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBrowseOpen(false)}
                className="mt-2 text-sm text-zinc-500 hover:text-white"
              >
                Cerrar
              </button>
            </div>
          )}
          {(gallery.length > 0 || galleryFiles.length > 0) && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-zinc-400">
                {gallery.length} en galería
                {galleryFiles.length ? ` · ${galleryFiles.length} por subir al guardar` : ""}
              </p>
              <p className="text-xs text-zinc-500">
                {gallery.length === 0 && galleryFiles.length > 0
                  ? "Guardá el proyecto para subir las fotos. Si son muchas, subí en dos veces."
                  : "Las de la galería ya están guardadas. Las \"por subir\" se suben al hacer clic en Guardar."}
              </p>
              <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
                {gallery.map((item, i) => (
                  <div
                    key={item.path}
                    className="group relative aspect-square overflow-hidden rounded bg-zinc-800"
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveGalleryItem(i, "up")}
                          disabled={i === 0}
                          className="rounded bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryItem(i, "down")}
                          disabled={i === gallery.length - 1}
                          className="rounded bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCover(item.path)}
                          className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500"
                        >
                          Portada
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGallery((prev) => prev.filter((_, j) => j !== i))}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                      >
                        Quitar de galería
                      </button>
                    </div>
                  </div>
                ))}
                {galleryFiles.map((f, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded bg-zinc-800">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-full w-full object-cover"
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(i)}
                      className="absolute right-1 top-1 rounded bg-red-600/90 px-1.5 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 lg:items-end">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !title.trim() || !slug.trim()}
            className="rounded bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Guardando…" : submitLabel}
          </button>
          {project && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded bg-red-900/80 px-4 py-3 font-medium text-red-200 hover:bg-red-800 disabled:opacity-50"
            >
              {deleting ? "Eliminando…" : "Eliminar proyecto"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
