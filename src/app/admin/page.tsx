import Link from "next/link";
import { listProjects } from "./actions";
import { DeleteProjectButton } from "./DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const projects = await listProjects();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Proyectos</h1>
        <Link href="/admin/vimeo-hidden" className="text-sm text-zinc-400 hover:text-white">
          Videos Vimeo ocultos
        </Link>
      </div>
      <div className="overflow-x-auto rounded border border-zinc-800">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-300">Título</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  No hay proyectos.{" "}
                  <Link href="/admin/projects/new" className="text-amber-500 hover:underline">
                    Crear uno
                  </Link>
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/80 hover:bg-zinc-900/30">
                  <td className="px-4 py-3 text-white">{p.title}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.slug}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-amber-500 hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteProjectButton projectId={p.id} title={p.title} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
