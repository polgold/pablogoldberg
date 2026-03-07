import Link from "next/link";
import { notFound } from "next/navigation";
import { getFilm } from "../../admin-actions";
import { FilmForm } from "../FilmForm";
import { DeleteProjectButton } from "../../DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function FilmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fullFilm = await getFilm(id);
  if (!fullFilm) notFound();

  return (
    <div className="space-y-10">
      <Link href="/admin/films" className="text-sm text-zinc-400 hover:text-white">
        ← Films
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">{fullFilm.title}</h1>
        <DeleteProjectButton
          resourceType="film"
          resourceId={id}
          resourceTitle={fullFilm.title}
        />
      </div>

      <FilmForm filmId={id} film={fullFilm} />
    </div>
  );
}
