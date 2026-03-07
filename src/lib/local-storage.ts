/**
 * Almacenamiento local de archivos (Hostinger / filesystem).
 * Cuando USE_LOCAL_STORAGE=true, las imágenes se guardan en public/uploads/projects/
 * y se sirven en /uploads/projects/<path>.
 */

import path from "path";
import fs from "fs";

const UPLOAD_SUBDIR = "uploads/projects";

/** Directorio base dentro del proyecto (ej. public/uploads/projects). */
export function getLocalProjectsDir(): string {
  const base = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public");
  return path.join(base, UPLOAD_SUBDIR);
}

/** Ruta absoluta en disco para un path relativo (ej. "slug/cover.jpg" -> .../public/uploads/projects/slug/cover.jpg). */
export function resolveLocalPath(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "").replace(/\.\./g, "");
  return path.join(getLocalProjectsDir(), clean);
}

/** URL pública para un path relativo (ej. "slug/cover.jpg" -> /uploads/projects/slug/cover.jpg). */
export function getLocalProjectsUrl(relativePath: string): string {
  if (!relativePath?.trim()) return "";
  const clean = relativePath.replace(/^\//, "").replace(/\\/g, "/");
  return `/${UPLOAD_SUBDIR}/${clean}`.replace(/\/+/g, "/");
}

/** Escribir un archivo en almacenamiento local. Crea carpetas si no existen. */
export async function writeLocalFile(relativePath: string, data: Buffer | Uint8Array): Promise<void> {
  const fullPath = resolveLocalPath(relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(data));
}

/** Listar nombres de archivos en un directorio relativo (ej. "slug/large"). */
export function listLocalDir(relativeDir: string): string[] {
  const fullPath = resolveLocalPath(relativeDir);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return [];
  try {
    return fs.readdirSync(fullPath).filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}

/** Listar archivos que coinciden con una extensión (ej. imagen). */
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
export function listLocalImageFiles(relativeDir: string): string[] {
  return listLocalDir(relativeDir).filter((name) => IMAGE_EXT.test(name));
}

export function isLocalStorageEnabled(): boolean {
  return process.env.USE_LOCAL_STORAGE === "true" || process.env.USE_LOCAL_STORAGE === "1";
}
