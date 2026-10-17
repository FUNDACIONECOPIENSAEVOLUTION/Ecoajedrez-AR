# ECOAJEDREZ AR · Entrega y traspaso 0.4.1-beta.1 (17/10/2026)

## Leer antes de modificar
1. `AGENTS.md`, `docs/ESTADO_ACTUAL.md`, este archivo, `CHANGELOG.md`, `version.json`.
2. Repositorio canónico: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR
3. Juego publicado: https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/
4. Otro juego `FUNDACIONECOPIENSAEVOLUTION/3d-line` es **independiente**: no modificar.

## Implementado esta sesión
- **Historial remoto completo:** `match-state.js` añade `makeSnapshot()` y `verifyAndRestore()`. El anfitrión envía FEN con todos los movimientos SAN; el invitado reproduce y verifica la posición antes de actualizar. Se descartan estados inconsistentes sin modificar el tablero actual. Ya no se pierde el historial de jugadas al recibir una nueva posición online.
- **Partidas locales recuperables:** con `saveLocalMatch()` y `readLocalMatch()`, partidas CPU y dos jugadores locales se guardan en el almacenamiento de ese navegador, por cuenta (UID o invitado). Se restauran al entrar si tienen menos de 90 días, incluyen estilo/tablero/colores/idioma y muestran CONTINUAR PARTIDA. No son partidas guardadas en la nube; borrar datos del navegador puede eliminarlas. Se omiten deliberadamente las partidas online.
- **Historial visual 3D/AR:** selección de casilla y última jugada resaltadas con materiales translúcidos; se conservan movimientos legales y animación de piezas.
- **Exportación PGN:** botón GUARDAR PARTIDA PGN en el menú, genera archivo estándar con el historial disponible. No requiere servidor.
- **Inicio Google móvil:** se eliminó una espera innecesaria entre clic e inicio del popup de Google; persiste sesión desde inicialización Firebase. Botón deshabilitado mientras se inicializa el SDK para evitar un clic prematuro. Aún necesita prueba en la página pública y autorización del dominio en Firebase.
- **Cambio de cuenta seguro:** al cerrar sesión se limpia la partida en memoria sin sobrescribir el guardado de la cuenta anterior; nueva cuenta recupera únicamente su espacio local.
- **Diagnóstico del dispositivo:** botón DIAGNÓSTICO en menú. Comprueba HTTPS, WebGL2, WebXR immersive-ar, disponibilidad de Firebase Auth, PeerJS, QR, reconocimiento de voz, 6 modelos glTF y estado de conectividad. Permite copiar el informe voluntariamente. No comprueba autorizaciones Google ni garantiza AR funcionando o conectividad PeerJS real.
- Traducciones principales del menú PGN/Diagnóstico en español/inglés/chino simplificado.

## Pruebas automáticas
- `node --check main.js`, `node --check auth.js`, `node --check commands.js`, `node --check pvp.js`.
- `node --test tests/*.test.mjs`; contiene nuevas pruebas `tests/match-persistence.test.mjs` para historial remoto, protección de estados dañados, almacenamiento local e interacciones básicas de PeerJS.
- Despliegue automático Pages desde la rama principal, con verificación GitHub Actions.
- **Límite:** tests de sintaxis y módulos Node no equivalen a probar Google OAuth, cámara AR, WebXR o PvP entre dos teléfonos.

## Qué probar en dos celulares
1. En uno abrir la web (versión 0.4.1), entrar de invitado, VS computadora, hacer e4 y otra jugada, cerrar/reabrir; confirmar CONTINUAR PARTIDA y último movimiento resaltado.
2. Menú → GUARDAR PARTIDA PGN; abrir el archivo y comprobar secuencia de jugadas.
3. Menú → DIAGNÓSTICO, ejecutar y copiar informe si surge error; no compartir sin revisar navegador/equipo en el texto.
4. En el Android compatible (AR confirmada en versión anterior): abrir AR, detectar mesa, fijar tablero, tocar/arrastrar, salir y verificar que conserva la partida.
5. Entrar con Google; si aparece `auth/unauthorized-domain`, autorizar `fundacionecopiensaevolution.github.io` en Firebase Authentication del proyecto `d-line-g`. Conector Firebase no disponible para cambios en esta sesión.
6. Dos teléfonos con redes diferentes: anfitrión CREA DUELO ONLINE, invitado se une con QR/código. Comprobar que blancos y negros respetan turnos, FEN coincide y se muestra historial. PeerJS público puede fallar tras NAT o bloquear conexiones.

## No se afirma como terminado
- Ni WebXR de la versión nueva ni OAuth ni conectividad PvP validados físicamente aquí. Solo AR de una versión anterior fue confirmada por el usuario.
- No existen torneos FIDE certificados, ratings oficiales, Stockfish WASM, matchmaking público, almacenamiento cloud persistente de partidas ni APK.
- El backend P2P es un prototipo sin servidor árbitro seguro contra un anfitrión malicioso y no debe usarse en partidas con apuestas/ranking.
- No se añadieron modelos de Harry Potter ni personajes sujetos a franquicias.

## Siguiente prioridad
Validación de un duelo real entre dos móviles y UX de reconexión. Si hay un error: usar DIAGNÓSTICO y el registro de GitHub Actions. Después valorar backend seguro (Firestore/Realtime Database independiente y reglas de seguridad) y Stockfish bajo licencia GPLv3.
