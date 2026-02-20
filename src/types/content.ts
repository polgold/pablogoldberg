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
  order?: number;
  featuredImage?: string;
  /** Path del cover en Storage; para construir thumb en cards sin tocar estructura. */
  coverImagePath?: string;
  videoUrls: { vimeo?: string[]; youtube?: string[] };
  primaryVideo?: { type: "vimeo" | "youtube"; id: string };
  galleryImages: string[];
}

export interface Taxonomy {
  categories: Array<{ slug: string; name: string }>;
  tags: Array<{ slug: string; name: string }>;
}
