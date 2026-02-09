import Link from "next/link";
import { listProjects } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const projects = await listProjects();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Proyectos</h1>
      <div className="overflow-x-auto rounded border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-300">Título</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Locale</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Publicado</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
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
                  <td className="px-4 py-3 text-zinc-400">{p.locale}</td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="text-emerald-400">Sí</span>
                    ) : (
                      <span className="text-zinc-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-amber-500 hover:underline"
                    >
                      Editar
                    </Link>
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
