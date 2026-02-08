"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const social = [
  { href: "https://www.instagram.com/polgold", label: "Instagram" },
  { href: "https://www.facebook.com/pablogoldberg", label: "Facebook" },
  { href: "https://www.youtube.com/sunfactoryfilms", label: "YouTube" },
  { href: "https://vimeo.com/sunfactory", label: "Vimeo" },
  { href: "https://wa.me/5491136511204", label: "WhatsApp" },
];

function getLocaleFromPathname(pathname: string): "es" | "en" {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "en" ? "en" : "es";
}

export function Footer() {
  const pathname = usePathname();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  return (
    <footer className="border-t border-white/10 bg-surface-light">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-white/60">© {new Date().getFullYear()} Pablo Goldberg</p>
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Redes sociales">
            {social.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/70 transition-colors hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
              >
                {label}
              </a>
            ))}
          </nav>
          <Link
            href={`/${locale}/contact`}
            className="text-sm font-medium text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
          >
            {locale === "es" ? "Contacto" : "Contact"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
