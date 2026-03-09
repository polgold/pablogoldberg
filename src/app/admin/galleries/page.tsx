import Link from "next/link";
import { galleriesList } from "./actions";
import { listGalleryItems } from "@/lib/galleries/db";
import { getUploadUrl } from "@/lib/galleries/urls";
import { GALLERY_SECTIONS } from "@/lib/galleries/config";

export const dynamic = "force-dynamic";

export default async function AdminGalleriesPage() {
  const galleries = await galleriesList();
  const withPreview = await Promise.all(
    galleries.map(async (g) => {
      const items = await listGalleryItems(g.id, false);
      const first = items.find((i) => i.is_visible) ?? items[0];
      return {
        gallery: g,
        count: items.length,
        firstThumbPath: first?.thumb_path ?? null,
      };
    })
  );
  const bySection = GALLERY_SECTIONS.map((section) => ({
    section,
    list: withPreview.filter((p) => p.gallery.section === section),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-white">Galerías</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/galleries/rebuild"
            className="rounded border border-amber-600/60 bg-amber-900/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-900/40"
          >
            Reconstruir (work/photography)
          </Link>
          <Link
            href="/admin/galleries/rebuild/order"
            className="rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white"
          >
            Ordenar fotografía
          </Link>
          <Link
            href="/admin/galleries/new"
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
          >
            Nueva galería
          </Link>
        </div>
      </div>

      <p className="text-sm text-zinc-400">
        Las galerías usan imágenes locales (MEDIA_ROOT). Orden y visibilidad se guardan en la base.
      </p>

      {bySection.map(({ section, list }) => (
        <section key={section}>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">{section}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.length === 0 ? (
              <p className="text-zinc-500">Ninguna galería en esta sección.</p>
            ) : (
              list.map(({ gallery, count, firstThumbPath }) => (
                <Link
                  key={gallery.id}
                  href={`/admin/galleries/${gallery.section}/${gallery.slug}`}
                  className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition hover:border-amber-600/50"
                >
                  <div className="aspect-video bg-zinc-800">
                    {firstThumbPath ? (
                      <img
                        src={getUploadUrl(firstThumbPath)}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-500">Sin imágenes</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-white">{gallery.title}</p>
                      <p className="text-xs text-zinc-500">
                        /{gallery.section}/{gallery.slug} · {count} imagen{count !== 1 ? "es" : ""}
                      </p>
                    </div>
                    <span className="text-zinc-500 group-hover:text-amber-500">Editar →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      ))}

      {galleries.length === 0 && (
        <p className="text-zinc-500">
          No hay galerías. Creá una desde &quot;Nueva galería&quot; o ejecutá el script de inicialización.
        </p>
      )}
    </div>
  );
}
