"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// Enlaces según https://linktr.ee/pablogoldberg (Email, YouTube, X, LinkedIn, Spotify, Website, BESTEFAR/bestefarmovie.com, IMDb, Facebook, Vimeo)
const LINKTREE_URL = "https://linktr.ee/pablogoldberg";
const SUNFACTORY_URL = "https://www.sunfactory.com.ar";
const SUNFACTORY_LOGO = "/images/sunfactory-logo.svg";

const social = [
  { href: LINKTREE_URL, label: "Links", Icon: LinksIcon },
  { href: "https://vimeo.com/sunfactory", label: "Vimeo", Icon: VimeoIcon },
  { href: "https://bestefarmovie.com", label: "BESTEFAR", Icon: WebsiteIcon },
];

function LinksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function VimeoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.156 0-.701.328-1.634.977L0 6.197a315.065 315.065 0 0 0 3.503-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
    </svg>
  );
}

function WebsiteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm3.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function getLocaleFromPathname(pathname: string): "es" | "en" {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "en" ? "en" : "es";
}

export function Footer() {
  const pathname = usePathname();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="flex flex-col gap-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">
            © {new Date().getFullYear()} Pablo Goldberg
          </p>
          <a
            href={SUNFACTORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Sun Factory — productora (nueva pestaña)"
          >
            <Image
              src={SUNFACTORY_LOGO}
              alt="Sun Factory"
              width={140}
              height={28}
              className="h-6 w-auto object-contain"
            />
          </a>
        </div>
        <nav className="flex flex-wrap items-center gap-8" aria-label="Redes sociales">
          {social.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
            </a>
          ))}
        </nav>
        <Link
          href={`/${locale}/contact`}
          className="text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
        >
          {locale === "es" ? "Contacto" : "Contact"}
        </Link>
      </div>
    </footer>
  );
}
