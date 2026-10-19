# Biblioteca de texturas PBR reales para fichas de ECOAJEDREZ

En lugar de colorear primitivas (versión v0.15.4), esta carpeta recibe mapas PBR **auténticos**, preferiblemente de bibliotecas CC0. **No subas ZIP originales ni archivos de 4K/8K directamente al juego.**

## Fuentes verificadas de texturas gratuitas CC0
- **[ambientCG](https://ambientcg.com/)** — biblioteca de superficies PBR CC0 gratuitas incluso para aplicaciones comerciales, con texturas de madera, roca, hielo, mármol y metales.
- **[Poly Haven](https://polyhaven.com/textures)** — CC0 comercial, descargas de cada material en 1K/2K/4K, mapas difusos, normales OpenGL y rugosidad.
- **[3DTextures.me](https://3dtextures.me/about/)** — materiales gratuitos CC0; las colecciones pagas se venden por separado.

**Ejemplos verificados:** [nogal](https://polyhaven.com/a/walnut_veneer_02) · [nogal oscuro](https://polyhaven.com/a/black_walnut_veneer_02) · [mármol](https://polyhaven.com/a/marble_01).

## Cómo subir una textura real (una carpeta por acabado)

Dentro de `walnut/`, `oak/`, `stone/`, `marble/`, `obsidian/`, `bronze/`, `gold/`, `ice/` o `basalt/`, sube:

```text
color.jpg         OBLIGATORIO (diffuse/albedo/base color)
normal.jpg        opcional (Normal OpenGL, NO DirectX)
roughness.jpg     opcional (roughness)
metalness.jpg     opcional (metallic)
```

También admitimos las variantes `.webp` o `.png` (con los mismos nombres). Un archivo por rol; prioridad automática: WebP, JPG, PNG. **Convierte/renombra antes de subir:** si el paquete descarga nombres como `walnut_veneer_02_diff_1k.jpg`, en esta carpeta el archivo se debe llamar exactamente `color.jpg`.

**1K (1024 × 1024) JPEG** es un tamaño inicial adecuado; para 3D/AR móvil no es necesario 4K. Cada archivo debe pesar **hasta 2 MB**, de origen y licencia CC0. Para el juego es mejor incluir **color + normal + roughness**. Si solo está el color, el sistema sigue usando los valores físicos predefinidos.

### Enlaces para subir directamente
| Material | Carpeta | Fuente sugerida |
|---|---|---|
| Nogal | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/walnut) | [Walnut Veneer 02](https://polyhaven.com/a/walnut_veneer_02) |
| Roble | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/oak) | [Maderas de Poly Haven](https://polyhaven.com/textures/wood) |
| Piedra | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/stone) | [Piedras de Poly Haven](https://polyhaven.com/textures/stone) |
| Mármol | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/marble) | [Marble 01](https://polyhaven.com/a/marble_01) |
| Obsidiana | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/obsidian) | [Rocas oscuras](https://polyhaven.com/textures/stone) |
| Bronce | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/bronze) | [Metales](https://polyhaven.com/textures/metal) |
| Oro | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/gold) | [Metales](https://polyhaven.com/textures/metal) |
| Hielo | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/ice) | [Hielo y nieve de ambientCG](https://ambientcg.com/) |
| Basalto | [Subir](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/texturas-pbr/basalt) | [Piedras volcánicas](https://polyhaven.com/textures/stone) |

Los colores emisivos de gemas/manos quedan aparte y no se sobrescriben. Al subir estos mapas GitHub Pages valida formato y tamaño y **solo publica los materiales aprobados**, generando un manifiesto sin incluir todo el repositorio. El navegador carga las texturas solo al seleccionar el material, con caché durante la sesión. **Si aún no existe un material real, se conserva la textura provisional anterior.**

**Licencias:** conserve enlace, autor y fecha del activo. Las texturas CC0 no necesitan atribución obligatoria; la carpeta contiene instrucciones, pero no incluye activos ajenos sin revisión.
**Precisión visual:** las fotografías PBR necesitan UVs adecuados en la geometría de cada pieza. Las piezas procedurales del juego tienen UV básicas; un GLB de terceros sin UV precisará tratamiento en Blender. El hielo translúcido además requiere propiedades de refracción/material físico; el PBR base mejorará el aspecto, pero no producirá por sí solo hielo perfecto.

## Importación automatizada de relieve fotográfico PBR CC0 (v0.15.6)
La biblioteca del juego admite **color.webp, normal.webp y roughness.webp** (mapas OpenGL). Para descargar texturas reales de Poly Haven / ambientCG y generar un ZIP 768px apto para móviles, el repositorio ejecuta [ECOAJEDREZ - Descargar relieves CC0 PBR](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/actions/workflows/import-pbr.yml).

Este flujo descarga material real CC0 **en GitHub Actions**, no en el móvil. Comprueba la licencia de origen, realiza la conversión, registra los enlaces y SHA-256 de mapas originales en \`FUENTES_CC0_IMPORTADAS.json\` y genera \`ECOAJEDREZ_RELIEVES_PBR_CC0.zip\`. Después publica al repositorio solo los formatos autorizados. La ausencia de un material real conserva el fallback anterior; no inventa archivos ni atribuciones.

- [Carpeta de texturas y relieves](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/tree/main/assets/texturas-pbr)
- [Descarga del paquete ZIP una vez generado](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/raw/refs/heads/main/assets/texturas-pbr/ECOAJEDREZ_RELIEVES_PBR_CC0.zip)
- [Historial de importación y artefactos](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/actions/workflows/import-pbr.yml)

El paquete es una recopilación de terceros **CC0**, no texturas inventadas por la fundación. Por rendimiento se limitan a 768px y WebP. Los normales aportan relieve visual mediante iluminación PBR; no cambian físicamente los vértices de las figuras.
