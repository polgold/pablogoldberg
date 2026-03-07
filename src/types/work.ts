/** Single item on the Work page: from admin project, film, or legacy Vimeo. */
export interface WorkItem {
  slug: string;
  title: string;
  year?: string;
  featuredImage?: string | null;
  href: string;
  external?: boolean;
  /** Source bucket for filters/sorting in Work UI. */
  source?: "vimeo" | "youtube" | "project" | "film";
  /** When set, card opens Vimeo in-page lightbox instead of external link. */
  vimeoId?: string;
  /** When set, card opens YouTube in lightbox. */
  youtubeId?: string;
}
