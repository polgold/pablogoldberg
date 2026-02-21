import Image from "next/image";
import { getPageBySlug } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { SafeHtml } from "@/components/SafeHtml";
import { ScrollReveal } from "@/components/ScrollReveal";

const BIO_ES = `
<p>Soy Director de <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, donde realizo servicios de producción audiovisual.</p>
<p>Dirigí el documental BESTEFAR (40') y fui director de fotografía en Home(Sick). También dirigí la serie Sirenas Rock.</p>
<p>En la actualidad trabajo como Director, DF, productor y colaborador creativo en agencias de publicidad.</p>
<p>Hace más de 20 años realizo cine documental y contenido comercial para empresas y agencias, desarrollando piezas con una mirada clara y un enfoque específico según cada proyecto.</p>
`;

const BIO_EN = `
<p>I'm Director at <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, where I provide audiovisual production services.</p>
<p>I directed the documentary BESTEFAR (40') and was director of photography on Home(Sick). I also directed the series Sirenas Rock.</p>
<p>I currently work as Director, DP, producer, and creative collaborator with advertising agencies.</p>
<p>For over 20 years I've been making documentary film and commercial content for companies and agencies, developing pieces with a clear vision and a specific approach for each project.</p>
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
