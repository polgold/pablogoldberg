import Link from "next/link";
import Image from "next/image";
import { getFeaturedProjects, getProjects } from "@/lib/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { HeroReel } from "@/components/HeroReel";

const HOME_PROJECTS_MIN = 8;
const HOME_PROJECTS_MAX = 16;

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
  const [featured, allProjects, vimeoVideos] = await Promise.all([
    getFeaturedProjects(HOME_PROJECTS_MAX, loc),
    getProjects(loc),
    heroVimeoEnv ? Promise.resolve([]) : getVimeoPortfolioVideos(),
  ]);
  const projects =
    featured.length >= HOME_PROJECTS_MIN
      ? featured
      : [...featured, ...allProjects.filter((p) => !featured.find((f) => f.slug === p.slug))].slice(
          0,
          HOME_PROJECTS_MAX
        );

  const heroVimeoId = heroVimeoEnv || (vimeoVideos[0]?.id ?? "");
  const heroPoster =
    featured[0]?.featuredImage || allProjects[0]?.featuredImage || undefined;
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
        </section>
      )}

      <section className="mx-auto max-w-[1600px] px-0 sm:px-4 md:px-6">
        <div className="flex items-end justify-between border-b border-white/5 px-4 py-4 sm:px-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-white/60">
            {t.workTitle}
          </h2>
          <Link
            href={`/${locale}/work`}
            className="text-xs text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
          >
            {locale === "es" ? "Ver todo" : "View all"}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
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
    </div>
  );
}
