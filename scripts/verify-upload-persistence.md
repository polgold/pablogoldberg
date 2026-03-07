# Verificación de persistencia de uploads

Pasos para verificar que los archivos subidos persisten correctamente (incluyendo después de redeploy).

## Requisitos previos

- Proyecto corriendo localmente o en Hostinger
- Acceso al admin
- Supabase configurado

## Pasos de verificación

### 1. Subir un archivo

1. Ir a Admin → Proyectos → Crear o editar un proyecto
2. Subir una imagen de portada o agregar imágenes a la galería
3. Guardar

### 2. Confirmar fila en DB

En Supabase (SQL Editor o Dashboard):

```sql
-- Ver proyectos con cover
SELECT id, slug, cover_image_path FROM admin_projects WHERE cover_image_path IS NOT NULL;

-- Ver imágenes de galería
SELECT id, project_id, path, thumb_path FROM project_gallery_images ORDER BY created_at DESC LIMIT 5;
```

Verificar que `path` y `thumb_path` tienen formato `projects/{slug}/large/...` y `projects/{slug}/thumb/...`.

### 3. Confirmar archivo en UPLOAD_DIR

**Desarrollo (UPLOAD_DIR no definido):**
```bash
ls -la public/uploads/projects/{slug}/large/
ls -la public/uploads/projects/{slug}/thumb/
```

**Hostinger (UPLOAD_DIR definido):**
```bash
ls -la $UPLOAD_DIR/projects/{slug}/large/
ls -la $UPLOAD_DIR/projects/{slug}/thumb/
```

Los archivos deben existir en disco.

### 4. Redeploy

- Hacer un deploy (git push, o redeploy manual en Hostinger)
- En desarrollo: simular con `rm -rf .next && npm run build`

### 5. Confirmar persistencia

**Desarrollo:** Si usás `public/uploads`, los archivos se pierden en redeploy (están en el repo). Para probar persistencia real, definí `UPLOAD_DIR` apuntando a un directorio fuera del proyecto.

**Hostinger:**
1. Verificar que los archivos siguen en `$UPLOAD_DIR`
2. Abrir la página del proyecto en el sitio
3. Verificar que la imagen se renderiza correctamente (portada y galería)

### Checklist final

- [ ] Archivo subido
- [ ] Fila en DB con path correcto
- [ ] Archivo existe en UPLOAD_DIR
- [ ] Redeploy ejecutado
- [ ] Archivo sigue en UPLOAD_DIR
- [ ] Imagen se renderiza en el sitio
