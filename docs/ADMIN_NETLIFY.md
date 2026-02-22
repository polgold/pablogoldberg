# Panel Admin y despliegue en Netlify

## Variables de entorno en Netlify

En **Site settings → Environment variables** (o en `netlify.toml` con `[build.environment]`) configura:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (auth en cliente y server) | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo server, nunca en cliente) | `eyJ...` |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket de Storage | `public` |
| `ADMIN_EMAILS` | Emails permitidos para /admin (whitelist) | `tu@email.com,otro@email.com` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Clave fija para Server Actions (evita "Server Action not found" tras deploy). Generar con: `openssl rand -base64 32` | string base64 de 32 bytes |

### Detalles

- **NEXT_SERVER_ACTIONS_ENCRYPTION_KEY**: sin esta variable, cada deploy genera nuevos IDs para las Server Actions y el panel puede mostrar "Server Action was not found". Configúrala en Netlify (Build & deploy → Environment) con un valor fijo; por ejemplo genera uno con `openssl rand -base64 32` y úsalo en todos los deploys.
- **ADMIN_EMAILS**: lista separada por comas. Solo esos emails pueden iniciar sesión en `/admin`. Si está vacío, nadie puede acceder.
- **Service role**: necesario para que el panel admin escriba en la base de datos y suba archivos a Storage desde el servidor.
- Las variables `NEXT_PUBLIC_*` se exponen al navegador; el resto solo en el servidor.

## Migración SQL

Ejecuta en el **SQL Editor** del dashboard de Supabase el contenido de:

- `supabase/migrations/20250208000000_admin_columns.sql`

Añade las columnas `published`, `gallery_video_paths` y `tags` a `projects`. Los proyectos existentes quedan con `published = false` hasta que los publiques desde el panel.

## Bucket de Storage

- Usa el mismo bucket que `SUPABASE_STORAGE_BUCKET` (p. ej. `public`).
- Las rutas que usa el admin son:
  - `covers/{slug}.{ext}` — portada del proyecto
  - `gallery/{slug}/{filename}` — imágenes de la galería
  - `videos/{slug}/{filename}` — videos de la galería

Asegúrate de que el bucket exista y esté configurado como **público** si quieres que las imágenes se sirvan por URL pública.

## Rutas del admin

- `/admin` — listado de proyectos (requiere login).
- `/admin/login` — login email/contraseña (Supabase Auth).
- `/admin/projects/new` — crear proyecto.
- `/admin/projects/[id]/edit` — editar proyecto (datos, portada, galería, bulk loader, Publish).

## Sitio público

- Solo se muestran proyectos con `published = true`.
- El resto del sitio (páginas, estilos, rutas públicas) no cambia.
