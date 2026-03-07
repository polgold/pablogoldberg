import { Suspense } from "react";
import { scanPhotographyGalleries } from "@/lib/work-galleries";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls, getCanonicalUrl } from "@/lib/site";
import { GalleryFilterClient } from "./PhotographyFilterClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const urls = getHreflangUrls("/photography");
  const loc = getLocaleFromParam(locale);
  const description =
    loc === "es"
      ? "Fotografías seleccionadas. Retratos, producto, publicidad, documental. Pablo Goldberg."
      : "Selected photographs. Portraits, product, advertising, documentary. Pablo Goldberg.";
  const pageUrl = getCanonicalUrl(`/${locale}/photography`);
  return {
    title: COPY[loc].metadata.photography,
    description,
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
    openGraph: {
      title: COPY[loc].metadata.photography,
      description,
      url: pageUrl,
      siteName: "Pablo Goldberg",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: COPY[loc].metadata.photography,
      description,
    },
  };
}

export default async function PhotographyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const workGalleries = scanPhotographyGalleries();
  const galleries = workGalleries.map((g, i) => ({
    id: g.slug,
    title: g.title,
    slug: g.slug,
    sort_order: i,
    photos: g.photos.map((p) => ({
      thumbUrl: p.thumbUrl,
      largeUrl: p.largeUrl,
      fallbackThumbUrl: p.thumbUrl,
      fallbackLargeUrl: p.largeUrl,
    })),
  }));
  const t = COPY[loc].gallery;

  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-14" />}>
      <GalleryFilterClient
        galleries={galleries}
        locale={loc}
        title={t.title}
        subtitle={t.subtitle}
        allLabel={t.all}
      />
    </Suspense>
  );
}
