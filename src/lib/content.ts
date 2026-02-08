import {
  convertLexicalToHTML,
  defaultHTMLConverters,
} from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { getPayloadClient } from "./get-payload";
import type { PageItem, ProjectItem } from "@/types/content";

function lexicalToHtml(lexical: unknown): string {
  if (
    !lexical ||
    typeof lexical !== "object" ||
    !("root" in lexical)
  ) {
    return "";
  }
  try {
    return (
      convertLexicalToHTML({
        data: lexical as SerializedEditorState<SerializedLexicalNode>,
        converters: defaultHTMLConverters,
      }) ?? ""
    );
  } catch {
    return "";
  }
}

function mediaUrl(doc: unknown): string | undefined {
  if (!doc || typeof doc !== "object") return undefined;
  const d = doc as { url?: string };
  return d.url;
}

function parseVideoUrl(url: string | null | undefined): { type: "vimeo" | "youtube"; id: string } | undefined {
  if (!url || typeof url !== "string") return undefined;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: "vimeo", id: vimeo[1] };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { type: "youtube", id: yt[1] };
  return undefined;
}

export async function getPages(): Promise<PageItem[]> {
  const payload = await getPayloadClient();
  if (!payload) return [];
  const result = await payload.find({
    collection: "pages",
    depth: 0,
    limit: 100,
    pagination: false,
  });
  const docs = (result.docs ?? []) as Array<Record<string, unknown>>;
  return docs.map((doc) => ({
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    content: lexicalToHtml(doc.content),
    date: "",
    modified: "",
    excerpt: "",
  }));
}

export async function getProjects(): Promise<ProjectItem[]> {
  const payload = await getPayloadClient();
  if (!payload) return [];
  const result = await payload.find({
    collection: "projects",
    depth: 2,
    limit: 500,
    sort: "-year",
    pagination: false,
  });
  const docs = (result.docs ?? []) as Array<Record<string, unknown>>;
  return docs.map((doc) => {
    const cover = doc.cover as Record<string, unknown> | number | null | undefined;
    const gallery = (doc.gallery as Array<{ image?: unknown }> | null) ?? [];
    const coverUrl = typeof cover === "object" && cover ? mediaUrl(cover) : undefined;
    const galleryImages = gallery
      .map((g) => mediaUrl(g.image))
      .filter((u): u is string => Boolean(u));
    const primaryVideo = parseVideoUrl(doc.videoUrl as string | undefined);
    const roles = (doc.roles as string[] | undefined) ?? [];
    return {
      slug: String(doc.slug),
      title: String(doc.title),
      content: lexicalToHtml(doc.description),
      excerpt: lexicalToHtml(doc.description).slice(0, 300),
      date: "",
      modified: "",
      year: doc.year != null ? String(doc.year) : "",
      roles,
      featuredImage: coverUrl,
      videoUrls: { vimeo: undefined, youtube: undefined },
      primaryVideo,
      galleryImages,
    };
  });
}

export async function getPageBySlug(slug: string): Promise<PageItem | undefined> {
  const pages = await getPages();
  return pages.find((p) => p.slug === slug);
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | undefined> {
  const payload = await getPayloadClient();
  if (!payload) return undefined;
  const result = await payload.find({
    collection: "projects",
    depth: 2,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const doc = result.docs?.[0] as Record<string, unknown> | undefined;
  if (!doc) return undefined;
  const cover = doc.cover as Record<string, unknown> | number | null | undefined;
  const gallery = (doc.gallery as Array<{ image?: unknown }> | null) ?? [];
  const coverUrl = typeof cover === "object" && cover ? mediaUrl(cover) : undefined;
  const galleryImages = gallery
    .map((g) => mediaUrl(g.image))
    .filter((u): u is string => Boolean(u));
  const primaryVideo = parseVideoUrl(doc.videoUrl as string | undefined);
  const roles = (doc.roles as string[] | undefined) ?? [];
  return {
    slug: String(doc.slug),
    title: String(doc.title),
    content: lexicalToHtml(doc.description),
    excerpt: lexicalToHtml(doc.description).slice(0, 300),
    date: "",
    modified: "",
    year: doc.year != null ? String(doc.year) : "",
    roles,
    featuredImage: coverUrl,
    videoUrls: { vimeo: undefined, youtube: undefined },
    primaryVideo,
    galleryImages,
  };
}

export async function getFeaturedProjects(limit = 6): Promise<ProjectItem[]> {
  const payload = await getPayloadClient();
  if (!payload) return [];
  const result = await payload.find({
    collection: "projects",
    depth: 2,
    where: { isFeatured: { equals: true } },
    limit: limit || 6,
    sort: "-year",
    pagination: false,
  });
  const docs = (result.docs ?? []) as Array<Record<string, unknown>>;
  return docs.map((doc) => {
    const cover = doc.cover as Record<string, unknown> | number | null | undefined;
    const coverUrl = typeof cover === "object" && cover ? mediaUrl(cover) : undefined;
    const primaryVideo = parseVideoUrl(doc.videoUrl as string | undefined);
    const roles = (doc.roles as string[] | undefined) ?? [];
    return {
      slug: String(doc.slug),
      title: String(doc.title),
      content: lexicalToHtml(doc.description),
      excerpt: "",
      date: "",
      modified: "",
      year: doc.year != null ? String(doc.year) : "",
      roles,
      featuredImage: coverUrl,
      videoUrls: { vimeo: undefined, youtube: undefined },
      primaryVideo,
      galleryImages: [],
    };
  });
}

export async function getProjectSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  if (!payload) return [];
  const result = await payload.find({
    collection: "projects",
    depth: 0,
    limit: 1000,
    pagination: false,
  });
  const docs = (result.docs ?? []) as Array<Record<string, unknown>>;
  return docs.map((d) => String(d.slug ?? ""));
}

export async function getAdjacentProjects(
  slug: string
): Promise<{ prev: ProjectItem | null; next: ProjectItem | null }> {
  const projects = await getProjects();
  const list = projects.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? list[i - 1] ?? null : null,
    next: i < list.length - 1 ? list[i + 1] ?? null : null,
  };
}
