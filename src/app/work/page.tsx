import { getProjects } from "@/lib/content";
import { WorkPageClient } from "./WorkPageClient";

export default function WorkPage() {
  const projects = getProjects();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Trabajo
        </h1>
        <p className="mt-2 text-white/70">
          Selección de proyectos como director, DP y productor.
        </p>
      </div>
      <WorkPageClient projects={projects} />
    </div>
  );
}
