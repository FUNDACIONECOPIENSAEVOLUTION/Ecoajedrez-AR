# ECOAJEDREZ v0.11.1-beta.1 · Pantalla de inicio, video de 10 segundos e imagen limpia
Fecha: 2026-10-18. Alcance: **solo bienvenida/login**; otras pantallas, modelos 3D, partidas y AR intactos.

## Origen verificable
- El propietario subió directamente a GitHub la imagen limpia `app/imagenes/interfaces/login_post_intro_fondo.png` (2 956 307 bytes), confirmó su ruta y aprobó utilizarla detrás de los controles reales de inicio.
- Referencia visual aprobada: arena galáctica con castillos e islas flotantes, brillos azul/oro, piezas de ajedrez y logo/textos a la izquierda (los textos del ejemplo son referencia de layout, no deben pegarse como imagen raster).
- El problema de versiones previas era el fondo formado con tarjetas collage de bosques y portales, y el rótulo «ECOAJEDREZ» partido en dos líneas por un bloque central demasiado angosto.

## Cambios realizados
- `index.html`: el PNG limpio pasa a ser el `img.ambientPoster` de `#welcomeVideoBackdrop`; hoja `login-scene.css` cargada **después** de `adventure.css`. Se conserva película `#cinemaVideo`, botón «VER INTRO CINEMATOGRÁFICA», invitado y Google desactivado de forma segura. El video ambient de bienvenida ya no tiene loop ni se inicia (el intro inicial se reproduce en el overlay). Versión `0.11.1-beta.1` y referencias de scripts actualizadas.
- `login-scene.css`: fondo limpio `cover`, formulario real centrado en parte izquierda de escritorio con degradado lateral, sin panel oscuro grande ni imágenes collage, logo y título legible de **una sola línea**, botón intro/Google/invitado, versión y privacidad visibles. Breakpoints 1080/760/440px, viewport móvil con scroll si falta espacio, reducción de movimiento respetada.
- `opening.js`: el video de intro automática de primera visita se cierra al alcanzar **10 segundos de video realmente reproducidos** o al finalizar antes. Si el usuario toca «Omitir intro» también se cierra. Queda el PNG estático y **no se reinicia otro video en bucle detrás**. Un visitante que ya vio/omitió la intro en ese navegador ve directamente la imagen. El botón de intro permite reproducir otra vez voluntariamente, como antes.
- `scripts/build-pages.mjs`: publica exclusivamente el PNG concreto aprobado con firma PNG válida y límite de 6 MB; no copia arbitrariamente carpetas. `login-scene.css` publicado. CSP, caché de imágenes/tipos de ficha anterior y WebXR sin modificar.
- `tests/login-poster.test.mjs`: comprueba imagen binaria auténtica, publicación segura, animación solo inicial, 10 segundos, controles y breakpoints.

## Limitaciones y pruebas
- Si un navegador restringe autoplay o el usuario activa ahorro de datos/reducción de movimiento, se muestra la imagen y los botones sin bloquear al jugador; «Ver intro» sigue disponible.
- La intro MP4 original puede durar más o menos de 10s, pero se cortará **como máximo a los 10 segundos de reproducción**. No es un temporizador inventado con 10s de pantalla en caso de buffering.
- El PNG es ~3 MB y se sirve desde GitHub Pages HTTPS gratuitamente. En teléfonos estrechos, `background-size: cover` recorta bordes de la escena **sin recortar los botones/logo/texto HTML**, que siempre se superponen y permiten deslizar la página.
- Prueba manual requerida: PC 1366x768, tablet horizontal y vertical, Android vertical; versión `v0.11.1-beta.1`, sin título partido ni doble menú, iniciar invitado, video primera visita/omitir y cambio estático. La publicación automática no sustituye pruebas visuales físicas.
