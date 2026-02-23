"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { listFeaturedProjectsForOrder, updateProjectsOrder, type FeaturedProjectForOrder } from "../actions";

export function FeaturedOrderClient({ initialProjects }: { initialProjects: FeaturedProjectForOrder[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= projects.length) return;
      const next = [...projects];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      setProjects(next.map((p, i) => ({ ...p, order: i })));
      setSaving(true);
      updateProjectsOrder(next.map((p, i) => ({ id: p.id, order: i })))
        .then(({ error }) => {
          setSaving(false);
          if (error) setToast(error);
          else setToast("Orden guardado");
        })
        .finally(() => {
          setTimeout(() => setToast(null), 2000);
        });
    },
    [projects]
  );

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDraggedId(null);
      setDragOverId(null);
      const fromId = e.dataTransfer.getData("text/plain");
      if (!fromId || fromId === targetId) return;
      const fromIndex = projects.findIndex((p) => p.id === fromId);
      const toIndex = projects.findIndex((p) => p.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      moveItem(fromIndex, toIndex);
    },
    [projects, moveItem]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  if (projects.length === 0) {
    return (
      <p className="rounded border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-500">
        No hay proyectos destacados. Marcá &quot;Destacado&quot; en los proyectos que quieras mostrar primero.
      </p>
    );
  }

  return (
    <div>
      {toast && <p className="mb-4 text-sm text-amber-400">{toast}</p>}
      {saving && <p className="mb-2 text-xs text-zinc-500">Guardando orden…</p>}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {projects.map((p) => (
          <li
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p.id)}
            onDragOver={(e) => handleDragOver(e, p.id)}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, p.id)}
            onDragEnd={handleDragEnd}
            className={`cursor-grab rounded border bg-zinc-900 transition-opacity active:cursor-grabbing ${
              draggedId === p.id ? "opacity-50" : ""
            } ${dragOverId === p.id ? "ring-2 ring-amber-500" : "border-zinc-800"}`}
          >
            <div className="relative aspect-video bg-zinc-800">
              {p.coverUrl ? (
                <Image
                  src={p.coverUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 20vw"
                  unoptimized={p.coverUrl.includes("supabase")}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-500">Sin portada</div>
              )}
              <div className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-zinc-300">
                ⋮⋮
              </div>
            </div>
            <p className="truncate p-2 text-sm font-medium text-white" title={p.title}>
              {p.title}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-zinc-500">Arrastrá las tarjetas para cambiar el orden. Se guarda automáticamente. / Drag to reorder. Saves automatically.</p>
    </div>
  );
}
