# Análisis: public/uploads y flujo de imágenes

## 1. Estructura real en `public/uploads/projects/`

```
public/uploads/projects/
├── bestefar/
│   ├── cover.jpg          ← COVER del proyecto (raíz del slug)
│   ├── thumb/             ← imágenes chicas (galería)
│   │   └── *.jpg
│   └── large/             ← imágenes grandes (galería)
│       └── *.jpg
├── procens-inside/
│   └── cover.jpg          ← solo cover en raíz
├── sirenas-rock/
│   └── cover.jpg
├── baguales/
│   ├── cover.jpg
│   ├── thumb/
│   └── large/
├── age-luthier/
│   └── cover.jpg
├── home-sick/
│   └── cover.jpg
├── portfolio/             ← Fotografía (home + /photography)
│   ├── thumb/             ← imágenes CHICAS (grid home)
│   │   └── *.jpg          ← nombres reales: DSC00051.jpg, CHICAS_BOSQUE-39.jpg, etc.
│   ├── large/             ← imágenes GRANDES (lightbox)
│   │   └── *.jpg
│   └── *.jpg              ← algunos en raíz también
├── bosque/, music/, art/, ...  ← otros proyectos con thumb/ y large/
```

**Convención:**
- **Cover de proyecto:** `slug/cover.jpg` (en la **raíz** del slug). No va dentro de thumb/ ni large/.
- **Galería de proyecto:** `slug/thumb/filename.jpg` (chicas) y `slug/large/filename.jpg` (grandes).
- **Portfolio (fotografía):** `portfolio/thumb/filename.jpg` y `portfolio/large/filename.jpg`.

---

## 2. Flujo Featured Work (Trabajos destacados – home)

1. **Origen:** `src/content/projects.es.json` → `coverImagePath`: `"bestefar/cover.jpg"`, `"procens-inside/cover.jpg"`, etc.
2. **En home** (`page.tsx`):  
   `getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)`  
   - `toLargePathOrOriginal("bestefar/cover.jpg")` → devuelve `"bestefar/cover.jpg"` (no tiene /large/ ni /thumb/, se deja igual).  
   - Con `USE_LOCAL_STORAGE=true` → `getPublicImageUrl` devuelve `/api/proxy-image?path=bestefar%2Fcover.jpg`.
3. **ProjectCard** usa esa URL en `<img src={coverUrl}>`.
4. **Proxy** (`/api/proxy-image`): recibe `path=bestefar/cover.jpg`.  
   - Resuelve: `getLocalProjectsDir()` + `"bestefar/cover.jpg"`.  
   - `getLocalProjectsDir()` = `UPLOAD_DIR ?? path.join(process.cwd(), "public")` + `"/uploads/projects"`.  
   - Busca el archivo ahí. Si no existe, prueba `bestefar/large/cover.jpg` y luego `process.cwd()/public/uploads/projects/bestefar/cover.jpg`.

**Conclusión featured:** La ruta que pide el código (`bestefar/cover.jpg`) coincide con tu estructura. En producción falla porque:
- O no se despliega `public/uploads/projects/` (solo se sube por Files a otro sitio), y hace falta **UPLOAD_DIR** apuntando a la ruta absoluta donde sí están las carpetas,  
- O `UPLOAD_DIR` está mal (no es la carpeta que **contiene** `uploads`).

---

## 3. Flujo Fotografía (grid en home)

1. **getPhotographyImagesForHome** (content.ts):  
   - Intenta fotos de proyectos con `pieceType` foto y de `portfolio_photos` en DB.  
   - Si no hay nada → **getRandomPhotosForHome** (portfolio-photos.ts): lee de **Supabase** (tablas `portfolio_galleries` y `portfolio_photos`).  
   - Si eso también devuelve [] y `USE_LOCAL_STORAGE=true` → usa un **fallback hardcodeado**:  
     `portfolio/thumb/photo1.jpg`, `portfolio/thumb/photo2.jpg`, `portfolio/thumb/photo3.jpg`.

2. **En tu disco** no existen `photo1.jpg`, `photo2.jpg`, `photo3.jpg` en `portfolio/thumb/`.  
   Existen archivos como `DSC00051.jpg`, `CHICAS_BOSQUE-39.jpg`, etc.

**Conclusión fotografía:** Si la DB no tiene fotos de portfolio, se piden `portfolio/thumb/photo1.jpg` etc., que **no existen** en tu `public/uploads/projects/portfolio/thumb/`. Por eso la sección sale gris.

---

## 4. Dónde se usa thumb vs large en el código

| Uso | Path que se pide | Origen |
|-----|-------------------|--------|
| Cover de proyecto (featured, página proyecto) | `slug/cover.jpg` (o `slug/large/cover.jpg` como fallback en proxy) | coverImagePath en JSON / DB |
| Galería de proyecto (grid + lightbox) | `slug/thumb/*.jpg` para grid, `slug/large/*.jpg` para lightbox | getProjectGalleryFromStorage, GalleryWithLightbox |
| Portfolio (fotografía home y /photography) | `portfolio/thumb/*.jpg` y `portfolio/large/*.jpg` | getRandomPhotosForHome (DB) o fallback photo1/2/3 |
| Backstage | `slug/thumb/*`, `slug/large/*` | projects-backstage.ts |

El proxy ya contempla:
- Si pide `slug/cover.jpg` y no existe → prueba `slug/large/cover.jpg`.
- Si pide algo con `/large/` o `/thumb/` y no existe → prueba el path sin ese segmento.

---

## 5. Resumen de por qué no se ve nada en producción

1. **Featured covers:** Las rutas son correctas (`bestefar/cover.jpg`, etc.). El servidor no encuentra los archivos porque:
   - La app corre desde otro `cwd` y no tiene ahí `public/uploads/projects/`, **o**
   - Las imágenes están en una ruta que subiste por Files y no es la misma que usa la app.  
   **Solución:** Definir **UPLOAD_DIR** en Hostinger con la ruta absoluta de la carpeta que **contiene** `uploads` (la que tiene dentro `uploads/projects/bestefar/cover.jpg`, etc.).

2. **Fotografía:** Si no hay filas en `portfolio_photos` / galleries, se usan `portfolio/thumb/photo1.jpg`, etc., que no existen en tu estructura.  
   **Solución:** Cuando `USE_LOCAL_STORAGE=true` y no hay fotos en DB, en vez de photo1/2/3 hay que **listar** `portfolio/thumb/` desde disco y usar esos paths (igual que en local con tus archivos reales).

---

## 6. Qué no tocar

- Estructura en disco: **thumb/** y **large/** dentro de cada slug/portfolio está bien.  
- Covers en la **raíz** del slug (`slug/cover.jpg`) están bien.  
- El proxy y `imageVariantPath` ya respetan thumb vs large; el problema no es “confundir” carpetas, sino **dónde busca el servidor** (UPLOAD_DIR / deploy) y el **fallback** de fotografía (photo1/2/3).
