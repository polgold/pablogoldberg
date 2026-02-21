"use client";

import { useEffect, useRef, useState } from "react";
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
  viewAllLabel?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function HomePhotographyGrid({
  photos,
  locale,
  title,
  viewAllLabel = "View all",
}: HomePhotographyGridProps) {
  const poolRef = useRef<PhotoItem[]>([]);
  const [displayed, setDisplayed] = useState<PhotoItem[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (photos.length === 0) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handler);

    const shuffled = shuffle(photos);
    poolRef.current = shuffled;
    const initial = shuffled.slice(0, Math.min(8, shuffled.length));
    setDisplayed(initial);

    return () => mq.removeEventListener("change", handler);
  }, [photos]);

  useEffect(() => {
    const pool = poolRef.current;
    const needRotation =
      !prefersReducedMotion &&
      pool.length >= 9 &&
      displayed.length >= 8;
    if (!needRotation) return;

    const interval = setInterval(() => {
      setDisplayed((prev) => {
        const pool = poolRef.current;
        const currentUrls = new Set(prev.map((p) => p.thumbUrl));
        const available = pool.filter((p) => !currentUrls.has(p.thumbUrl));
        if (available.length === 0) return prev;

        const randomIndex = Math.floor(Math.random() * available.length);
        const replacement = available[randomIndex];
        const next = [...prev.slice(1), replacement];
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, displayed]);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      displayed.length < 8 ||
      poolRef.current.length < 9
    )
      return;
    const currentUrls = new Set(displayed.map((p) => p.thumbUrl));
    const available = poolRef.current.filter(
      (p) => !currentUrls.has(p.thumbUrl)
    );
    const next = available[0];
    if (next) {
      const img = new window.Image();
      img.src = next.thumbUrl;
    }
  }, [displayed, prefersReducedMotion]);

  if (photos.length === 0 || displayed.length === 0) return null;

  return (
    <section className="border-b border-white/5 bg-black px-4 py-14 sm:px-6 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
          <Link
            href={`/${locale}/photography`}
            className="text-sm font-medium text-white/80 underline decoration-brand/50 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-inset focus:ring-offset-2 focus:ring-offset-black"
          >
            {viewAllLabel}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
          {displayed.map((photo, i) => (
            <Link
              key={`${photo.thumbUrl}-${i}`}
              href={`/${locale}/photography`}
              className="relative block aspect-square bg-black"
            >
              <span
                key={photo.thumbUrl}
                className="absolute inset-0 animate-photography-fade"
              >
                <Image
                  src={photo.thumbUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
