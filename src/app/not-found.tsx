import { headers } from "next/headers";
import Link from "next/link";

export const metadata = {
  title: "Página no encontrada | Page not found",
  robots: { index: false, follow: true },
};

function detectLocale(acceptLanguage: string | null): "es" | "en" {
  if (!acceptLanguage) return "es";
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("en") ? "en" : "es";
}

const COPY_404 = {
  es: { message: "Página no encontrada.", link: "Volver al inicio" },
  en: { message: "Page not found.", link: "Back to home" },
};

export default async function NotFound() {
  const headersList = await headers();
  const locale = detectLocale(headersList.get("accept-language"));
  const t = COPY_404[locale];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <h1 className="text-2xl font-semibold text-white">404</h1>
      <p className="mt-2 text-white/70">{t.message}</p>
      <Link
        href={`/${locale}`}
        className="mt-6 text-sm text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black rounded"
      >
        {t.link}
      </Link>
    </div>
  );
}
