import Link from "next/link";
import { getProjectsFromJson, getFeaturedWorkProjects, getPhotographyImagesForHome } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
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

// Featured work is content-driven; reflect changes immediately after deploy
export const revalidate = 0;

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

  // Featured Work: JSON + Supabase (proyectos del admin marcados como destacados)
  const [jsonProjects, supabaseFeatured, photographyImages, vimeoVideos] = await Promise.all([
    getProjectsFromJson(loc),
    getFeaturedWorkProjects(6, loc),
    getPhotographyImagesForHome(8, loc),
    heroVimeoEnv ? Promise.resolve([]) : getVimeoPortfolioVideos(),
  ]);
  const fromJson = jsonProjects
    .filter((p) => p.featured)
    .slice(0, 6)
    .map((p) => ({
      project: { slug: p.slug, title: p.title, description: p.description },
      coverUrl: p.coverImagePath
        ? getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)
        : null,
    }));
  const seen = new Set(fromJson.map((x) => x.project.slug));
  const fromSupabase = await Promise.all(
    supabaseFeatured
      .filter((p) => !seen.has(p.slug))
      .slice(0, 6 - fromJson.length)
      .map(async (p) => {
        seen.add(p.slug);
        return {
          project: { slug: p.slug, title: p.title, description: p.excerpt || p.summary || "" },
          coverUrl: await getProjectPosterUrl(p),
        };
      })
  );
  const featuredWithCover = [...fromJson, ...fromSupabase].slice(0, 6);

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
