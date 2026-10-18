# ECOAJEDREZ · Entrega v0.14.0-beta.1
Fecha: 2026-10-18

## Solicitud y distinción definitiva de recursos
El usuario cargó 20 fotografías WebP en `app/imagenes/tableros/`.
- **13 nombres que empiezan con `tablero_`**: imágenes cuadradas de tableros completos decorados, con 8×8 casillas, marco y posibles ornamentos. Son superficies REALES que se aplican al tablero jugable.
- **7 nombres que empiezan por `vista-` o `vista_`**: ilustraciones fantásticas para DECORACIÓN del menú, NO son vistas previas de los tableros de la partida ni se usan sobre la cuadrícula. Se muestran separadamente en una galería de siete ilustraciones.
No volver a confundir ambas categorías.

## Arquitectura implementada
- `board-skins.js`: inventario **BOARD_SKINS** con 13 texturas + opción clásica. `createBoardSurface` crea un `THREE.PlaneGeometry(8,8)` sobre las casillas existentes, con `raycast=()=>{}` para no atrapar pulsaciones. La textura se aplica como imagen y las fichas siguen siendo mallas 3D jugables. El tablero del ajedrez conserva 64 casillas de chess.js; NO se reemplaza ni reescribe.
- El WebP contiene marco. Por defecto, se considera que el área central de las casillas ocupa un **86%** de la imagen: se escala el plano visual con `1/gridCoverage`. Rango corregible 65–100% mediante `#boardCoverage` y persistencia local. **Esto es un encuadre centrado aproximado, NO calibración por análisis pixel de las 13 imágenes**. Si una imagen concreta contiene perspectiva/rotación interna, se deberá ajustar/calibrar por archivo posteriormente; no prometer coincidencia perfecta solo por compartir dimensiones. Se dibuja un `GridHelper(8,8)` tenue en el área jugable para ayudar a alinear.
- Three.js `world` contiene tablero base, fichas, superficie y decoraciones. En AR todos se escalan juntos por el `world.scale` existente, por lo que el marco y la imagen aumentan proporcionalmente sin estirarse independientemente. Las imágenes no cambian los movimientos ni el cálculo de la casilla.
- La textura seleccionada se interpreta en sRGB, con filtro anisotrópico (máximo 8) y se destruye cuando se reemplaza. Solo hay UNA textura de tablero activa en GPU. Si no carga, queda el tablero clásico.
- `board-catalog-ui.js`: sincroniza los dos selectores (`#boardSkin` en Configuración y `#toolsBoardSkin` en Menú de partida), una miniatura de la textura REAL seleccionada, información de posición, control de encuadre, almacenamiento local e ilustraciones de menú `VISION_ART` navegables con botones anterior/siguiente. Las ilustraciones `vista-` están en una galería independiente y NO se asignan a casillas.
- `board-catalog.css`: diseño responsive en PC/tablet/móvil y botones accesibles.
- `asset-cache.js` y `sw.js`: se amplía exclusivamente la lista permitida de descargas públicas para incluir `tablero_*.webp` aprobados. **NO se agregan a la precarga inicial de 14 archivos**, se descargan bajo demanda tras seleccionar el diseño. Permanecen reutilizables en CacheStorage mientras el navegador conserve datos; sin nueva suscripción/cuenta, sin contraseñas y sin garantías absolutas de persistencia. Se mantiene la versión de caché previa para no forzar redescargas.
- `scripts/build-pages.mjs`: publica SOLO los nombres exactos de 13 tableros y 7 vistas aprobados, con verificación de firma RIFF/WEBP y tamaño; evita copiar directorios arbitrarios. Todos se sirven desde GitHub Pages HTTPS sin pago.
- `tests/board-skins.test.mjs`: catálogo exacto, archivos reales y WebP válido, separación de vistas, entrega Pages, 64 casillas con picking intocable, encuadre y caché lazy.

## Comprobación visual manual que falta
1. PC: invitado → VS computadora → CONFIGURACIÓN → «Diseño jugable del tablero» → escoger un tablero, ej. «Celta mágico»; ver miniatura y jugar e2e4 con las piezas **encima**.
2. Android: girar cámara 3D; asegurar que las figuras se seleccionan y los efectos gráficos no capturan los toques.
3. Si imagen incluye marco ancho, usar deslizador «Alinear las casillas con la imagen» hasta hacer coincidir la cuadrícula propia con las 64 casillas pintadas; verificar diferentes tableros para calibración futura.
4. «☰ Menú» durante partida → «Diseño del tablero»; cambiar estilo sin reiniciar partida, turnos, ni sincronizar preferencias al rival.
5. AR en Android compatible: confirmar que la imagen escala junto al tablero al seleccionar tamaño AR; debe conservar proporciones. Revisar rendimiento con nivel gráfico bajo.
6. Volver a cargar la página: selección previa conservada y el WebP debería salir de caché si hay almacenamiento suficiente. Los 7 `vista-` solo aparecen en galería «Visiones de los Reinos».
7. Probar en móvil vertical, tablet horizontal y PC y observar posibles bordes recortados/escala al 86% inicial.

## Fuera de alcance
No se han añadido videos sobre las casillas, figuras de marca ajena, panorámicas 360, servicios de pago ni capacidades de IA nuevas. No se han realizado pruebas físicas visuales de alineación en todos los tableros; la exactitud requiere calibración de las imágenes individuales. No se altera QR, intro, Firebase, privacidad, PeerJS ni reglas del ajedrez.

## Versión
`0.14.0-beta.1` publicada después de CI; consultar las ejecuciones del workflow para el estado real.
