"use client";

import { useState } from "react";
import { addHiddenVimeoId, removeHiddenVimeoId } from "../actions";

export function VimeoHiddenClient({ initialIds }: { initialIds: string[] }) {
  const [ids, setIds] = useState<string[]>(initialIds);
  const [newId, setNewId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const id = newId.trim().replace(/\D/g, "");
    if (!id) return;
    setLoading(true);
    setMessage(null);
    const { error } = await addHiddenVimeoId(id);
    if (error) {
      setMessage(error);
    } else {
      setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setNewId("");
    }
    setLoading(false);
  }

  async function handleRemove(vimeoId: string) {
    setLoading(true);
    setMessage(null);
    const { error } = await removeHiddenVimeoId(vimeoId);
    if (error) setMessage(error);
    else setIds((prev) => prev.filter((x) => x !== vimeoId));
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="ID de video (ej. 884669410)"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 w-48"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          Ocultar
        </button>
      </form>
      {message && <p className="text-sm text-red-400">{message}</p>}
      <ul className="space-y-2">
        {ids.length === 0 ? (
          <li className="text-zinc-500">Ningún video oculto.</li>
        ) : (
          ids.map((id) => (
            <li key={id} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-4 py-2">
              <span className="font-mono text-sm text-white">{id}</span>
              <button
                type="button"
                onClick={() => handleRemove(id)}
                disabled={loading}
                className="text-sm text-zinc-400 hover:text-white disabled:opacity-50"
              >
                Mostrar de nuevo
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
