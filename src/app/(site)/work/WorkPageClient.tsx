"use client";

import type { WorkItem } from "@/types/work";
import { WorkGrid } from "@/components/WorkGrid";

interface WorkPageClientProps {
  items: WorkItem[];
  locale: string;
}

export function WorkPageClient({ items, locale }: WorkPageClientProps) {
  return <WorkGrid items={items} locale={locale} linkCards />;
}
