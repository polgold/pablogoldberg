-- Bio (página about): pegar solo esto en Supabase SQL Editor y Run
insert into public.pages (slug, locale, title, content) values
  (
    'about',
    'es',
    'Bio',
    '<p>Nací en Quilmes, en el año 1976. Egresado de la Escuela Panamericana de Diseño y Publicidad. Director de <a href="https://www.sunfactoryfilms.com" target="_blank" rel="noopener">Sun Factory</a>, realizando servicios de producción audiovisual.</p><p>Actualmente, vivo en Pereyra, provincia de Buenos Aires y trabajo como Director, Creativo, Fotógrafo, Editor y Músico.</p><p>La música es mi driver de conexiones neuronales y un cable a tierra, no solamente en los tiempos libres.</p><p>Lo que más me inspira de mi trabajo, es que elegí hacer todos los días algo distinto, algo que me apasiona. Me permite conectar y trabajar con gente maravillosa, me hace viajar y conocer lugares increíbles. La inspiración sucede en el momento menos pensado.</p><p>Siempre hay una historia apasionante que contar. Una perspectiva nueva y fresca que descubrir. Por eso, con más de 20 años de experiencia, pongo cada día toda mi energía y pasión en lo que hago. Para hacer que cada proyecto sea único e irrepetible.</p>'
  )
on conflict (slug, locale) do update set
  title = excluded.title,
  content = excluded.content;
