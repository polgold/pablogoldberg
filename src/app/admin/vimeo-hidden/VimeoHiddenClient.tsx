"use client";

import { useState, useCallback, useEffect } from "react";
import { addHiddenVimeoId, removeHiddenVimeoId } from "../actions";
import { WorkGrid } from "@/components/WorkGrid";
import type { WorkItem } from "@/types/work";

interface VimeoHiddenClientProps {
  initialItems: WorkItem[];
  initialHiddenIds: string[];
}

export function VimeoHiddenClient({ initialItems, initialHiddenIds }: VimeoHiddenClientProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set(initialHiddenIds));
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<"Hidden" | "Unhidden" | null>(null);
  const [newId, setNewId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleHide = useCallback(async (vimeoId: string) => {
    setLoadingId(vimeoId);
    setAddError(null);
    setHiddenIds((prev) => new Set([...prev, vimeoId]));
    setToast("Hidden");
    const { error } = await addHiddenVimeoId(vimeoId);
    setLoadingId(null);
    if (error) {
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(vimeoId);
        return next;
      });
      setAddError(error);
    }
  }, []);

  const handleUnhide = useCallback(async (vimeoId: string) => {
    setLoadingId(vimeoId);
    setAddError(null);
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(vimeoId);
      return next;
    });
    setToast("Unhidden");
    const { error } = await removeHiddenVimeoId(vimeoId);
    setLoadingId(null);
    if (error) {
      setHiddenIds((prev) => new Set([...prev, vimeoId]));
      setAddError(error);
    }
  }, []);

  const handleAddById = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const id = newId.trim().replace(/\D/g, "");
      if (!id) return;
      setAddLoading(true);
      setAddError(null);
      const { error } = await addHiddenVimeoId(id);
      if (error) {
        setAddError(error);
      } else {
        setHiddenIds((prev) => (prev.has(id) ? prev : new Set([...prev, id])));
        setNewId("");
        setToast("Hidden");
      }
      setAddLoading(false);
    },
    [newId]
  );

  const renderCardExtra = useCallback(
    (item: WorkItem) => {
      const vimeoId = item.slug.startsWith("vimeo-") ? item.slug.replace("vimeo-", "") : "";
      const isHidden = vimeoId ? hiddenIds.has(vimeoId) : false;
      const loading = loadingId === vimeoId;

      return {
        badge: isHidden ? (
          <span className="absolute left-2 top-2 rounded bg-amber-600/90 px-2 py-0.5 text-[10px] font-medium uppercase text-white">
            Hidden
          </span>
        ) : vimeoId ? (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] text-white/80">
            ID: {vimeoId}
          </span>
        ) : undefined,
        actions: vimeoId ? (
          <button
            type="button"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isHidden) handleUnhide(vimeoId);
              else handleHide(vimeoId);
            }}
            className="rounded border border-white/30 bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            {isHidden ? "Unhide" : "Hide"}
          </button>
        ) : undefined,
      };
    },
    [hiddenIds, loadingId, handleHide, handleUnhide]
  );

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      {addError && (
        <p className="text-sm text-red-400">{addError}</p>
      )}

      {/* Add by ID — collapsed */}
      <details className="group">
        <summary className="cursor-pointer list-none text-sm text-zinc-500 hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1">
            <span className="transition group-open:rotate-90">▶</span> Añadir por ID (ocultar sin estar en la lista)
          </span>
        </summary>
        <form onSubmit={handleAddById} className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="ID (ej. 884669410)"
            className="w-36 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={addLoading}
            className="rounded bg-amber-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            Ocultar
          </button>
        </form>
      </details>

      {/* Grid — same as /en/work */}
      <div className="min-h-[200px] border-t border-zinc-800 pt-6">
        {initialItems.length === 0 ? (
          <p className="text-zinc-500">No hay videos en el portfolio Vimeo. Revisa VIMEO_ACCESS_TOKEN.</p>
        ) : (
          <WorkGrid
            items={initialItems}
            locale="en"
            linkCards={false}
            renderCardExtra={renderCardExtra}
          />
        )}
      </div>
    </div>
  );
}