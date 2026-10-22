# Inventario de piezas históricas y derechos

**Fuente:** https://github.com/instructorandradedcc/Ecoajedres-AR  
Listados inspeccionados el 17/10/2026; los tamaños son los registrados por GitHub (bytes). El repositorio original pesa bastante y sus archivos no se trasladaron. **Tamaño menor de 15 MB NO equivale a permiso de explotación comercial**. No se identificó licencia de modelos en el repo inspeccionado.

| Archivo histórico | Bytes | <15 MB | Estado para comercializar |
|---|---:|:---:|---|
| Bishop_HPotter.glb | 22,366,928 | No | Licencia y personaje no verificados |
| Bishop_HPotter_Hollow.glb | 22,566,276 | No | Igual |
| King_Dumbledore.glb | 21,947,228 | No | Igual |
| King_Voldemort.glb | 8,244,928 | Sí | Igual |
| Knight_RWeasley.glb | 2,090,712 | Sí | Igual |
| Pawn_Gryffindor.glb | 12,548,828 | Sí | Igual |
| Pawn_Hufflepuff.glb | 7,110,920 | Sí | Igual |
| Pawn_Ravenclaw.glb | 8,203,360 | Sí | Igual |
| Pawn_Sytherin.glb | 7,480,864 | Sí | Igual |
| Queen_Hermione.glb | 21,215,744 | No | Igual |
| Rook_Dobby.glb | 21,160,564 | No | Igual |
| Rook_Dobby2.glb | 21,521,164 | No | Igual |
| Rook_Dobby_Hollow.glb | 23,500,984 | No | Igual |
| modelo1/Glass Chess.obj | 5,121,856 | Sí | Revisar derechos y texturas |

**Total:** 13 archivos GLB; 6 cumplen el umbral de 15 MB + 1 OBJ, pero el objetivo es optimizar la **colección completa** para rendimiento real en móvil.

## Decisión
1. Mantener modelo de demostración 3D original creado con geometrías Three.js en `main.js`; permite comercialización sin arrastrar piezas de franquicia ajena.
2. Revisar procedencia y permiso de cada GLB de la fuente original antes de importarlo.
3. Si se autorizan para uso interno, optimizar en Blender: unir mallas, LOD, reducción polígonos, texturas 1024/2048, compresión glTF/Draco o Meshopt cuando el visor lo soporte; validar materiales y animaciones.
4. Alternativas CC0 a evaluar/comprobar en fichas originales: https://opengameart.org/content/stylized-chess-pieces ; https://opengameart.org/content/3d-chess-pieces ; https://opengameart.org/content/chess-board-pieces .
5. Futuro set magos será **inspirado en fantasía**, no modelos de Harry Potter o Dumbledore sin licencia explícita.

## Procedimiento para nuevos modelos
Registrar nombre; autor; URL de origen; licencia escrita y fecha de verificación; GLB comprimido; bytes; polígonos; texturas; celular de prueba; captura. Nunca asumir CC0 por ser descargable.

## Activos originales integrados el 2026-10-17
Ruta: `assets/models/staunton/` — `pawn.gltf`, `rook.gltf`, `knight.gltf`, `bishop.gltf`, `queen.gltf`, `king.gltf`.
Son seis mallas 3D originales de geometría Staunton, generadas para ECOAJEDREZ y guardadas en glTF 2.0 autocontenido.
Se utilizan como una malla por tipo, y mediante instanciación/clonación de Three.js aparecen 32 piezas sobre el tablero.
Cada archivo es menor de 50 KB (<15 MB). Son recolorables, pero NO están riggeadas; el movimiento de casillas es una animación por interpolación.
Hay verificación automática de tamaños, buffers, normales e índices; falta verificación visual y de WebXR en celular.

## Bibliotecas externas adicionales revisadas (solo enlaces, sin importar archivos)
- Poly Haven Chess Set (Riley Queen), CC0, requiere reducir texturas: https://polyhaven.com/a/chess_set
- Polyy.AI low-poly Staunton 12 GLB, CC0 declarado y descarga por itch.io: https://polyyai.itch.io/3d-chess-pieces-pack
- KayKit Adventurers pack básico gratuito CC0, personajes de fantasía: https://kaylousberg.itch.io/kaykit-adventurers
- KayKit Skeletons pack básico gratuito CC0: https://kaylousberg.itch.io/kaykit-skeletons
- Quaternius packs gratuitos: https://quaternius.com (verificar paquete/licencia específico).
- Adobe Mixamo es un servicio con condiciones de uso, NO material CC0; uso comercial en juegos permitido con limitaciones de distribución en bruto.

Ver [ENTREGA_0.3.0.md](ENTREGA_0.3.0.md) para detalles y próximos tests.
## Auditoría de colecciones 2026-10-22 — rama 0.16.0-beta.1

| ID del selector | Nombre propuesto | Recurso real | Estado |
|---|---|---|---|
| `anthro` | Guardianes animados (procedural) | `anthropomorphic-pieces.js`, genera piezas geométricas y animaciones por código | Jugable con respaldo; **NO** existe `assets/models/anthropomorphic/anthropomorphic-chess.glb` ni su manifest |
| `staunton` | Clásicas talladas | 6 glTF originales `assets/models/staunton/*.gltf` | Disponible |
| `royal` | Corte imperial | Reutiliza los 6 glTF Staunton con detalles adicionales creados por código | Disponible; **no son seis modelos nuevos independientes** |
| `fantasy` | Runas encantadas | Modelado geométrico desde `main.js` | Disponible, sin GLB externo |
| `classic` | Estrategas esenciales | Modelado geométrico desde `main.js` | Disponible, sin GLB externo |
| `robotic` | Guardianes robóticos negro/azul | 6 GLB + 6 JPG en `app/imagenes/fichas/roboticos/` | Solo rama `feature/robotic-chess-set`; integrado en código, requiere prueba de navegador y móviles antes de fusionar |
| `community` | Externa CC0 | Debe tener 12 archivos `w-*.glb` y `b-*.glb` más manifest | Incompleta, deshabilitada |

**Cantidad real:** 7 opciones previstas (5 integradas, 1 robótica en pruebas, 1 comunitaria deshabilitada). No confundir estilos con paquetes de modelos independientes: `royal` usa Staunton, `anthro` usa formas procedurales mientras no haya GLB y `fantasy`/`classic` son procedurales.

**Otras fuentes históricas:** el repositorio anterior contiene 13 modelos de personajes de franquicia y un OBJ; son un inventario externo **no importado**, con restricciones de licencia y tamaños que impiden contarlos como grupos jugables. No agregar como opciones activas sin licencia y conversión.

**Pendiente:** comprobar render y escalas de los robots en Android; confirmar acciones de caminata y captura, integrar clips riggeados solo tras preparar armatures en Blender, completar paquete comunitario si se desea. La rama no está publicada en GitHub Pages (producción es `main`).
