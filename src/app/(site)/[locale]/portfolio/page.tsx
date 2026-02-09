import Image from "next/image";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const videos = await getVimeoPortfolioVideos();

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-white">Portfolio</h1>
        <p className="mt-1 text-sm text-white/60">
          {locale === "es" ? "Últimos 40 videos · Vimeo" : "Latest 40 videos · Vimeo"}
        </p>
        {videos.length === 0 ? (
          <p className="mt-12 text-sm text-white/50">
            {locale === "es"
              ? "No hay videos. Configurá VIMEO_ACCESS_TOKEN en .env (token de vimeo.com/sunfactory)."
              : "No videos. Set VIMEO_ACCESS_TOKEN in .env (token from vimeo.com/sunfactory)."}
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {videos.map((v) => (
              <li key={v.id}>
                <a
                  href={v.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-video overflow-hidden rounded bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
                >
                  {v.thumbnail ? (
                    <Image
                      src={v.thumbnail}
                      alt={v.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/30">Video</div>
                  )}
                  <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="line-clamp-2 text-xs text-white">{v.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
