import Link from "next/link";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">
        ← Proyectos
      </Link>
      <h1 className="text-2xl font-semibold text-white">Nuevo proyecto</h1>
      <ProjectForm projectId={null} project={null} />
    </div>
  );
}
