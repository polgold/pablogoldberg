# Admin de galerías locales

Sistema de galerías con imágenes en disco (MEDIA_ROOT), índice en SQLite y admin con drag & drop.

## Variables de entorno

- **MEDIA_ROOT** (opcional): Ruta absoluta o relativa a la raíz del proyecto donde se guardan las imágenes. Por defecto: `data/uploads`. En Hostinger: ej. `/data/pablogoldberg/uploads`.
- **GALLERIES_DB_PATH** (opcional): Ruta del archivo SQLite. Por defecto: `data/galleries.db`.

## Comandos locales

```bash
# Inicializar la base y crear galerías desde public/uploads/work/photography
npm run galleries:init

# Desarrollo
npm run dev

# Build
npm run build
npm start
```

## Uso del admin

1. **Crear galería**: Admin → Galerías → Nueva galería. Elegir sección (photography, work, beasts, aerial), título y slug.
2. **Subir imágenes**: En el detalle de la galería, arrastrar archivos a la zona de drop o "Elegí archivos". Se renombran (slugify), se comprimen con Sharp y se generan large (2200px) y thumb (700px).
3. **Reordenar**: Arrastrar los thumbnails en el grid para cambiar el orden. Se guarda al soltar.
4. **Visible/oculta**: Botón 👁 en cada imagen.
5. **Destacar para home**: Botón ★. Esas imágenes aparecen en la mini galería de la home (rotación cada 5s).
6. **Regenerar thumbs**: Botón "Reconstruir desde disco" si faltan thumbs o añadiste archivos a mano en MEDIA_ROOT.
7. **Alt text**: Botón "A" en cada imagen para editar el texto alternativo.

## Deploy en Hostinger

1. Crear carpeta persistente fuera del build, ej. `/home/tuuser/pablogoldberg-data/uploads` y opcionalmente `/home/tuuser/pablogoldberg-data` para la DB.
2. En el panel de Hostinger (o `.env` de producción) configurar:
   - `MEDIA_ROOT=/home/tuuser/pablogoldberg-data/uploads`
   - `GALLERIES_DB_PATH=/home/tuuser/pablogoldberg-data/galleries.db`
3. Asegurar que la app tenga permisos de escritura en esas carpetas.
4. Las imágenes se sirven vía `/uploads/photography/people/large/archivo.webp` (route handler que lee de MEDIA_ROOT).
5. El deploy (build) no toca `data/` ni MEDIA_ROOT, por lo que las imágenes no se borran.

## Estructura en disco (MEDIA_ROOT)

```
uploads/
  photography/
    people/
      large/
      thumb/
    portraits/
      large/
      thumb/
  work/
  beasts/
  aerial/
```

## Migrar fotos existentes desde public/uploads/work

Si tenés fotos en `public/uploads/work/photography/` y querés pasarlas al sistema nuevo:

1. Copiar o enlazar: `cp -r public/uploads/work/* data/uploads/` (o symlink si MEDIA_ROOT apunta a `public/uploads/work` temporalmente).
2. Ejecutar `npm run galleries:init` (crea las filas de galerías).
3. En cada galería en el admin, clic en "Reconstruir desde disco" para que escanee large/thumb y agregue los ítems a la DB.
