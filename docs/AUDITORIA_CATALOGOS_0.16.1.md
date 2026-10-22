# ECOAJEDREZ 0.16.1-beta.1 · Auditoría completa del catálogo visual

**Fecha:** 22/10/2026. **Origen comprobado:** rama `main` de FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR antes de aplicar el parche. Se comprobó presencia de cada archivo por su ruta exacta en GitHub; esto no equivale a ejecutar WebGL/AR en un Android real.

## Tableros, vista 3D y reino 360

| Tablero/ID | Vista 3D/menú tras corregir | Reino 360 (carpeta) |
|---|---|---|
| alquimia | vista frontal de su propio skybox hasta recibir WebP plano dedicado | alquimista_eter |
| celta | 04_entorno_celta_bosque_encantado.webp | celta_bosque |
| cyber | 10_entorno_cyberpunk_sintetico.webp | cyberpunk_sintetico |
| cosmos | 01_entorno_galactico_cosmico.webp | galactico_cosmico |
| amatista | vista frontal de su propio skybox hasta recibir WebP plano dedicado | espejo_vacio |
| dorado | 03_entorno_medieval_leyenda_fantasia.webp | medieval_leyenda |
| atlantis | 08_entorno_atlante_submarino.webp | atlante_submarino |
| hielo | 06_entorno_glacial_reino_de_hielo.webp | glacial_hielo |
| lava | 05_entorno_volcanico_inframundo.webp | volcanico_inframundo |
| egipto | 09_entorno_egipcio_faraonico.webp | egipcio_alquimia |
| gotico | vista frontal de su propio skybox hasta recibir WebP plano dedicado | nigromante_gotico |
| cristales | 02_entorno_magico_fantasia_ancestral.webp | magico_ancestral |
| steampunk | 07_entorno_steampunk_mecanico.webp | steampunk_mecanico |

`classic`: tablero original sin vínculo fijo con un reino; permite elegir bioma.

**Verificado en fuente:** 13 tableros WebP jugables, 7 imágenes decorativas (vista-*), 10 entornos WebP tradicionales, y 13 cubemaps con seis caras `px/nx/py/ny/pz/nz.webp` (78 rutas). Todos los nombres esperados están presentes en GitHub.

**Causa del problema de la vista de reino:** `publishedRealmURL` devolvía `null` si el manifiesto `entornos/manifest.json` estaba ausente o desactualizado, aunque el WebP sí existiera. El script `scripts/build-pages.mjs` genera el manifiesto al publicar, pero no existe como archivo fuente. El nuevo código consulta directamente la URL WebP con HEAD, admite el fondo específico y recupera un fallback de su propio skybox en tres casos.

**Otra causa de las fichas no visibles:** `scripts/build-pages.mjs` no copiaba la colección robótica desde `app/imagenes/fichas/roboticos`. Se agregó validación y publicación explícita de seis GLB, seis JPG y manifest público. No se publican los MP4 de referencia como dependencia de las animaciones.

## Comportamiento esperado en la web

1. Seleccionar cualquiera de los 13 tableros: mostrar textura y vista del reino; mensaje claro si falla el archivo realmente.
2. Entrar en modo 3D: fondo del reino asociado, sin reutilizar arbitrariamente bosque o templo neón.
3. Entrar en 360°: comprobar seis caras publicadas, aun si el manifiesto estaba desactualizado.
4. Seleccionar Guardines robóticos: opción habilitada por manifest público, carga bajo demanda de seis GLB, materiales y acentos diferenciados entre ejércitos, mirada hacia el oponente.
5. Mover y capturar sin cambiar reglas, 3D/360 ni realidad aumentada.

**Límites:** GLB no poseen esqueleto ni animaciones articuladas de caminata. Las nuevas comprobaciones de rutas y sintaxis no reemplazan prueba visual en móvil/PC. El usuario validará y reportará errores en la versión publicada.

## Cambios y QA
- `realm-pairing.js`, `board-catalog-ui.js`, `experience-modes.js`
- `scripts/build-pages.mjs`, `main.js`, `index.html`
- `tests/realm-catalog-robotics.test.mjs`, `version.json`, `package.json`, `CHANGELOG.md`

Cada versión publicada debe incrementar el número visible, `package.json` y `version.json`.
