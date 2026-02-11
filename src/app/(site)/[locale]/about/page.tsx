import Image from "next/image";
import { getPageBySlug } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { SafeHtml } from "@/components/SafeHtml";
import { ScrollReveal } from "@/components/ScrollReveal";

const BIO_ES = `
<p>Soy Pablo, nací en Quilmes y vivo en Pereyra, Buenos Aires. Soy dueño de <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, una productora de cine ubicada en Argentina. Me licencié en Artes Visuales y Diseño en la Escuela Panamericana de Diseño y Publicidad de Buenos Aires en 1997. Hoy en día, sigo aprendiendo.</p>
<p>Durante los últimos 20 años he trabajado como director y director de fotografía en cortometrajes, documentales, comerciales, vídeos musicales, largometrajes, televisión, conciertos, branded content y fotografía publicitaria. En los trabajos comerciales y artísticos en América Latina hay que hacer de todo. Así que adquirí experiencia en todas las áreas necesarias para dar vida a las historias.</p>
`;

const BIO_EN = `
<p>I'm Pablo, I was born in Quilmes and live in Pereyra, Buenos Aires. I own <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, a film production company located in Argentina. I graduated in Visual Arts & Design at the Panamerican School of Design & Advertising in Buenos Aires, 1997. But I'm still learning.</p>
<p>For the last 20 years I've worked as a director & cinematographer in commercial short films, music videos, feature films, television, live events, branded content, and advertising photography. In commercial and art works in Latin America, you have to do everything. So I gained experience in all areas required to bring stories to life.</p>
`;

const PORTRAIT_PATH = "/images/about-portrait.jpg";

const PRODUCTIONS = [
  {
    name: "Sun Factory",
    href: "https://www.sunfactory.com.ar",
    lineEs: "Productora de cine. Argentina.",
    lineEn: "Film production company. Argentina.",
  },
  {
    name: "BESTEFAR",
    href: "https://bestefarmovie.com",
    lineEs: "Largometraje.",
    lineEn: "Feature film.",
  },
  {
    name: "Accerts Productions",
    href: "https://www.accerts.com",
    lineEs: "Producción. Argentina.",
    lineEn: "Production. Argentina.",
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const page = await getPageBySlug("about", loc);
  const t = COPY[loc];
  const title = page?.title || t.about.defaultTitle;
  const content = page?.content?.trim() || (loc === "es" ? BIO_ES : BIO_EN);

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:items-start">
          <ScrollReveal>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[480px] lg:sticky lg:top-24 lg:mx-0 lg:max-w-none">
              <Image
                src={PORTRAIT_PATH}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            </div>
          </ScrollReveal>
          <div className="mt-10 lg:mt-0">
            <ScrollReveal delayMs={80}>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">
                {title}
              </h1>
              <div className="prose-safe mt-8 text-base leading-relaxed text-white/88 md:text-lg">
                <SafeHtml html={content} />
              </div>
            </ScrollReveal>
            <ScrollReveal
              className="mt-14 border-t border-white/10 pt-10"
              delayMs={140}
              aria-label={loc === "es" ? "Producciones / Productor para" : "Productions / Producer for"}
            >
              <h2 className="text-xs font-medium uppercase tracking-wider text-white/50">
                {loc === "es" ? "Producciones / Productor para" : "Productions / Producer for"}
              </h2>
              <ul className="mt-6 space-y-6">
                {PRODUCTIONS.map((p) => (
                  <li key={p.name}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-sm text-white/60 group-hover:text-white/80">
                        {loc === "es" ? p.lineEs : p.lineEn}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const page = await getPageBySlug("about", loc);
  const title = page?.title || COPY[loc].about.defaultTitle;
  const description =
    loc === "es"
      ? "Pablo Goldberg — Director, creativo, fotógrafo y editor. Sun Factory. Buenos Aires."
      : "Pablo Goldberg — Director, creative, photographer and editor. Sun Factory. Buenos Aires.";
  const urls = getHreflangUrls("/about");
  return {
    title,
    description,
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
    openGraph: {
      title: `${title} | Pablo Goldberg`,
      description,
    },
  };
}
