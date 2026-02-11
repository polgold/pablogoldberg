"use client";

import { useMemo, useState } from "react";
import type { WorkItem } from "@/types/work";
import { WorkCard } from "./WorkCard";

export interface WorkGridProps {
  items: WorkItem[];
  locale: string;
  /** If true, cards are links (public work). If false, cards are divs (admin). */
  linkCards?: boolean;
  /** When set, Vimeo items open in this lightbox instead of external link. */
  onVimeoClick?: (vimeoId: string) => void;
  /** Optional extra per card (badge + actions) for admin. */
  renderCardExtra?: (item: WorkItem) => { badge?: React.ReactNode; actions?: React.ReactNode };
}

export function WorkGrid({ items, locale, linkCards = true, onVimeoClick, renderCardExtra }: WorkGridProps) {
  const [yearFilter, setYearFilter] = useState("");
  const [sortBy, setSortBy] = useState<"manual" | "year_desc" | "year_asc" | "title_asc">("manual");
  const years = useMemo(() => {
    const set = new Set(items.map((i) => i.year).filter(Boolean));
    return Array.from(set).sort((a, b) => (b ?? "").localeCompare(a ?? ""));
  }, [items]);
  const filtered = useMemo(() => {
    if (!yearFilter) return items;
    return items.filter((i) => i.year === yearFilter);
  }, [items, yearFilter]);
  const ordered = useMemo(() => {
    if (sortBy === "manual") return filtered;
    const copy = [...filtered];
    if (sortBy === "title_asc") {
      copy.sort((a, b) => a.title.localeCompare(b.title));
      return copy;
    }
    if (sortBy === "year_asc") {
      copy.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
      return copy;
    }
    copy.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    return copy;
  }, [filtered, sortBy]);

  const isPlaceholder = items.length === 1 && items[0]?.slug === "coming-soon";

  return (
    <>
      {!isPlaceholder && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {years.length > 0 && (
            <>
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
            </>
          )}
          <span className="mx-1 text-white/35">|</span>
          <label className="text-xs text-white/60" htmlFor="work-sort">
            {locale === "es" ? "Ordenar" : "Sort"}
          </label>
          <select
            id="work-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "manual" | "year_desc" | "year_asc" | "title_asc")}
            className="rounded border border-white/20 bg-black px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="manual">{locale === "es" ? "Destacado" : "Featured"}</option>
            <option value="year_desc">{locale === "es" ? "Año (nuevo a viejo)" : "Year (newest first)"}</option>
            <option value="year_asc">{locale === "es" ? "Año (viejo a nuevo)" : "Year (oldest first)"}</option>
            <option value="title_asc">{locale === "es" ? "Título (A-Z)" : "Title (A-Z)"}</option>
          </select>
        </div>
      )}
      <ul className="mt-8 grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
        {ordered.map((item) => {
          const extra = renderCardExtra?.(item);
          return (
            <li key={item.slug} className="group bg-black">
              <WorkCard
                item={item}
                href={linkCards ? item.href : undefined}
                external={linkCards ? item.external : undefined}
                onVimeoClick={linkCards ? onVimeoClick : undefined}
                badge={extra?.badge}
                actions={extra?.actions}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
