/**
 * SQLite local para galerías. DB en data/galleries.db (persistente, fuera del build).
 */
import "server-only";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.GALLERIES_DB_PATH?.trim() || path.join(DB_DIR, "galleries.db");

let _db: import("better-sqlite3").Database | null = null;

function getDb(): import("better-sqlite3").Database {
  if (_db) return _db;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  _db = db;
  return db;
}

function initSchema(db: import("better-sqlite3").Database) {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  db.exec(sql);
}

export type GalleryRow = {
  id: number;
  section: string;
  slug: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type GalleryItemRow = {
  id: number;
  gallery_id: number;
  filename: string;
  original_filename: string;
  large_path: string;
  thumb_path: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_visible: number;
  is_featured_home: number;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
};

export function listGalleries(): GalleryRow[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM galleries ORDER BY section, slug");
  return stmt.all() as GalleryRow[];
}

export function getGalleryById(id: number): GalleryRow | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM galleries WHERE id = ?");
  return (stmt.get(id) as GalleryRow | undefined) ?? null;
}

export function getGalleryBySectionSlug(section: string, slug: string): GalleryRow | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM galleries WHERE section = ? AND slug = ?");
  return (stmt.get(section, slug) as GalleryRow | undefined) ?? null;
}

export function createGallery(section: string, slug: string, title: string): GalleryRow {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO galleries (section, slug, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
  );
  const info = stmt.run(section, slug, title, now, now);
  return getGalleryById(info.lastInsertRowid as number)!;
}

export function updateGallery(id: number, data: { title?: string }) {
  const db = getDb();
  const now = new Date().toISOString();
  if (data.title != null) {
    db.prepare("UPDATE galleries SET title = ?, updated_at = ? WHERE id = ?").run(data.title, now, id);
  }
}

export function listGalleryItems(galleryId: number, visibleOnly = false): GalleryItemRow[] {
  const db = getDb();
  const sql = visibleOnly
    ? "SELECT * FROM gallery_items WHERE gallery_id = ? AND is_visible = 1 ORDER BY sort_order, id"
    : "SELECT * FROM gallery_items WHERE gallery_id = ? ORDER BY sort_order, id";
  const stmt = db.prepare(sql);
  return stmt.all(galleryId) as GalleryItemRow[];
}

export function getGalleryItemById(id: number): GalleryItemRow | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM gallery_items WHERE id = ?");
  return (stmt.get(id) as GalleryItemRow | undefined) ?? null;
}

export function insertGalleryItem(row: {
  gallery_id: number;
  filename: string;
  original_filename: string;
  large_path: string;
  thumb_path: string;
  width?: number;
  height?: number;
  sort_order: number;
  is_visible?: number;
  is_featured_home?: number;
  alt_text?: string | null;
}): GalleryItemRow {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO gallery_items (
      gallery_id, filename, original_filename, large_path, thumb_path,
      width, height, sort_order, is_visible, is_featured_home, alt_text, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run(
    row.gallery_id,
    row.filename,
    row.original_filename,
    row.large_path,
    row.thumb_path,
    row.width ?? null,
    row.height ?? null,
    row.sort_order,
    row.is_visible ?? 1,
    row.is_featured_home ?? 0,
    row.alt_text ?? null,
    now,
    now
  );
  const id = (db.prepare("SELECT last_insert_rowid() as id").get() as { id: number }).id;
  return getGalleryItemById(id)!;
}

export function updateGalleryItemSortOrder(id: number, sort_order: number) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE gallery_items SET sort_order = ?, updated_at = ? WHERE id = ?").run(
    sort_order,
    now,
    id
  );
}

export function updateGalleryItemVisibility(id: number, is_visible: number) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE gallery_items SET is_visible = ?, updated_at = ? WHERE id = ?").run(
    is_visible,
    now,
    id
  );
}

export function updateGalleryItemFeatured(id: number, is_featured_home: number) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE gallery_items SET is_featured_home = ?, updated_at = ? WHERE id = ?").run(
    is_featured_home,
    now,
    id
  );
}

export function updateGalleryItemAlt(id: number, alt_text: string | null) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE gallery_items SET alt_text = ?, updated_at = ? WHERE id = ?").run(
    alt_text ?? null,
    now,
    id
  );
}

export function deleteGalleryItem(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM gallery_items WHERE id = ?").run(id);
}

export function getMaxSortOrder(galleryId: number): number {
  const db = getDb();
  const row = db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM gallery_items WHERE gallery_id = ?").get(
    galleryId
  ) as { m: number };
  return row.m + 1;
}

/** Items por filename en una galería (para detectar duplicados). */
export function getGalleryItemByFilename(galleryId: number, filename: string): GalleryItemRow | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM gallery_items WHERE gallery_id = ? AND filename = ?");
  return (stmt.get(galleryId, filename) as GalleryItemRow | undefined) ?? null;
}

/** Featured para home: is_featured_home = 1, ordenados. Si faltan, completar con visibles recientes. */
export function getFeaturedItemsForHome(limit: number): GalleryItemRow[] {
  const db = getDb();
  const featured = db
    .prepare(
      `SELECT gi.* FROM gallery_items gi
       JOIN galleries g ON g.id = gi.gallery_id
       WHERE gi.is_featured_home = 1 AND gi.is_visible = 1
       ORDER BY gi.updated_at DESC LIMIT ?`
    )
    .all(limit) as GalleryItemRow[];
  if (featured.length >= limit) return featured;
  const need = limit - featured.length;
  const ids = featured.map((r) => r.id);
  const placeholders = ids.length ? ids.map(() => "?").join(",") : "0";
  const extra = db
    .prepare(
      `SELECT gi.* FROM gallery_items gi
       JOIN galleries g ON g.id = gi.gallery_id
       WHERE gi.is_visible = 1 AND gi.id NOT IN (${placeholders})
       ORDER BY gi.updated_at DESC LIMIT ?`
    )
    .all(...ids, need) as GalleryItemRow[];
  return [...featured, ...extra];
}

export function deleteGallery(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM gallery_items WHERE gallery_id = ?").run(id);
  db.prepare("DELETE FROM gallery_settings WHERE gallery_id = ?").run(id);
  db.prepare("DELETE FROM galleries WHERE id = ?").run(id);
}
