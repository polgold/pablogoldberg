/**
 * Crea imágenes de prueba en public/uploads/projects/ para ver el home en local.
 * Ejecutar: node scripts/seed-local-images.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public", "uploads", "projects");

const COVERS = [
  "bestefar/cover.jpg",
  "procens-inside/cover.jpg",
  "sirenas-rock/cover.jpg",
  "baguales/cover.jpg",
  "age-luthier/cover.jpg",
  "home-sick/cover.jpg",
];

const PHOTOS = [
  "portfolio/thumb/photo1.jpg",
  "portfolio/thumb/photo2.jpg",
  "portfolio/thumb/photo3.jpg",
  "portfolio/large/photo1.jpg",
  "portfolio/large/photo2.jpg",
  "portfolio/large/photo3.jpg",
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function createImage(relativePath, width = 800, height = 600) {
  const fullPath = path.join(ROOT, relativePath);
  const dir = path.dirname(fullPath);
  await ensureDir(dir);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 40, g: 40, b: 50 },
    },
  })
    .jpeg({ quality: 80 })
    .toFile(fullPath);
  console.log("  ", relativePath);
}

async function main() {
  console.log("Creando imágenes de prueba en public/uploads/projects/ ...");
  await ensureDir(ROOT);

  console.log("Covers (trabajos destacados):");
  for (const p of COVERS) await createImage(p);

  console.log("Fotos (portfolio):");
  for (const p of PHOTOS) await createImage(p, 400, 400);

  console.log("\nListo. Arrancá con: USE_LOCAL_STORAGE=true npm run dev");
  console.log("Luego abrí http://localhost:3000/es\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
