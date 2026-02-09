import Link from "next/link";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <h1 className="text-2xl font-semibold text-white">404</h1>
      <p className="mt-2 text-white/70">Página no encontrada.</p>
      <Link
        href="/es"
        className="mt-6 text-sm text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black rounded"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
