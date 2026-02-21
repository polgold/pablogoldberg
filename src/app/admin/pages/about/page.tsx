import Link from "next/link";
import { getPageContentForAdmin } from "../../actions";
import { PageEditor } from "../PageEditor";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const content = await getPageContentForAdmin("about");

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/pages" className="text-zinc-400 hover:text-white">
          ← Páginas
        </Link>
        <h1 className="text-2xl font-semibold text-white">About / Bio</h1>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        El contenido que guardes aquí se muestra en /es/about y /en/about. Puedes usar HTML (p, a, etc.).
      </p>
      <PageEditor
        slug="about"
        initial={{
          es: content.es ?? { title: "Sobre mí", content: "" },
          en: content.en ?? { title: "About", content: "" },
        }}
      />
    </div>
  );
}
