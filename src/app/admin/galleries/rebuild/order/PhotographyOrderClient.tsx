"use client";

import { useState, useCallback, useEffect } from "react";
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
  orderGetCategoryPhotos,
  orderSaveCategoriesOrder,
  orderSaveCategoryPhotoOrder,
} from "../actions";

const UPLOADS_BASE = "/uploads/work/photography";

export function PhotographyOrderClient({
  initialCategories,
}: {
  initialCategories: string[];
}) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategories[0] ?? null
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadPhotos = useCallback(async (category: string) => {
    setLoadingPhotos(true);
    try {
      const list = await orderGetCategoryPhotos(category);
      setPhotos(list);
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) loadPhotos(selectedCategory);
    else setPhotos([]);
  }, [selectedCategory, loadPhotos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCategoriesDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = categories.findIndex((c) => c === active.id);
      const newIndex = categories.findIndex((c) => c === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = arrayMove(categories, oldIndex, newIndex);
      setCategories(next);
      setSavingCategories(true);
      setMessage(null);
      try {
        await orderSaveCategoriesOrder(next);
        setMessage({ type: "ok", text: "Orden de categorías guardado" });
      } catch {
        setMessage({ type: "err", text: "Error al guardar" });
      } finally {
        setSavingCategories(false);
      }
    },
    [categories]
  );

  const handlePhotosDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !selectedCategory) return;
      const oldIndex = photos.findIndex((p) => p === active.id);
      const newIndex = photos.findIndex((p) => p === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = arrayMove(photos, oldIndex, newIndex);
      setPhotos(next);
      setSavingPhotos(true);
      setMessage(null);
      try {
        await orderSaveCategoryPhotoOrder(selectedCategory, next);
        setMessage({ type: "ok", text: "Orden de fotos guardado" });
      } catch {
        setMessage({ type: "err", text: "Error al guardar" });
      } finally {
        setSavingPhotos(false);
      }
    },
    [photos, selectedCategory]
  );

  return (
    <div className="space-y-10">
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

      {/* Orden de categorías */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Orden de categorías (pestañas en /photography)
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          Arrastrá los títulos para cambiar el orden. Se guarda al soltar.
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCategoriesDragEnd}
        >
          <SortableContext
            items={categories}
            strategy={rectSortingStrategy}
          >
            <ul className="flex flex-wrap gap-2">
              {categories.map((slug) => (
                <SortableCategoryPill
                  key={slug}
                  slug={slug}
                  isSelected={selectedCategory === slug}
                  onSelect={() => setSelectedCategory(slug)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        {savingCategories && (
          <p className="mt-2 text-xs text-amber-200/80">Guardando…</p>
        )}
      </section>

      {/* Fotos en la categoría seleccionada */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Fotos en la galería
        </h2>
        {!selectedCategory ? (
          <p className="text-sm text-zinc-500">Elegí una categoría arriba.</p>
        ) : (
          <>
            <p className="mb-4 text-xs text-zinc-500">
              Categoría: <strong className="text-zinc-300">{selectedCategory}</strong>.
              Arrastrá las imágenes para reordenar. Se guarda al soltar.
            </p>
            {loadingPhotos ? (
              <p className="text-sm text-zinc-500">Cargando fotos…</p>
            ) : photos.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay imágenes en esta categoría.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePhotosDragEnd}
              >
                <SortableContext
                  items={photos}
                  strategy={rectSortingStrategy}
                >
                  <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                    {photos.map((filename) => (
                      <SortablePhotoThumb
                            key={filename}
                            filename={filename}
                            category={selectedCategory}
                          />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
            {savingPhotos && (
              <p className="mt-2 text-xs text-amber-200/80">Guardando…</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function SortableCategoryPill({
  slug,
  isSelected,
  onSelect,
}: {
  slug: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        isDragging
          ? "z-10 cursor-grabbing border-amber-500 bg-amber-900/40 text-white shadow-lg"
          : isSelected
            ? "border-amber-500 bg-amber-900/30 text-amber-100"
            : "cursor-grab border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
      }`}
    >
      <span
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.preventDefault();
          onSelect();
        }}
        className="block touch-none"
      >
        {title}
      </span>
    </li>
  );
}

function SortablePhotoThumb({
  filename,
  category,
}: {
  filename: string;
  category: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filename });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const thumbUrl = `${UPLOADS_BASE}/${category}/thumb/${filename}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-lg border bg-zinc-800 ${
        isDragging ? "z-10 ring-2 ring-amber-500 opacity-90" : "border-zinc-700"
      }`}
    >
      <div
        className="aspect-square cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <img
          src={thumbUrl}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
      <p className="truncate px-1 py-0.5 text-xs text-zinc-500" title={filename}>
        {filename}
      </p>
    </li>
  );
}
