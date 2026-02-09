"use client";

import { useMemo, useState } from "react";
import type { WorkItem } from "@/types/work";
import { WorkCard } from "./WorkCard";

export interface WorkGridProps {
  items: WorkItem[];
  locale: string;
  /** If true, cards are links (public work). If false, cards are divs (admin). */
  linkCards?: boolean;
  /** Optional extra per card (badge + actions) for admin. */
  renderCardExtra?: (item: WorkItem) => { badge?: React.ReactNode; actions?: React.ReactNode };
}

export function WorkGrid({ items, locale, linkCards = true, renderCardExtra }: WorkGridProps) {
  const [yearFilter, setYearFilter] = useState("");
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
          const extra = renderCardExtra?.(item);
          return (
            <li key={item.slug} className="group bg-black">
              <WorkCard
                item={item}
                href={linkCards ? item.href : undefined}
                external={linkCards ? item.external : undefined}
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
