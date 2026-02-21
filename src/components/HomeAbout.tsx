import Link from "next/link";

interface HomeAboutProps {
  locale: string;
  aboutText: string;
}

export function HomeAbout({ locale, aboutText }: HomeAboutProps) {
  return (
    <section className="border-b border-white/5 bg-black px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-base leading-relaxed text-white/85 md:text-lg">
          {aboutText}
        </p>
        <Link
          href={`/${locale}/about`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand underline decoration-brand/50 underline-offset-2 transition-colors hover:text-brand/90 hover:decoration-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
        >
          {locale === "es" ? "Sobre mí" : "About"}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
