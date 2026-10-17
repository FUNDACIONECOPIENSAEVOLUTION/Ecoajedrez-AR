# Entrega Ecoajedrez 0.4.0-beta.1 — 2026-10-17

## Qué solicitó el usuario y qué quedó implementado
- El usuario confirmó que el tablero anterior **sí funciona en realidad aumentada** y puede mover piezas. Esa evidencia corresponde a la versión previa 0.3; se debe repetir prueba física tras esta revisión.
- Pantalla de bienvenida con identidad gamer, botones de Google e invitado, menú principal con VS CPU, dos jugadores locales, crear sala online y unirse por código.
- Configuración antes de jugar (idioma, dificultad, siete biomas, modelos 3D, colores de piezas y escala AR). La partida usa el canvas 3D a pantalla completa con barra de controles y un botón para regresar al menú y continuar partida.
- Transición corta animada entre menús/partida, pantalla completa 3D y funciones AR existentes conservadas.
- Movimiento por toque en dos pasos y gesto de arrastrar en modo 3D y modo AR. Nota: selección XR proyecta casillas contra cámara; precisión depende de dispositivo, ángulo y zoom; debe probarse.
- Entrada por comandos como e2e4, e4, Cf3 (notación española), Nf3 (SAN inglés), enroque corto, caballo de g1 a f3. Se crea copia de posición chess.js para validación preliminar y movimiento final pasa por el único motor de reglas.
- Dictado de comandos con Web Speech cuando está disponible; requiere permiso y navegador compatible. No hay reconocimiento de voz garantizado en iOS.
- Login Google mediante `auth.js`, adaptado del proyecto propio 3 LINE-AR: reutiliza **solamente Firebase Authentication** del proyecto existente `d-line-g`, sin tocar sus datos de progreso ni escribir en Firestore. El dominio `fundacionecopiensaevolution.github.io` debe estar permitido en Firebase Auth. Modo invitado local siempre disponible.
- Sala online beta por PeerJS (mismo patrón que 3 LINE-AR): anfitrión crea código de 6 caracteres, invita por URL y QR, invitado se conecta y juega negras; anfitrión valida turnos y movimientos con chess.js y envía FEN versionada. **Sin pruebas end-to-end entre dos celulares todavía**, sin matchmaking, ranking ni servidor con SLA. No es adecuado todavía para partidas competitivas con dinero.
- Se conservaron modelos glTF originales ligeros, selector Staunton/fantasía/clásico y tablero AR WebXR.

## Pruebas aprobadas
- GitHub Actions verifica sintaxis de main.js, commands.js, auth.js y pvp.js; y suite Node `tests/*.test.mjs` (piezas glTF, estructura AR, lógica de comandos y UI). Se despliega en Pages cuando las comprobaciones terminan con éxito.
- La prueba de código **no garantiza** que Firebase popup, señalización PeerJS, QR, dictado o gestos AR funcionen en dispositivos particulares.

## Guía para probar
1. Abrir https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/ y forzar actualización de página si aparece versión anterior.
2. Pulsar invitado, elegir VS computadora, configurar estilo tablero y pulsar INICIAR PARTIDA.
3. Desde el teclado jugar `e4`, después `Cf3` cuando corresponda; probar también `e2e4` en nueva partida. Pulsar 🎙 y decir `caballo de g1 a f3` cuando corresponda.
4. Arrastrar una ficha en 3D o tocarla y luego pulsar destino. Abrir menú y continuar la misma partida.
5. En Android compatible activar AR, fijar tablero, probar gestos, comandos dentro del visor AR, escala y salida; usar el mismo dispositivo donde 3 LINE-AR funciona.
6. Probar Google: si sale `auth/unauthorized-domain`, ir al proyecto Firebase `d-line-g` → Authentication → Settings → Authorized domains y autorizar `fundacionecopiensaevolution.github.io` (dominio, sin `https://` ni ruta). Verificar que Google esté habilitado en Sign-in method.
7. Probar online con dos navegadores/dispositivos: ambos entran (Google o invitado), primero CREA DUELO ONLINE y comparte QR/enlace/código; segundo UNIRME, elegir código, esperar conexión y probar turnos alternados. La página necesita Internet para PeerJS, Three.js, Firebase y chess.js.

## No implementado o no validado
- Stockfish/WASM de fuerza FIDE, Elo calibrado, torneos/ranking/estadísticas, emparejamiento público y moderación.
- Sincronización espacial de un tablero físico entre dos teléfonos. Cada jugador usa su tablero AR local; solo los movimientos de ajedrez se sincronizan.
- Guardado de avances y emparejamiento mediante Firebase Database/Firestore, seguros con reglas del servidor (todavía no se escriben datos).
- Conectividad P2P con TURN propio o garantías de NAT, reconexión permanente y sistema anti-trampas profesional.
- Integración de APK/TWA, monetización/ads y actualizaciones OTA de binarios.

## Para la próxima IA
Leer primero AGENTS.md, esta entrega, docs/ESTADO_ACTUAL.md, docs/HOJA_DE_RUTA.md y CHANGELOG.md. Continuar en este repo, sin tocar 3d-line ni el repo histórico de las piezas protegidas. Documentar resultados de pruebas reales y actualizar fecha/versión por cambio.