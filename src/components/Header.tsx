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
    { href: `/${locale}/work`, label: t.work },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/contact`, label: t.contact },
  ];

  const isActive = (href: string) => pathname === href || (href !== `/${locale}` && pathname.startsWith(href));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 md:px-8">
        <Link
          href={`/${locale}`}
          className="font-display text-lg tracking-[0.15em] text-white transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
        >
          PABLO GOLDBERG
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Principal">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-body text-[13px] uppercase tracking-[0.2em] transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black ${
                isActive(href) ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="text-white/30">|</span>
          <Link
            href={switchHref}
            className="font-body text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
          >
            {locale === "es" ? "EN" : "ES"}
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={locale === "es" ? "Abrir menú" : "Open menu"}
        >
          <span className="block h-px w-5 bg-white" />
          <span className="block h-px w-5 bg-white" />
          <span className="block h-px w-5 bg-white" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-black md:hidden">
          <nav className="flex flex-col gap-0 py-2" aria-label={locale === "es" ? "Menú móvil" : "Mobile menu"}>
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-5 py-3 font-body text-sm uppercase tracking-widest ${
                  isActive(href) ? "text-white" : "text-white/80"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link href={switchHref} onClick={() => setOpen(false)} className="px-5 py-3 font-body text-sm text-white/60">
              {locale === "es" ? "EN" : "ES"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
