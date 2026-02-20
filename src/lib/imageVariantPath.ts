/**
 * Convierte un storage_path (original) a la ruta thumb o large.
 * Thumb/large en Storage son siempre .jpg (aunque el original sea .png).
 * Reglas: mismo segmento => devolver p con .jpg; segmento cruzado => reemplazar y .jpg; sin segmento => insertar y .jpg.
 */

const JPG_EXT = ".jpg";

/** Devuelve el path con la extensión del filename final forzada a .jpg */
function forceJpg(p: string): string {
  if (!p) return p;
  const lastSlash = p.lastIndexOf("/");
  const rawName = lastSlash === -1 ? p : p.slice(lastSlash + 1);
  const dot = rawName.lastIndexOf(".");
  const baseName = dot === -1 ? rawName : rawName.slice(0, dot);
  const filename = baseName + JPG_EXT;
  if (lastSlash === -1) return filename;
  return p.slice(0, lastSlash + 1) + filename;
}

/** Inserta segment (thumb o large) antes del filename y fuerza .jpg */
function insertSegmentAndJpg(p: string, segment: "thumb" | "large"): string {
  if (!p) return p;
  const lastSlash = p.lastIndexOf("/");
  const dir = lastSlash === -1 ? "" : p.slice(0, lastSlash);
  const rawName = lastSlash === -1 ? p : p.slice(lastSlash + 1);
  const dot = rawName.lastIndexOf(".");
  const baseName = dot === -1 ? rawName : rawName.slice(0, dot);
  const filename = baseName + JPG_EXT;
  if (!dir) return `${segment}/${filename}`;
  return `${dir}/${segment}/${filename}`;
}

export function toThumbPath(p: string): string {
  if (!p) return p;
  if (p.includes("/thumb/")) return forceJpg(p);
  if (p.includes("/large/")) return forceJpg(p.replace("/large/", "/thumb/"));
  return insertSegmentAndJpg(p, "thumb");
}

export function toLargePath(p: string): string {
  if (!p) return p;
  if (p.includes("/large/")) return forceJpg(p);
  if (p.includes("/thumb/")) return forceJpg(p.replace("/thumb/", "/large/"));
  return insertSegmentAndJpg(p, "large");
}
