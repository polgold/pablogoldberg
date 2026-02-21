"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePageContent } from "../actions";

type Props = {
  slug: string;
  initial: {
    es: { title: string; content: string } | null;
    en: { title: string; content: string } | null;
  };
};

export function PageEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [esTitle, setEsTitle] = useState(initial.es?.title ?? "");
  const [esContent, setEsContent] = useState(initial.es?.content ?? "");
  const [enTitle, setEnTitle] = useState(initial.en?.title ?? "");
  const [enContent, setEnContent] = useState(initial.en?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    const result = await updatePageContent(slug, {
      es: { title: esTitle, content: esContent },
      en: { title: enTitle, content: enContent },
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  const inputClass =
    "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      {success && (
        <p className="rounded bg-emerald-900/40 px-3 py-2 text-sm text-emerald-300">
          Guardado correctamente.
        </p>
      )}

      <div className="space-y-6 rounded border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-medium text-white">Español</h2>
        <div>
          <label htmlFor="es-title" className={labelClass}>
            Título (ES)
          </label>
          <input
            id="es-title"
            type="text"
            value={esTitle}
            onChange={(e) => setEsTitle(e.target.value)}
            className={inputClass}
            placeholder="ej. Sobre mí"
          />
        </div>
        <div>
          <label htmlFor="es-content" className={labelClass}>
            Contenido (HTML)
          </label>
          <textarea
            id="es-content"
            value={esContent}
            onChange={(e) => setEsContent(e.target.value)}
            rows={14}
            className={`${inputClass} font-mono text-sm`}
            placeholder="<p>Párrafo...</p>"
          />
        </div>
      </div>

      <div className="space-y-6 rounded border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-medium text-white">English</h2>
        <div>
          <label htmlFor="en-title" className={labelClass}>
            Title (EN)
          </label>
          <input
            id="en-title"
            type="text"
            value={enTitle}
            onChange={(e) => setEnTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. About"
          />
        </div>
        <div>
          <label htmlFor="en-content" className={labelClass}>
            Content (HTML)
          </label>
          <textarea
            id="en-content"
            value={enContent}
            onChange={(e) => setEnContent(e.target.value)}
            rows={14}
            className={`${inputClass} font-mono text-sm`}
            placeholder="<p>Paragraph...</p>"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar"}
        </button>
        <a
          href={`/es/about`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 hover:text-white"
        >
          Ver página (ES) →
        </a>
        <a
          href={`/en/about`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 hover:text-white"
        >
          Ver página (EN) →
        </a>
      </div>
    </form>
  );
}
