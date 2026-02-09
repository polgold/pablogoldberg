import { getPublicGalleriesWithPhotos } from "@/lib/portfolio-photos";
import { PhotosGridWithLightbox } from "@/components/PhotosGridWithLightbox";

export default async function GalleryPage() {
  const galleries = await getPublicGalleriesWithPhotos();
  const hasAnyPhotos = galleries.some((g) => g.photos.length > 0);

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          Photos
        </h1>
        {!hasAnyPhotos ? (
          <p className="mt-6 text-sm text-white/40">
            Sin imágenes visibles. En el admin <strong>/admin/portfolio-photos</strong> elegí una galería (o creá una como &quot;Retratos&quot;) y subí fotos. El bucket es <strong>projects</strong>, path <strong>slug/archivo</strong> (ej. retratos/IMG_1.png).
          </p>
        ) : (
          <div className="mt-8 space-y-12">
            {galleries.map((gallery) =>
              gallery.photos.length > 0 ? (
                <section key={gallery.id}>
                  <h2 className="mb-4 text-lg font-medium text-white md:text-xl">
                    {gallery.title}
                  </h2>
                  <PhotosGridWithLightbox
                    urls={gallery.photos.map((p) => p.public_url)}
                  />
                </section>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Photos",
};
