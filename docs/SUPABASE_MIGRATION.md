# Migración a Supabase (sin pg)

## Resumen

- **Datos**: Supabase Postgres vía `@supabase/supabase-js` (HTTP). Tablas `pages` y `projects`.
- **Fotos**: Supabase Storage. Campo `cover_image_path` y `gallery_image_paths` en `projects`; URLs con `getPublicImageUrl()` o signed URLs desde server.
- **Sin pg/pg-pool**: el sitio no usa `DATABASE_URL` ni conecta a Postgres directo; funciona en Netlify (SSR/server routes).

---

## Archivos cambiados

| Archivo | Cambio |
|--------|--------|
| `package.json` | Añadido `@supabase/supabase-js`. Eliminados: `pg`, `pg-pool`, `@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`, `payload`, `graphql`, `@aws-sdk/client-s3`, scripts `payload:migrate*`. |
| `.env.example` | Reemplazado por variables Supabase (ya no Payload/DATABASE_URL). |
| `next.config.ts` | Quitado `withPayload`. Añadidos `remotePatterns` para Supabase Storage. |
| `tsconfig.json` | Eliminado path `@payload-config`. |
| `src/lib/supabase/server.ts` | **Nuevo.** `createSupabaseServerClient()` con SERVICE_ROLE_KEY. |
| `src/lib/supabase/client.ts` | **Nuevo.** Cliente con ANON_KEY para uso en navegador. |
| `src/lib/supabase/storage.ts` | **Nuevo.** `getPublicImageUrl(path)`, `getSignedImageUrl()` para bucket privado. |
| `src/lib/content.ts` | Reescrito: lee de Supabase (`pages`, `projects`), sin Payload/Lexical. |
| `src/app/sitemap.ts` | Eliminado polyfill de `File` (ya no se usa Payload/Lexical aquí). |
| `src/app/(payload)/layout.tsx` | Sustituido por layout mínimo (sin Payload). |
| `src/app/(payload)/api/[...slug]/route.ts` | Devuelve 404 (sin API de Payload). |
| `src/app/(payload)/admin/[[...segments]]/page.tsx` | Página estática "Content is managed via Supabase". |
| **Eliminados** | `src/payload.config.ts`, `src/lib/get-payload.ts`, `src/collections/Media.ts`, `Pages.ts`, `Projects.ts`, `Users.ts`. |

---

## Package.json diff (resumen)

- **Añadido:** `"@supabase/supabase-js": "^2.49.1"`
- **Eliminado:** `@aws-sdk/client-s3`, `@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`, `graphql`, `payload`, scripts `payload:migrate`, `payload:migrate:create`

---

## Variables de entorno en Netlify

En **Site settings → Environment variables** (o en `netlify.toml` bajo `[build.environment]`):

| Variable | Descripción | Dónde se usa |
|----------|-------------|----------------|
| `SUPABASE_URL` | URL del proyecto (ej. `https://xxx.supabase.co`) | Server + client |
| `SUPABASE_ANON_KEY` | Clave anónima (pública) | Cliente browser si hace llamadas a Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo server) | **Solo** en server (SSR, API routes). Nunca exponer al cliente. |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket (ej. `public`) | Server para URLs de imágenes |

Opcional para cliente (si se usan llamadas desde el navegador):

- `NEXT_PUBLIC_SUPABASE_URL` = mismo valor que `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = mismo valor que `SUPABASE_ANON_KEY`

---

## Tablas en Supabase

### `pages`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `slug` | text | ej. home, about, contact |
| `locale` | text | es | en |
| `title` | text | |
| `content` | text | HTML |
| `created_at` | timestamptz | default now() |

Unique: `(slug, locale)`.

### `projects`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | PK |
| `slug` | text | URL-friendly |
| `locale` | text | es | en |
| `title` | text | |
| `summary` | text | Resumen corto |
| `description` | text | HTML cuerpo |
| `credits` | text | HTML créditos |
| `year` | int | |
| `order` | int | Orden manual (mayor = primero) |
| `client` | text | |
| `piece_type` | text | Ad, Documentary, etc. |
| `duration` | text | ej. 30s |
| `video_url` | text | Vimeo/YouTube URL |
| `external_link` | text | |
| `cover_image_path` | text | Ruta en bucket (ej. `demo/cover.jpg`) |
| `gallery_image_paths` | text[] | Rutas en bucket |
| `is_featured` | boolean | default false |
| `created_at` | timestamptz | |

Unique: `(slug, locale)`.

Script SQL completo: `supabase/tables.sql` (incluye RLS de lectura pública e inserts de ejemplo).

---

## Storage (fotos)

- Crear un bucket en Supabase Storage (nombre = `SUPABASE_STORAGE_BUCKET`, ej. `public`).
- Si el bucket es **público**: las URLs se construyen con `getPublicImageUrl(path)` (helper en `src/lib/supabase/storage.ts`).
- Si el bucket es **privado**: usar en server `getSignedImageUrl(supabase, path, 3600)` con el cliente de `createSupabaseServerClient()`.

---

## Pruebas

1. `npm run build` — debe completar sin errores y sin usar `DATABASE_URL`/pg.
2. `npm run start` — levantar y revisar home, `/es/work`, `/es/work/[slug]`, about, contact.
3. En logs en runtime no debe aparecer `pg` ni conexión a Postgres.
4. En Netlify: configurar las env vars anteriores y desplegar; el build no requiere DB.
