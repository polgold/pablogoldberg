"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  galleryRebuild,
  galleryUploadFiles,
  galleryReorderItems,
  galleryItemSetVisible,
  galleryItemSetFeatured,
  galleryItemUpdateAlt,
  galleryItemDelete,
} from "@/app/admin/galleries/actions";
import type { GalleryItemWithUrl } from "@/lib/galleries/urls";

export function GalleryDetailClient({
  galleryId,
  initialItems,
}: {
  galleryId: number;
  section: string;
  slug: string;
  initialItems: GalleryItemWithUrl[];
}) {
  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editingAlt, setEditingAlt] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      await galleryReorderItems(galleryId, reordered.map((i) => i.id));
      setMessage({ type: "ok", text: "Orden guardado" });
      setTimeout(() => setMessage(null), 2000);
    },
    [galleryId, items]
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      setUploading(true);
      setMessage(null);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
      try {
        const result = await galleryUploadFiles(galleryId, formData);
        setMessage(
          result.errors.length
            ? { type: "err", text: `Añadidas: ${result.added}. Errores: ${result.errors.length}` }
            : { type: "ok", text: `Añadidas ${result.added} imagen(es)` }
        );
        window.location.reload();
      } catch (err) {
        setMessage({ type: "err", text: String(err) });
      } finally {
        setUploading(false);
      }
    },
    [galleryId]
  );

  const handleDropZone = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (!files?.length) return;
      setUploading(true);
      setMessage(null);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) formData.append("files", files[i]);
      }
      try {
        const result = await galleryUploadFiles(galleryId, formData);
        setMessage(
          result.errors.length
            ? { type: "err", text: `Añadidas: ${result.added}. Errores: ${result.errors.length}` }
            : { type: "ok", text: `Añadidas ${result.added} imagen(es)` }
        );
        window.location.reload();
      } catch (err) {
        setMessage({ type: "err", text: String(err) });
      } finally {
        setUploading(false);
      }
    },
    [galleryId]
  );

  const handleRebuild = useCallback(async () => {
    setRebuilding(true);
    setMessage(null);
    try {
      const result = await galleryRebuild(galleryId);
      setMessage({
        type: "ok",
        text: `Reconstruido: +${result.added} nuevas, ${result.thumbRegenerated} thumbs regenerados`,
      });
      window.location.reload();
    } catch (err) {
      setMessage({ type: "err", text: String(err) });
    } finally {
      setRebuilding(false);
    }
  }, [galleryId]);

  const toggleVisible = useCallback(
    async (itemId: number, current: number) => {
      await galleryItemSetVisible(itemId, current !== 1);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_visible: i.is_visible ? 0 : 1 } : i))
      );
    },
    []
  );

  const toggleFeatured = useCallback(
    async (itemId: number, current: number) => {
      await galleryItemSetFeatured(itemId, current !== 1);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_featured_home: i.is_featured_home ? 0 : 1 } : i))
      );
    },
    []
  );

  const deleteItem = useCallback(async (itemId: number) => {
    if (!confirm("¿Borrar esta imagen de la galería?")) return;
    await galleryItemDelete(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const saveAlt = useCallback(async (itemId: number, value: string) => {
    await galleryItemUpdateAlt(itemId, value || null);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, alt_text: value || null } : i))
    );
    setEditingAlt(null);
  }, []);

  return (
    <div className="space-y-6">
      {message && (
        <p
          className={
            message.type === "ok"
              ? "rounded bg-emerald-900/50 px-3 py-2 text-sm text-emerald-200"
              : "rounded bg-red-900/50 px-3 py-2 text-sm text-red-200"
          }
        >
          {message.text}
        </p>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropZone}
        className="rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900/50 p-8 text-center transition hover:border-amber-500/50"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className="cursor-pointer text-zinc-400 hover:text-white"
        >
          {uploading ? (
            "Subiendo…"
          ) : (
            <>
              Arrastrá imágenes aquí o <span className="text-amber-500 underline">elegí archivos</span>
            </>
          )}
        </label>
        <p className="mt-1 text-xs text-zinc-500">
          Múltiples archivos. Se renombrarán y comprimirán automáticamente.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleRebuild}
          disabled={rebuilding}
          className="rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        >
          {rebuilding ? "Reconstruyendo…" : "Reconstruir desde disco"}
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-zinc-400">
          Imágenes ({items.length}) — arrastrá para reordenar
        </h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {items.map((item) => (
                <SortableGalleryItem
                  key={item.id}
                  item={item}
                  onToggleVisible={() => toggleVisible(item.id, item.is_visible)}
                  onToggleFeatured={() => toggleFeatured(item.id, item.is_featured_home)}
                  onDelete={() => deleteItem(item.id)}
                  onEditAlt={() => setEditingAlt(item.id)}
                  onSaveAlt={(val) => { saveAlt(item.id, val); setEditingAlt(null); }}
                  onCloseAlt={() => setEditingAlt(null)}
                  editingAlt={editingAlt === item.id}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function AltEditOverlay({
  initialValue,
  onSave,
  onClose,
}: {
  initialValue: string;
  onSave: (val: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-2">
      <div className="w-full space-y-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Alt text"
          className="w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-white"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(value);
            if (e.key === "Escape") onClose();
          }}
          autoFocus
        />
        <div className="flex gap-1">
          <button type="button" onClick={() => onSave(value)} className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
            Guardar
          </button>
          <button type="button" onClick={onClose} className="rounded bg-zinc-600 px-2 py-1 text-xs text-white">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableGalleryItem({
  item,
  onToggleVisible,
  onToggleFeatured,
  onDelete,
  onEditAlt,
  onSaveAlt,
  onCloseAlt,
  editingAlt,
}: {
  item: GalleryItemWithUrl;
  onToggleVisible: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  onEditAlt: () => void;
  onSaveAlt: (val: string) => void;
  onCloseAlt: () => void;
  editingAlt: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-lg border bg-zinc-900 ${
        isDragging ? "z-10 opacity-90 ring-2 ring-amber-500" : "border-zinc-700"
      } ${item.is_visible ? "" : "opacity-60"}`}
    >
      <div className="aspect-square" {...attributes} {...listeners}>
        <img
          src={item.thumbUrl}
          alt={item.alt_text ?? ""}
          className="h-full w-full cursor-grab object-cover active:cursor-grabbing"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-black/70 p-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
          title={item.is_visible ? "Ocultar" : "Mostrar"}
          className="rounded bg-zinc-700 p-1 text-xs text-white hover:bg-zinc-600"
        >
          {item.is_visible ? "👁" : "👁‍🗨"}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }}
          title={item.is_featured_home ? "Quitar de home" : "Destacar en home"}
          className={`rounded p-1 text-xs ${item.is_featured_home ? "bg-amber-600 text-white" : "bg-zinc-700 text-white hover:bg-zinc-600"}`}
        >
          ★
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEditAlt(); }}
          title="Alt text"
          className="rounded bg-zinc-700 p-1 text-xs text-white hover:bg-zinc-600"
        >
          A
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Borrar"
          className="rounded bg-red-900/70 p-1 text-xs text-white hover:bg-red-800"
        >
          ×
        </button>
      </div>
      {editingAlt && (
        <AltEditOverlay
          initialValue={item.alt_text ?? ""}
          onSave={onSaveAlt}
          onClose={onCloseAlt}
        />
      )}
    </li>
  );
}
