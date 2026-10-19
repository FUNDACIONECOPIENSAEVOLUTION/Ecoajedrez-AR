# Piezas antropomorfas gratis de ECOAJEDREZ

**Archivo original del usuario:** anthropomorphic-chess.glb. Modelo glTF 2.0, 32 piezas con brazos y piernas, 32 clips Walk, gemas emisivas azul y violeta.

[Subir GLB original aquí](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/models/anthropomorphic)

**Nombre exacto:** anthropomorphic-chess.glb (solo uno; no requiere 12 GLBs).

El HTML proporcionado construye estas piezas con primitivas Three.js. La versión inicial integrada en el juego usa una representación procedural similar, brazos/piernas animados y gemas brillantes; cuando el archivo GLB esté publicado, usa sus mallas y clips Walk auténticos, normalizando piezas para el tablero 8×8.

El GLB contiene 32 clips Walk pero NO incluye clips Attack ni Death. La demo realiza esas acciones por JavaScript; se integrarán posteriormente al juego sin sustituir el motor de reglas chess.js. Emissive se conserva, pero la corona Bloom intensa no se guarda dentro del GLB: el renderer determina ese postproceso.

El estilo Antropomórfico está marcado como GRATIS. Aún NO hay integración real con AdMob ni compras; los otros estilos seguirán jugables durante esta fase de pruebas. Antes de publicar cualquier pack de terceros confirmar su licencia de redistribución.