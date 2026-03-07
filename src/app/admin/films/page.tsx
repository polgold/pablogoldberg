import Link from "next/link";
import { listFilms } from "../admin-actions";
import { getVideoThumbnailUrl } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function FilmsAdminPage() {
  const films = await listFilms();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Films</h1>
        <Link
          href="/admin/films/new"
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
        >
          Nuevo film
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((f: { id: string; title: string; platform: string; video_id: string; custom_thumbnail?: string | null; published: boolean }) => (
          <Link
            key={f.id}
            href={`/admin/films/${f.id}`}
            className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition hover:border-amber-600/50"
          >
            <div className="aspect-video bg-zinc-800">
              <img
                src={getVideoThumbnailUrl(f.platform, f.video_id, f.custom_thumbnail)}
                alt=""
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="font-medium text-white">{f.title}</p>
              <p className="text-xs text-zinc-500">
                {f.platform} • {f.published ? "Publicado" : "Borrador"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {films.length === 0 && (
        <p className="text-zinc-500">No hay films. Creá uno desde &quot;Nuevo film&quot;.</p>
      )}
    </div>
  );
}
