import Link from "next/link";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="font-medium text-white hover:underline">
            Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-zinc-400 hover:text-white">
              Proyectos
            </Link>
            <Link
              href="/admin/projects/new"
              className="text-zinc-400 hover:text-white"
            >
              Nuevo proyecto
            </Link>
            <Link
              href="/admin/portfolio-photos"
              className="text-zinc-400 hover:text-white"
            >
              Portfolio Photos
            </Link>
            <Link
              href="/admin/pages"
              className="text-zinc-400 hover:text-white"
            >
              Páginas
            </Link>
            <form action={logout} className="inline">
              <button type="submit" className="text-zinc-400 hover:text-white">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
