# Pablo Goldberg — Portfolio

Sitio en Next.js (App Router) con Payload CMS 3 como backend. Contenido gestionado desde `/admin` (proyectos, páginas, media). Base de datos Postgres; medios en disco o S3/R2.

## Requisitos

- Node.js 20+
- Postgres (local o remoto)

## Variables de entorno

Copia `.env.example` a `.env` y rellena:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `PAYLOAD_SECRET` | Secreto para JWT/sesiones (mín. 32 caracteres) |
| `DATABASE_URL` | URL de conexión Postgres |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT` | Opcional. Si están definidas, los medios se suben a S3/R2 en lugar de disco. Para R2 usa `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com` y `S3_REGION=auto`. |

## Instalación

```bash
npm install
```

## Base de datos y migraciones

Tras configurar `DATABASE_URL`:

```bash
# Crear/actualizar tablas (desarrollo)
npm run payload:migrate

# Crear nueva migración (cuando cambies colecciones)
npm run payload:migrate:create
```

## Desarrollo

```bash
npm run dev
```

- Sitio: [http://localhost:3000](http://localhost:3000)
- Admin Payload: [http://localhost:3000/admin](http://localhost:3000/admin) (crea el primer usuario al entrar)

## Build y producción

```bash
npm run build
npm start
```

En Netlify (o similar): configura `DATABASE_URL`, `PAYLOAD_SECRET` y, si usas medios externos, las variables S3/R2. El build ya no ejecuta ningún parse de WordPress.

## Estructura de rutas

| Ruta | Contenido |
|------|-----------|
| `/` | Home: hero, reel, proyectos destacados, CTA |
| `/work` | Listado de proyectos (filtros por rol, búsqueda) |
| `/work/[slug]` | Detalle de proyecto (vídeo, galería, prev/next) |
| `/about` | Página «about» (Payload collection Pages) |
| `/contact` | Página «contact» + CTA / mailto |
| `/admin` | Payload CMS — gestionar Projects, Pages, Media, Users |

## Contenido desde Payload

- **Projects**: title, slug, year, roles, description (rich text), videoUrl (Vimeo/YouTube), cover, gallery, isFeatured.
- **Pages**: slug (home, about, contact), title, content (rich text).
- **Media**: upload + alt; opcional width/height. Si usas S3/R2, las imágenes no se guardan en git.

## Resumen de comandos

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servir build |
| `npm run payload:migrate` | Aplicar migraciones Payload |
| `npm run payload:migrate:create` | Crear nueva migración |
