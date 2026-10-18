# Historial de ECOAJEDREZ AR

## 0.14.5-beta.1 — 2026-10-18 · Laboratorio Skybox 360° para 13 reinos
- Carpetas individuales app/imagenes/skybox/ID para seis caras WebP px, nx, py, ny, pz, nz de cada reino.
- Visor separado skybox-test.html, mirada cúbica 360° con Three.js, arrastre y orientación de teléfono opcional; botón de acceso en Configuración.
- Publicación segura de conjuntos de seis caras válidas por GitHub Pages; manifiesto informa faltantes y no bloquea al juego.
- Aún no hay imágenes de seis caras cargadas, batallas finales ni validación visual en móvil; ajedrez y AR quedan sin modificar.


## 0.14.4-beta.1 — 2026-10-18 · Incorporados los 10 WebP de reino subidos
- Se reconocen los 10 nombres originales numerados `01_` a `10_` en la carpeta entornos; 13 tableros usan 10 paisajes (3 compartidos provisionalmente).
- Alquimia, Plata y amatista y Gótico son los únicos sin paisaje exclusivo; existen fondos compartidos y se pueden sobreescribir con `entorno_ID.webp` cuando se suban.
- Mapeo y allowlist de GitHub Pages sincronizados desde `realm-pairing.js`. No cambian movimientos, texturas de casillas ni la experiencia AR.
- Documentación actualizada en un único resumen maestro y carpeta de fondos; se exige verificar pruebas CI y visualización 3D en navegador.


## 0.14.3-beta.1 — 2026-10-18 · Tablero y reino son una pareja única en 3D
- Nueva carpeta de subida `app/imagenes/entornos/` con README de los 13 WebP `entorno_ID.webp` y manifest generado por GitHub Pages solo con archivos existentes y seguros.
- Cada tablero jugable selecciona su bioma y fondo 3D automáticamente. El clásico conserva escenarios libres; los 13 modelos ilustrados no tienen selector separado de reino. No hay cambios al fondo AR (cámara real).
- Configuración muestra tablero + reino en paralelo, con aviso visual de reino pendiente hasta que su propietario publique imagen válida.
- Pantallas de empate, derrota o victoria incorporan una ilustración `vista-` celestial como fondo de ambientación, manteniendo los efectos anteriores.
- Pruebas de mapeo y seguridad del bundle actualizadas; falta validación de AR en equipo físico.


## 0.14.2-beta.1 — 2026-10-18 · Final mágico y continuidad en un solo resumen
- Modal de victoria, derrota y tablas, con efectos CSS ligeros, animación de aro/partículas y los controles reiniciar, menú y ver tablero.
- Ganador calculado con chess.js, según bot/local/online host/invitado; textos ES/EN/ZH, accesibilidad reducida y sin alterar reglas o AR.
- NUEVOS victory-fx.js, victory-fx.css y tests/victory-fx.test.mjs. Actualizada allowlist Pages y chequeo sintáctico en CI.
- Actualizado docs/RESUMEN_MAESTRO.md: mapa único del proyecto, historial 0.14.1 y 0.14.2, archivos y tareas prioritarias.
- Pendientes: inspección visual en Chrome Android, WebXR real, modalidad remota entre dos teléfonos.


## 0.14.0-beta.1 — 2026-10-18 · Tableros reales sobre 3D, colección de vistas separada
- 13 imágenes `tablero_*.webp` importadas como texturas jugables 8x8 sin cambiar posiciones de casillas, clics, fichas ni turnos. Selector configurable antes y durante la partida.
- Encadre del marco ajustable al 65–100% (predeterminado 86%); proporción conservada al cambiar zoom y tamaño AR. Se requiere prueba visual de cuadrícula real por imagen.
- 7 imágenes `vista-*.webp` implementadas exclusivamente como arte decorativo en carrusel de menú, no como miniaturas de tableros.
- CacheStorage y service worker guardan solo los diseños que el usuario selecciona, sin descargar todos cada vez ni perder los modelos ya guardados.
- Nuevos `board-skins.js`, `board-catalog-ui.js`, `board-catalog.css` y `tests/board-skins.test.mjs`. Publicación segura solo de recursos permitidos. Ver `docs/ENTREGA_0.14.md`.
- Infraestructura gratuita; motores y PvP inalterados.


## 0.13.0-beta.1 — 2026-10-18
- Fondo mágico 3D con ambientes de bosque, templo, ciudad y volcán mediante imágenes del usuario y geometría ligera, con perfiles de rendimiento.
- Última jugada: silueta temporal, origen y destino visibles solo en el dispositivo solicitante. Online no permite deshacer.
- Acceso AR junto a estrella y menú de partida ampliado (historial, PGN, escenarios, legal y salir).
- Aviso inicial de condiciones de uso, política de privacidad y permisos contextualizados. Términos provisionales sujetos a revisión institucional.
- Añadidos magic-world.js, last-move-ghost.js, magic-game.css, legal-consent.js y terms.html.
- Se conserva caché de piezas, intro, QR y reglas. Más detalles en docs/ENTREGA_0.13.md.


## 0.12.1-beta.1 — 2026-10-18 · Modelos 3D cacheados sin descargas duplicadas
- Validación de las seis figuras glTF originales de ajedrez autocontenidas en `assets/models/staunton/`.
- Unificada la descarga en `asset-cache.js` con la lectura de `GLTFLoader.parseAsync` para que intro y partida compartan solicitudes sin duplicaciones.
- La colección de modelos se guarda en CacheStorage y se reutiliza en las visitas siguientes, mientras el navegador conserve el almacenamiento. Conservado el nombre de caché `v0.11.0` para no perder archivos ya descargados.
- Nueva barra real de seis modelos y botón `Preparar / comprobar piezas 3D`, más indicador independiente de disponibilidad en memoria y caché. Persistencia reforzada solicitada al navegador tras interacción del usuario, sin garantía de conservación permanente.
- Estilos Staunton/Realeza reutilizan seis glTF; Fantasía y Clásico son geometría procedural, no paquetes descargables externos. No se incluyeron modelos antiguos de franquicias sin licencia.
- Test de dos visitas compartiendo caché en `tests/model-cache-persistence.test.mjs`; consultar `docs/ENTREGA_0.12.1.md`. AR, PvP y BFF sin modificar, coste $0.


## 0.12.0-beta.1 — 2026-10-18
- Contraste reforzado en la bienvenida: título, subtítulo, letras pequeñas, textos de estado y privacidad, conservando la imagen limpia aprobada.
- Introducción automática al iniciar una pestaña nueva; una vez por sesión, saltable, hasta 10s de video; recursos públicos descargados en paralelo con progreso real; fondo permanece estático al salir.
- La opción Unirme a partida ahora permite escanear el QR generado al crear un duelo, mediante cámara con permiso del usuario y validación de invitación propia. Se mantiene entrada manual de seis símbolos y deep link desde cámara del teléfono.
- Archivos nuevos `qr-scanner.js`, `readability-qr.css`, `tests/qr-join-intro.test.mjs`; guía `docs/ENTREGA_0.12.md`. Las pruebas automatizadas no sustituyen una prueba física entre dos celulares. Sin costos ni cambios en AR/Firebase.


## 0.11.1-beta.1 — 2026-10-18 · Portada con imagen limpia y video 10s
- Fondo exclusivo aprobado y subido por el usuario: `app/imagenes/interfaces/login_post_intro_fondo.png` con firma PNG verificada, empaquetado específico para GitHub Pages.
- Video de intro automática primera visita: cierra al final o a 10s de reproducción; aparece imagen fija. Ya no hay video ambiental en bucle en bienvenida. Puede omitirse o reproducirse de nuevo manualmente.
- Nuevos estilos `login-scene.css` para PC, tablet y celular: logo, título ECOAJEDREZ sin dividirse, botones reales legibles sobre fondo panorámico, scroll seguro.
- Registro técnico `docs/ENTREGA_0.11.1.md` y tests del contenido/flujo. No se modifican menú, partidas, AR, OAuth ni infraestructura gratuita.



## 0.11.0-beta.1 — 2026-10-18 · Ocho ilustraciones reales, intro inicial y caché
- Se verificaron y publicaron las ocho imágenes WebP que el usuario subió a `app/imagenes/tarjetas/`: cuatro modalidades y cuatro escenarios.
- Los controles reales del menú muestran tarjetas ilustradas; nuevo Portal de la Arena selecciona bosque/templo/ciudad/volcán y actualiza los biomas reales de ajedrez 3D.
- La introducción MP4 del usuario se abre automáticamente solo en la primera visita del navegador cuando se permite reproducción automática silenciada. Siempre se puede omitir o repetir con el botón.
- Indicador de progreso verdadero para 14 archivos (8 WebP + 6 glTF), cantidad en caché/descargados/pendientes. CacheStorage y service worker solo guardan recursos públicos, sin datos privados ni videos de gran tamaño; ahorro de datos respetado.
- Nuevo diseño adaptativo con las imágenes aprobadas, barra de progreso en bienvenida e intro, versión visible fuera de partida; `adventure.css`, `adventure-ui.js`, `asset-cache.js`, `sw.js`.
- CI, lista blanca Pages y comprobaciones de seguridad actualizadas. Guías `docs/ENTREGA_0.11.md` y `docs/RESUMEN_MAESTRO.md` para ahorrar lectura y mantener la continuidad.
- La reproducción y AR reales aún requieren pruebas físicas; los navegadores pueden desalojar caché y no se promete modo offline completo. Sin nuevos gastos ni cambios de autenticación.



## 0.10.1-beta.1 — 2026-10-17 · Corrección de bienvenida cinematográfica
- Quitados rey, caballo, torre y alfil Unicode exagerados de la portada tras captura del usuario; eran caracteres 2D, no fichas 3D.
- Media original PNG/MP4 del propietario vuelve al fondo de toda la arena con tarjeta legible encima, sin caja aislada a la derecha.
- Nuevas reglas de pantalla completa y scroll móvil; conserva el inicio como invitado y el botón de intro.
- CSS local adicional `cinematic-fix.css`, build actualizado, pruebas de regresión y traspaso `docs/ENTREGA_0.10.1.md`.
- No hay gastos ni cambios de Firebase, modelado GLB o WebXR. Pendiente verificación visual real del propietario.



## 0.10.0-beta.1 — 2026-10-17 · Universo celestial interactivo
- Inspirado por las interfaces aprobadas: arte SVG vectorial original de islas flotantes, galaxia y figuras de ajedrez; piezas flotantes con CSS y destellos ornamentados en la portada.
- El video ambiental permanece detrás del texto real; se oculta la galería lateral con collages y se reemplaza por arena galáctica animada.
- Menú gamer más panorámico con cuatro portales de juego; conserva identificación, invitado, QR y botones.
- Configuración sobre escena ilustrada, vista previa cambiante por bioma, navegación lateral real (escritorio), panel transparente y ornamentos dorados.
- Desplazamiento seguro en pantalla vertical/corta y breakpoints. Reducción de movimiento para accesibilidad.
- Nuevos `celestial.css`, `celestial-ui.js`, `assets/ui/celestial-arena.svg`, tests y documento `docs/ENTREGA_0.10.md`.
- La estética interpreta las propuestas conceptuales, no copia literalmente la tipografía rasterizada de sus imágenes. Verificación física pendiente. Sin gastos ni cambios de 3D/AR/login/PvP.



## 0.9.0-beta.1 — 2026-10-17 · Cine gamer debajo del contenido
- Tras revisar capturas del usuario, se reposicionan los MP4: bienvenida con fondo animado **detrás de las letras y botones**, lateral con imágenes y movimiento mínimo, menú principal con otro video bajo las tarjetas.
- Degradados de contraste y controles para pausar/activar fondos; CSS responsive evita el collage recortado que producía mezclar video e imagen en el panel lateral.
- Solo un fondo MP4 a la vez, carga bajo demanda, pausas automáticas en partida/AR y al bloquear/ocultar; respeto a preferencias de datos/movimiento y fallback PNG.
- No hay cambios de motor 3D/WebXR, autenticación o Firebase; costo $0. Ver `docs/ENTREGA_0.9.md` para pruebas pendientes.



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
