# Arquitectura Admin-Driven para Hostinger

Este documento describe la arquitectura del panel de administración y cómo gestionar el contenido sin editar código.

## Almacenamiento de archivos subidos

**Los archivos subidos NO se guardan dentro del repositorio ni del path de deploy.**

- **Variable de entorno:** `UPLOAD_DIR`
- **En Hostinger:** Configurá `UPLOAD_DIR` apuntando a un directorio **fuera** del path que git deploy sobrescribe.
  - Ejemplo: `/home/username/persistent/uploads` o `/var/www/persistent/uploads`
- **En desarrollo:** Si no se define `UPLOAD_DIR`, se usa `public/uploads` (se sobrescribe con git deploy).

**Estructura de carpetas:**
```
UPLOAD_DIR/
└── projects/
    └── {slug}/
        ├── large/     # Imágenes originales o grandes
        │   ├── cover.jpg
        │   └── imagen-xxx.jpg
        └── thumb/     # Miniaturas generadas automáticamente
            ├── cover.jpg
            └── imagen-xxx.jpg
```

### Servido de imágenes

- **Directo (desarrollo):** Cuando `NEXT_PUBLIC_USE_IMAGE_PROXY` no está definido, las imágenes se sirven desde `/uploads/projects/...` (Next.js sirve `public/` directamente).
- **Proxy (Hostinger):** Cuando `NEXT_PUBLIC_USE_IMAGE_PROXY=true` (requerido si `UPLOAD_DIR` apunta fuera de `public/`), las imágenes se sirven vía `/api/proxy-image?path=projects/slug/large/archivo.jpg` con cache fuerte (1 año, immutable).

---

## Tablas de base de datos (Supabase)

| Tabla | Descripción |
|-------|-------------|
| `admin_projects` | Proyectos con campos bilingües, hero video (platform, video_id, hero_video_url), website, instagram, published, sort_order |
| `project_gallery_images` | Imágenes de galería por proyecto: path, thumb_path, is_cover, sort_order, hidden |
| `project_videos` | Videos adicionales: platform, video_id, url (original), custom_thumbnail (fallback), sort_order |
| `films` | Sección Films: title, platform, video_id, url (original), custom_thumbnail (fallback), description, published, sort_order |

### Videos (estructura)

Todos los videos se almacenan en forma estructurada:
- **platform:** `vimeo` | `youtube`
- **video_id:** ID extraído de la URL
- **url:** URL original (para referencia)

Si el thumbnail de la plataforma falla, se usa `custom_thumbnail` (URL opcional).

---

## Cómo agregar un nuevo proyecto

1. **Admin** → **Nuevo proyecto**
2. Completar:
   - Título (ES) y Título (EN)
   - Slug (ej: `mi-proyecto`)
   - Descripción
   - Video hero (URL de Vimeo o YouTube)
   - Website, Instagram
   - Portada (imagen)
   - Orden, Publicado
3. Guardar
4. En la página del proyecto: subir imágenes a la galería, agregar videos adicionales, seleccionar portada desde la galería

---

## Cómo agregar un nuevo film

1. **Admin** → **Films** → **Nuevo film**
2. Completar:
   - Título
   - URL de Vimeo o YouTube
   - Descripción
   - Orden, Publicado
3. Guardar

El thumbnail se obtiene de Vimeo/YouTube. Si falla, podés definir un Thumbnail custom (URL).

---

## Cómo hacer backup del contenido

### 1. Base de datos (Supabase)

- Exportar desde el dashboard de Supabase: **Settings** → **Database** → **Backups**
- O usar `pg_dump` con la connection string de Supabase

### 2. Archivos subidos

- Copiar el directorio `UPLOAD_DIR` completo (p. ej. `/home/username/persistent/uploads`)
- Backup recomendado: `rsync` o `tar` del directorio a un almacenamiento externo

```bash
# Ejemplo de backup
tar -czvf uploads-backup-$(date +%Y%m%d).tar.gz /path/to/UPLOAD_DIR
```

### 3. Restaurar

- **DB:** Importar el dump en Supabase
- **Archivos:** Descomprimir/copiar en el mismo path que `UPLOAD_DIR`

---

---

## Seguridad y RLS (Row Level Security)

### Dónde se usa la Service Role Key

La `SUPABASE_SERVICE_ROLE_KEY` **solo se usa en el servidor**, nunca en el navegador:

| Ubicación | Cliente | Uso |
|-----------|---------|-----|
| `src/lib/supabase/server.ts` | `createAdminSupabaseClient()` | Todas las operaciones admin (create/update/delete) |
| `src/lib/supabase/server.ts` | `createSupabaseServerClient()` | Lecturas del sitio público (admin-content) |
| `src/app/admin/admin-actions.ts` | `createAdminSupabaseClient()` | Server actions: proyectos, galería, videos, films |

### Operaciones server-side (service role)

Todas las escrituras pasan por **server actions** que usan `createAdminSupabaseClient()`:

- **Crear proyecto** → `createAdminProject` (admin-actions.ts)
- **Actualizar proyecto** → `updateAdminProject` (admin-actions.ts)
- **Eliminar proyecto** → `deleteAdminProject` (admin-actions.ts)
- **Subir imágenes galería** → `uploadProjectGalleryImages` (admin-actions.ts)
- **Portada, reordenar, ocultar, eliminar imagen** → `setGalleryCover`, `reorderGalleryImages`, `toggleGalleryImageHidden`, `deleteGalleryImage`
- **Agregar/eliminar video de proyecto** → `addProjectVideo`, `removeProjectVideo`
- **Crear/actualizar/eliminar film** → `createFilm`, `updateFilm`, `deleteFilm`

### Políticas RLS activas

RLS permanece **habilitado** en todas las tablas:

- **admin_projects**: `SELECT` público (`using (true)`), `INSERT/UPDATE/DELETE` solo `service_role`
- **project_gallery_images**: igual
- **project_videos**: igual
- **films**: igual

### El navegador NO escribe directamente

- El admin UI usa **solo** server actions (ProjectForm, GalleryEditor, ProjectVideosEditor, FilmForm).
- El cliente `createAdminBrowserClient` (anon key) se usa **únicamente** para auth (login, logout).
- **Ningún componente cliente** hace `.insert()`, `.update()` o `.delete()` contra Supabase.

### Si falta SUPABASE_SERVICE_ROLE_KEY

`createAdminSupabaseClient()` lanza un error explícito indicando que hay que configurar la variable. No hay fallback silencioso a anon.

---

## Configuración en Hostinger

1. **Variables de entorno:** `UPLOAD_DIR`, `NEXT_PUBLIC_USE_IMAGE_PROXY=true`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`
2. **Directorio persistente:** Crear el directorio fuera del deploy path y dar permisos de escritura al usuario de la app
3. **Migraciones:** Ejecutar en Supabase: `20250307000000_admin_driven_schema.sql` y `20250307100000_video_and_thumbnail_fields.sql`

## Verificación de persistencia

Ver `scripts/verify-upload-persistence.md` para pasos de prueba: subir archivo → confirmar DB → confirmar archivo en disco → redeploy → verificar que sigue funcionando.
