import { getPageBySlug } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { SafeHtml } from "@/components/SafeHtml";

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
  const content = page?.content?.trim() || "";

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[720px] px-5 pb-24 pt-16 md:px-8">
        <h1 className="font-display text-2xl tracking-[0.12em] text-white md:text-3xl">
          {title}
        </h1>
        {content ? (
          <div className="prose-safe mt-10 font-body text-lg leading-relaxed text-white/85">
            <SafeHtml html={content} />
          </div>
        ) : (
          <p className="mt-10 font-body text-lg leading-relaxed text-white/70">
            {loc === "es"
              ? "Director, director de fotografía y productor. Con base en Buenos Aires."
              : "Director, director of photography and producer. Based in Buenos Aires."}
          </p>
        )}
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
      ? "Pablo Goldberg — Director, director de fotografía y productor. Buenos Aires."
      : "Pablo Goldberg — Director, director of photography and producer. Buenos Aires.";
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pablo Goldberg`,
      description,
    },
  };
}
