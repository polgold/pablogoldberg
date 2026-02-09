"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { WorkItem } from "@/types/work";

interface WorkPageClientProps {
  items: WorkItem[];
  locale: string;
}

export function WorkPageClient({ items, locale }: WorkPageClientProps) {
  const [yearFilter, setYearFilter] = useState<string>("");
  const years = useMemo(() => {
    const set = new Set(items.map((i) => i.year).filter(Boolean));
    return Array.from(set).sort((a, b) => (b ?? "").localeCompare(a ?? ""));
  }, [items]);
  const filtered = useMemo(() => {
    if (!yearFilter) return items;
    return items.filter((i) => i.year === yearFilter);
  }, [items, yearFilter]);

  const isPlaceholder = items.length === 1 && items[0]?.slug === "coming-soon";

  return (
    <>
      {!isPlaceholder && years.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setYearFilter("")}
            className={`rounded border px-3 py-1.5 text-xs transition-colors ${
              !yearFilter ? "border-white/40 text-white" : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            {locale === "es" ? "Todos" : "All"}
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYearFilter(y ?? "")}
              className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                yearFilter === y ? "border-white/40 text-white" : "border-white/20 text-white/60 hover:text-white"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-8 grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => {
          const linkProps = item.external
            ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
            : {};
          return (
            <li key={item.slug} className="group bg-black">
              <a
                href={item.href}
                className="relative block aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
                {...linkProps}
              >
                {item.featuredImage ? (
                  <Image
                    src={item.featuredImage}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
                    {item.title}
                  </div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">{item.title}</span>
                  {item.year && <span className="ml-2 text-xs text-white/80">{item.year}</span>}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
