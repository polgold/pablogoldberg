#!/usr/bin/env node
/**
 * Inicializa la base SQLite de galerías (data/galleries.db) y opcionalmente
 * crea galerías desde la estructura existente en public/uploads/work.
 * Ejecutar: node scripts/init-galleries-db.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const dbPath = process.env.GALLERIES_DB_PATH || path.join(dataDir, "galleries.db");
const schemaPath = path.join(root, "src", "lib", "galleries", "schema.sql");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Creado data/");
}

const { default: Database } = await import("better-sqlite3");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const sql = fs.readFileSync(schemaPath, "utf8");
db.exec(sql);
console.log("Schema aplicado en", dbPath);

// Opcional: crear galerías desde public/uploads/work/photography
const workDir = path.join(root, "public", "uploads", "work");
const photographyDir = path.join(workDir, "photography");
if (fs.existsSync(photographyDir) && fs.statSync(photographyDir).isDirectory()) {
  const categories = fs.readdirSync(photographyDir).filter((name) => {
    const full = path.join(photographyDir, name);
    return !name.startsWith(".") && fs.statSync(full).isDirectory();
  });
  for (const slug of categories) {
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);
    try {
      db.prepare(
        "INSERT OR IGNORE INTO galleries (section, slug, title, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))"
      ).run("photography", slug, title);
    } catch (e) {
      // ignore duplicate
    }
  }
  console.log("Galerías photography creadas/verificadas:", categories.length);
}

db.close();
console.log("Listo.");
