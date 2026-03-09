import Link from "next/link";
import { orderGetCategories } from "../actions";
import { PhotographyOrderClient } from "./PhotographyOrderClient";

export const dynamic = "force-dynamic";

export default async function PhotographyOrderPage() {
  const categories = await orderGetCategories();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/galleries/rebuild"
            className="text-zinc-400 hover:text-white"
          >
            ← Reconstruir
          </Link>
          <h1 className="text-2xl font-semibold text-white">
            Orden de galerías (Fotografía)
          </h1>
        </div>
      </div>
      <p className="text-sm text-zinc-400">
        Arrastrá los títulos de categoría para cambiar el orden en la página pública.
        Elegí una categoría y arrastrá las fotos para reordenarlas dentro de la galería.
      </p>
      <PhotographyOrderClient initialCategories={categories} />
    </div>
  );
}
