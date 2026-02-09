import { redirect } from "next/navigation";
import { createProject } from "../../actions";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  async function submit(formData: FormData) {
    "use server";
    const result = await createProject(formData);
    if (result.error) throw new Error(result.error);
    if (result.id) redirect(`/admin/projects/${result.id}`);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Nuevo proyecto</h1>
      <ProjectForm submit={submit} project={null} />
    </div>
  );
}
