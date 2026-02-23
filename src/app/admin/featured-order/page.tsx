import Link from "next/link";
import { listFeaturedProjectsForOrder } from "../actions";
import { FeaturedOrderClient } from "./FeaturedOrderClient";

export const dynamic = "force-dynamic";

export default async function FeaturedOrderPage() {
  const projects = await listFeaturedProjectsForOrder();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin" className="text-zinc-400 hover:text-white">
          ← Proyectos
        </Link>
        <h1 className="text-2xl font-semibold text-white">Orden de destacados / Featured order</h1>
      </div>
      <p className="mb-4 text-sm text-zinc-400">
        Ordená los proyectos que aparecen en &quot;Trabajos destacados&quot; en /work y en la home. Arrastrá para cambiar la posición. / Order the projects shown in &quot;Featured work&quot; on /work and home. Drag to reorder.
      </p>
      <FeaturedOrderClient initialProjects={projects} />
    </div>
  );
}
