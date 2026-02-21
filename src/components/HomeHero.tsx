import Link from "next/link";

interface HomeHeroProps {
  locale: string;
  h1: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export function HomeHero({ locale, h1, sub, ctaPrimary, ctaSecondary }: HomeHeroProps) {
  return (
    <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center border-b border-white/5 bg-black px-6 py-20 md:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-light tracking-tight text-white md:text-5xl md:leading-tight">
          {h1}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-white/75 md:text-lg">
          {sub}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#reel"
            className="inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-black"
          >
            {ctaPrimary}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-sm border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black"
          >
            {ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
