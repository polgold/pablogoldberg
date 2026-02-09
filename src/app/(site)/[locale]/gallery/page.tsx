import { getPortfolioGalleryUrls } from "@/lib/portfolio-gallery";
import { PhotosGridWithLightbox } from "@/components/PhotosGridWithLightbox";

export default async function GalleryPage() {
  const urls = await getPortfolioGalleryUrls();

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          Photos
        </h1>
        {urls.length === 0 ? (
          <p className="mt-6 text-sm text-white/40">
            Sin imágenes. Subí fotos en Supabase Storage: bucket <strong>projects</strong>, carpeta <strong>portfolio</strong> o <strong>uploads</strong>. Opcional: env <code className="text-white/60">PORTFOLIO_GALLERY_FOLDER</code> = nombre de la carpeta.
          </p>
        ) : (
          <div className="mt-8">
            <PhotosGridWithLightbox urls={urls} />
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Photos",
};
