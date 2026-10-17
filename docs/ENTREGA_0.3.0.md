# Entrega 0.3.0-beta.1 — 17/10/2026

## Qué se hizo
- Añadidos seis modelos originales de ajedrez realmente tridimensionales en assets/models/staunton/ (pawn, rook, knight, bishop, queen, king). Son glTF 2.0 autocontenidos, cada uno pesa menos de 50 KB. La aplicación instancia 32 piezas desde esos seis modelos.
- Integración con GLTFLoader, cambio de estilo entre Staunton, fantasía geométrica y clásico, selector de colores para ambos ejércitos y animación interpolada al mover.
- AR rediseñada inspirada en el enfoque que funciona en 3 LINE-AR: solicitar sesión WebXR al pulsar un botón; dom-overlay, hit-test opcional, retícula, FIJAR TABLERO, SALIR AR, TOCAR o APUNTAR para seleccionar casillas, escala y holograma cuando el hit-test no está disponible.
- La inteligencia artificial sigue siendo experimental. El 3D y la AR usan una misma instancia de chess.js. No se añadió PvP por Internet ni modelo de personajes protegidos.

## Qué sabemos que pasó las pruebas
- GitHub Actions ha ejecutado correctamente node --check main.js y node --test tests/*.test.mjs; desplegó la rama principal en Pages.
- Tests de modelos verifican JSON glTF, buffers embebidos, coordenadas finitas, índices válidos y límite por archivo.
- **No hay prueba física** en Chrome Android / WebXR; no presentar el botón AR como certificado para todos los celulares.

## Próximas pruebas manuales prioritarias
1. Abrir https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/ y verificar visibilidad del tablero, 32 piezas y mensaje '6 modelos 3D cargados'.
2. En PC realizar e2e4 con clic sobre el peón de e2 y casilla e4, probar teclado, modo local, IA y colores.
3. En Chrome Android con servicios AR compatibles, pulsar Activar realidad aumentada, buscar una mesa y FIJAR TABLERO.
4. Mover piezas con TOCAR CASILLA y luego con APUNTAR + SELECCIONAR, capturar pieza, cambiar la escala y salir sin perder el juego.
5. Si no entra AR o no aparece cámara, anotar celular, versión Android, navegador y captura de error. Revisar permisos, secure context, WebXR immersive-ar y ARCore.

## Arquitectura validada / advertencias
- GitHub Pages actualiza la aplicación web al abrir/cargar recursos con nueva versión; NO actualiza al instante todas las APK y el código nativo no se sustituye por OTA arbitraria.
- TWA Chrome y Capacitor WebView tienen diferentes posibilidades WebXR; probar antes de construir la APK.
- La alternativa holograma usa WebXR pero NO garantiza hit-test ni anclaje de superficies.
- Retener modelos antiguos de franquicias solo como referencia, no redistribuir sin verificar derechos.
- Stockfish aún no integrado. Los títulos FIDE no se otorgan según un nivel de IA, y profundidad no equivale a Elo.

## Recursos gratuitos externos (investigados, NO incorporados)
- Poly Haven Chess Set, Riley Queen, CC0: https://polyhaven.com/a/chess_set (versión 4K muy pesada, hay que optimizar).
- Polyy.AI low-poly Staunton, licencia CC0 declarada: https://polyyai.itch.io/3d-chess-pieces-pack (requiere descargar vía itch.io).
- KayKit Adventurers: https://kaylousberg.itch.io/kaykit-adventurers ; pack gratis CC0 5 personajes, revisar extras de pago.
- KayKit Skeletons: https://kaylousberg.itch.io/kaykit-skeletons ; pack gratis CC0 4 personajes.
- Quaternius: https://quaternius.com ; comprobar cada pack específico antes de importar.
- Adobe Mixamo: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html ; uso comercial en videojuegos permitido con límites sobre redistribución en bruto; no es CC0.

## Para otra IA
Leer AGENTS.md, docs/ESTADO_ACTUAL.md, docs/HOJA_DE_RUTA.md, este documento, CHANGELOG.md y version.json. No reabrir conversación histórica sin motivo. Editar exclusivamente este repo canónico y registrar cambios.