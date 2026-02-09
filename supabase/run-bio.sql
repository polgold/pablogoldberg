-- Bio (página about): pegar en Supabase SQL Editor y Run para actualizar el contenido.
insert into public.pages (slug, locale, title, content) values
  (
    'about',
    'es',
    'Bio',
    '<p>Soy Pablo, nací en Quilmes y vivo en Pereyra, Buenos Aires. Soy dueño de <a href="https://www.sunfactory.com.ar" target="_blank" rel="noopener">Sun Factory</a>, una productora de cine ubicada en Argentina. Me licencié en Artes Visuales y Diseño en la Escuela Panamericana de Diseño y Publicidad de Buenos Aires en 1997. Hoy en día, sigo aprendiendo.</p><p>Durante los últimos 20 años he trabajado como director y director de fotografía en cortometrajes, documentales, comerciales, vídeos musicales, largometrajes, televisión, conciertos, branded content y fotografía publicitaria. En los trabajos comerciales y artísticos en América Latina hay que hacer de todo. Así que adquirí experiencia en todas las áreas necesarias para dar vida a las historias.</p>'
  )
on conflict (slug, locale) do update set
  title = excluded.title,
  content = excluded.content;
