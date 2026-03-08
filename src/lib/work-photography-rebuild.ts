/**
 * Reconstrucción manual de galerías en public/uploads/work/photography/{categoria}.
 * Sin DB: solo filesystem. Compatible con scanPhotographyGalleries() en work-galleries.
 */
import "server-only";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const WORK_PHOTOGRAPHY_DIR = path.join(process.cwd(), "public", "uploads", "work", "photography");
const LARGE_MAX_SIDE = 2200;
const THUMB_MAX_SIDE = 600;
const LARGE_QUALITY = 88;
const THUMB_QUALITY = 82;

const IMAGE_EXT = /\.(jpe?g|png|webp|tiff?|avif|gif)$/i;
const SKIP_NAMES = /^\.|\.DS_Store$/i;

export function sanitizeCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "gallery";
}

export function isWorkPhotographyImageFilename(name: string): boolean {
  return !SKIP_NAMES.test(name) && IMAGE_EXT.test(name);
}

/** Rutas absolutas para una categoría (thumb y large). */
export function getWorkPhotographyDirs(category: string): { thumbDir: string; largeDir: string } {
  const safe = sanitizeCategory(category);
  const base = path.join(WORK_PHOTOGRAPHY_DIR, safe);
  return {
    thumbDir: path.join(base, "thumb"),
    largeDir: path.join(base, "large"),
  };
}

function listImageFilesInDir(dirPath: string): string[] {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return [];
  try {
    return fs
      .readdirSync(dirPath)
      .filter((name) => isWorkPhotographyImageFilename(name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** Lista nombres de archivos en thumb y large para una categoría. */
export function listCategoryImageFiles(category: string): { thumb: string[]; large: string[] } {
  const { thumbDir, largeDir } = getWorkPhotographyDirs(category);
  return {
    thumb: listImageFilesInDir(thumbDir),
    large: listImageFilesInDir(largeDir),
  };
}

/** Lista categorías existentes (carpetas bajo work/photography). */
export function listWorkPhotographyCategories(): string[] {
  if (!fs.existsSync(WORK_PHOTOGRAPHY_DIR) || !fs.statSync(WORK_PHOTOGRAPHY_DIR).isDirectory()) {
    return [];
  }
  return fs
    .readdirSync(WORK_PHOTOGRAPHY_DIR)
    .filter((name) => {
      const full = path.join(WORK_PHOTOGRAPHY_DIR, name);
      return !name.startsWith(".") && fs.statSync(full).isDirectory();
    })
    .sort((a, b) => a.localeCompare(b));
}

/** Vacía thumb y large de la categoría (borra archivos, no las carpetas). */
export function clearCategoryFolders(category: string): { removed: number; errors: string[] } {
  const { thumbDir, largeDir } = getWorkPhotographyDirs(category);
  const errors: string[] = [];
  let removed = 0;
  for (const dir of [thumbDir, largeDir]) {
    if (!fs.existsSync(dir)) continue;
    const names = listImageFilesInDir(dir);
    for (const name of names) {
      try {
        fs.unlinkSync(path.join(dir, name));
        removed++;
      } catch (e) {
        errors.push(`${name}: ${String(e)}`);
      }
    }
  }
  return { removed, errors };
}

export type ProcessWorkPhotographyResult = {
  processed: number;
  failed: number;
  generatedNames: string[];
  errors: string[];
};

/**
 * Procesa archivos: convierte a JPG, genera large (2200) y thumb (600), nombres categoria-001.jpg.
 * Orden alfabético por nombre original. Si rebuild, primero vacía thumb y large.
 */
export async function processUploadToWorkPhotography(
  category: string,
  files: Array<{ name: string; buffer: Buffer }>,
  options: { rebuild?: boolean } = {}
): Promise<ProcessWorkPhotographyResult> {
  const safeCategory = sanitizeCategory(category);
  const { thumbDir, largeDir } = getWorkPhotographyDirs(category);

  if (options.rebuild) {
    clearCategoryFolders(category);
  }

  for (const dir of [path.join(WORK_PHOTOGRAPHY_DIR, safeCategory), thumbDir, largeDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const imageFiles = files
    .filter((f) => isWorkPhotographyImageFilename(f.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const result: ProcessWorkPhotographyResult = {
    processed: 0,
    failed: 0,
    generatedNames: [],
    errors: [],
  };

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const seq = String(i + 1).padStart(3, "0");
    const baseName = `${safeCategory}-${seq}.jpg`;
    const largePath = path.join(largeDir, baseName);
    const thumbPath = path.join(thumbDir, baseName);

    try {
      const buffer = file.buffer;

      await sharp(buffer)
        .rotate()
        .resize(LARGE_MAX_SIDE, undefined, { withoutEnlargement: true, fit: "inside" })
        .jpeg({ quality: LARGE_QUALITY, mozjpeg: true })
        .toFile(largePath);

      await sharp(buffer)
        .rotate()
        .resize(THUMB_MAX_SIDE, undefined, { withoutEnlargement: true, fit: "inside" })
        .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
        .toFile(thumbPath);

      result.processed++;
      result.generatedNames.push(baseName);
    } catch (e) {
      result.failed++;
      result.errors.push(`${file.name}: ${String(e)}`);
    }
  }

  return result;
}
