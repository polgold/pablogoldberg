import Link from "next/link";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";
import type { VimeoVideo } from "@/lib/vimeo";

function yearFromReleaseTime(releaseTime: string): string {
  if (!releaseTime || releaseTime.length < 4) return "";
  return releaseTime.slice(0, 4);
}

function vimeoToWorkItem(v: VimeoVideo): WorkItem {
  return {
    slug: `vimeo-${v.id}`,
    title: v.name,
    year: yearFromReleaseTime(v.releaseTime) || undefined,
    featuredImage: v.thumbnail || undefined,
    href: v.link,
    external: true,
    source: "vimeo",
    vimeoId: v.id,
  };
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const urls = getHreflangUrls("/work");
  const loc = getLocaleFromParam(locale);
  return {
    title: COPY[loc].metadata.work,
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);

  const [vimeoVideos] = await Promise.all([getVimeoPortfolioVideos()]);

  const vimeoItems: WorkItem[] = vimeoVideos.map(vimeoToWorkItem);

  const tWork = COPY[loc].work;

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        {/* 1) Galería de Vimeo (videos del portfolio) */}
        <section className="mb-12" aria-labelledby="work-vimeo-heading">
          <h2 id="work-vimeo-heading" className="text-xl font-semibold text-white md:text-2xl">
            {tWork.title}
          </h2>
          {vimeoItems.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              {locale === "es"
                ? "Para mostrar los videos configurá VIMEO_ACCESS_TOKEN en las variables de entorno del servidor (developer.vimeo.com)."
                : "To show videos, set VIMEO_ACCESS_TOKEN in the server environment (developer.vimeo.com)."}
            </p>
          ) : (
            <>
              <WorkPageClient items={vimeoItems} locale={locale} />
              <div className="mt-12 flex justify-center">
                <Link
                  href={`/${locale}/work/archive`}
                  className="inline-flex items-center justify-center rounded-sm border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
                >
                  {tWork.viewAllWork}
                </Link>
              </div>
            </>
          )}
        </section>

        {/* 2) Featured Work: desactivado temporalmente hasta rearmar sistema de portadas */}
        {/* <FeaturedWork projects={featuredWithCover} ... /> */}
      </div>
    </div>
  );
}
