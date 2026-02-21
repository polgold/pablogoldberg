/**
 * Inserta/actualiza la página "about" (bio) en Supabase.
 * Ejecutar: node --env-file=.env --import tsx scripts/seed-about-bio.ts
 * Requiere .env con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const bioContent = `<p>Nací en Quilmes, en el año 1976. Egresado de la Escuela Panamericana de Diseño y Publicidad. Director de <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener noreferrer">Sun Factory</a>, realizando servicios de producción audiovisual.</p>
<p>Actualmente, vivo en Pereyra, provincia de Buenos Aires y trabajo como Director, Creativo, Fotógrafo, Editor y Músico.</p>
<p>La música es mi driver de conexiones neuronales y un cable a tierra, no solamente en los tiempos libres.</p>
<p>Lo que más me inspira de mi trabajo, es que elegí hacer todos los días algo distinto, algo que me apasiona. Me permite conectar y trabajar con gente maravillosa, me hace viajar y conocer lugares increíbles. La inspiración sucede en el momento menos pensado.</p>
<p>Siempre hay una historia apasionante que contar. Una perspectiva nueva y fresca que descubrir. Por eso, con más de 20 años de experiencia, pongo cada día toda mi energía y pasión en lo que hago. Para hacer que cada proyecto sea único e irrepetible.</p>`;

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
