import Link from "next/link";
import { listAdminPortfolioGalleries, listAdminPortfolioPhotos } from "../actions";
import { PortfolioPhotosClient } from "./PortfolioPhotosClient";

export const dynamic = "force-dynamic";

export default async function PortfolioPhotosAdminPage() {
  const galleries = await listAdminPortfolioGalleries();
  const defaultGalleryId = galleries[0]?.id ?? null;
  const photos = await listAdminPortfolioPhotos(defaultGalleryId);

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <Link href="/admin" className="text-zinc-400 hover:text-white">
          ← Proyectos
        </Link>
        <h1 className="text-2xl font-semibold text-white">Portfolio Photos</h1>
      </div>
      <p className="mb-4 text-sm text-zinc-400">
        Subí fotos, creá galerías y mostrá/ocultá en la página pública <strong>/photography</strong>. Arrastrá para reordenar.
      </p>
      <PortfolioPhotosClient
        initialGalleries={galleries}
        initialPhotos={photos}
      />
    </div>
  );
}
