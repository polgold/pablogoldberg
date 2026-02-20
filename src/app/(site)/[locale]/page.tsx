import Link from "next/link";
import Image from "next/image";
import { getFeaturedProjects, getProjects } from "@/lib/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { HeroReel } from "@/components/HeroReel";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { HomeAbout } from "@/components/HomeAbout";
import { ScrollReveal } from "@/components/ScrollReveal";

const FEATURED_WORK_COUNT = 6;

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

  // Evitar llamada a API de Vimeo si ya tenemos el ID en env (mejora TTFB)
  const [featuredForSection, allProjects, vimeoVideos] = await Promise.all([
    getFeaturedProjects(FEATURED_WORK_COUNT, loc),
    getProjects(loc),
    heroVimeoEnv ? Promise.resolve([]) : getVimeoPortfolioVideos(),
  ]);
  const featuredWork =
    featuredForSection.length >= FEATURED_WORK_COUNT
      ? featuredForSection.slice(0, FEATURED_WORK_COUNT)
      : [
          ...featuredForSection,
          ...allProjects.filter((p) => !featuredForSection.find((f) => f.slug === p.slug)),
        ].slice(0, FEATURED_WORK_COUNT);

  const heroVimeoId = heroVimeoEnv || (vimeoVideos[0]?.id ?? "");
  const heroPoster =
    featuredWork[0]?.featuredImage || allProjects[0]?.featuredImage || undefined;
  const hasHero = Boolean(heroVimeoId || heroPoster);

  const t = COPY[loc].home;

  return (
    <div className="min-h-screen bg-black">
      {hasHero && (
        <section className="relative h-screen w-full border-b border-white/5">
          <HeroReel
            vimeoId={heroVimeoId}
            title={t.reel}
            fallbackImageSrc={heroPoster}
          />
          <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center">
            <ScrollIndicator />
          </div>
        </section>
      )}

      <HomeAbout locale={loc} />

      <ScrollReveal className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8" delayMs={80}>
        <section className="py-10 md:py-14" aria-label={t.ctaFeatured}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <Link
              href={`/${locale}/work`}
              className="group flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center transition-colors hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-lg font-medium text-white group-hover:text-white">
                {t.ctaVideos}
              </span>
              <span className="mt-1 text-sm text-white/60">
                {locale === "es" ? "Reel y proyectos en video" : "Reel and video projects"}
              </span>
            </Link>
            <Link
              href={`/${locale}/gallery`}
              className="group flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center transition-colors hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-lg font-medium text-white group-hover:text-white">
                {t.ctaGallery}
              </span>
              <span className="mt-1 text-sm text-white/60">
                {locale === "es" ? "Fotografías y galerías" : "Photos and galleries"}
              </span>
            </Link>
            <Link
              href={`/${locale}/work`}
              className="group flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center transition-colors hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-lg font-medium text-white group-hover:text-white">
                {t.ctaFeatured}
              </span>
              <span className="mt-1 text-sm text-white/60">
                {locale === "es" ? "Proyectos destacados" : "Featured projects"}
              </span>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8" delayMs={100}>
        <section className="pb-14 pt-4 md:pb-20" aria-labelledby="featured-work-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="featured-work-heading" className="text-xl font-semibold text-white md:text-2xl">
              {t.featured}
            </h2>
            <Link
              href={`/${locale}/work`}
              className="text-sm font-medium text-white/80 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              {t.viewAll}
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
            {featuredWork.map((project) => (
              <li key={project.slug} className="group bg-black">
                <Link
                  href={`/${locale}/work/${project.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
                >
                  {project.featuredImage ? (
                    <Image
                      src={project.featuredImage}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
                      {project.title}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="text-sm font-medium text-white">{project.title}</span>
                    {project.year && (
                      <span className="ml-2 text-xs text-white/80">{project.year}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>
    </div>
  );
}
