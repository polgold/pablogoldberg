"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { PhotosGridWithLightbox } from "@/components/PhotosGridWithLightbox";
import { getThumbUrl, getLargeUrl } from "@/lib/storageImages";
import { PHOTOS_BUCKET } from "@/lib/portfolio-photos";
import type { Locale } from "@/lib/content";
import type { GalleryWithPhotos } from "@/lib/portfolio-photos";

const QUERY_KEY = "g";

export interface GalleryFilterClientProps {
  galleries: GalleryWithPhotos[];
  locale: Locale;
  title: string;
  subtitle?: string;
  allLabel: string;
}

export function GalleryFilterClient({
  galleries,
  locale,
  title,
  subtitle,
  allLabel,
}: GalleryFilterClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSlug = useMemo(() => {
    const g = searchParams.get(QUERY_KEY);
    if (!g || g === "all") return "all";
    const exists = galleries.some((gal) => gal.slug === g);
    return exists ? g : "all";
  }, [searchParams, galleries]);

  const setFilter = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug === "all") {
        params.delete(QUERY_KEY);
      } else {
        params.set(QUERY_KEY, slug);
      }
      const q = params.toString();
      const url = q ? `${pathname}?${q}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const photosToShow = useMemo(() => {
    if (currentSlug === "all") {
      return galleries.flatMap((g) => g.photos);
    }
    const gallery = galleries.find((g) => g.slug === currentSlug);
    return gallery?.photos ?? [];
  }, [currentSlug, galleries]);

  const hasAnyPhotos = galleries.some((g) => g.photos.length > 0);
  const tabs = useMemo(
    () => [{ slug: "all", title: allLabel }, ...galleries.filter((g) => g.photos.length > 0).map((g) => ({ slug: g.slug, title: g.title }))],
    [allLabel, galleries]
  );

  if (!hasAnyPhotos) {
    return (
      <div className="min-h-screen border-t border-white/5 bg-black pt-14">
        <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
          <h1 className="text-xl font-semibold text-white md:text-2xl">{title}</h1>
          <p className="mt-6 text-sm text-white/40">
            {locale === "es"
              ? "Sin imágenes visibles. En el admin /admin/portfolio-photos elegí una galería y subí fotos."
              : "No visible photos. In admin /admin/portfolio-photos choose a gallery and upload photos."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}

        <div className="mt-6 md:mt-8">
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 md:flex-wrap md:overflow-visible"
            role="tablist"
            aria-label={locale === "es" ? "Filtrar por galería" : "Filter by gallery"}
          >
            {tabs.map((tab) => {
              const isActive = (tab.slug === "all" && currentSlug === "all") || tab.slug === currentSlug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setFilter(tab.slug)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black ${
                    isActive
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <PhotosGridWithLightbox
              items={photosToShow.map((p) => ({
                thumbUrl: getThumbUrl(PHOTOS_BUCKET, p.storage_path),
                largeUrl: getLargeUrl(PHOTOS_BUCKET, p.storage_path),
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
