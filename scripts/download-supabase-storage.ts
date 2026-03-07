/**
 * Descarga todo el bucket "projects" de Supabase Storage y lo guarda en
 * public/uploads/projects/ para migrar a Hostinger (almacenamiento local).
 *
 * Uso:
 *   node --env-file=.env --import tsx scripts/download-supabase-storage.ts
 *
 * Requiere .env con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BUCKET = "projects";
const OUT_DIR = path.join(process.cwd(), "public", "uploads", "projects");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  /** Lista recursivamente todos los paths de archivos en el bucket. */
  async function listAllFilePaths(prefix: string): Promise<string[]> {
    const pathForList = prefix.replace(/\/$/, "");
    const { data, error } = await supabase.storage.from(BUCKET).list(pathForList, { limit: 1000 });
    if (error) {
      console.warn("  list error", pathForList, error.message);
      return [];
    }
    if (!data?.length) return [];

    const files: string[] = [];
    const fullPrefix = pathForList ? pathForList + "/" : "";
    for (const item of data) {
      const name = (item as { name?: string }).name;
      if (!name || name.startsWith(".")) continue;
      const fullPath = fullPrefix + name;
      const hasExtension = /\.[a-z0-9]+$/i.test(name);
      if (hasExtension) {
        files.push(fullPath);
        continue;
      }
      const { data: subData, error: subError } = await supabase.storage.from(BUCKET).list(fullPath, { limit: 1 });
      if (!subError && Array.isArray(subData)) {
        files.push(...(await listAllFilePaths(fullPath + "/")));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allPaths = await listAllFilePaths("");
  console.log(`Encontrados ${allPaths.length} archivos en el bucket "${BUCKET}".`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let ok = 0;
  let err = 0;
  for (const filePath of allPaths) {
    const { data, error } = await supabase.storage.from(BUCKET).download(filePath);
    if (error) {
      console.warn("  download error", filePath, error.message);
      err++;
      continue;
    }
    const outPath = path.join(OUT_DIR, filePath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(await data.arrayBuffer()));
    ok++;
    if (ok % 20 === 0) console.log("  ", ok, "descargados...");
  }

  console.log(`Listo: ${ok} guardados en ${OUT_DIR}`);
  if (err) console.warn(`${err} fallos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
