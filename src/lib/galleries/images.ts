/**
 * Pipeline de procesamiento de imágenes con Sharp.
 * Large: max 2200px. Thumb: max 700px. Calidad web, EXIF orientación.
 */
import "server-only";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { IMAGE_EXTENSIONS } from "./slugify";

const LARGE_MAX_WIDTH = 2200;
const THUMB_MAX_WIDTH = 700;
const LARGE_QUALITY = 85;
const THUMB_QUALITY = 80;

export function isImageFilename(name: string): boolean {
  return IMAGE_EXTENSIONS.test(name);
}

export type ProcessResult = {
  largePath: string;
  thumbPath: string;
  width: number;
  height: number;
};

/**
 * Procesa un archivo de imagen: corrige orientación EXIF, genera large y thumb.
 * largePath y thumbPath son relativos a la galería (section/slug/large|thumb/filename).
 */
export async function processImage(
  inputPath: string,
  largeOutPath: string,
  thumbOutPath: string,
  outputExt: "jpg" | "webp" = "webp"
): Promise<ProcessResult> {
  const buffer = fs.readFileSync(inputPath);
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  const pipeline = sharp(buffer)
    .rotate() // EXIF orientation
    .resize(LARGE_MAX_WIDTH, undefined, { withoutEnlargement: true, fit: "inside" });

  if (outputExt === "webp") {
    await pipeline
      .webp({ quality: LARGE_QUALITY })
      .toFile(largeOutPath);
  } else {
    await pipeline
      .jpeg({ quality: LARGE_QUALITY, mozjpeg: true })
      .toFile(largeOutPath);
  }

  const thumbPipeline = sharp(buffer)
    .rotate()
    .resize(THUMB_MAX_WIDTH, undefined, { withoutEnlargement: true, fit: "inside" });

  if (outputExt === "webp") {
    await thumbPipeline
      .webp({ quality: THUMB_QUALITY })
      .toFile(thumbOutPath);
  } else {
    await thumbPipeline
      .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
      .toFile(thumbOutPath);
  }

  const largeMeta = await sharp(fs.readFileSync(largeOutPath)).metadata();
  return {
    largePath: path.basename(largeOutPath),
    thumbPath: path.basename(thumbOutPath),
    width: (largeMeta.width as number) ?? w,
    height: (largeMeta.height as number) ?? h,
  };
}

/**
 * Genera solo thumb desde el large existente (para regenerar thumbs).
 */
export async function regenerateThumbFromLarge(
  largeAbsPath: string,
  thumbOutPath: string,
  outputExt: "jpg" | "webp" = "webp"
): Promise<{ thumbPath: string }> {
  const buffer = fs.readFileSync(largeAbsPath);
  const pipeline = sharp(buffer)
    .resize(THUMB_MAX_WIDTH, undefined, { withoutEnlargement: true, fit: "inside" });
  if (outputExt === "webp") {
    await pipeline.webp({ quality: THUMB_QUALITY }).toFile(thumbOutPath);
  } else {
    await pipeline.jpeg({ quality: THUMB_QUALITY, mozjpeg: true }).toFile(thumbOutPath);
  }
  return { thumbPath: path.basename(thumbOutPath) };
}
