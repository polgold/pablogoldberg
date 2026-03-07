/**
 * Almacenamiento local en disco (solo servidor). Usa fs/path.
 * Importar solo desde Server Components, Server Actions o API routes.
 */
import "server-only";

import path from "path";
import fs from "fs";

const UPLOAD_SUBDIR = "uploads/projects";

export function getLocalProjectsDir(): string {
  const base = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public");
  return path.join(base, UPLOAD_SUBDIR);
}

export function resolveLocalPath(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "").replace(/\.\./g, "");
  return path.join(getLocalProjectsDir(), clean);
}

export async function writeLocalFile(relativePath: string, data: Buffer | Uint8Array): Promise<void> {
  const fullPath = resolveLocalPath(relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(data));
}

export function listLocalDir(relativeDir: string): string[] {
  const fullPath = resolveLocalPath(relativeDir);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return [];
  try {
    return fs.readdirSync(fullPath).filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
export function listLocalImageFiles(relativeDir: string): string[] {
  return listLocalDir(relativeDir).filter((name) => IMAGE_EXT.test(name));
}
