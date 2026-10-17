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