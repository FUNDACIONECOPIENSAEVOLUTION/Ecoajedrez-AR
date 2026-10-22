# Guardianes Robóticos — paquete en preparación

Colección opcional de piezas para ECOAJEDREZ. **Esta rama no modifica el juego público**.

## Cargar recursos binarios
Extraer el ZIP local `ecoajedrez_roboticos_paquete.zip` y copiar sus directorios `modelos/`, `imagenes/` y `videos/` dentro de esta carpeta. Deben existir seis archivos GLB: `peon.glb`, `alfil.glb`, `caballo.glb`, `torre.glb`, `reina.glb`, `rey.glb`. Hay cinco JPG, porque no se recibió imagen estática del caballo. Los MP4 son referencias y no contienen clips integrados al GLB.

## Animaciones
`animaciones.js` implementa movimiento provisional de la pieza completa, ataque y desaparición. No hay esqueletos ni clips internos de caminata. Para un movimiento articulado se necesita rigging y clips GLB (Idle/Walk/Attack/Hit/Defeat) exportados desde Blender. Para el caballo conservar el salto.

## Integración pendiente
El juego actualmente usa modelos Staunton ubicados en `assets/models/staunton/`. Aún se requiere incorporar un nuevo estilo al selector, ajustar escala y orientación de cada GLB, previsualizar imágenes en el catálogo, manejar instancias y revisar rendimiento/AR. No sustituir los modelos originales por ahora.
