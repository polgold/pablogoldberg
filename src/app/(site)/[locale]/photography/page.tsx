import { Suspense } from "react";
import { getPublicGalleriesWithPhotos } from "@/lib/portfolio-photos";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { GalleryFilterClient } from "./PhotographyFilterClient";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const urls = getHreflangUrls("/photography");
  const loc = getLocaleFromParam(locale);
  return {
    title: "Photography",
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
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
  const galleries = await getPublicGalleriesWithPhotos();
  const t = COPY[loc].gallery;

  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-14" />}>
      <GalleryFilterClient
        galleries={galleries}
        locale={loc}
        title="Photography"
        subtitle={t.subtitle}
        allLabel={t.all}
      />
    </Suspense>
  );
}
