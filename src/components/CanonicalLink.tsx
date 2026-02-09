"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getCanonicalUrl } from "@/lib/site";

const NO_INDEX_PREFIXES = ["/admin", "/login", "/wp-admin", "/wp-login"];

/** Inyecta <link rel="canonical"> en el head solo en rutas públicas. */
export function CanonicalLink() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    if (NO_INDEX_PREFIXES.some((p) => pathname.startsWith(p))) return;
    const href = getCanonicalUrl(pathname);
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }, [pathname]);
  return null;
}
