import { getPageBySlug } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { SafeHtml } from "@/components/SafeHtml";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const page = await getPageBySlug("contact", loc);
  const t = COPY[loc].contact;
  const title = page?.title || t.defaultTitle;
  const content = page?.content?.trim() || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      {content ? (
        <div className="prose-safe mt-8 text-white/90">
          <SafeHtml html={content} />
        </div>
      ) : null}
      <div className="mt-10">
        <a
          href="mailto:hola@pablogoldberg.com"
          className="inline-block rounded bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
        >
          {t.ctaButton}
        </a>
        <p className="mt-4 text-sm text-white/60">{t.emailNote}</p>
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
  const page = await getPageBySlug("contact", loc);
  const title = page?.title || COPY[loc].contact.defaultTitle;
  const description =
    loc === "es"
      ? "Contacto y booking para proyectos de dirección, cinematografía y producción. Pablo Goldberg."
      : "Contact and booking for direction, cinematography and production projects. Pablo Goldberg.";
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pablo Goldberg`,
      description:
        loc === "es"
          ? "Contacto y booking para spots, videoclips y documentales."
          : "Contact and booking for spots, music videos and documentaries.",
    },
  };
}
