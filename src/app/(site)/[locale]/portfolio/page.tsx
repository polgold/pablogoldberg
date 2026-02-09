import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { PortfolioVideoGrid } from "@/components/PortfolioVideoGrid";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const videos = await getVimeoPortfolioVideos();

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-5 sm:py-10 md:px-8">
        <h1 className="text-xl font-semibold text-white">Portfolio</h1>
        {videos.length === 0 ? (
          <p className="mt-8 text-sm text-white/50">
            {locale === "es"
              ? "No hay videos. Configurá VIMEO_ACCESS_TOKEN en .env (token de vimeo.com/sunfactory)."
              : "No videos. Set VIMEO_ACCESS_TOKEN in .env (token from vimeo.com/sunfactory)."}
          </p>
        ) : (
          <PortfolioVideoGrid videos={videos} />
        )}
      </div>
    </div>
  );
}
