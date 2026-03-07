"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProjectButton({
  projectId,
  projectTitle,
  deleteAction,
}: {
  projectId: string;
  projectTitle: string;
  deleteAction: (id: string) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    if (!confirm(`¿Eliminar "${projectTitle}"? No se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const { error } = await deleteAction(projectId);
      if (error) throw new Error(error);
      router.push("/admin");
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
      className="rounded border border-red-600/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/30 disabled:opacity-50"
    >
      {deleting ? "…" : "Eliminar proyecto"}
    </button>
  );
}
