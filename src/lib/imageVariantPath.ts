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

/**
 * Para proyectos: si el path ya tiene /large/ o /thumb/, devuelve la variante large.
 * Si no (ej. food/gallery/x.jpg), devuelve el path original para no pedir food/gallery/large/x.jpg que puede no existir.
 */
export function toLargePathOrOriginal(p: string): string {
  if (!p) return p;
  if (p.includes("/large/") || p.includes("/thumb/")) return toLargePath(p);
  return forceJpg(p);
}

/**
 * Para proyectos: si el path ya tiene /thumb/ o /large/, devuelve la variante thumb.
 * Si no, devuelve el path original (no insertar /thumb/ que puede no existir).
 */
export function toThumbPathOrOriginal(p: string): string {
  if (!p) return p;
  if (p.includes("/thumb/") || p.includes("/large/")) return toThumbPath(p);
  return forceJpg(p);
}

/**
 * Inserta segment (large o thumb) como carpeta antes del filename. Respeta la extensión.
 * Para Fotografía: en Supabase es categoría/large/archivo.jpg y categoría/thumb/archivo.jpg.
 * Ej: bosque/CHICAS_BOSQUE-3.jpg → bosque/large/CHICAS_BOSQUE-3.jpg
 */
function insertSegmentBeforeFilename(p: string, segment: "large" | "thumb"): string {
  if (!p) return p;
  const trimmed = p.replace(/^\//, "");
  if (trimmed.includes(`/${segment}/`)) return trimmed;
  if (segment === "large" && trimmed.includes("/thumb/")) return trimmed.replace("/thumb/", "/large/");
  if (segment === "thumb" && trimmed.includes("/large/")) return trimmed.replace("/large/", "/thumb/");
  const lastSlash = trimmed.lastIndexOf("/");
  const dir = lastSlash === -1 ? "" : trimmed.slice(0, lastSlash);
  const filename = lastSlash === -1 ? trimmed : trimmed.slice(lastSlash + 1);
  if (!dir) return `${segment}/${filename}`;
  return `${dir}/${segment}/${filename}`;
}

/** Fotografía: categoría/large/archivo.jpg */
export function toLargePathPrefix(p: string): string {
  return insertSegmentBeforeFilename(p, "large");
}

/** Fotografía: categoría/thumb/archivo.jpg */
export function toThumbPathPrefix(p: string): string {
  return insertSegmentBeforeFilename(p, "thumb");
}
