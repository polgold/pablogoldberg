import Link from "next/link";
import Image from "next/image";
import { getFeaturedWorkProjects, getPhotographyImagesForHome } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
import type { ProjectItem } from "@/types/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeReel } from "@/components/HomeReel";
import { HomeAbout } from "@/components/HomeAbout";
import { HomePhotographyGrid } from "@/components/HomePhotographyGrid";

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

  const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === "true";
  const [featuredWorkProjects, photographyImages, vimeoVideos] = await Promise.all([
    safeMode ? (await import("@/lib/content")).getFeaturedVideoProjects(4, loc) : getFeaturedWorkProjects(4, loc),
    getPhotographyImagesForHome(8, loc),
    heroVimeoEnv ? Promise.resolve([]) : getVimeoPortfolioVideos(),
  ]);

  const featuredWithPosters = await Promise.all(
    featuredWorkProjects.map(async (project) => ({
      project,
      posterUrl: await getProjectPosterUrl(project),
    }))
  );

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

      {/* SECTION 3 — FEATURED WORK */}
      <section
        className="border-b border-white/5 bg-black px-4 py-14 sm:px-6 md:px-8"
        aria-labelledby="featured-work-heading"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2
              id="featured-work-heading"
              className="text-xl font-semibold text-white md:text-2xl"
            >
              {t.featured}
            </h2>
            <Link
              href={`/${locale}/work`}
              className="text-sm font-medium text-white/80 underline decoration-brand/50 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              {t.viewAll}
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
            {featuredWithPosters.map(({ project, posterUrl }: { project: ProjectItem; posterUrl: string | null }) => {
              const shortDesc =
                project.summary?.trim() ||
                project.excerpt?.trim() ||
                "";
              return (
                <li key={project.slug} className="group bg-black">
                  <Link
                    href={`/${locale}/work/${project.slug}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-black focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-inset"
                  >
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt=""
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
                        {project.title}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                      <span className="text-sm font-medium text-white">
                        {project.title}
                      </span>
                      {shortDesc && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/70">
                          {shortDesc}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-white/70">
                        {project.roles?.[0] && <span>{project.roles[0]}</span>}
                        {project.year && <span>{project.year}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

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
