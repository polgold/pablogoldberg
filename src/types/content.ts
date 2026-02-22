export interface PageItem {
  slug: string;
  title: string;
  content: string;
  date: string;
  modified: string;
  excerpt: string;
}

export interface ProjectItem {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  year: string;
  roles: string[];
  client?: string;
  pieceType?: string;
  duration?: string;
  summary?: string;
  credits?: string;
  externalLink?: string;
  /** Enlaces externos (web de la película, prensa, etc.) con etiqueta opcional. */
  projectLinks?: { url: string; label?: string }[];
  order?: number;
  isFeatured?: boolean;
  featuredImage?: string;
  /** Path del cover en Storage; para construir thumb en cards sin tocar estructura. */
  coverImagePath?: string;
  videoUrls: { vimeo?: string[]; youtube?: string[] };
  primaryVideo?: { type: "vimeo" | "youtube"; id: string };
  /** Reels o trailers (YouTube/Vimeo) para mostrar en la página del proyecto. */
  reelVideos?: { type: "vimeo" | "youtube"; id: string }[];
  /** Paths en Storage (bucket projects), ej. slug/thumbs/foto.jpg. Se sirven por /api/proxy-image?path=... */
  galleryImages: string[];
}

export interface Taxonomy {
  categories: Array<{ slug: string; name: string }>;
  tags: Array<{ slug: string; name: string }>;
}

/** Modelo fijo para Projects/Featured Work (loader JSON; luego migrable a admin/Supabase). */
export interface Project {
  slug: string;
  title: string;
  description: string;
  /** Path en bucket (original), ej. bestefar/cover.jpg */
  coverImagePath: string;
  /** URL YouTube o Vimeo (trailer/teaser o full) */
  videoUrl?: string;
  /** Link a web del proyecto */
  websiteUrl?: string;
  /** RRSS: Instagram, etc. */
  socials?: { label: string; url: string }[];
  /** Carpeta en Storage para backstage, ej. "bestefar" */
  storageFolder: string;
  featured?: boolean;
}
