/**
 * Persistent storage for Hostinger: files OUTSIDE deployment path.
 * UPLOAD_DIR must point to a directory that is NOT overwritten by git deploy.
 * Example: /home/username/persistent/uploads or /var/www/persistent/uploads
 */
import "server-only";
import path from "path";
import fs from "fs";

const UPLOAD_SUBDIR = "uploads";
const PROJECTS_SUBDIR = "projects";

/** Base directory for all uploads. MUST be outside repo/deploy path on Hostinger. */
export function getPersistentUploadDir(): string {
  const envDir = process.env.UPLOAD_DIR?.trim();
  if (envDir) return envDir;
  return path.join(process.cwd(), "public", UPLOAD_SUBDIR);
}

/** Base for project uploads: projects/{slug}/ */
export function getProjectsUploadDir(): string {
  return path.join(getPersistentUploadDir(), PROJECTS_SUBDIR);
}

export function resolveProjectPath(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "").replace(/\.\./g, "");
  return path.join(getProjectsUploadDir(), clean);
}

export async function writeProjectFile(relativePath: string, data: Buffer | Uint8Array): Promise<void> {
  const fullPath = resolveProjectPath(relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(data));
}

export function listProjectDir(relativeDir: string): string[] {
  const fullPath = resolveProjectPath(relativeDir);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return [];
  try {
    return fs.readdirSync(fullPath).filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
export function listProjectImageFiles(relativeDir: string): string[] {
  return listProjectDir(relativeDir).filter((name) => IMAGE_EXT.test(name));
}

export function projectFileExists(relativePath: string): boolean {
  const fullPath = resolveProjectPath(relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
}
