"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAdminBrowserClient } from "@/lib/supabase/admin-browser";

export default function AdminUnauthorizedPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createAdminBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="mx-auto max-w-md rounded border border-red-900/50 bg-red-950/30 p-6">
      <h1 className="mb-4 text-xl font-semibold text-red-400">No autorizado</h1>
      <p className="mb-4 text-zinc-400">
        Tu email no está en la lista de administradores (ADMIN_EMAILS). No puedes acceder al panel.
      </p>
      <button
        onClick={handleLogout}
        className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
