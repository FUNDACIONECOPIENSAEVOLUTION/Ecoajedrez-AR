# ECOAJEDREZ — Correcciones táctiles y hoja de ruta de espectadores

## Cambios implementados en rama de pruebas
- Aviso fijo de jugadas `#commandHint`: se oculta automáticamente tras ~3,4 s y al seleccionar casilla; no recibe eventos táctiles.
- Notificaciones `#gameToast`: no bloquean toques; duran 1,5 s para mensajes habituales y 2,7 s para errores importantes.
- Selección 3D/360: raycast de casillas antes que mallas 3D (reduce errores con piezas voluminosas).
- Vista 360: arrastrar comienza a partir de 19 px y se evita iniciar rotación sobre cualquier casilla del tablero.
- Vista 3D: desactivar temporalmente OrbitControls al tocar una pieza propia o casilla de destino ya seleccionada.
- Robots: animación de cuerpo completo por código; marcha rígida y salto del caballo. NO hay articulación independiente de extremidades; los GLB se recibieron sin rig ni clips.
- Colección robótica en selector; disponible cuando cargan correctamente sus 6 GLB. Se conservan las otras colecciones.

## Pendiente de validar manualmente
1. Probar Android vertical/horizontal: seleccionar peón, mover y capturar sin que la cámara gire.
2. Probar vista 360, gesto de giro fuera del tablero, pellizco de zoom y precisión de casillas.
3. Probar tiempos de avisos y que no oculten fichas ni consuman eventos táctiles.
4. Confirmar 6 GLB renderizados, vista previa y rendimiento en Android y AR.
5. Ejecutar `npm test`, `npm run build` y ensayos físicos antes de fusionar a `main`.

## Modo espectador solicitado — NO implementado
Objetivo: permitir que una tercera persona vea en directo partidas contra CPU, dos jugadores locales y PvP online, con enlace separado de solo lectura. La arquitectura PeerJS actual acepta solo una conexión por sala y la reserva para el oponente; no debe reutilizarse el código de duelo para espectadores. Propuesta:

- Emisor independiente `SpectatorHub`, con PeerJS y códigos de visualización largos y aleatorios, lista de conexiones, topes de espectadores, validación de mensajes y desconexión.
- Al conectar, entregar posición FEN + historial validado; retransmitir actualizaciones solo cuando haya un cambio legal, nunca permitir `MOVE` desde un espectador.
- Vista espectador en dispositivo propio: motor `chess.js` solo lectura, movimientos táctiles desactivados, pero controles visuales 3D/360 activos. AR opcional únicamente en dispositivos compatibles y con permiso.
- En PvP online, emitir estado desde el anfitrión ya validado, no desde el cliente invitado. No exponer tokens o datos personales.
- En GitHub Pages, PeerJS público no garantiza que todos los espectadores conecten por NAT/firewall; limitar carga y probar en redes reales.

## YouTube Live y Bilibili — NO implementado
La retransmisión pública requiere un codificador de video y conexión a las plataformas; PeerJS de ajedrez no equivale a un servidor RTMP/WebRTC de streaming. En escritorio puede utilizarse OBS Studio para capturar ventana del juego (3D/360), conectar mediante claves de transmisión privadas a YouTube Live o Bilibili cuando la cuenta esté habilitada. En AR móvil, la captura dependerá del sistema y sus permisos. No guardar claves de YouTube/Bilibili en GitHub ni exponerlas en JavaScript cliente.

## Animación articulada — trabajo Blender
Los GLB robóticos originales no incluyen esqueleto y al menos el peón se recibió en una única malla geométrica. Crear submallas de extremidades + pivotes y rig con huesos; exportar clips GLB `Idle`, `Walk`, `Attack`, `Hit`, `Defeat`. Hasta entonces el movimiento existente es rígido y las capturas usan efectos de transformación sin deformar geometría.
