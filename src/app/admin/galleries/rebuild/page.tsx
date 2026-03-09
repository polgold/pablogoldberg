import Link from "next/link";
import { rebuildListCategories } from "./actions";
import { RebuildGalleryClient } from "./RebuildGalleryClient";

export const dynamic = "force-dynamic";

export default async function RebuildGalleryPage() {
  const existingCategories = await rebuildListCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/galleries" className="text-zinc-400 hover:text-white">
          ← Galerías
        </Link>
        <Link
          href="/admin/galleries/rebuild/order"
          className="rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white"
        >
          Ordenar galerías y fotos
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-white">
        Reconstruir galería (work/photography)
      </h1>
      <p className="text-sm text-zinc-400">
        Subí imágenes para una categoría. Se convierten a JPG, se generan large (2200px) y thumb (600px),
        y se renombran como <code className="rounded bg-zinc-800 px-1">categoria-001.jpg</code>.
        Las galerías se leen automáticamente desde{" "}
        <code className="rounded bg-zinc-800 px-1">/public/uploads/work/photography/</code>.
      </p>
      <p className="text-xs text-zinc-500">
        En Hostinger (o servidor tradicional) usá Node runtime; el procesamiento es en servidor con filesystem real.
      </p>
      <RebuildGalleryClient existingCategories={existingCategories} />
    </div>
  );
}
