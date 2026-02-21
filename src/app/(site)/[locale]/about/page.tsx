import Image from "next/image";
import { getPageBySlug } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { SafeHtml } from "@/components/SafeHtml";
import { ScrollReveal } from "@/components/ScrollReveal";

const BIO_ES = `
<p>Nací en Quilmes, en el año 1976. Egresado de la Escuela Panamericana de Diseño y Publicidad. Director de <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, realizando servicios de producción audiovisual.</p>
<p>Actualmente, vivo en Pereyra, provincia de Buenos Aires y trabajo como Director, Creativo, Fotógrafo, Editor y Músico.</p>
<p>La música es mi driver de conexiones neuronales y un cable a tierra, no solamente en los tiempos libres.</p>
<p>Lo que más me inspira de mi trabajo, es que elegí hacer todos los días algo distinto, algo que me apasiona. Me permite conectar y trabajar con gente maravillosa, me hace viajar y conocer lugares increíbles. La inspiración sucede en el momento menos pensado.</p>
<p>Siempre hay una historia apasionante que contar. Una perspectiva nueva y fresca que descubrir. Por eso, con más de 20 años de experiencia, pongo cada día toda mi energía y pasión en lo que hago. Para hacer que cada proyecto sea único e irrepetible.</p>
`;

const BIO_EN = `
<p>I was born in Quilmes in 1976. I graduated from the Panamerican School of Design and Advertising. Director at <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, providing audiovisual production services.</p>
<p>I currently live in Pereyra, Buenos Aires province, and work as Director, Creative, Photographer, Editor and Musician.</p>
<p>Music is my driver for neural connections and a grounding wire, not only in my free time.</p>
<p>What inspires me most about my work is that I chose to do something different every day, something I'm passionate about. It allows me to connect and work with wonderful people, it takes me traveling and to incredible places. Inspiration happens when you least expect it.</p>
<p>There's always a compelling story to tell. A new and fresh perspective to discover. That's why, with over 20 years of experience, I put all my energy and passion into what I do every day. To make each project unique and one of a kind.</p>
`;

const PORTRAIT_PATH = "/images/about-portrait.jpg";

const ROLES = [
  {
    name: "Sun Factory",
    href: "https://www.sunfactory.com.ar",
    roleEs: "Director en",
    roleEn: "Director at:",
  },
  {
    name: "Accerts Productions",
    href: "https://www.accerts.com",
    roleEs: "Productor y D.F. en",
    roleEn: "Producer & D.P. at:",
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
              <div className="prose-safe about-rich mt-8 text-base leading-relaxed text-white/88 md:text-lg">
                <SafeHtml html={content} />
              </div>
            </ScrollReveal>
            <ScrollReveal
              className="mt-14 border-t border-white/10 pt-10"
              delayMs={140}
              aria-label={loc === "es" ? "Roles profesionales" : "Professional roles"}
            >
              <h2 className="text-xs font-medium uppercase tracking-wider text-white/50">
                {loc === "es" ? "Roles profesionales" : "Professional roles"}
              </h2>
              <ul className="mt-6 space-y-5">
                {ROLES.map((p) => (
                  <li key={p.name}>
                    <p className="text-sm text-white/70">
                      <span className="mr-1">{loc === "es" ? `${p.roleEs}:` : p.roleEn}</span>
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white transition-colors hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black rounded"
                      >
                        {p.name}
                      </a>
                    </p>
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
