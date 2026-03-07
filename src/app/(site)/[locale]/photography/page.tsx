import { Suspense } from "react";
import { getGalleriesForPublic } from "@/lib/galleries/public";
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
  const galleries = getGalleriesForPublic("photography");
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
