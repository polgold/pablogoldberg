import Link from "next/link";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeReel } from "@/components/HomeReel";
import { HomeAbout } from "@/components/HomeAbout";
import { linkifyCompanies } from "@/lib/linkifyCompanies";

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
  const heroVimeoEnv =
    process.env.HERO_VIMEO_ID?.trim() ||
    process.env.NEXT_PUBLIC_HERO_VIMEO_ID?.trim() ||
    "";

  const [vimeoVideos] = await Promise.all([getVimeoPortfolioVideos()]);
  const heroVimeoId = heroVimeoEnv || (vimeoVideos[0]?.id ?? "");
  const t = COPY[loc].home;

  return (
    <div className="min-h-screen bg-black">
      {/* SECTION 1 — HERO */}
      <HomeHero
        locale={locale}
        h1={t.heroH1}
        sub={linkifyCompanies(t.heroSub)}
        ctaPrimary={t.ctaPrimary}
        ctaSecondary={t.ctaSecondary}
      />

      {/* SECTION 2 — REEL */}
      <HomeReel vimeoId={heroVimeoId} title={t.reel} />

      {/* SECTION 3 — TRABAJOS DESTACADOS: oculto hasta rearmar orígenes de portadas */}
      {/* <FeaturedWork ... /> */}

      {/* SECTION 4 — PHOTOGRAPHY (preview rotativo): oculto hasta rearmar */}
      {/* <HomePhotographyGrid ... /> */}

      {/* SECTION 5 — ABOUT */}
      <HomeAbout locale={locale} aboutText={linkifyCompanies(t.aboutText)} />

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
