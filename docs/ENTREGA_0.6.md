# Entrega ECOAJEDREZ AR — v0.6.0-beta.1 · 2026-10-17

## Fuentes
- Solicitud: mejorar UX y corregir fallas demostradas con capturas reales: códigos de sala excesivamente largos y link visible, mensajes técnicos, piezas 3D no suficientemente diferenciadas, AR blanca al bloquear Android, tablero inclinado y mano real por debajo de las piezas.
- Documento de referencia enviado por usuario: propuesta «Arcane Glass UI» (gradientes esmeralda/oro, paneles translúcidos, botones ornamentados, orbes, anillo radial, flash de portal, partículas de runas).
- Su CSS de referencia NO se copió literalmente porque contenía propuestas que ocultaban el comando táctil en móviles, pedían abrir fuentes externas contra CSP, y sugirieron publicar window.__eco con escena/cámara. Se adaptó al estado real para preservar seguridad y entrada del juego.

## Cambios realmente programados en este repositorio
- `arcane.css`: diseño responsivo gamer con temas verde esmeralda y oro; medallón, brillo de botones/tarjetas, HUD flotante y mensajes de la arena; se sirve desde GitHub Pages con CSP original sin Google Fonts externas.
- `arcane-ui.js`: orbe basado en el estado REAL de chess.js, menú radial de seis acciones (en móvil), transiciones visuales no bloqueantes, efectos Three.js (anillos de selección y partículas al mover/capturar). Usa una instancia compartida de THREE y referencias locales; NO expone globales en window ni usa setInterval de seguimiento.
- `index.html`: opción nuevo ejército `royal`/«Realeza arcana», enlaces QR e inputs de sala para seis caracteres, CSS enlazado, diálogo de recuperación AR y versión 0.6.
- `main.js`: ornamenta geométricamente los seis glTF Staunton originales en opción «Realeza arcana» con auras, coronas y cristales originales. No incorpora assets de Harry Potter sin licencia; no son modelos descargados de una fuente nueva. Efectos mágicos alimentados por selección y jugadas legales; textura base de los seis glTF originales. Sistema de liberación de geometrías/materiales.
- `pvp.js`: PeerJS genera sala de **seis caracteres** aleatorios usando crypto.getRandomValues con alfabeto sin caracteres confusos; normalización 6; QR contiene URL para unirse, pero no se muestra el enlace largo. COPIAR CÓDIGO copia exclusivamente los seis caracteres. Mensajes de red temáticos; desconexión de señalización no se considera automáticamente pérdida del WebRTC ya conectado, y se intenta recuperación PeerJS.
- `main.js` WebXR: se trata interrupción por bloqueo/tab en segundo plano, finaliza sesión afectada y presenta pantalla de recuperación para volver al tablero 3D o reentrar AR mediante toque voluntario. No intenta abrir AR sin gesto de usuario. Coloca el tablero horizontal al detectar la superficie (en vez de usar rotación de hit-test que puede voltearlo).
- AR control táctil: al tocar una pieza en la pantalla se resalta instantáneamente y se puede arrastrar el dedo sobre la pantalla hacia destino; retroalimentación visual. Se conserva apuntar y comando/dictado.
- Botón de rescate **↻ RECUPERAR** en el HUD AR: fuerza salida de una sesión XR posiblemente congelada, ofrece regresar a 3D o volver a iniciar AR mediante toque y conserva el tablero actual.

## Limitaciones honestas y seguridad
- **La mano física aún se verá detrás/atravesada por piezas virtuales**: esta implementación no incluye segmentación de mano, oclusión por profundidad ni pinza en el aire. El arrastre se realiza tocando la PANTALLA, no agarrando físicamente objetos delante de la cámara. Estas funciones requieren investigación y compatibilidad WebXR/WebGPU/visión; no prometerlas como listas.
- El navegador/dispositivo puede bloquear sesiones XR irreversiblemente; recuperación propuesta debería evitar recarga completa, pero exige prueba física en el celular del usuario. No se ha verificado físicamente después de 0.6.
- 6 caracteres son más cómodos pero reducen entropía respecto a 12; solo para duelo casual sin ranking ni apuestas. No equivalen a acceso cifrado/autenticado del servidor ni protegen el QR si se comparte públicamente. Validación de mensajes y tasa PeerJS continúan; no hay backend autoritativo ni antitrampas. PvP entre dos móviles aún necesita pruebas reales, puede fallar tras NAT/cortafuegos.
- Botón Google sigue desactivado en GitHub Pages: BFF Cloudflare Pages Functions está preparado pero no desplegado ni conectado con secretos. Firebase institucional `ecoajedrez-3d` existe en Spark, no se creó aplicación ni base de datos aquí. Independiente de `d-line-g` de 3 LINE-AR.
- Los modelos extra son **variantes originales** construidas sobre los seis glTF que ya existían, no modelos de franquicias. Verificar licencias y rendimiento de otros modelos gratuitos antes de incorporarlos.
- $0 COP: ninguna suscripción, cuenta, facturación, servidor o dominio adicional activado.

## Archivos y verificación
- `index.html`, `arcane.css`, `arcane-ui.js`, `main.js`, `pvp.js`, `version.json`, `scripts/build-pages.mjs`, `.github/workflows/pages.yml`, `tests/flow-and-commands.test.mjs`, `tests/models-ar.test.mjs`.
- GitHub Actions Node 22: `node --check main.js`, `node --check arcane-ui.js`, tests, `scripts/security-check.mjs`, build `dist/`, despliegue Pages.
- La página solo despliega archivos allowlisted, no Functions ni secretos; CSP se mantiene restrictiva.

## Pruebas pendientes
1. En móvil real: visitante -> rival CPU -> seleccionar pieza -> ver runa -> mover por toque o arrastre en pantalla -> ver partículas -> guardar PGN.
2. Personalización: conmutar Staunton glTF/Realeza arcana/Fantasía/Clásico y confirmar que los seis tipos se distinguen; revisar 6/6 cargados en diagnóstico.
3. AR: detectar mesa, fijar horizontal, tocar/apuntar, mover usando pantalla (sin afirmar oclusión/agarre aéreo).
4. Con AR activa, bloquear el celular y volver: el juego debe mostrar restauración del tablero 3D y opción REABRIR AR sin perder la partida local. Revisar permisos.
5. Dos celulares: crear duelo, apuntar QR con otro teléfono o teclear seis caracteres, conectar, alternar jugadas y verificar historial. Reportar limitaciones de PeerJS.
6. Orientación vertical/horizontal, escritorio/móvil, accesibilidad táctil, permisos de cámara y dictado.

## Para siguiente IA
Leer AGENTS.md y este documento, no reemplazar código de 3 LINE-AR. No añadir nuevas dependencias/redes sin comprobar CSP/licencia/cuotas. Si falla Actions, mirar logs y reparar antes de afirmar éxito. Actualizar pruebas y versión con cada release.
