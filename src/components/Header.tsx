"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/work", label: "Trabajo" },
  { href: "/about", label: "Sobre mí" },
  { href: "/contact", label: "Contacto / Booking", cta: true },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          PABLO GOLDBERG
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map(({ href, label, cta }) => (
            <Link
              key={href}
              href={href}
              className={
                cta
                  ? "rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand"
                  : pathname === href || (href !== "/" && pathname.startsWith(href))
                    ? "text-brand"
                    : "text-white/80 transition-colors hover:text-white"
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Abrir menú"
        >
          <span className="block h-0.5 w-5 bg-white" />
          <span className="mt-1 block h-0.5 w-5 bg-white" />
          <span className="mt-1 block h-0.5 w-5 bg-white" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Menú móvil">
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
          </nav>
        </div>
      )}
    </header>
  );
}
