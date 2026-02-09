import { getProjects } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const projects = await getProjects(loc);

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 md:px-8">
        <h1 className="text-xl font-semibold text-white">{locale === "es" ? "Trabajo" : "Work"}</h1>
        <WorkPageClient projects={projects} locale={locale} />
      </div>
    </div>
  );
}
