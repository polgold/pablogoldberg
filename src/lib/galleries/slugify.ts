/**
 * Renombre automático de archivos: slugify, minúsculas, sin espacios ni caracteres raros.
 * Evita colisiones con numeración correlativa.
 */
export const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif|gif)$/i;

export function slugifyFilename(name: string, options?: { prefix?: string; index?: number }): string {
  const base = name.replace(IMAGE_EXTENSIONS, "").trim();
  let slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) slug = "image";
  if (options?.prefix) slug = `${options.prefix}-${slug}`;
  if (options?.index != null) slug = `${slug}-${String(options.index).padStart(3, "0")}`;
  return slug;
}

/** Extensión preferida para salida (webp o jpg), sin punto. */
export function getOutputExtension(originalName: string, preferWebp = false): string {
  const ext = (originalName.match(IMAGE_EXTENSIONS)?.[0] ?? "").toLowerCase().replace(/^\./, "");
  if (preferWebp && /jpe?g|png/i.test(ext)) return "webp";
  if (ext === "jpeg") return "jpg";
  return ext || "jpg";
}

/**
 * Genera nombre final único: slug + extensión.
 * Si existsCheck(name) devuelve true, añade sufijo numérico.
 */
export function uniqueSlugFilename(
  originalName: string,
  existsCheck: (candidate: string) => boolean,
  options?: { prefix?: string; index?: number }
): string {
  const ext = getOutputExtension(originalName, true);
  const candidate = `${slugifyFilename(originalName, options)}.${ext}`;
  if (!existsCheck(candidate)) return candidate;
  let n = 1;
  const base = candidate.replace(/\.[a-z]+$/i, "");
  while (existsCheck(`${base}-${n}.${ext}`)) n++;
  return `${base}-${n}.${ext}`;
}
