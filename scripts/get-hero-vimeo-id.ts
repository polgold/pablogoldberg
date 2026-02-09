/**
 * Obtiene el ID del primer video de Vimeo (reel/hero).
 * Ejecutar: npx tsx scripts/get-hero-vimeo-id.ts
 *
 * Copiá el ID que aparece y agregalo a .env:
 *   HERO_VIMEO_ID=123456789
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Cargar .env manualmente
try {
  const env = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* .env no existe */
}

const API = "https://api.vimeo.com";
const token = process.env.VIMEO_ACCESS_TOKEN?.trim();

if (!token) {
  console.error("❌ Faltá VIMEO_ACCESS_TOKEN en .env");
  process.exit(1);
}

async function main() {
  const res = await fetch(`${API}/me/videos?per_page=10&sort=date`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("❌ Error de Vimeo:", res.status, await res.text());
    process.exit(1);
  }

  const json = (await res.json()) as { data?: Array<{ uri: string; name: string }> };
  const videos = json.data ?? [];

  if (videos.length === 0) {
    console.log("No hay videos en la cuenta. Subí uno primero en vimeo.com.");
    return;
  }

  const first = videos[0];
  const id = first.uri.match(/\/videos\/(\d+)/)?.[1];

  if (!id) {
    console.error("No se pudo extraer el ID del video.");
    process.exit(1);
  }

  console.log("\n🎬 Videos (los más recientes primero):\n");
  videos.forEach((v, i) => {
    const vid = v.uri.match(/\/videos\/(\d+)/)?.[1];
    const marker = i === 0 ? " ← este se usa como hero por defecto" : "";
    console.log(`   ${i + 1}. ${v.name} (ID: ${vid})${marker}`);
  });

  console.log("\n✅ Agregá a tu .env:\n");
  console.log(`   HERO_VIMEO_ID=${id}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
