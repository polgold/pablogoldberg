import { getPageBySlug } from "@/lib/content";
import { SafeHtml } from "@/components/SafeHtml";

export const metadata = {
  title: "Sobre mí",
  description:
    "Pablo Goldberg — Director, director de fotografía y productor. Filmmaker con base en Buenos Aires.",
  openGraph: {
    title: "Sobre mí | Pablo Goldberg",
    description: "Director, DP y productor. Filmmaker con base en Buenos Aires.",
  },
};

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  const title = page?.title || "Sobre mí";
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
          Director, director de fotografía y productor. Con base en Buenos Aires.
        </p>
      )}
    </div>
  );
}
