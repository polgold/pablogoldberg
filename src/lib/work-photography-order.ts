/**
 * Orden de categorías y fotos para work/photography.
 * Persistido en JSON en public/uploads/work/photography/.
 */
import "server-only";
import path from "path";
import fs from "fs";

const WORK_PHOTOGRAPHY = path.join(process.cwd(), "public", "uploads", "work", "photography");
const CATEGORIES_ORDER_FILE = "_categories_order.json";

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/** Orden de categorías (slugs). Si no existe, devuelve null. */
export function readCategoriesOrder(): string[] | null {
  const file = path.join(WORK_PHOTOGRAPHY, CATEGORIES_ORDER_FILE);
  const arr = readJsonFile<string[]>(file);
  if (!Array.isArray(arr) || arr.some((x) => typeof x !== "string")) return null;
  return arr;
}

/** Guarda el orden de categorías. */
export function saveCategoriesOrder(slugs: string[]): void {
  const file = path.join(WORK_PHOTOGRAPHY, CATEGORIES_ORDER_FILE);
  writeJsonFile(file, slugs);
}

/** Orden de fotos (filenames) en una categoría. Si no existe, devuelve null. */
export function readCategoryPhotoOrder(category: string): string[] | null {
  const safe = category.replace(/[^a-z0-9-]/gi, "").replace(/\/|\.\./g, "");
  if (!safe) return null;
  const file = path.join(WORK_PHOTOGRAPHY, safe, "order.json");
  const arr = readJsonFile<string[]>(file);
  if (!Array.isArray(arr) || arr.some((x) => typeof x !== "string")) return null;
  return arr;
}

/** Guarda el orden de fotos de una categoría. */
export function saveCategoryPhotoOrder(category: string, filenames: string[]): void {
  const safe = category.replace(/[^a-z0-9-]/gi, "").replace(/\/|\.\./g, "");
  if (!safe) return;
  const dir = path.join(WORK_PHOTOGRAPHY, safe);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  const file = path.join(dir, "order.json");
  writeJsonFile(file, filenames);
}

/** Lista categorías en orden de visualización (según _categories_order.json + resto alfabético). */
export function getCategoriesInOrder(): string[] {
  if (!fs.existsSync(WORK_PHOTOGRAPHY) || !fs.statSync(WORK_PHOTOGRAPHY).isDirectory()) return [];
  const categories = fs.readdirSync(WORK_PHOTOGRAPHY).filter((name) => {
    const full = path.join(WORK_PHOTOGRAPHY, name);
    return !name.startsWith(".") && fs.statSync(full).isDirectory();
  });
  const orderSlugs = readCategoriesOrder();
  if (orderSlugs?.length) {
    const orderSet = new Set(orderSlugs);
    const ordered = orderSlugs.filter((s) => categories.includes(s));
    const rest = categories.filter((c) => !orderSet.has(c)).sort((a, b) => a.localeCompare(b));
    return [...ordered, ...rest];
  }
  return categories.sort((a, b) => a.localeCompare(b));
}

/** Lista nombres de archivos de una categoría en orden de visualización. */
export function getCategoryPhotoFilenamesInOrder(category: string): string[] {
  const safe = category.replace(/[^a-z0-9-]/gi, "").replace(/\/|\.\./g, "");
  if (!safe) return [];
  const thumbDir = path.join(WORK_PHOTOGRAPHY, safe, "thumb");
  const largeDir = path.join(WORK_PHOTOGRAPHY, safe, "large");
  const list = (dir: string) => {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [] as string[];
    return fs.readdirSync(dir).filter((n) => /\.(jpe?g|png|webp|avif|gif)$/i.test(n) && !n.startsWith("."));
  };
  const all = [...new Set([...list(thumbDir), ...list(largeDir)])];
  const order = readCategoryPhotoOrder(safe);
  if (order?.length) {
    const orderSet = new Set(order);
    const ordered = order.filter((n) => all.includes(n));
    const rest = all.filter((n) => !orderSet.has(n)).sort((a, b) => a.localeCompare(b));
    return [...ordered, ...rest];
  }
  return all.sort((a, b) => a.localeCompare(b));
}
