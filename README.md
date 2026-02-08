# Pablo Goldberg — Portfolio

Sitio estático en Next.js (App Router) generado a partir del export XML de WordPress. Sin base de datos ni CMS.

## Requisitos

- Node.js 18+
- Contenido: archivo de export de WordPress en `content/wp-export.xml`

## Instalación

```bash
npm install
```

## Contenido (XML → JSON)

Antes de desarrollar o hacer build, genera los JSON a partir del XML de WordPress:

```bash
npm run content:parse
```

Esto lee `content/wp-export.xml` y escribe en `content/generated/`:

- `pages.json` — páginas (home, about, contact, etc.)
- `projects.json` — proyectos (páginas que no son principales)
- `taxonomy.json` — categorías y etiquetas

Ejecuta este comando cada vez que actualices el XML.

## Medios (imágenes / vídeos)

- Las URLs de imágenes en el XML pueden apuntar a `pablogoldberg.com` (ya permitido en `next.config.ts`).
- Para servir medios en local o sin depender del WordPress original:
  1. Extrae el zip de medios de WordPress en `public/uploads`, respetando la estructura `wp-content/uploads/...`.
  2. Opcional: en el parser o en el contenido generado, reemplaza dominios por rutas locales (`/uploads/...`) si quieres que todo salga de `public/uploads`.

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build y producción

```bash
npm run build
npm start
```

Build estático: las páginas se generan en el build (incluidas `/work/[slug]` vía `generateStaticParams`).

## Estructura de rutas

| Ruta | Contenido |
|------|-----------|
| `/` | Home: hero, reel, proyectos destacados, CTA |
| `/work` | Listado de proyectos con filtros y búsqueda |
| `/work/[slug]` | Detalle de proyecto (vídeo, galería, créditos, prev/next) |
| `/about` | Contenido de la página «about» del XML |
| `/contact` | Contenido de la página «contact» + CTA / mailto |

## SEO

- Metadata y Open Graph en layout y por página.
- Imagen por defecto para redes: coloca `public/og-default.png` (recomendado 1200×630).
- `sitemap.xml` y `robots.txt` generados en `/sitemap.xml` y `/robots.txt`.

## Resumen de comandos

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run content:parse` | Regenerar JSON desde `content/wp-export.xml` |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servir build (tras `npm run build`) |
