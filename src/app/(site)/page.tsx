import Link from "next/link";
import Image from "next/image";
import { getPageBySlug, getFeaturedProjects } from "@/lib/content";
import { VideoEmbed } from "@/components/VideoEmbed";

const PRIMARY_REEL_VIMEO = "884669410";

function extractFirstVimeo(content: string): string | null {
  const m = content.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

export default async function HomePage() {
  const homePage = await getPageBySlug("home");
  const featured = await getFeaturedProjects(6);
  const reelId = homePage
    ? extractFirstVimeo(homePage.content) || PRIMARY_REEL_VIMEO
    : PRIMARY_REEL_VIMEO;

  return (
    <div>
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-20 text-center sm:py-30">
        <div className="absolute inset-0 bg-surface-light" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
            PABLO GOLDBERG
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            Director · Director de fotografía · Productor
          </p>
          <p className="mt-2 text-sm text-white/60">
            Más de 20 años contando historias. Buenos Aires.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-surface px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-brand">
            Reel
          </h2>
          <div className="mx-auto max-w-4xl">
            <VideoEmbed
              type="vimeo"
              id={reelId}
              title="Director showreel"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Trabajo destacado
            </h2>
            <Link
              href="/work"
              className="text-sm font-medium text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
            >
              Ver todo →
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group block overflow-hidden rounded-lg border border-white/10 bg-surface-card transition-colors hover:border-white/20"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                    {project.featuredImage ? (
                      <Image
                        src={project.featuredImage}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/30">
                        Sin imagen
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm text-white/90">
                        {project.year && `${project.year} · `}
                        {project.title}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white">{project.title}</h3>
                    {project.year && (
                      <p className="mt-1 text-sm text-white/60">{project.year}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 bg-surface-light px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            ¿Proyecto en mente?
          </h2>
          <p className="mt-3 text-white/80">
            Hablemos de tu próximo spot, videoclip o documental.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
          >
            Contacto / Booking
          </Link>
        </div>
      </section>
    </div>
  );
}
