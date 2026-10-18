# ECOAJEDREZ 0.10.1-beta.1 — Corrección visual de portada (2026-10-17)

## Origen
El propietario mostró una captura de v0.10.0 en resolución aproximada 1294×701: a la izquierda cuatro **símbolos Unicode planos y desproporcionados** (caballo, rey, alfil, torre) flotando en un escenario oscuro; a la derecha un panel de bienvenida aislado con los botones, sin parecido visual suficiente al arte gamer aprobado.

## Corrección realizada directamente en GitHub
1. Eliminado por completo el elemento `.celestialCourt` y sus cuatro símbolos `.arcanePiece` del HTML. No eran modelos 3D ni aportaban el realismo aprobado.
2. Se trasladó el bloque `.welcomeVideoBackdrop` fuera del contenido de inicio para que sea **hijo directo de #loginPanel**: el PNG y el MP4 originales del propietario ahora ocupan el lienzo completo, no una caja estrecha de formulario. `opening.js` continúa funcionando mediante `#welcomeAmbientVideo` y `video.closest('.welcomeVideoBackdrop')`.
3. CSS `cinematic-fix.css` cargado después de `celestial.css`: escena a pantalla panorámica, degradados para legibilidad, botones reales sobre panel de cristal centrado a la izquierda, fotografía/video visible al fondo y sin formas 2D gigantes. Adaptación a ventanas de escritorio y móviles, con desplazamiento vertical si la altura no alcanza.
4. Conservados intro cinematográfica opcional, controles Google desactivado/invitado activo, menu y settings, tableros 3D/WebXR, PeerJS, privacidad, CSP y formatos originales sin descargar recursos extra.
5. Versionado uniforme `0.10.1-beta.1` en `index.html`, `opening.js`, `privacy.html` y `version.json`, con cache busting en scripts/hojas de estilo. El build lista explícitamente `cinematic-fix.css`.
6. Pruebas actualizadas: además de version/media, `tests/celestial-ui.test.mjs` verifica que la corte Unicode no esté en HTML y que el video de fondo esté fuera del formulario.

## Notas de alcance
Es una corrección de **composición, legibilidad y realismo visual** mediante videos e imágenes ya alojados en GitHub, no nuevos modelos 3D ni rendering adicional. Los videos son propiedad del usuario y no se creó cuenta de pago ni servicio externo. No declarar identidad píxel-perfecta con el concepto aprobado: requiere comprobación física.

## Pruebas del usuario
- En navegador de escritorio, actualizar con Ctrl+F5 y confirmar badge v0.10.1-beta.1.
- Portada: ya NO aparecen rey/caballo/alfil/torre gigantes a la izquierda; el fondo animado o su imagen está tras toda la portada y los botones quedan sobre la escena.
- Clic «PAUSAR FONDO», «VER INTRO», «CONTINUAR COMO INVITADO»; todos accesibles, la intro se puede omitir.
- En smartphone verificar logo, botones y enlace de privacidad. Si pantalla baja, poder deslizar sin que quede contenido inaccesible.
- Menú y configuración sin regresiones; probar modo ajedrez y AR después. El sitio puede servir imágenes como fallback por códecs/red/batería.
