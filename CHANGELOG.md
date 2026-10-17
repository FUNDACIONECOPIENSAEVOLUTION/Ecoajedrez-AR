# Historial de ECOAJEDREZ AR

## 0.8.0-beta.1 — 2026-10-17 · Videos originales del propietario
- Se integran los tres MP4 que el propietario subió en `videos/` a una intro opcional con botón Omitir y dos escenas de fondo en bucle.
- Se integran también los tres PNG originales como pósteres y fondos de las tarjetas ilustradas. Videos e imágenes se muestran completos con `object-fit:contain`, sin recortar el tablero; conservan fallback SVG.
- Carga diferida: el MP4 principal (13.6MB) solo al solicitar intro; un fondo activo a la vez; pausa al entrar a partida o realidad aumentada; ahorro de datos y reducción de movimiento respetados.
- GitHub Pages publica estrictamente seis archivos permitidos tras verificar firmas PNG/MP4 y límites de tamaño. CSP, motor AR, acceso invitado y privacidad no se alteran.
- Tests para reproducción, ruta de media y protección de backend; ver `docs/ENTREGA_0.8.md`. Reproducción física de MP4 y correspondencia de los clips todavía requiere comprobación del usuario.



## 0.7.0-beta.1 — 2026-10-17 · Apertura cinematográfica
- Revisión de la bienvenida: dos columnas desktop, arte protagonista, versión móvil con ilustración superior y botones accesibles.
- Dos arenas SVG originales de fantasía (Bosque encantado y Portal de duelo), con carrusel de transición automática y selección manual.
- Menú principal gamer con cabecera y cuatro tarjetas ilustradas, estilos originales y animación ligera de invocación de tablero.
- Etiqueta versión visible y derivada de version.json en bienvenida, menú, personalización, salas/QR, diagnóstico, carga y privacidad; nunca sobre el tablero ni durante AR.
- No se añadió vídeo pesado, servicio externo, fuente de Google ni Firebase. Cambios orientados a coste $0 y compatibilidad móvil.
- Prueba automatizada en tests/opening.test.mjs, lista blanca de arte/ui/version en Pages dist. Visita física desde móvil/AR pendiente.



## 0.6.0-beta.1 — 2026-10-17 · Arcane Glass y recuperación AR
- Nuevo tema Arcane Glass local y accesible, sin relajar CSP ni descargar Google Fonts.
- Orbes de estado, menú radial móvil con acciones reales, portal de cambio de pantalla, anillos y partículas dentro de Three.js.
- Duelo PeerJS de seis caracteres + QR con URL oculta en interfaz; avisos tematizados y reintento de señalización.
- Piezas «Realeza arcana» 3D originales sobre seis glTF Staunton locales; sin obras de franquicias; limpieza de geometría/materiales.
- WebXR: recuperación después de bloqueo del celular/fin inesperado de sesión; reentrada con gesto, tablero horizontal, mejoras de arrastre sobre la pantalla. Sin oclusión de mano ni seguimiento en aire.
- Pruebas CI actualizadas, despliegue público de CSS/JS por lista allowlisted, nota de QA en docs/ENTREGA_0.6.md.
- Pendiente confirmar en Android real y dos móviles; Google Auth BFF aún requiere servidor seguro, sin costo activado.



## 0.5.0-beta.1 — 2026-10-17 · Protección de datos
- Eliminación de configuración de autenticación Firebase del frontend actual; login Google desactivado en GitHub Pages hasta activar servidor propio.
- Intermediario BFF Cloudflare Pages Functions implementado como código: OAuth Authorization Code/PKCE, state, nonce y JWKS verificación de ID tokens; cookies HttpOnly Secure cifradas AES-GCM.
- Restricción de origen, cookies de sesión temporales y pseudónimos sin email.
- CSP, cabeceras HTTP para Cloudflare, política de privacidad y modelos de amenazas documentados.
- Salas PeerJS de 12 caracteres aleatorios, límites de tamaño y frecuencia de mensajes.
- GitHub Actions realiza secret scan y publica únicamente directorio dist con lista blanca de archivos.
- Backend OAuth aún sin desplegar/credenciales, Google no probado; invitado y juego local disponibles. No hay garantías de seguridad absoluta.
- Guía de despliegue en docs/DEPLOY_SEGURIDAD.md, traspaso docs/ENTREGA_SEGURIDAD_0.5.md.



## 0.4.1-beta.1 — 2026-10-17
- Sincronización PeerJS reforzada con historial SAN completo y validación FEN/SAN antes de aplicar cambios.
- Persistencia local por cuenta o invitado y recuperación al abrir sesión; modos CPU/local solamente.
- Descarga PGN y resaltado de última jugada/selección en 3D y AR.
- Popup Google directo desde el gesto de usuario y acceso deshabilitado mientras se inicializa Firebase SDK.
- Limpieza de partida en memoria al cerrar sesión para impedir reutilizar la partida de otra cuenta.
- Diagnóstico del dispositivo disponible desde el menú, con informe copiable; no prueba por sí solo acceso Google/PeerJS remoto.
- Pruebas ampliadas de historial, snapshots corruptos, guardado y controles de diagnóstico.
- Traspaso documentado en docs/ENTREGA_0.4.1.md. Aún sin pruebas entre dos celulares ni validación Google real.



## 0.4.0-beta.1 — 2026-10-17
- Portada gamer con Google/invitado, menú de modalidades y configuración previa.
- Transiciones, tablero 3D a pantalla completa y continuar partida.
- Siete estilos de tableros con colores y tres variantes de piezas.
- Comandos algebraicos internacionales/españoles, coordenadas y dictado experimental.
- Arrastre de fichas en 3D y AR, tamaño AR configurable.
- Login Google con Firebase Auth del proyecto propio d-line-g (sin acceder datos de otro juego).
- Salas PvP privadas PeerJS por código y QR; host valida jugadas y sincroniza FEN.
- Pruebas automáticas; falta probar red entre dos celulares, dictado y Google.
- Entrega documentada en docs/ENTREGA_0.4.0.md.



## 0.3.0-beta.1 — 2026-10-17
- Creación de seis modelos originales de ajedrez glTF 2.0 (rey, dama, alfil, caballo, torre, peón), que el juego utiliza en 32 instancias.
- Selector Staunton/Fantasía geométrica/Clásico geométrico; materiales blancos y negros personalizables; movimiento animado.
- AR explícita adaptada de 3 LINE-AR: sesión WebXR con DOM overlay, detección de superficie, FIJAR TABLERO, TOCAR/APUNTAR, escala, SALIR y fallback holograma.
- `tests/models-ar.test.mjs` verifica integridad de glTF y controles; workflow ejecuta todas las pruebas antes del despliegue.
- Prueba física AR y navegador móvil pendiente; PvP online, Stockfish, animación de combate y APK siguen sin implementar.

# Cambios — Ecoajedrez AR

## 0.2.0-alpha — 2026-10-17
- Repositorio canónico propio de la Fundación.
- UI gamer responsive, logo suministrado, tablero de 64 casillas y 32 piezas generadas con geometría Three.js.
- Partida local y vs computadora experimental; reglas chess.js.
- Controles táctiles/clic y entrada por teclado, temas clásico/selva, i18n preliminar ES/EN/ZH.
- Acceso AR experimental WebXR hit-test; por verificar en Android real.
- Inicio de documentación para IA: AGENTS, estado, modelos, decisiones y ruta.
- Workflow GitHub Actions con `node --check`, pruebas de consistencia y despliegue Pages ejecutados con éxito (run `39040927867`). Sin prueba de navegador/WebXR física.

### Límites
Sin partidas online, títulos/rating FIDE calibrados, APK, anuncios, personajes GLB fantásticos ni garantía de soporte iOS.

- Se eliminó el borrador temporal de `3d-line/ecoajedrez-ar/`, conservando `3d-line` principal intacto.
