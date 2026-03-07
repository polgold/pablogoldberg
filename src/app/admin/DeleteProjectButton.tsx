"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAdminProject, deleteFilm } from "./admin-actions";

export function DeleteProjectButton({
  resourceType,
  resourceId,
  resourceTitle,
}: {
  resourceType: "project" | "film";
  resourceId: string;
  resourceTitle: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    if (!confirm(`¿Eliminar "${resourceTitle}"? No se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const deleteAction = resourceType === "project" ? deleteAdminProject : deleteFilm;
      const { error } = await deleteAction(resourceId);
      if (error) throw new Error(error);
      router.push(resourceType === "project" ? "/admin" : "/admin/films");
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
