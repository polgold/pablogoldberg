import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProject } from "../../admin-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProjectForm } from "../ProjectForm";
import { updateAdminProject, deleteAdminProject } from "../../admin-actions";
import { GalleryEditor } from "../GalleryEditor";
import { ProjectVideosEditor } from "../ProjectVideosEditor";
import { DeleteProjectButton } from "../../DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getAdminProject(id);
  if (!project) notFound();

  const supabase = createSupabaseServerClient();
  let gallery: { id: string; path: string; thumb_path: string; is_cover: boolean; sort_order: number; hidden: boolean }[] = [];
  let videos: { id: string; platform: string; video_id: string; url: string | null; sort_order: number }[] = [];
  if (supabase) {
    const [gRes, vRes] = await Promise.all([
      supabase.from("project_gallery_images").select("*").eq("project_id", id).order("sort_order"),
      supabase.from("project_videos").select("*").eq("project_id", id).order("sort_order"),
    ]);
    gallery = (gRes.data ?? []) as typeof gallery;
    videos = (vRes.data ?? []) as typeof videos;
  }

  return (
    <div className="space-y-10">
      <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">
        ← Proyectos
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-white">{project.title_es}</h1>
          <p className="text-zinc-500">/{project.slug}</p>
        </div>
        <DeleteProjectButton projectId={id} projectTitle={project.title_es} deleteAction={deleteAdminProject} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Datos del proyecto</h2>
        <ProjectForm action={(fd) => updateAdminProject(id, fd)} project={project} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Galería</h2>
        <GalleryEditor
          projectId={id}
          slug={project.slug}
          images={gallery}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Videos adicionales (Vimeo/YouTube)</h2>
        <ProjectVideosEditor projectId={id} videos={videos} />
      </section>
    </div>
  );
}
