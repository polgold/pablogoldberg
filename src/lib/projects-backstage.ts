/**
 * Backstage: hasta 12 imágenes desde /public/uploads/work/film/{slug}/thumb y large.
 * Sin Supabase. Lee del filesystem.
 */
import "server-only";
import path from "path";
import fs from "fs";
import { getWorkImageUrl } from "./work-images";

const WORK_DIR = path.join(process.cwd(), "public", "uploads", "work");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function isImageName(name: string): boolean {
  const i = name.lastIndexOf(".");
  return i >= 0 && IMAGE_EXT.has(name.slice(i).toLowerCase());
}

export type BackstageImage = { thumbUrl: string; largeUrl: string; originalUrl: string; alt: string };

const SLUG_TO_FILM_FOLDER: Record<string, string> = {
  "procens-inside": "procens",
  "sirenas-rock": "sirenas",
  "age-luthier": "forsaken-pixels",
};

/**
 * Lista imágenes en film/{slug}/thumb y large. Máx 12, orden por nombre.
 */
export async function getBackstageImages(
  storageFolder: string,
  limit = 12
): Promise<BackstageImage[]> {
  if (!storageFolder?.trim()) return [];
  const folderSlug = SLUG_TO_FILM_FOLDER[storageFolder] ?? storageFolder.replace(/\/$/, "");
  const thumbDir = path.join(WORK_DIR, "film", folderSlug, "thumb");
  const largeDir = path.join(WORK_DIR, "film", folderSlug, "large");

  const thumbNames = fs.existsSync(thumbDir)
    ? fs.readdirSync(thumbDir).filter((n) => !n.startsWith(".") && isImageName(n)).sort((a, b) => a.localeCompare(b))
    : [];
  const largeNames = fs.existsSync(largeDir)
    ? fs.readdirSync(largeDir).filter((n) => !n.startsWith(".") && isImageName(n)).sort((a, b) => a.localeCompare(b))
    : [];

  const allNames = [...new Set([...thumbNames, ...largeNames])].sort((a, b) => a.localeCompare(b)).slice(0, limit);

  return allNames.map((name) => {
    const thumbPath = `film/${folderSlug}/thumb/${name}`;
    const largePath = `film/${folderSlug}/large/${name}`;
    const thumbExists = fs.existsSync(path.join(WORK_DIR, thumbPath));
    const largeExists = fs.existsSync(path.join(WORK_DIR, largePath));
    const actualThumb = thumbExists ? thumbPath : largePath;
    const actualLarge = largeExists ? largePath : thumbPath;
    return {
      thumbUrl: getWorkImageUrl(actualThumb),
      largeUrl: getWorkImageUrl(actualLarge),
      originalUrl: getWorkImageUrl(actualLarge),
      alt: name.replace(/\.[^/.]+$/, "") || "Backstage",
    };
  });
}
