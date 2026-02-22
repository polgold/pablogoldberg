"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject } from "./actions";

export function DeleteProjectButton({ projectId, title }: { projectId: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    if (!confirm(`¿Eliminar "${title}"? No se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const { error } = await deleteProject(projectId);
      if (error) throw new Error(error);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={deleting}
      className="ml-3 text-red-400 hover:text-red-300 hover:underline disabled:opacity-50"
    >
      {deleting ? "…" : "Eliminar"}
    </button>
  );
}
