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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      {content ? (
        <div className="prose-safe mt-8 text-white/90">
          <SafeHtml html={content} />
        </div>
      ) : (
        <p className="mt-8 text-white/70">
          {loc === "es"
            ? "Director, director de fotografía y productor. Con base en Buenos Aires."
            : "Director, director of photography and producer. Based in Buenos Aires."}
        </p>
      )}
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
      ? "Pablo Goldberg — Director, director de fotografía y productor. Filmmaker con base en Buenos Aires."
      : "Pablo Goldberg — Director, director of photography and producer. Filmmaker based in Buenos Aires.";
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pablo Goldberg`,
      description,
    },
  };
}
