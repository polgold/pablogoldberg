# Panel Admin (/admin)

Panel de gestión de proyectos con auth Supabase, CRUD, cover uploader y bulk uploader.

## Requisitos previos

1. **Supabase**: proyecto creado, tablas `pages` y `projects` (ver `supabase/tables.sql`)
2. **Migración admin**: ejecutar `supabase/migrations/20250208000000_admin_columns.sql` para columnas `published`, `gallery_video_paths`, `tags`
3. **Storage**: bucket creado (nombre = `SUPABASE_STORAGE_BUCKET`, ej. `public`), configurado como público para URLs directas
4. **Auth**: en Supabase Dashboard → Authentication → Users, crear usuario con email/contraseña

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (**solo server**, nunca exponer) |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket de Storage (ej. `public`) |
| `ADMIN_EMAILS` | Emails permitidos separados por coma (ej. `admin@ejemplo.com,otro@ejemplo.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Mismo valor que `SUPABASE_URL` (para login en cliente) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mismo valor que `SUPABASE_ANON_KEY` (para login en cliente) |

## Uso

1. **Login**: ir a `/admin/login` e iniciar sesión con un email en `ADMIN_EMAILS`
2. **Proyectos**: listar en `/admin`, crear en `/admin/projects/new`, editar en `/admin/projects/[id]`
3. **Portada**: subir imagen única en sección "Portada" → se guarda en `covers/{slug}/cover.ext`
4. **Galería**: subir imágenes/videos sueltos con drag&drop → `gallery/{slug}/` y `videos/{slug}/`
5. **Bulk loader**: arrastrar carpetas completas o archivos → misma estructura, con preview y barra de progreso

## Rutas de Storage

| Tipo | Ruta | Ejemplo |
|------|------|---------|
| Cover | `covers/{slug}/cover.{ext}` | `covers/mi-proyecto/cover.jpg` |
| Imágenes galería | `gallery/{slug}/{filename}` | `gallery/mi-proyecto/foto-abc123.jpg` |
| Videos galería | `videos/{slug}/{filename}` | `videos/mi-proyecto/clip-def456.mp4` |

Los nombres de archivo se generan con `uniqueStorageName()` para evitar colisiones.

## Características

- **Auth**: email/password vía Supabase Auth
- **Whitelist**: solo emails en `ADMIN_EMAILS` pueden acceder
- **Service role**: usado únicamente en server (actions, DB, Storage)
- **Bulk upload**: soporta carpetas (webkitGetAsEntry), preview, progreso incremental
- **Separación**: imágenes → gallery, videos → videos
- **CRUD**: crear y editar proyectos; publicar para visibilidad en el sitio
