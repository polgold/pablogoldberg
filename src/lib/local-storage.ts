/**
 * URLs y flag para almacenamiento local (Hostinger).
 * Sin dependencias Node (fs/path) para poder importarse en cliente.
 * Las funciones que usan fs están en local-storage-server.ts (solo servidor).
 */

const UPLOAD_SUBDIR = "uploads/projects";

/** URL pública para un path relativo (ej. "slug/cover.jpg" -> /uploads/projects/slug/cover.jpg). */
export function getLocalProjectsUrl(relativePath: string): string {
  if (!relativePath?.trim()) return "";
  const clean = relativePath.replace(/^\//, "").replace(/\\/g, "/");
  return `/${UPLOAD_SUBDIR}/${clean}`.replace(/\/+/g, "/");
}

export function isLocalStorageEnabled(): boolean {
  return process.env.USE_LOCAL_STORAGE === "true" || process.env.USE_LOCAL_STORAGE === "1";
}
