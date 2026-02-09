import Link from "next/link";
import { listHiddenVimeoIds } from "../actions";
import { VimeoHiddenClient } from "./VimeoHiddenClient";

export const dynamic = "force-dynamic";

export default async function VimeoHiddenPage() {
  const hiddenIds = await listHiddenVimeoIds();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin" className="text-zinc-400 hover:text-white">
          ← Proyectos
        </Link>
        <h1 className="text-2xl font-semibold text-white">Videos Vimeo ocultos</h1>
      </div>
      <p className="mb-4 text-sm text-zinc-400">
        Los IDs que agregues aquí no se mostrarán en la página Portfolio (vimeo.com/sunfactory).
      </p>
      <VimeoHiddenClient initialIds={hiddenIds} />
    </div>
  );
}
