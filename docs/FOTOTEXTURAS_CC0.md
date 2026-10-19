# ECOAJEDREZ · Nueve fototexturas PBR CC0 y relieve visual
**Versión de código:** 0.15.6-beta.1 · 19/10/2026

## Descarga gratuita (sin crear cuentas ni contratar servicios)
Los 9 materiales proceden de fotografías y escaneos publicados por [Poly Haven](https://polyhaven.com/), bajo licencia **Creative Commons CC0 1.0** (uso comercial permitido). La integración usa **la API pública solo en Python/GitHub Actions durante la compilación**; el navegador del jugador lee JPG locales publicados en GitHub Pages, sin enlaces externos al seleccionar piezas.

Ejecutar desde la raíz del repositorio:

```powershell
py scripts/descargar-relieves-pbr.py --strict
npm run build
```

Se descargan en `assets/texturas-pbr/<acabado>/` (sin paquetes ZIP pesados) el **color, normal OpenGL, rugosidad, altura y metalicidad** que efectivamente existan a 1K. `color`, `normal` y `roughness` son obligatorios en la instalación; altura y metal son opcionales. `scripts/build-pages.mjs` valida firma, extensión, tamaño máximo 2 MB por archivo y suma máxima de 30 MB; genera `dist/assets/texturas-pbr/manifest.json`. No cambia las 64 casillas ni las reglas de ajedrez.

| Acabado ECOAJEDREZ | Activo fotográfico gratuito | Qué representa |
|---|---|---|
| Nogal | [Walnut Veneer](https://polyhaven.com/a/walnut_veneer) | Veta de nogal real |
| Roble | [Oak Wood Planks](https://polyhaven.com/a/oak_wood_planks) | Madera de roble barnizada |
| Piedra | [Rock 01](https://polyhaven.com/a/rock_01) | Piedra gris erosionada |
| Mármol | [Marble 01](https://polyhaven.com/a/marble_01) | Mármol con juntas; se puede sustituir luego por una losa más fina |
| Obsidiana | [Dark Rock](https://polyhaven.com/a/dark_rock) | Piedra oscura **inspirada** en obsidiana (no vidrio volcánico exacto) |
| Bronce | [Rusty Metal 02](https://polyhaven.com/a/rusty_metal_02) | Metal oxidado, coloreado como bronce de fantasía |
| Oro arcano | [Metal Plate 02](https://polyhaven.com/a/metal_plate_02) | Base metálica irregular tintada de oro; no fotografía de oro macizo |
| Hielo rúnico | [Snow 02](https://polyhaven.com/a/snow_02) | Relieve de nieve fina tintada; no hielo físicamente transparente |
| Basalto | [Volcanic Rock Tiles](https://polyhaven.com/a/volcanic_rock_tiles) | Roca volcánica texturizada |

**Atribución:** activos bajo CC0; incluir «Mapas PBR: Poly Haven» al utilizar su API pública. Este documento conserva la procedencia para cualquier uso comercial posterior.

## Qué es y qué no es relieve
El mapa `normal.jpg` modifica la respuesta de luz para dar apariencia tridimensional a vetas, grietas y surcos sobre el modelo. `roughness.jpg` decide en qué áreas brillan los reflejos. `height.jpg` se conserva como recurso para Blender/futuros modelos subdivididos: **no** es desplazamiento geométrico auténtico en la malla del juego (y no debe inventarse profundidad que no existe). En hardware sin mapas disponibles sigue activo el material procedimental simple; esto no daña AR ni el ajedrez.

## Verificar antes de llamar estable a la versión
1. En GitHub → Actions comprobar que el flujo «Ecoajedrez - check and deploy Pages» descargó **9/9** mapas y publicó `dist`. Si falla la red del proveedor, el flujo fracasa sin reemplazar la versión pública anterior.
2. Abrir la [página del juego](https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/) en ventana privada; Configuración → VISTA PREVIA 3D → seleccionar cualquier acabado y comprobar que el estado diga «9 acabados fotográficos PBR CC0 listos».
3. Comprobar en DevTools que `assets/texturas-pbr/walnut/color.jpg`, `normal.jpg` y `roughness.jpg` responden 200, y también el manifest.
4. Jugar una partida con piezas Staunton y antropomórficas en escritorio y probar AR en un Android compatible. Las pruebas estáticas NO garantizan realismo percibido, FPS ni compatibilidad WebXR.

**Compromiso de rendimiento:** descargamos imágenes 1K para móvil y solo el juego/visor descarga normales y rugosidad del acabado elegido. Las nueve miniaturas color se cargan cuando se presenta la configuración; no se guardan cookies ni credenciales de Poly Haven.
