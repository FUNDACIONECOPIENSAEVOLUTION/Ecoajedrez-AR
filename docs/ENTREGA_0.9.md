# ECOAJEDREZ v0.9.0-beta.1 — Fondos cinematográficos bajo el contenido
Fecha de entrega: 2026-10-17.

## Diagnóstico de las capturas aportadas
El usuario mostró pantalla de bienvenida 0.8 con video en el lateral derecho y el contenido de marca/título/botones en el izquierdo, sobre un color plano. El lateral mostraba franjas/capas de imagen debido a la superposición de imagen y video vertical con `object-fit:contain`. También mostró el menú: tarjetas ilustradas y banner, pero fondo del panel muy estático. Solicitó video **DETRÁS DE LAS LETRAS** o de fondo y que el lateral fuese una imagen con movimiento suave.

## Modificación real en GitHub
- `index.html`: coloca `welcomeVideoBackdrop` dentro de `loginContent` ANTES del logo, con video MP4 de 17:08 y póster PNG. El lateral `heroShowcase` mantiene dos imágenes PNG originales sin reproducción de video superpuesta, animadas suavemente mediante CSS. Se conserva carrusel y sus dos botones. Inserta `menuAtmosphere` (MP4 de 17:10 y PNG de respaldo) como primer hijo de `menuPanel`, detrás del encabezado y las cuatro tarjetas. Botón de pausar/activar fondo accesible en ambas pantallas. Se preserva el intro (16:58) opcional con Omitir, acceso como invitado, botones y modal.
- `opening.css`: capas cinematográficas con video oscuro y halos bajo el contenido legible; mantiene correctas las capas de apilamiento (z-index 0 bajo z-index 2), opacidades para contraste y responsive. `@keyframes arcaneGalleryFloat`: desplazamiento mínimo (aprox. 1%) del lateral sin recortar piezas. `object-fit:contain` sigue en las imágenes del lateral; `object-fit:cover` se reserva al video como *fondo decorativo*, sin afirmar que el tablero completo del video sea visible detrás del texto.
- `opening.js`: una sola rutina para pausar ambos MP4 ambientales antes de iniciar el correspondiente a `data-view='welcome'` o `'menu'`. Carga diferida; jamás reproducir estos fondos durante `data-view='game'`, WebXR, página oculta o modal de intro; ahorro de datos/movimiento reducido. Los controles sincronizan su estado. `cinemaVideo` solo se carga tras clic en intro y se puede omitir.
- `version.json` = `0.9.0-beta.1`; etiquetas HTML y privacidad actualizadas. No se cambian `main.js`, `auth.js`, `pvp.js`, `scripts/build-pages.mjs` ni los archivos originales de video.
- `tests/video-media.test.mjs` controla la nueva composición, conserva la prueba de protección de datos, intro y modo invitado; `tests/opening.test.mjs` actualiza versión.

## Límites y mantenimiento
Los MP4 publicados en GitHub siguen siendo los aportados por el usuario. No se generó otro video ni se activó hosting, cuenta, tarjeta, nube de pago ni Firebase. Se mantiene el costo $0; el backend de Google sigue no desplegado. El video real detrás del texto es desenfocado/oscurecido a propósito, el lateral muestra el arte casi completo. Solo se carga un video ambiental en ese momento (el intro grande no comienza sin clic). Si el video no se reproduce, se queda el póster PNG.
**Validación pendiente**: ver la interfaz en navegador y celular reales, que se lea en móviles, que únicamente se reproduzca video bajo la vista activa, usar Cont. como invitado, jugar 3D y activar AR. Pasar GitHub Actions y verificar despliegue exitoso.

## Continuidad para otras IAs
Leer AGENTS.md, docs/ENTREGA_0.8.md y este archivo. Para cambios visuales, conservar IDs y data-view, las capas de CSS y la pausa al activar WebXR. Incrementar version.json, fallback y cache busting al editar. Evitar añadir un cuarto stream activo. Reunir capturas después de probar el 0.9.
