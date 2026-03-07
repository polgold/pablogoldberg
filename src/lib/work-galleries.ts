/**
 * Carga de galerías desde el filesystem bajo /public/uploads/work/.
 * Sin Supabase Storage. Escanea carpetas locales.
 */
import "server-only";
import path from "path";
import fs from "fs";
import { getWorkImageUrl } from "./work-images";

const WORK_DIR = path.join(process.cwd(), "public", "uploads", "work");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

function listImageFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return [];
  try {
    return fs.readdirSync(dirPath)
      .filter((name) => !name.startsWith(".") && IMAGE_EXT.test(name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export type GalleryPhoto = {
  thumbPath: string;
  largePath: string;
  thumbUrl: string;
  largeUrl: string;
};

export type WorkGallery = {
  slug: string;
  title: string;
  category: "photography" | "film";
  photos: GalleryPhoto[];
};

/**
 * Escanea photography/{category}/thumb y large.
 * Estructura: photography/art/thumb/, photography/art/large/, etc.
 */
export function scanPhotographyGalleries(): WorkGallery[] {
  const photographyDir = path.join(WORK_DIR, "photography");
  if (!fs.existsSync(photographyDir) || !fs.statSync(photographyDir).isDirectory()) return [];

  const galleries: WorkGallery[] = [];
  const categories = fs.readdirSync(photographyDir).filter((name) => {
    const full = path.join(photographyDir, name);
    return !name.startsWith(".") && fs.statSync(full).isDirectory();
  });

  for (const category of categories.sort()) {
    const thumbDir = path.join(photographyDir, category, "thumb");
    const largeDir = path.join(photographyDir, category, "large");
    const thumbNames = listImageFiles(thumbDir);
    const largeNames = listImageFiles(largeDir);
    const allNames = [...new Set([...thumbNames, ...largeNames])].sort((a, b) => a.localeCompare(b));

    if (allNames.length === 0) continue;

    const photos: GalleryPhoto[] = allNames.map((name) => {
      const thumbPath = `photography/${category}/thumb/${name}`;
      const largePath = `photography/${category}/large/${name}`;
      const thumbExists = fs.existsSync(path.join(WORK_DIR, thumbPath));
      const largeExists = fs.existsSync(path.join(WORK_DIR, largePath));
      const actualThumb = thumbExists ? thumbPath : largePath;
      const actualLarge = largeExists ? largePath : thumbPath;
      return {
        thumbPath: actualThumb,
        largePath: actualLarge,
        thumbUrl: getWorkImageUrl(actualThumb),
        largeUrl: getWorkImageUrl(actualLarge),
      };
    });

    galleries.push({
      slug: category,
      title: category.charAt(0).toUpperCase() + category.slice(1),
      category: "photography",
      photos,
    });
  }

  return galleries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Escanea film/{slug}/thumb y large.
 */
export function scanFilmGalleries(): WorkGallery[] {
  const filmDir = path.join(WORK_DIR, "film");
  if (!fs.existsSync(filmDir) || !fs.statSync(filmDir).isDirectory()) return [];

  const galleries: WorkGallery[] = [];
  const slugs = fs.readdirSync(filmDir).filter((name) => {
    const full = path.join(filmDir, name);
    return !name.startsWith(".") && fs.statSync(full).isDirectory();
  });

  for (const slug of slugs.sort()) {
    const thumbDir = path.join(filmDir, slug, "thumb");
    const largeDir = path.join(filmDir, slug, "large");
    const thumbNames = listImageFiles(thumbDir);
    const largeNames = listImageFiles(largeDir);
    const allNames = [...new Set([...thumbNames, ...largeNames])].sort((a, b) => a.localeCompare(b));

    if (allNames.length === 0) continue;

    const photos: GalleryPhoto[] = allNames.map((name) => {
      const thumbPath = `film/${slug}/thumb/${name}`;
      const largePath = `film/${slug}/large/${name}`;
      const thumbExists = fs.existsSync(path.join(WORK_DIR, thumbPath));
      const largeExists = fs.existsSync(path.join(WORK_DIR, largePath));
      const actualThumb = thumbExists ? thumbPath : largePath;
      const actualLarge = largeExists ? largePath : thumbPath;
      return {
        thumbPath: actualThumb,
        largePath: actualLarge,
        thumbUrl: getWorkImageUrl(actualThumb),
        largeUrl: getWorkImageUrl(actualLarge),
      };
    });

    galleries.push({
      slug,
      title: slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
      category: "film",
      photos,
    });
  }

  return galleries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Todas las galerías (photography + film). */
export function scanAllGalleries(): WorkGallery[] {
  return [...scanPhotographyGalleries(), ...scanFilmGalleries()];
}

/**
 * Obtiene la galería de un proyecto film por slug.
 * Mapeo: bestefar->bestefar, procens-inside->procens, sirenas-rock->sirenas, age-luthier->forsaken-pixels
 */
const SLUG_TO_FILM_FOLDER: Record<string, string> = {
  "procens-inside": "procens",
  "sirenas-rock": "sirenas",
  "age-luthier": "forsaken-pixels",
};

export function getFilmGalleryBySlug(jsonSlug: string): WorkGallery | null {
  const folderSlug = SLUG_TO_FILM_FOLDER[jsonSlug] ?? jsonSlug;
  const galleries = scanFilmGalleries();
  return galleries.find((g) => g.slug === folderSlug) ?? null;
}

/**
 * Busca cover para un proyecto film: film/{slug}/large/*-cover.jpg o film/{slug}/thumb/*-cover.jpg
 * o primera imagen disponible.
 */
export function getFilmCoverPath(slug: string): string | null {
  const folderSlug = SLUG_TO_FILM_FOLDER[slug] ?? slug;
  const largeDir = path.join(WORK_DIR, "film", folderSlug, "large");
  const thumbDir = path.join(WORK_DIR, "film", folderSlug, "thumb");
  const largeNames = listImageFiles(largeDir);
  const thumbNames = listImageFiles(thumbDir);

  const coverCandidates = [...largeNames, ...thumbNames].filter(
    (n) => n.toLowerCase().includes("cover") || n.toLowerCase().includes("-cover")
  );
  if (coverCandidates.length > 0) {
    const name = coverCandidates[0];
    if (largeNames.includes(name)) return `film/${folderSlug}/large/${name}`;
    return `film/${folderSlug}/thumb/${name}`;
  }
  const first = largeNames[0] ?? thumbNames[0];
  if (first) {
    if (largeNames.includes(first)) return `film/${folderSlug}/large/${first}`;
    return `film/${folderSlug}/thumb/${first}`;
  }
  return null;
}
