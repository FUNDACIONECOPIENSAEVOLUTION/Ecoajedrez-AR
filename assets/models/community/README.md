# ECOAJEDREZ — Carpeta de piezas 3D externas (opcional)
Esta carpeta está preparada para una futura **colección Staunton CC0 de baja complejidad**. NO subir el ZIP: extráelo primero. Los originales del juego (`assets/models/staunton/*.gltf`) continuarán siempre como respaldo.

## Seis figuras por color, doce archivos GLB
```text
w-pawn.glb       b-pawn.glb
w-rook.glb       b-rook.glb
w-knight.glb     b-knight.glb
w-bishop.glb     b-bishop.glb
w-queen.glb      b-queen.glb
w-king.glb       b-king.glb
```
**Subir modelos reales en GLB 2.0**, no archivos vacíos. Cada GLB individual ≤3 MB; los doce juntos ≤24 MB. El build de GitHub Pages solo publica la colección si **los doce** cumplen las comprobaciones (cabecera GLB y versiones válidas). La modalidad extra solo se habilita entonces. Si falla algo, se mantienen los modelos originales y no se bloquea el juego.

## Fuentes preseleccionadas (sin descarga/importación automática)
1. Polyy.AI — [3D Chess Pieces Pack, versión low-poly (CC0 declarada)](https://polyyai.itch.io/3d-chess-pieces-pack). 12 modelos en GLB, con piezas claras y oscuras; se anuncian 3.600–4.600 triángulos por pieza. La descarga gratuita se obtiene con «Download Now» y precio voluntario; no republicar paquetes sin verificar las condiciones de la licencia original.
2. Omie's Assets — [Low Poly Chess/Checkers Set (CC0)](https://omies-assets.itch.io/3d-chesscheckers-set). Incluye Blender y FBX, 1.000–2.000 triángulos por modelo; convertir a 12 GLB con Blender y conservar materiales.
3. Polyy.AI — [3D Chess Sets Pack 1 (CC0 declarada)](https://polyyai.itch.io/3d-chess-sets-pack-1). Bauhaus, Art Déco, Sci-fi, egipcio: una posible segunda fase temática.

**Revisión legal:** Registrar fuente exacta, licencia, descarga y versiones en el historial cuando se incorporen archivos. Las páginas itch.io de algunas colecciones muestran además restricciones a revender el paquete sin modificar: no redistribuir el paquete original como producto independiente. El código/compatibilidad no sustituyen la revisión de derechos.

### Normalización para el juego
- El motor mantiene las 64 casillas 1×1, mapeos blancos/negros y sus movimientos originales. La colección externa solo afecta las mallas visuales y sus materiales.
- El cargador centra horizontalmente cada figura y sitúa su base en el suelo del tablero; calcula su altura individual automáticamente, sin depender de su origen en Blender.
- Usa un modo **Staunton CC0 (opcional)** y conserva los cuatro estilos anteriores. No modifica la IA, reglas, AR ni PvP.
- Para móvil, idealmente ≤5.000 triángulos por pieza y materiales pequeños; evitar las versiones de ~55.000 triángulos.
