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
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[720px] px-5 pb-24 pt-16 md:px-8">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h1>
        {content ? (
          <div className="prose-safe mt-10 text-lg leading-relaxed text-white/85">
            <SafeHtml html={content} />
          </div>
        ) : null}
        <div className="mt-12">
          <a
            href="mailto:hola@pablogoldberg.com"
            className="text-sm text-white/80 underline underline-offset-4 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
          >
            hola@pablogoldberg.com
          </a>
          <p className="mt-4 text-xs text-white/40">
            {t.emailNote}
          </p>
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
  const page = await getPageBySlug("contact", loc);
  const title = page?.title || COPY[loc].contact.defaultTitle;
  const description =
    loc === "es"
      ? "Contacto y booking. Pablo Goldberg."
      : "Contact and booking. Pablo Goldberg.";
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pablo Goldberg`,
      description:
        loc === "es"
          ? "Contacto y booking."
          : "Contact and booking.",
    },
  };
}
