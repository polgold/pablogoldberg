import Link from "next/link";
import { getProjectsFromJson, getPhotographyImagesForHome } from "@/lib/content";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toLargePathOrOriginal } from "@/lib/imageVariantPath";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeReel } from "@/components/HomeReel";
import { HomeAbout } from "@/components/HomeAbout";
import { HomePhotographyGrid } from "@/components/HomePhotographyGrid";
import { FeaturedWork } from "@/components/projects/FeaturedWork";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const urls = getHreflangUrls("");
  return {
    alternates: {
      canonical: urls[getLocaleFromParam(locale) as "es" | "en"],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const heroVimeoEnv = process.env.HERO_VIMEO_ID?.trim();

  // Featured Work: loader único JSON, determinístico, máx 6
  const allProjects = await getProjectsFromJson(loc);
  const featuredProjects = allProjects.filter((p) => p.featured).slice(0, 6);
  const featuredWithCover = featuredProjects.map((p) => ({
    project: p,
    coverUrl: p.coverImagePath
      ? getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)
      : null,
  }));

  const [photographyImages, vimeoVideos] = await Promise.all([
    getPhotographyImagesForHome(8, loc),
    heroVimeoEnv ? Promise.resolve([]) : getVimeoPortfolioVideos(),
  ]);

  const heroVimeoId = heroVimeoEnv || (vimeoVideos[0]?.id ?? "");
  const t = COPY[loc].home;

  return (
    <div className="min-h-screen bg-black">
      {/* SECTION 1 — HERO */}
      <HomeHero
        locale={locale}
        h1={t.heroH1}
        sub={t.heroSub}
        ctaPrimary={t.ctaPrimary}
        ctaSecondary={t.ctaSecondary}
      />

      {/* SECTION 2 — REEL */}
      <HomeReel vimeoId={heroVimeoId} title={t.reel} />

      {/* SECTION 3 — FEATURED WORK (loader JSON, determinístico) */}
      <FeaturedWork
        projects={featuredWithCover}
        locale={locale}
        title={t.featured}
        viewAllLabel={t.viewAll}
      />

      {/* SECTION 4 — PHOTOGRAPHY */}
      <HomePhotographyGrid
        photos={photographyImages}
        locale={locale}
        title={t.photography}
        viewAllLabel={t.viewAll}
      />

      {/* SECTION 5 — ABOUT */}
      <HomeAbout locale={locale} aboutText={t.aboutText} />

      {/* SECTION 6 — CTA */}
      <section className="border-b border-white/5 bg-black px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-2xl font-light tracking-tight text-white md:text-3xl">
            {t.ctaCollaborate}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="mt-6 inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-black"
          >
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
