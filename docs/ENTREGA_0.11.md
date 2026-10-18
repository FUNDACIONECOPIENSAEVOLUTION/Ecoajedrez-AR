# ECOAJEDREZ 0.11.0-beta.1 — Tarjetas, portales, primera intro y caché
Fecha 2026-10-18.

## Qué pidió el usuario
Reproducir la interfaz del mockup aprobado con las imágenes reales cargadas en GitHub: cuatro tarjetas de modalidades (vs CPU, local, crear online, unirse) y cuatro tarjetas de escenarios (bosque, templo, ciudad y volcán). Además intro cinematográfica automática **solo la primera vez**, pantalla con barra de progreso de descarga de los archivos 3D y fondos, y caché persistente del celular/computador para acelerar las siguientes visitas.

## Verificación en GitHub
Confirmados ocho WebP en `app/imagenes/tarjetas` (~3.4 MB total) y seis originales `assets/models/staunton/*.gltf` (todos son glTF con buffers incorporados en data:). El sitio usa GitHub Pages, sin backend requerido para modo invitado.
Los otros cinco grandes fondos mencionados en conversaciones previas **no** se encontraron en `app/imagenes/interfaces` (solo README); se utiliza arte de las ocho tarjetas ya existente y medios en `videos/` para escenografía, sin inventar archivos.

## Cambio de código
- `index.html`: ocho rutas WebP aplicadas directamente a controles DOM reales. Cuatro altas tarjetas de modo; `arenaScreen` añadida con cuatro botones de escenario, botón regresar y versión; barra `downloadStatus` bienvenida y `cinemaAssets` bajo la intro.
- `adventure.css`: distribución gamer responsiva escritorio y móvil, tarjetas con imagen y sombreado para lectura, fondos de selva y templo, transiciones reducidas si el sistema solicita menos movimiento; mantiene nombres/enlaces de botones reales.
- `adventure-ui.js`: Portal de la Arena via botón en menú. `jungle`/ `neon`/`marble`/`volcano` se traducen al motor existente, emite `change` y usa el menú real de configuración; no crea otro tablero falso.
- `opening.js`: intro video muted/play() al primer acceso por navegador (`localStorage` por origen, con controles y **Omitir intro**). El cambio de vista y al entrar a WebXR detiene videos, como antes. Si autoplay se rechaza en el navegador, el usuario puede tocar controles o saltar.
- `asset-cache.js`: caché de exactamente 14 recursos (8 WebP + 6 glTF) con un máximo de dos descargas paralelas, recuento real de archivos existentes en caché/descargados/fallidos y eventos `eco:asset-progress`. Si ahorro de datos está activo, omite precarga. Fallback sin bloquear si CacheStorage falla.
- `sw.js`: SW limitado a la ruta GitHub Pages del juego y exactamente 14 assets públicos; ignora Range, cualquier petición privada, endpoints, cross-origin y HTML. Purga solamente versiones antiguas con prefijo ECOAJEDREZ propio. Videos de 13,6/7,7/6,6 MB no se precargan a propósito para no agotar datos/cuota.
- `scripts/build-pages.mjs`: solo copia los ocho WebP exactos tras validar cabeceras RIFF/WEBP y tamaño. Incluye scripts y SW en allowlist, no publica secretos/funciones privadas.
- `.github/workflows/pages.yml` y `scripts/security-check.mjs`: testean/escanean nuevas rutinas; `tests/adventure-cache.test.mjs`: asegura archivos, selección, reproducción, caching, seguridad.

## Precisión funcional
- El progreso indica porcentaje **por archivos completados** (no por bytes). El MP4 de intro no se incluye en las 14 descargas y depende de buffering del navegador.
- CacheStorage puede ser desalojado por el navegador, modo incógnito/limpieza/quota, por lo que NO promete disponibilidad permanente ni juego offline completo (Three.js, chess.js y PeerJS aún pueden depender de CDN o servicio).
- La intro solo se auto-muestra la primera vez de ese navegador (si el visitante la omite, se marca como vista); el botón manual permite repetirla. Puede verse una pantalla con controles de reproducción si las políticas móviles impiden el autoplay.
- El diseño refleja estética de referencia, no debe presentarse como idéntico píxel a píxel sin revisión visual real.
- Usuario debe probar 4 modalidades, 4 portales, intro, carga, AR, caché, dos móviles en dispositivos. No hubo validación física de Android ni PvP.
- Presupuesto $0: no se habilitaron servicios ni cuentas nuevas.
