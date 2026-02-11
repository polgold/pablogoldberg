"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
  const t = COPY[locale].nav;
  const otherLocale: Locale = locale === "es" ? "en" : "es";
  const switchHref = pathnameWithLocale(pathname, otherLocale);
  const isHomepage = pathname === `/${locale}`;
  const isTransparent = isHomepage && !isScrolled;

  const nav = [
    { href: `/${locale}/work`, label: t.work },
    { href: `/${locale}/gallery`, label: t.gallery },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/contact`, label: t.contact },
  ];

  const isActive = (href: string) => pathname === href || (href !== `/${locale}` && pathname.startsWith(href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        isTransparent ? "bg-transparent" : "border-b border-white/10 bg-black/80 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 md:px-8">
        <Link
          href={`/${locale}`}
          className={`text-base tracking-[0.18em] transition-colors md:text-lg ${
            isTransparent ? "text-white hover:text-white/80" : "text-foreground hover:text-foreground/80"
          } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-black`}
        >
          PABLO GOLDBERG
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative pb-1 text-sm tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-black ${
                isActive(href)
                  ? isTransparent
                    ? "text-white"
                    : "text-foreground"
                  : isTransparent
                    ? "text-white/75 hover:text-white"
                    : "text-foreground/75 hover:text-foreground"
              }`}
            >
              {label}
              {isActive(href) && (
                <span className={`absolute -bottom-0 left-0 h-px w-full ${isTransparent ? "bg-white" : "bg-foreground"}`} />
              )}
            </Link>
          ))}
          <span className={isTransparent ? "text-white/35" : "text-foreground/35"}>|</span>
          <Link
            href={switchHref}
            className={`text-xs tracking-[0.18em] ${
              isTransparent ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"
            } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-black`}
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
          >
            {locale === "es" ? "EN" : "ES"}
          </Link>
        </nav>

        <button
          type="button"
          className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded md:hidden ${
            isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-foreground/10"
          }`}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={locale === "es" ? "Abrir menú" : "Open menu"}
        >
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black/95 backdrop-blur-lg md:hidden">
          <nav className="flex flex-col gap-0 py-2" aria-label={locale === "es" ? "Menú móvil" : "Mobile menu"}>
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-5 py-3 text-sm tracking-wide ${
                  isActive(href) ? "text-white" : "text-white/80 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href={switchHref}
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-sm tracking-[0.18em] text-white/65 hover:text-white"
            >
              {locale === "es" ? "EN" : "ES"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
