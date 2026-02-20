import { Suspense } from "react";
import { getPublicGalleriesWithPhotos } from "@/lib/portfolio-photos";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { GalleryFilterClient } from "./GalleryFilterClient";

export const revalidate = 300;

export default async function GalleryPage({
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
        title={t.title}
        subtitle={t.subtitle}
        allLabel={t.all}
      />
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const t = COPY[loc].gallery;
  return {
    title: t.title,
  };
}
