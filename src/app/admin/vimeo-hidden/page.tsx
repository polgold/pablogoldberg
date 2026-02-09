import Link from "next/link";
import { getVimeoPortfolioVideosAll } from "@/lib/vimeo";
import { listHiddenVimeoIds, listCustomVimeoIds } from "../actions";
import { VimeoHiddenClient } from "./VimeoHiddenClient";
import type { WorkItem } from "@/types/work";

export const dynamic = "force-dynamic";

/** Year from Vimeo release_time (e.g. "2024-01-15T..." -> "2024"). */
function yearFromReleaseTime(releaseTime: string): string {
  if (!releaseTime || releaseTime.length < 4) return "";
  return releaseTime.slice(0, 4);
}

export default async function VimeoHiddenPage() {
  const [videos, hiddenIds, customIds] = await Promise.all([
    getVimeoPortfolioVideosAll(),
    listHiddenVimeoIds(),
    listCustomVimeoIds(),
  ]);

  const items: WorkItem[] = videos.map((v) => ({
    slug: `vimeo-${v.id}`,
    title: v.name,
    year: yearFromReleaseTime(v.releaseTime) || undefined,
    featuredImage: v.thumbnail || undefined,
    href: v.link,
    external: true,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin" className="text-zinc-400 hover:text-white">
          ← Proyectos
        </Link>
        <h1 className="text-2xl font-semibold text-white">Videos Vimeo ocultos</h1>
      </div>
      <p className="mb-4 text-sm text-zinc-400">
        Misma lista que en /work. Oculta o muestra videos. Agregá por ID para que aparezca en /work aunque no esté en los 60.
      </p>
      <VimeoHiddenClient
        initialItems={items}
        initialHiddenIds={hiddenIds}
        initialCustomIds={customIds}
      />
    </div>
  );
}
