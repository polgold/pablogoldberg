"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const ROTATE_MS = 5000;

export type HomePhotographyItem = {
  thumbUrl: string;
  largeUrl: string;
  gallerySlug: string;
  section: string;
};

export function HomePhotographyMini({
  items,
  locale,
  title,
  ctaLabel,
}: {
  items: HomePhotographyItem[];
  locale: string;
  title: string;
  ctaLabel: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];
  const galleryUrl = `/${locale}/photography${current.gallerySlug ? `?g=${current.gallerySlug}` : ""}`;

  return (
    <section className="border-b border-white/5 bg-black px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-medium tracking-tight text-white md:text-2xl">
            {title}
          </h2>
          <Link
            href={galleryUrl}
            className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 transition hover:text-white hover:decoration-white/60"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-sm bg-white/5">
          {items.map((item, i) => (
            <Link
              key={`${item.gallerySlug}-${i}`}
              href={`/${locale}/photography${item.gallerySlug ? `?g=${item.gallerySlug}` : ""}`}
              className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${
                i === index ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <Image
                src={item.largeUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                unoptimized={item.largeUrl.startsWith("/uploads/")}
              />
            </Link>
          ))}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
