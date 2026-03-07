import Link from "next/link";
import { createFilm } from "../../admin-actions";
import { FilmForm } from "../FilmForm";

export const dynamic = "force-dynamic";

export default function NewFilmPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/films" className="text-sm text-zinc-400 hover:text-white">
        ← Films
      </Link>
      <h1 className="text-2xl font-semibold text-white">Nuevo film</h1>
      <FilmForm action={createFilm} film={null} />
    </div>
  );
}
