/**
 * Inserta/actualiza la página "about" (bio) en Supabase.
 * Ejecutar: node --env-file=.env --import tsx scripts/seed-about-bio.ts
 * Requiere .env con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const bioContent = `<p>Soy Director de <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, donde realizo servicios de producción audiovisual.</p>
<p>Dirigí el documental BESTEFAR (40') y fui director de fotografía en Home(Sick). También dirigí la serie Sirenas Rock.</p>
<p>En la actualidad trabajo como Director, DF, productor y colaborador creativo en agencias de publicidad.</p>
<p>Hace más de 20 años realizo cine documental y contenido comercial para empresas y agencias, desarrollando piezas con una mirada clara y un enfoque específico según cada proyecto.</p>`;

async function main() {
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
    process.exit(1);
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("pages")
    .upsert(
      { slug: "about", locale: "es", title: "Bio", content: bioContent },
      { onConflict: "slug,locale" }
    )
    .select()
    .single();
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log("Bio actualizada en Supabase (about, es):", data?.title);
}

main();
