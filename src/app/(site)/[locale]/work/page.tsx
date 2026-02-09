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
      <div className="mx-auto max-w-[1600px]">
        <WorkPageClient projects={projects} locale={locale} />
      </div>
    </div>
  );
}
