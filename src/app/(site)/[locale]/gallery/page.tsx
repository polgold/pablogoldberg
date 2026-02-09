import Image from "next/image";
import { getPortfolioGalleryUrls } from "@/lib/portfolio-gallery";

export default async function GalleryPage() {
  const urls = await getPortfolioGalleryUrls();

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
        <h1 className="sr-only">Portfolio</h1>
        {urls.length === 0 ? null : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {urls.map((url, i) => (
              <li key={i} className="relative aspect-square overflow-hidden bg-white/5">
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Portfolio",
};
