/** Single item on the Work page: from DB project or Vimeo (external). */
export interface WorkItem {
  slug: string;
  title: string;
  year?: string;
  featuredImage?: string | null;
  href: string;
  external?: boolean;
  /** When set, card opens Vimeo in-page lightbox instead of external link. */
  vimeoId?: string;
}
