import Link from "next/link";

interface HomeAboutProps {
  locale: "es" | "en";
}

export function HomeAbout({ locale }: HomeAboutProps) {
  const roleLine =
    locale === "es" ? "Director / Productor / Director de fotografía" : "Director / Producer / Cinematographer";
  const leadLine =
    locale === "es" ? "Más de 20 años creando historias." : "Over 20 years crafting stories.";
  const cta = locale === "es" ? "Conocé más" : "Learn more";

  return (
    <section className="border-b border-white/10 bg-black px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-light tracking-[0.08em] text-white md:text-4xl">
          {roleLine}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-relaxed text-white/75 md:text-xl">
          {leadLine}
        </p>
        <Link
          href={`/${locale}/about`}
          className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black"
        >
          {cta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
