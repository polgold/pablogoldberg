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
  featuredImage?: string;
  videoUrls: { vimeo?: string[]; youtube?: string[] };
  primaryVideo?: { type: "vimeo" | "youtube"; id: string };
  galleryImages: string[];
  credits?: string;
}

export interface Taxonomy {
  categories: Array<{ slug: string; name: string }>;
  tags: Array<{ slug: string; name: string }>;
}
