"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const social = [
  { href: "https://www.instagram.com/polgold", label: "Instagram" },
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
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 px-5 py-8 md:flex-row md:px-8">
        <p className="font-body text-xs uppercase tracking-widest text-white/40">
          © {new Date().getFullYear()} Pablo Goldberg
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-8" aria-label="Redes sociales">
          {social.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              {label}
            </a>
          ))}
        </nav>
        <Link
          href={`/${locale}/contact`}
          className="font-body text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
        >
          {locale === "es" ? "Contacto" : "Contact"}
        </Link>
      </div>
    </footer>
  );
}
