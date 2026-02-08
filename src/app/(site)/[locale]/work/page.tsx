import { getProjects } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const projects = await getProjects(loc);
  const t = COPY[loc].work;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {t.title}
        </h1>
        <p className="mt-2 text-white/70">{t.subtitle}</p>
      </div>
      <WorkPageClient projects={projects} locale={locale} />
    </div>
  );
}
