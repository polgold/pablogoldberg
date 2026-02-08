# Pablo Goldberg — Portfolio

Sitio en Next.js (App Router) con Payload CMS 3 como backend. Contenido gestionado desde `/admin` (proyectos, páginas, media). Base de datos Postgres; medios en disco o S3/R2. Versión ES/EN con selector en el header.

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

**Producción:** asegura tener `DATABASE_URL` y `PAYLOAD_SECRET` configurados para que `/admin` y el sitio funcionen correctamente.

## Instalación

```bash
npm install
```

## Base de datos y migraciones

Tras configurar `DATABASE_URL`:

```bash
# Aplicar migraciones (crear/actualizar tablas)
npm run payload:migrate

# Crear nueva migración (solo cuando cambies colecciones en el código)
npm run payload:migrate:create
```

Si añadiste o modificaste campos en Projects o Pages, ejecuta `payload:migrate` antes de usar el admin.

### Migraciones en producción (Netlify / DB remota)

Las migraciones no se ejecutan automáticamente en el deploy. Si el sitio en producción falla por tablas faltantes o esquema desactualizado:

1. Configura localmente (o en un entorno seguro) la **misma base de datos de producción**: copia `DATABASE_URL` de las variables de entorno del sitio en Netlify (Site settings → Environment variables).
2. Ejecuta las migraciones contra esa DB:
   ```bash
   npm run payload:migrate
   ```
3. Acepta las migraciones pendientes cuando el CLI lo pida. No hace falta redeploy: los cambios se aplican en la DB y el sitio ya desplegado los usará.

Solo necesitas repetir este paso cuando cambies colecciones o campos en el código y subas un nuevo deploy.

## Desarrollo

```bash
npm run dev
```

- Sitio: [http://localhost:3000](http://localhost:3000) (redirige a `/es`)
- Español: [http://localhost:3000/es](http://localhost:3000/es)
- English: [http://localhost:3000/en](http://localhost:3000/en)
- Admin Payload: [http://localhost:3000/admin](http://localhost:3000/admin) (crea el primer usuario al entrar)

## Cargar contenido desde /admin

1. Entra en **http://localhost:3000/admin** (o tu dominio/admin).
2. Crea un usuario la primera vez.
3. **Projects**: cada proyecto puede tener:
   - **Título** (ES/EN), **slug**, **Cliente** (obligatorio), **Tipo de pieza** (Ad, Documentary, Brand Film, Music Video, Social, Other), **Año**, **Orden** (opcional; si lo usas, los proyectos se ordenan por este número).
   - **Roles** (Director, DP, Producer, etc.), **Resumen** (corto, para listados y SEO), **Descripción** (texto largo), **Créditos** (rich text).
   - **Duración** (ej. 30s, 2:15), **Video** (URL Vimeo/YouTube), **Cover**, **Galería**, **Enlace externo** (opcional).
   - **Destacado**: marcar para que aparezca en la home.
4. **Pages**: crea páginas con slug `home`, `about`, `contact`. Título y contenido son localizables (ES/EN).
5. **Media**: sube imágenes para portadas y galerías. Con S3/R2 configurado, se suben a la nube.

La web usa solo el contenido de Payload; no hay que tocar JSON ni scripts para el contenido en vivo.

## Build y producción

```bash
npm run build
npm start
```

En Netlify (o similar): configura `DATABASE_URL`, `PAYLOAD_SECRET` y, si usas medios externos, las variables S3/R2.

## Estructura de rutas

| Ruta | Contenido |
|------|-----------|
| `/` | Redirige a `/es` |
| `/es`, `/en` | Home: hero, reel, proyectos destacados, CTA (contenido en ese idioma) |
| `/es/work`, `/en/work` | Listado de proyectos (filtros, búsqueda; muestra cliente y tipo de pieza) |
| `/es/work/[slug]`, `/en/work/[slug]` | Detalle de proyecto (vídeo, galería, créditos, enlace externo) |
| `/es/about`, `/en/about` | Página «about» (Payload Pages, localizada) |
| `/es/contact`, `/en/contact` | Página «contact» + CTA / mailto |
| `/admin` | Payload CMS — Projects, Pages, Media, Users |

Selector de idioma **ES | EN** en el header para cambiar de idioma manteniendo la misma página.

## Contenido desde Payload (resumen)

- **Projects**: title (localizado), slug, **client**, **pieceType**, year, **order**, roles, **summary** (localizado), description (localizado), **credits** (localizado), **duration**, videoUrl, **externalLink**, cover, gallery, isFeatured.
- **Pages**: slug (home, about, contact), title y content (localizados).
- **Media**: upload + alt. Con S3/R2, las imágenes no se guardan en git.

## Resumen de comandos

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servir build |
| `npm run payload:migrate` | Aplicar migraciones Payload |
| `npm run payload:migrate:create` | Crear nueva migración (tras cambiar colecciones) |
