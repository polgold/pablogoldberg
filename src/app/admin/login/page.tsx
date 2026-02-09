"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminBrowserClient } from "@/lib/supabase/admin-browser";

const CONFIG_ERROR =
  "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Configúralas en las variables de entorno del deploy (Netlify, Vercel, etc.) y vuelve a desplegar.";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const configured = Boolean(createAdminBrowserClient());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createAdminBrowserClient();
    if (!supabase) {
      setError(CONFIG_ERROR);
      setLoading(false);
      return;
    }
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold text-white">Admin – Login</h1>
      {!configured ? (
        <div className="rounded border border-amber-600/50 bg-amber-950/30 p-4 text-amber-200">
          <p className="text-sm font-medium">Configuración incompleta</p>
          <p className="mt-2 text-sm">{CONFIG_ERROR}</p>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-zinc-400">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      )}
      <p className="mt-4 text-xs text-zinc-500">
        Solo emails en la whitelist (ADMIN_EMAILS) pueden acceder.
      </p>
    </div>
  );
}
