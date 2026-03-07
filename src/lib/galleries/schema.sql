-- SQLite schema for local galleries (photography, work, etc.)
-- Run once: node -e "require('fs').mkdirSync('data', {recursive:true}); const db=require('better-sqlite3')('data/galleries.db'); db.exec(require('fs').readFileSync('src/lib/galleries/schema.sql','utf8'));"

CREATE TABLE IF NOT EXISTS galleries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(section, slug)
);

CREATE INDEX IF NOT EXISTS idx_galleries_section ON galleries(section);
CREATE INDEX IF NOT EXISTS idx_galleries_section_slug ON galleries(section, slug);

CREATE TABLE IF NOT EXISTS gallery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  large_path TEXT NOT NULL,
  thumb_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  is_featured_home INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery ON gallery_items(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_sort ON gallery_items(gallery_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_visible ON gallery_items(gallery_id, is_visible) WHERE is_visible = 1;
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(is_featured_home) WHERE is_featured_home = 1;

CREATE TABLE IF NOT EXISTS gallery_settings (
  gallery_id INTEGER PRIMARY KEY REFERENCES galleries(id) ON DELETE CASCADE,
  cover_item_id INTEGER REFERENCES gallery_items(id) ON DELETE SET NULL,
  description TEXT,
  grid_style TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
