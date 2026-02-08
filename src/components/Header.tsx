"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { COPY } from "@/lib/i18n";
import type { Locale } from "@/lib/content";

function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "en") return "en";
  return "es";
}

function pathnameWithLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "es" || segments[0] === "en") {
    segments[0] = locale;
    return "/" + segments.join("/");
  }
  return locale === "es" ? "/es" : "/en";
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
  const t = COPY[locale].nav;
  const otherLocale: Locale = locale === "es" ? "en" : "es";
  const switchHref = pathnameWithLocale(pathname, otherLocale);

  const nav = [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/work`, label: t.work },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/contact`, label: t.contact, cta: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          PABLO GOLDBERG
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {nav.map(({ href, label, cta }) => (
            <Link
              key={href}
              href={href}
              className={
                cta
                  ? "rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand"
                  : pathname === href || (href !== `/${locale}` && pathname.startsWith(href))
                    ? "text-brand"
                    : "text-white/80 transition-colors hover:text-white"
              }
            >
              {label}
            </Link>
          ))}
          <span className="text-white/40">|</span>
          <Link
            href={switchHref}
            className="text-sm font-medium text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand"
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
          >
            {locale === "es" ? "EN" : "ES"}
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={locale === "es" ? "Abrir menú" : "Open menu"}
        >
          <span className="block h-0.5 w-5 bg-white" />
          <span className="mt-1 block h-0.5 w-5 bg-white" />
          <span className="mt-1 block h-0.5 w-5 bg-white" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2" aria-label={locale === "es" ? "Menú móvil" : "Mobile menu"}>
            {nav.map(({ href, label, cta }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={
                  cta
                    ? "rounded bg-brand px-4 py-3 text-center font-medium text-white"
                    : "py-2 text-white/90"
                }
              >
                {label}
              </Link>
            ))}
            <Link
              href={switchHref}
              onClick={() => setOpen(false)}
              className="py-2 text-brand"
            >
              {locale === "es" ? "EN — English" : "ES — Español"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
