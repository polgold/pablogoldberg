import Link from "next/link";
import Image from "next/image";
import { getPageBySlug, getFeaturedProjects, getProjects } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { HeroReel } from "@/components/HeroReel";
import { ScrollIndicator } from "@/components/ScrollIndicator";

const PRIMARY_REEL_VIMEO = "884669410";

function extractFirstVimeo(content: string): string | null {
  const m = content.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const homePage = await getPageBySlug("home", loc);
  const featuredRaw = await getFeaturedProjects(8, loc);
  const featured =
    featuredRaw.length > 0 ? featuredRaw : (await getProjects(loc)).slice(0, 8);
  const reelId = homePage
    ? extractFirstVimeo(homePage.content) || PRIMARY_REEL_VIMEO
    : PRIMARY_REEL_VIMEO;
  const heroFallbackImage = process.env.NEXT_PUBLIC_HERO_IMAGE?.trim() || null;
  const t = COPY[loc].home;

  return (
    <div>
      {/* Fullscreen cinematic hero */}
      <section className="relative min-h-[100vh] w-full">
        <HeroReel
          vimeoId={reelId}
          title="Reel"
          fallbackImageSrc={heroFallbackImage}
        />
        <div className="relative z-10 flex min-h-[100vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Pablo Goldberg
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            {t.role}
          </p>
        </div>
        <ScrollIndicator />
      </section>

      {/* Work grid — no dead space */}
      <section className="border-t border-white/5 bg-black">
        <div className="mx-auto max-w-[1600px] px-0 md:px-5">
          <div className="flex items-end justify-between border-b border-white/5 px-5 py-6 md:px-8">
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((project) => (
              <li key={project.slug} className="group border-b border-r border-white/5">
                <Link
                  href={`/${locale}/work/${project.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
                >
                  {project.featuredImage ? (
                    <Image
                      src={project.featuredImage}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
                      {locale === "es" ? "Sin imagen" : "No image"}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-sm font-medium text-white">
                      {project.title}
                    </span>
                    {project.year && (
                      <span className="text-xs text-white/70">
                        {project.year}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
