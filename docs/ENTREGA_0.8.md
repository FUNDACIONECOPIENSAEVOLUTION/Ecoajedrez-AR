# Entrega 0.8.0-beta.1 · Videos MP4 e imágenes del propietario
Fecha: 2026-10-17.

## Solicitud
El propietario subió personalmente 3 MP4 + 3 PNG a la carpeta pública `videos/` y pidió integrarlos en la página y el juego ECOAJEDREZ 3D/AR. Este cambio afecta únicamente la experiencia visual de inicio, no el motor ni su autenticación.

## Evidencia GitHub y nombres exactos
Los seis archivos existen en rama `main`:
- `videos/Vídeo sin título-17_10_2026, 16_58.mp4` (13 621 873 bytes) → **intro cinematográfica opcional**.
- `videos/Vídeo sin título-17_10_2026, 17_08.mp4` (7 677 171 bytes) → **escena de bosque en bucle**.
- `videos/Vídeo sin título-17_10_2026, 17_10.mp4` (6 570 648 bytes) → **escena de portal en bucle**.
- `videos/ECOAJEDREZ_ Tablero Místico del Planeta-1.png` (3 283 997 bytes) → arte del intro + banner del menú.
- `videos/Ecoajedrez_ La Arena Cobra Vida-2.png` (3 407 963 bytes) → póster de bosque + tarjeta local.
- `videos/Ecoajedrez_ Portales del Bosque Mágico-3.png` (3 130 135 bytes) → póster de portal + tarjeta duelo.

**Advertencia:** la asignación de los tres MP4 por secuencia de hora/nombres es provisional. En esta sesión se verificaron desde la API GitHub nombres/tamaños, pero la interfaz GitHub no permitió descargar/revisar sus fotogramas o codecs. Pedir prueba visual al propietario; si el rol de cada video no corresponde, ajustar las rutas sin reemplazar la media.

## Integración
- `index.html`: usa fotos reales subidas por usuario en las dos escenas del carrusel, videos de fondo con `muted loop playsinline preload=none`, botón para pausar/reanudar animación. Intro HD en modal con controles y botón **OMITIR INTRO**, invocable desde bienvenida o menú. No bloquea jugar como invitado y no aparece en partidas/AR.
- `opening.js`: no solicita el MP4 de 13,6 MB hasta que el usuario pulsa **VER INTRO**. Solo solicita el MP4 de la escena activa si el navegador admite autoplay silenciado; pausa otros videos y detiene al ocultar pestaña, jugar o entrar en WebXR. Si el video falla, se mantiene el PNG; si falla el PNG, se usa el SVG original. Respeta reducción de movimiento y el ahorro de datos móvil; el usuario puede activar video manualmente.
- `opening.css`: ajusta `object-fit:contain` en imágenes y videos para **no recortar ninguna pieza del tablero**, mantiene gradientes laterales para encuadres no coincidentes. Añade panel gamer de intro, controles de omitir y usa las imágenes reales en las tarjetas del menú. CSS anterior y reglas 3D/AR conservados.
- `scripts/build-pages.mjs`: problema corregido: antes NO publicaba carpeta `videos/`; ahora copia exclusivamente los seis archivos enumerados, comprueba tamaño y cabeceras PNG/MP4, no copia arbitrariamente videos adicionales ni server/secretos.
- `version.json`, `privacy.html`, `README.md`: versión 0.8.0-beta.1 visible fuera de partida y AR.
- `tests/video-media.test.mjs`: verifica los seis archivos, publicación explícita y resguardos de UI/video. `tests/opening.test.mjs` versión actualizada.

## Seguridad, costos y rendimiento
- Plan gratuito $0: no se contrataron servicios y no se alteró Firebase, OAuth, servidor BFF ni GitHub Pages URL.
- Los medios solo usan recursos locales `./videos/`, ya permitidos por la CSP existente: `media-src 'self' blob:`. Nunca abrir Google Fonts ni dominios extra.
- Total media aproximadamente 37,7 MB incluyendo PNG/MP4, así que las animaciones no deben descargarse todas a la vez. El MP4 grande se carga SOLO bajo petición. En móviles con ahorro de datos se usan pósteres hasta que el usuario active video.
- GitHub Pages no garantiza transcodificación/streaming adaptativo. Verificar compatibilidad real del codec MP4 en Android/iOS/Windows. Si falla, usar un FFmpeg transcode opcional posterior y registrar licencia/origen.

## Pruebas manuales importantes
1. Carga dura Ctrl+F5; debe verse **v0.8.0-beta.1** y las fotografías reales.
2. En escritorio comprobar escena de bosque → portal, botón **PAUSAR ANIMACIÓN**, reproducción MP4 y póster de respaldo.
3. Botón **VER INTRO CINEMATOGRÁFICA**, reproducción, **OMITIR INTRO**, volver a modo invitado sin problemas.
4. En móvil, calidad/encuadre `contain` sin cortes, ahorro de datos, reproducción sin audio. Si el clip no se ve: verificar codec y enlaces GitHub Pages.
5. Entrar como invitado, jugar con CPU, abrir AR y volver sin reproducción de videos oculta ni congelaciones.
6. Confirmar visualmente si `16_58` es intro, `17_08` bosque, `17_10` portal. Cambiar asignación si el contenido difiere; no inventar certeza.
7. Confirmar GitHub Actions comprobaciones y deploy exitosos tras último commit.

## Instrucciones de continuidad
Leer AGENTS.md y este documento. Mantener versionado visible solo fuera de partida/AR. No modificar el código de 3 LINE-AR ni reutilizar Firebase de otra cuenta. Todas las nuevas variantes visuales con pruebas y respetando cuota gratis.
