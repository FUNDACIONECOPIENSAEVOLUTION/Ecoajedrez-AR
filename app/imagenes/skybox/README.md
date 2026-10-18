# SKYBOX 360° · ECOAJEDREZ / Reinos de batalla final

**13 reinos / 6 caras cuadradas por reino / 78 imágenes cuando esté completo.**
Estas son carpetas preparatorias. El juego 3D normal y la realidad aumentada NO se cambian: los skyboxes se prueban en un visor 360° separado antes de usarlos en futuras batallas finales.

## Subir las 6 caras
Cada reino tiene su propia carpeta con README y botón **Add file → Upload files** de GitHub. Pon las seis imágenes **exactamente** con los nombres:
`px.webp`, `nx.webp`, `py.webp`, `ny.webp`, `pz.webp`, `nz.webp`.

**Orientación de Three.js CubeTextureLoader** (+X, −X, +Y, −Y, +Z, −Z):
- `px.webp`: derecha, +X
- `nx.webp`: izquierda, −X
- `py.webp`: techo/cielo, +Y
- `ny.webp`: suelo, −Y
- `pz.webp`: frente, +Z
- `nz.webp`: atrás, −Z

**CRÍTICO:** son seis caras de *una misma proyección cúbica desde un único punto*, con FOV 90° cada una; las costuras deben coincidir. No son seis ilustraciones independientes. Los seis archivos deben ser **cuadrados**, tener **idéntica resolución** (recomendado 1024×1024 móvil / 2048×2048 escritorio), formato WebP real, cada uno ≤ 3 MB. Nunca estires panoramas 16:9 para hacer caras cuadradas. El visor no los deforma: proyecta las caras en una cámara virtual centrada. Una mayor resolución mejora nitidez, no ofrece profundidad o desplazamiento 6DoF.

GitHub Pages publica únicamente los **conjuntos completos, válidos y congruentes**. Un reino incompleto aparece como pendiente en el probador, sin seis solicitudes 404 y sin modificar el ajedrez principal.

## Reinos / carpeta para subir
1. **Galáctico / Cósmico** → `galactico_cosmico/` → tablero `cosmos`
2. **Mágico / Fantasía ancestral** → `magico_ancestral/` → tablero `cristales`
3. **Medieval / Leyenda** → `medieval_leyenda/` → tablero `dorado`
4. **Celta / Bosque encantado** → `celta_bosque/` → tablero `celta`
5. **Volcánico / Inframundo** → `volcanico_inframundo/` → tablero `lava`
6. **Glacial / Reino de hielo** → `glacial_hielo/` → tablero `hielo`
7. **Steampunk / Mecánico** → `steampunk_mecanico/` → tablero `steampunk`
8. **Atlante / Submarino** → `atlante_submarino/` → tablero `atlantis`
9. **Egipcio / Alquimia mística** → `egipcio_alquimia/` → tablero `egipto`
10. **Cyberpunk / Sintético** → `cyberpunk_sintetico/` → tablero `cyber`
11. **Espejo / Vacío** → `espejo_vacio/` → tablero `amatista`
12. **Nigromante / Gótico** → `nigromante_gotico/` → tablero `gotico`
13. **Alquimista / Éter** → `alquimista_eter/` → tablero `alquimia`

## Plan de futuras fases
1. Subir y comprobar cada skybox por giro de ratón, dedo o sensor de orientación del teléfono (requiere permiso en navegadores compatibles).
2. Afinar costuras, FOV y orientación antes de integrar la escena al tablero 3D.
3. Implementar sistema de batallas para avanzar por un reino; solo después enlazar el skybox 360° al nivel de batalla final correspondiente.
4. **AR**: sin skybox superpuesto al passtrough de la cámara; si se quiere VR 6DoF es una fase y tecnología distinta.
