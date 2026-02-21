"use client";

import Link from "next/link";
import Image from "next/image";

interface PhotoItem {
  thumbUrl: string;
  largeUrl: string;
}

interface HomePhotographyGridProps {
  photos: PhotoItem[];
  locale: string;
  title: string;
}

export function HomePhotographyGrid({ photos, locale, title }: HomePhotographyGridProps) {
  if (photos.length === 0) return null;

  return (
    <section className="border-b border-white/5 bg-black px-4 py-14 sm:px-6 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
          <Link
            href={`/${locale}/photography`}
            className="text-sm font-medium text-white/80 underline decoration-brand/50 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <Link key={i} href={`/${locale}/photography`} className="relative block aspect-square bg-black">
              <Image
                src={photo.thumbUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
