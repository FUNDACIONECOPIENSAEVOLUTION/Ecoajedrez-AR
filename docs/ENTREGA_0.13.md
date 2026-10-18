# ECOAJEDREZ 3D/AR — Entrega técnica v0.13.0-beta.1
Fecha: 2026-10-18. Rama: `main`. Repositorio: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/

## Alcance implementado
**No se rehizo el juego.** Conservamos ajedrez con chess.js, las piezas GLTF originales, modos IA/local/PeerJS, comandos, QR, WebXR AR, menú multimedia, intro, CacheStorage de 8 imágenes + 6 glTF y la entrada invitado. Google Sign-In sigue deshabilitado mientras no se configure BFF seguro.

### 1. Última jugada, consulta local exclusivamente
- Nuevos botones `#lastMoveBtn` (adyacente a la estrella central) y `#toolsLastMove` en menú de partida.
- `last-move-ghost.js`: `lastMoveInfo(history)` obtiene movimiento verbose de chess.js SIN mutarlo; `makeLastMoveOverlay()` muestra durante **4,5 segundos** un halo en origen y destino, línea discontinua y silueta translucida aproximada de la ficha anterior. La silueta NO ocupa ni modifica una casilla del juego, ni participa en raycast, ni altera el tablero real.
- Se eliminó el resaltado permanente de la última jugada; la pista se activa solamente tras pulsar el botón.
- **PeerJS no recibe ningún mensaje sobre esa pista**. Online no permite deshacer; el botón `undo` sigue desactivado en online. Cada jugador ve solo las pistas que solicitó en su dispositivo.

### 2. Acceso rápido AR y menú dentro de partida
- `#quickArBtn` con acceso directo a `startAR()`, sin solicitudes automáticas de cámara.
- `#gameTools` reemplaza el comportamiento anterior de salida inmediata de `#gameMenuBtn` (ahora abre acciones sin abandonar ni reiniciar partida). Incluye continuar, última jugada, activar AR, elegir bioma, historial local SAN de movimientos, exportar PGN, consultar legalidad y volver al menú principal.
- Elegir bioma cambia **solo la presentación local** (no envía configuración a otro jugador, no altera reglas).

### 3. Ambiente mágico y tablero iluminado
- `magic-world.js` + `magic-game.css`: los WebP reales y aprobados `app/imagenes/tarjetas/05..08` se usan como **fondo escénico** del WebGL transparente, más plantas geométricas, pilares/cristales, runas decorativas en esquinas fuera del tablero y luces/partículas leves. No se utilizan modelos de franquicias ni se descargan assets nuevos.
- Biomas: Bosque Encantado, Templo Arcano, Ciudad Flotante, Volcán Celestial; además siguen opciones clásico, madera e hielo, mapeadas a arte existente.
- Cada casilla del tablero 8×8 mantiene **tamaño, interacción y ubicación originales**; materiales tienen ligero efecto de luz mágico, sin afectar la lógica de ajedrez.
- Opciones de calidad `#quality`: automática, ligera, media y alta; preferencia local. Reducción automática de plantas para móviles/low; el modo reducido del sistema limita partículas.
- **AR no recibe la escenografía externa de 3D:** los elementos ambientales añadidos se ocultan durante WebXR para mantener claridad del campo de cámara, anclajes y rendimiento. Los efectos de portal AR/mundo envolvente a escala real se diseñarán y verificarán físicamente en fase posterior. Las imágenes WebP disponibles no son panoramas equirectangulares 360°, por lo que no afirmar skybox 360° verdadero.

### 4. Documentación legal/permisos
- `terms.html`: borrador institucional de términos de uso, información de gratuidad, ausencia de compras activas, límites de beta y privacidad. Revisión jurídica local **pendiente antes de comercializar**; el texto no elimina responsabilidades legales.
- `privacy.html`: actualizado para explicar tratamiento local de QR, caché público, aceptación de términos y permisos contextuales.
- `legal-consent.js`: muestra un aviso con enlaces a términos y privacidad cuando un usuario entra por primera vez como invitado/Google; requiere casilla y registra solo la aceptación local `ecoajedrez-terms-2026-10`. El cierre no otorga aceptación. Permisos de cámara (AR/QR) y micrófono (dictado) siempre se solicitan por separado por el navegador y exclusivamente cuando el jugador activa esas funciones.
- Entrar como invitado sigue siendo posible; la aceptación no requiere nombre, correo, documento ni clave.

### 5. CI y seguridad
- `scripts/build-pages.mjs` incluye solamente `magic-world.js`, `last-move-ghost.js`, `magic-game.css`, `legal-consent.js`, `terms.html` nuevos entre los recursos permitidos. No distribuye `worker-lib/`, `functions/`, pruebas, secretos ni documentación interna.
- `scripts/security-check.mjs` revisa los nuevos JS para patrones de credenciales; workflow Pages añade `node --check`. Nuevo `tests/magic-3d.test.mjs` valida ayuda fantasma pura/no-online, escena con WebP existentes, botones funcionales y consentimiento de primer uso.
- Caché previo **conservado** para evitar descargas innecesarias: 8 WebP + 6 glTF CacheStorage/Service Worker, salvo que el navegador los borre.

## Revisión manual imprescindible
1. PC: entrar como invitado, escoger Bosque Encantado, iniciar partida; el fondo NO debe quedar negro y se ven decoraciones fuera de cuadrícula. Cambiar calidad y mundo sin salir de la partida.
2. Mover `e2e4` y, si hay respuesta, pulsar `♞` junto a la estrella. Debe aparecer silueta y halos ~4,5s solo en ese navegador. En dos celulares online, confirmar que el rival no ve la pista ni cambia sus piezas.
3. Pulsar `◎ AR` junto a la estrella en Android WebXR compatible: solicitar cámara en el momento, fijar tablero igual que antes y regresar sin perder partida. No esperar bosque extendido alrededor en AR en esta entrega.
4. Abrir `☰ MENÚ`, consultar historial, cambiar mundo, exportar PGN, regresar a partida, privacidad y términos; verificar que no se reinicia la partida salvo nueva partida explícita.
5. Abrir juego desde navegador sin almacenamiento previo, pulsar invitado y ver aviso; cerrar sin marcar = permanece bienvenida, aceptar = entra a menú. Revisar versión visible v0.13.0-beta.1 fuera de partida.
6. Android/tablet: ajustar nivel ligero si bajan fps y comprobar orientación vertical/horizontal.
7. Introducción/QR/caché: se mantienen. Si falla un recurso, sigue funcionando el modo invitado y el ajedrez procedimental; Google Login no disponible hasta configurar BFF.

## Limitaciones conocidas
- No se ha verificado físicamente la experiencia en móviles, tablets, WebXR y dos terminales en esta entrega; tests de GitHub Actions verifican código/publicación, no desempeño real del navegador.
- El arte fondo es una imagen escénica 2D del propio proyecto combinada con elementos 3D procedurales; **no una esfera inmersiva real 360 ni una textura de video animada sobre cada casilla**.
- Los modelos Staunton originales son simples, no reemplazan personajes de fantasía 3D avanzados; no se publican modelos de marcas ajenas sin licencias.
- Los documentos legales requieren validación institucional y jurídica para mercado colombiano y expansión internacional.
- No hay nuevos servicios, llaves, compras ni gastos. Presupuesto $0 COP.
