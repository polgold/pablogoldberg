import Link from "next/link";
import { listAdminProjects } from "./admin-actions";
import { getProjectImageUrl } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const projects = await listAdminProjects();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Proyectos</h1>
        <Link
          href="/admin/projects/new"
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
        >
          Nuevo proyecto
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p: { id: string; slug: string; title_es: string; published: boolean; cover_image_path: string | null }) => (
          <Link
            key={p.id}
            href={`/admin/projects/${p.id}`}
            className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition hover:border-amber-600/50"
          >
            <div className="aspect-video bg-zinc-800">
              {p.cover_image_path ? (
                <img
                  src={getProjectImageUrl(p.cover_image_path)}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">Sin portada</div>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-white">{p.title_es}</p>
              <p className="text-xs text-zinc-500">
                /{p.slug} {p.published ? "• Publicado" : "• Borrador"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-zinc-500">No hay proyectos. Creá uno desde &quot;Nuevo proyecto&quot;.</p>
      )}
    </div>
  );
}
