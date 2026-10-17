# ECOAJEDREZ 3D / AR
**Versión:** 0.8.0-beta.1 — 17/10/2026  
**Propietario:** Fundación Ecopiensa Evolution  
**Estado:** tablero 3D con modelos glTF, selector de colores y AR WebXR basado en 3 LINE-AR; validación física Android pendiente. No es APK y el PvP remoto todavía es experimental, sin validación entre teléfonos.

## Prueba web
Repositorio: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR  
Dirección de GitHub Pages (acción de publicación completada; pendiente verificación visual del navegador): https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/

**Publicación:** comprobación sintáctica y despliegue Pages exitosos en GitHub Actions: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/actions/runs/39040927867 . Si el enlace aún no abre, revisar Settings → Pages → Source: GitHub Actions y esperar propagación. El usuario confirmó AR en una versión anterior; falta repetir la prueba física tras actualizar 0.4.1.

**Prueba local:** ejecutar `python -m http.server 8000` desde la raíz y visitar `http://localhost:8000`. Necesita conexión para las dependencias JS del CDN. La AR debe probarse por HTTPS en Android con navegador/WebXR compatibles.

## Incluye
- Tablero 3D con **6 modelos glTF originales** (<50 KB cada uno) y 32 instancias; selector Staunton/Fantasía/Clásico, colores por bando, animación de movimientos, biomas clásico y selva.
- Reglas legales (jaque, mate, tablas, enroque, promoción automática a dama) con `chess.js`.
- Contra computadora **demostrativa**: principiante aleatorio, intermedio heurístico y avanzado búsqueda básica de dos medias jugadas. **No** es Stockfish ni fuerza FIDE validada.
- Dos jugadores **en un mismo dispositivo**. Multijugador online **no implementado**.
- Controles 3D: toque o clic para seleccionar casilla, arrastrar para girar, teclado con formato `e2e4`.
- AR WebXR inspirado en 3 LINE-AR: botón ACTIVAR, detección opcional de superficies, FIJAR TABLERO, selección con dedo o apuntando a una casilla, ajuste de escala y SALIR. Sin hit-test ofrece un holograma no anclado. **La prueba física de cámara Android está pendiente**.
- Traducciones preliminares español, inglés y chino simplificado.

## Documentos para futuras sesiones o IAs
**Leer primero:** `AGENTS.md` → `docs/ESTADO_ACTUAL.md` → `docs/HOJA_DE_RUTA.md` → `docs/INVENTARIO_MODELOS.md`.  
El `CHANGELOG.md` y `version.json` guardan cambios y versión.
Toda implementación debe avanzar sobre este repositorio sin alterar la historia del proyecto 3 LINE-AR.

## Origen y advertencia comercial
Prototipo previo de usuario (referencia y modelos): https://github.com/instructorandradedcc/Ecoajedres-AR  
El código anterior presenta algunas ideas AR útiles pero también problemas de escala, precarga y carga de modelos; no se trasladó sin revisar. Los nombres de franquicia/personajes en esos GLB pueden plantear problemas de derechos de propiedad intelectual. **No redistribuir ni comercializar esos personajes/modelos hasta documentar licencia y titularidad**. Usar diseños originales de fantasía.

## Arquitectura de largo plazo
Web modular / PWA → WebXR → APK con Capacitor o solución nativa (sujeto a compatibilidad) → actualizaciones del contenido web vía servidor para capas permitidas por las reglas de las tiendas → PvP con backend y reglas verificadas → motor Stockfish bajo cumplimiento GPLv3 → escenarios originales y monetización responsable. El ejecutable nativo y plugins del APK pueden exigir reinstalación para actualizarse.

## Política de publicación
No afirmar "funciona en AR" hasta verificar dispositivo; distinguir código implementado de prueba completada. Documentar errores, límites de costos, licencias, pruebas y siguientes pasos en `docs/ESTADO_ACTUAL.md`.

## Entrega más reciente
Consultar [docs/ENTREGA_0.3.0.md](docs/ENTREGA_0.3.0.md) para modelos, enlaces CC0, diagnóstico AR y lista de pruebas que debe realizar una persona en un Android compatible.


## Versión 0.4.0-beta.1 — flujo gamer y multijugador experimental
Enlace: https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/

Bienvenida con Google (Firebase Auth existente del proyecto d-line-g) o invitado local. Menú principal con VS computadora, dos jugadores locales, crear sala online y unirse mediante código/URL/QR. El Google login necesita verificar dominio autorizado y proveedor activado; PvP por PeerJS es beta sin garantía de conexión en todas las redes.

La configuración del tablero ahora se realiza antes de jugar: siete variantes visuales (obsidiana, madera, mármol, neón, selva, volcán e hielo), estilos de piezas originales, colores, tamaño AR, idioma y dificultad. El tablero aparece a pantalla completa y se puede regresar al menú y continuar una partida.

Comandos: e2e4, e4, Nf3, Cf3, O-O, enroque corto, caballo de g1 a f3. Dictado opcional con Web Speech; las reglas se verifican con chess.js. Tocar o arrastrar piezas 3D y AR, con control de escala de mesa.

El usuario confirmó que la AR funcionaba en la versión previa. Esta actualización necesita prueba física regresiva en Android, más prueba de Google y PvP entre dos móviles.
Guía detallada: docs/ENTREGA_0.4.0.md


## Actualización 0.4.1-beta.1: recuperación y diagnóstico
- Historial íntegro de jugadas SAN con sincronización de FEN validada: el invitado online conserva anotaciones y se rechazan estados remotos inconsistentes.
- Partidas CPU/local guardadas **en el navegador** por cuenta o invitado; se restauran al volver a entrar (hasta 90 días, salvo eliminación de datos locales). Las partidas online NO se almacenan localmente como si fueran recuperables.
- Exportación de partida PGN desde el menú, con formato compatible con herramientas de ajedrez.
- Resaltado de la última jugada y la pieza seleccionada en tablero 3D y AR.
- DIAGNÓSTICO del dispositivo para verificar APIs WebXR/WebGL, disponibilidad de Firebase SDK, PeerJS, recursos 3D y copiar el informe voluntariamente.
- Popup Google se inicia directamente al tocar el botón, sin espera intermedia; queda pendiente comprobar autorización del dominio.
- Pruebas automatizadas ampliadas: `tests/match-persistence.test.mjs`.
**Estado:** versión desplegada automáticamente cuando GitHub Actions aprueba las pruebas; aún sin prueba del PvP entre dos celulares ni Google en el dominio. Leer `docs/ENTREGA_0.4.1.md`.


## Seguridad 0.5.0-beta.1
El juego no maneja contraseñas propias. Se eliminó la configuración Firebase de auth.js y se preparó un servidor intermediario (BFF) seguro con Cloudflare Pages Functions para futuro login Google. Este BFF solo funcionará tras conectar Cloudflare Pages con credenciales cifradas en su panel; Google queda desactivado en GitHub Pages, donde se puede jugar como invitado.
Protecciones: CSP, cabeceras HTTP Cloudflare, sesiones HttpOnly AES-GCM, OAuth state/nonce + PKCE y firma Google, listas de archivos públicos, escáner de secretos CI, salas con códigos de 12 caracteres y límites de mensajes. No sustituye auditoría de seguridad.
`privacy.html`: aviso al jugador. Detalle: `SECURITY.md`, `docs/DEPLOY_SEGURIDAD.md` y `docs/ENTREGA_SEGURIDAD_0.5.md`.


## Interfaz gamer v0.6.0-beta.1
Actualización basada en sugerencias «Arcane Glass» del usuario: interfaz verde esmeralda y oro, medallón, orbe de turno, menú radial en móvil, transición de portal, runas y partículas 3D ligeras; los comandos táctiles y por texto siguen disponibles.
Modalidades: CPU básica (no Stockfish), dos jugadores en un teléfono, duelo casual PeerJS con **código de seis caracteres + QR**. El link largo no aparece en el panel. No se garantiza disponibilidad de PeerJS tras NAT ni rankings seguros.
Piezas: seis glTF Staunton originales incorporados al repositorio, «Realeza arcana» con decoración original, Fantasía y Clásico ligero.
AR: intenta recuperarse tras bloquear el celular y ofrece reentrada mediante gesto del usuario sin perder una partida local. Permite apuntar y tocar/arrastrar **sobre la pantalla**, no rastreo de dedos en el aire ni ocultación de la mano real.
La versión 0.6 todavía necesita pruebas en Android físico y dos teléfonos; ver `docs/ENTREGA_0.6.md`. Sigue siendo gratis, con Google desactivado en Github.io hasta activar el BFF autorizado.


## 0.7.0-beta.1 — Opening gamer animado
La portada ya muestra dos arenas de fantasía ilustradas originales, carrusel que cambia automáticamente y botones de selección de escena, tarjetas de menú con ilustraciones, invocación CSS del tablero y versión única visible en todas las pantallas excepto partida/AR. Las imágenes fueron recreadas como SVG escalables inspirados en referencias del usuario para evitar depender de capturas pixeladas o recursos con licencias no comprobadas.
Consulta `docs/ENTREGA_0.7.md`. Modo invitado, reglas de ajedrez, WebXR, PeerJS casual y privacidad se conservan. La versión física en celulares aún debe probarse.

## 0.8.0-beta.1 · Videos originales del propietario
Se incluyen 3 MP4 y 3 imágenes PNG de la carpeta `videos/` en GitHub Pages: un intro opcional con botón Omitir y dos arenas animadas que se alternan en la bienvenida. Los archivos permanecen bajo su nombre original en GitHub; los enlaces están correctamente codificados para espacios y acentos. Los videos de fondo se cargan bajo demanda, sin sonido, y cada escena presenta su imagen de respaldo íntegra (sin recorte). En móviles con ahorro de datos o movimiento reducido, no arrancan automáticamente. AR, reglas de juego, modo invitado y Firebase permanecen sin cambios. Ver `docs/ENTREGA_0.8.md` para comprobar reproducción, compatibilidad y límites de peso.
