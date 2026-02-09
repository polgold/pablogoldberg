import { notFound } from "next/navigation";
import { getProject, updateProject } from "../../actions";
import { ProjectForm } from "../ProjectForm";
import { CoverUpload } from "../CoverUpload";
import { GalleryUpload } from "../GalleryUpload";
import { BulkLoader } from "../BulkLoader";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  async function submit(formData: FormData) {
    "use server";
    await updateProject(id, formData);
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-white">Editar: {project.title}</h1>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-300">Datos</h2>
        <ProjectForm submit={submit} project={project} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-300">Portada</h2>
        <CoverUpload projectId={id} slug={project.slug} currentPath={project.cover_image_path} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-300">Galería (imágenes y videos)</h2>
        <GalleryUpload projectId={id} slug={project.slug} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-300">Bulk loader</h2>
        <BulkLoader projectId={id} slug={project.slug} />
      </section>
    </div>
  );
}
