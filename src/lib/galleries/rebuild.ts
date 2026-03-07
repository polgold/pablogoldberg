/**
 * Reconstrucción de galerías: escanear disco, agregar nuevos a DB, mantener sort_order.
 * No rompe el orden manual existente; los nuevos se agregan al final.
 */
import "server-only";
import path from "path";
import fs from "fs";
import {
  getGalleryById,
  listGalleryItems,
  insertGalleryItem,
  getGalleryItemByFilename,
  getMaxSortOrder,
} from "./db";
import { getMediaRoot, getGalleryRelativePath } from "./config";
import { ensureGalleryDirs, listImageFilesInDir } from "./fs";
import { processImage, regenerateThumbFromLarge, isImageFilename } from "./images";
import { getOutputExtension, uniqueSlugFilename } from "./slugify";

export type RebuildResult = {
  added: number;
  missing: string[];
  thumbRegenerated: number;
  errors: string[];
};

/**
 * Reconstruye una galería desde disco: agrega archivos nuevos a DB, detecta faltantes.
 * Los items ya en DB conservan su sort_order; los nuevos se añaden al final.
 */
export async function rebuildGalleryFromDisk(galleryId: number): Promise<RebuildResult> {
  const gallery = getGalleryById(galleryId);
  if (!gallery) return { added: 0, missing: [], thumbRegenerated: 0, errors: ["Galería no encontrada"] };

  const { largeDir, thumbDir } = ensureGalleryDirs(gallery.section, gallery.slug);
  const largeFiles = listImageFilesInDir(largeDir);
  const thumbFiles = listImageFilesInDir(thumbDir);
  const allFilenames = [...new Set([...largeFiles, ...thumbFiles])].sort((a, b) => a.localeCompare(b));

  const existing = listGalleryItems(galleryId, false);
  const existingByFilename = new Map(existing.map((i) => [i.filename, i]));
  let nextSort = getMaxSortOrder(galleryId);
  const result: RebuildResult = { added: 0, missing: [], thumbRegenerated: 0, errors: [] };

  for (const filename of allFilenames) {
    if (!isImageFilename(filename)) continue;
    const largePath = path.join(largeDir, filename);
    const thumbPath = path.join(thumbDir, filename);
    const largeExists = fs.existsSync(largePath);
    const thumbExists = fs.existsSync(thumbPath);

    if (existingByFilename.has(filename)) {
      if (!thumbExists && largeExists) {
        try {
          const ext = getOutputExtension(filename, true) as "webp" | "jpg";
          await regenerateThumbFromLarge(largePath, thumbPath, ext);
          result.thumbRegenerated++;
        } catch (e) {
          result.errors.push(`Thumb ${filename}: ${String(e)}`);
        }
      }
      continue;
    }

    if (!largeExists) {
      result.missing.push(filename);
      continue;
    }

    const relLarge = getGalleryRelativePath(gallery.section, gallery.slug, "large", filename);
    const relThumb = getGalleryRelativePath(gallery.section, gallery.slug, "thumb", filename);
    if (!thumbExists) {
      try {
        const ext = getOutputExtension(filename, true) as "webp" | "jpg";
        await regenerateThumbFromLarge(largePath, thumbPath, ext);
      } catch (e) {
        result.errors.push(`Thumb ${filename}: ${String(e)}`);
      }
    }
    insertGalleryItem({
      gallery_id: galleryId,
      filename,
      original_filename: filename,
      large_path: relLarge,
      thumb_path: relThumb,
      sort_order: nextSort++,
      is_visible: 1,
      is_featured_home: 0,
    });
    result.added++;
  }

  return result;
}

/**
 * Procesa archivos subidos (Buffer o path), genera large/thumb con renombre, inserta en DB.
 */
export async function processUploadedFiles(
  galleryId: number,
  files: Array<{ name: string; buffer: Buffer }>
): Promise<{ added: number; errors: string[] }> {
  const gallery = getGalleryById(galleryId);
  if (!gallery) return { added: 0, errors: ["Galería no encontrada"] };

  const root = getMediaRoot();
  const { largeDir, thumbDir } = ensureGalleryDirs(gallery.section, gallery.slug);
  const existsCheck = (name: string) => !!getGalleryItemByFilename(galleryId, name);
  let nextSort = getMaxSortOrder(galleryId);
  const result = { added: 0, errors: [] as string[] };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!isImageFilename(file.name)) continue;
    const outputExt = getOutputExtension(file.name, true) as "webp" | "jpg";
    const filename = uniqueSlugFilename(file.name, existsCheck, {
      prefix: gallery.slug,
      index: i + 1,
    });
    const largeOutPath = path.join(largeDir, filename);
    const thumbOutPath = path.join(thumbDir, filename);

    try {
      const tmpPath = path.join(root, ".tmp", `upload-${Date.now()}-${i}-${file.name}`);
      const tmpDir = path.dirname(tmpPath);
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(tmpPath, file.buffer);
      const processed = await processImage(tmpPath, largeOutPath, thumbOutPath, outputExt);
      try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }

      const relLarge = getGalleryRelativePath(gallery.section, gallery.slug, "large", processed.largePath);
      const relThumb = getGalleryRelativePath(gallery.section, gallery.slug, "thumb", processed.thumbPath);
      insertGalleryItem({
        gallery_id: galleryId,
        filename: processed.largePath,
        original_filename: file.name,
        large_path: relLarge,
        thumb_path: relThumb,
        width: processed.width,
        height: processed.height,
        sort_order: nextSort++,
        is_visible: 1,
        is_featured_home: 0,
      });
      result.added++;
    } catch (e) {
      result.errors.push(`${file.name}: ${String(e)}`);
    }
  }
  return result;
}
