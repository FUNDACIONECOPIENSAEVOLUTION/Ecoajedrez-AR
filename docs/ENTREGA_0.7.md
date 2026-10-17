# Traspaso 0.7.0-beta.1 — Apertura cinematográfica y versión visible
Fecha: 2026-10-17.

## Petición y resultado
El usuario mostró capturas del opening 0.6, demasiado estático, y pidió implementación directa en GitHub, usando referencias de dos tableros de fantasía, versión visible en todos los menús excepto partidas y cambios visuales realmente notorios.

Se verificó permiso GitHub `push/admin` sobre `FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR`. Los cambios se ejecutaron por el conector GitHub; no se necesitó acceso al ordenador del usuario.

## Cambios implementados
- Dos **ilustraciones SVG vectoriales originales**, recreadas con estética similar a las referencias del usuario: `assets/ui/forest-arena.svg` y `assets/ui/portal-arena.svg`. Son **reinterpretaciones originales**, NO los píxeles idénticos de las capturas. Son de tamaño muy reducido, sin imágenes de terceros, fuentes externas ni licencias de franquicias.
- `index.html`: bienvenida rediseñada en desktop (dos columnas, marca/autenticación y una ilustración grande) y móvil (escena artística horizontal encima de botones), dos diapositivas ilustradas, controles de escena, cabeceras de menú ilustradas, tarjetas gamer Vs CPU / local / Crear sala / Unirse. Mantiene IDs y click handlers del juego. Versión visible `data-app-version` en bienvenida, menú, personalización, diagnóstico y pantalla de invocación. Módulo `opening.js` separado de `main.js`.
- `opening.css`: animación suave de cambio de escenas, halo, botones, tarjetas con arte y efecto CSS de tablero mágico materializándose (sin video ni streaming). Respeta `prefers-reduced-motion`, CSS para teléfonos y no oculta controles de ajedrez existentes.
- `opening.js`: lee `./version.json?v=0.7.0` con `cache: 'no-store'` y actualiza todas las etiquetas `data-app-version`. Crea etiqueta en sala online cuando aparece dinámicamente. Carrusel automático cada 6,2 segundos solo en bienvenida y página visible; botones permiten cambiar de escena.
- `privacy.html`: etiqueta versión dinámica fuera de partida.
- `main.js`: versión informada por diagnóstico extraída del DOM (manifest), no cadena obsoleta.
- `version.json`: versión oficial `0.7.0-beta.1`, notas honestas de validación.
- `scripts/build-pages.mjs`: añade `opening.js`, `opening.css`, `version.json`, `assets/ui` al paquete público permitido; sigue excluyendo secretos/funciones del servidor.
- Workflow GitHub Actions: `node --check opening.js`, CI de tests, seguridad, despliegue.
- `tests/opening.test.mjs`: comprueba versión visible, SVG, preservación del invitado y alojamiento seguro.

## Costos y seguridad
Presupuesto actual: $0 COP. No se crearon ni conectaron Firestore, servicios nuevos, servidores, dominios ni pagos. Sigue el invitado local. Google sigue deshabilitado en github.io hasta activar BFF de Cloudflare. CSP mantiene `font-src 'self'`; no se añadieron llamadas a Google Fonts o streaming.
Los SVG nuevos son gráficos escalables de estética conceptual originales, no copias exactas de ilustraciones aportadas mediante capturas de pantalla. El carrusel y la animación CSS son alternativas ligeras a vídeos cortos; funcionan sin archivo mp4.

## Comprobaciones pendientes
- Confirmar Actions check + deploy SUCCESS tras el último commit.
- Abrir https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/ desde computador y móvil, refrescar para limpiar caché. Leer `v0.7.0-beta.1` en bienvenida y menú.
- Ver animación del bosque al portal, botones de carrusel y tarjetas ilustradas.
- Entrar como invitado; seleccionar bot/local; cambiar bioma; jugar; verificar que NO aparece versión sobre tablero o AR.
- Tras crear sala, la etiqueta 0.7 debe aparecer junto al código QR; probar con dos móviles, red privada.
- Estabilidad WebXR y recuperación de bloqueo Android no se validaron físicamente en este release.

## Regla futura
Incrementar `version.json`, fallback UI y URL de cache busting para cada cambio funcional, y actualizar `AGENTS.md`/documentos; conservar la jugabilidad y seguridad. No hay garantías de que pruebas estáticas impliquen funcionamiento físico AR.
