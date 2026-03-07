/**
 * Utilidades de filesystem para galerías (MEDIA_ROOT).
 */
import "server-only";
import fs from "fs";
import path from "path";
import { getMediaRoot, getLargeDir, getThumbDir } from "./config";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

export function ensureGalleryDirs(section: string, slug: string): { largeDir: string; thumbDir: string } {
  const root = getMediaRoot();
  const largeDir = getLargeDir(root, section, slug);
  const thumbDir = getThumbDir(root, section, slug);
  for (const dir of [path.join(root, section), path.join(root, section, slug), largeDir, thumbDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  return { largeDir, thumbDir };
}

export function listImageFilesInDir(dirPath: string): string[] {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return [];
  try {
    return fs
      .readdirSync(dirPath)
      .filter((name) => !name.startsWith(".") && IMAGE_EXT.test(name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export function fileExists(absPath: string): boolean {
  return fs.existsSync(absPath) && fs.statSync(absPath).isFile();
}

export function getMediaRootPath(): string {
  return getMediaRoot();
}
