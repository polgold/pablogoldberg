import { notFound } from "next/navigation";
import { getProject } from "../../actions";
import { PortfolioEditor } from "../PortfolioEditor";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Editar: {project.title}</h1>
      <PortfolioEditor project={project} submitLabel="Guardar" />
    </div>
  );
}
