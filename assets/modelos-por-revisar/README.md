# ECOAJEDREZ — Buzón de modelos 3D por revisar

Esta carpeta es para **RECIBIR** modelos: puedes subir **muchos GLB, glTF, FBX, BLEND, OBJ o ZIP**, tanto piezas individuales como juegos completos. **No modifica el ajedrez ni los modelos activos.**

## SUBIR ARCHIVOS (GitHub)
Abre [SUBIR AQUÍ](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/modelos-por-revisar), inicia sesión con tu cuenta y arrastra varios archivos desde Windows; pulsa **Commit changes** para confirmar.

Para mantener varias colecciones separadas, también están disponibles:
- [Colección 01](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/modelos-por-revisar/coleccion-01)
- [Colección 02](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/modelos-por-revisar/coleccion-02)
- [Colección 03](https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/upload/main/assets/modelos-por-revisar/coleccion-03)

Puedes utilizar cada carpeta para una temática: por ejemplo, `coleccion-01` = mágicas, `coleccion-02` = clásicas y `coleccion-03` = reinos especiales. Para otras colecciones, crea nuevas subcarpetas debajo de este buzón.

## FORMATOS
| Formato | Qué haremos |
| --- | --- |
| **GLB** | El preferido. Si es GLB 2.0 válido, normalmente sirve para jugar tras normalizar escala y optimizar geometría. |
| **GLTF** | También sirve, pero debe acompañarse de sus archivos .bin y sus texturas vinculadas. |
| **FBX** | Lo revisaremos y convertiremos a GLB con Blender. |
| **BLEND** | Se exporta desde Blender a GLB. |
| **OBJ + MTL** | Puede convertirse, conservar .mtl y texturas. |
| **ZIP** | Archivo contenedor para varias piezas. No se abre ni se publica automáticamente. Podremos revisar su contenido después. |

Para carga desde el **navegador de GitHub**, procura que cada archivo pese **menos de 25 MB**. Si tus FBX/ZIP superan ese límite, usa GitHub Desktop / Git LFS según corresponda o comparte desde una plataforma de archivos (no fuerces GitHub con archivos enormes). GitHub bloquea archivos individuales de 100 MB en Git normal. Prioriza versiones ligeras para celulares.

## IDENTIFICACIÓN
- Ideal: `rey_blanco.glb`, `rey_negro.glb`, `reina_blanca.glb`, `caballo_negro.glb`, etc.
- Si el archivo trae el tablero y las 32 figuras en un único GLB, **súbelo igualmente** y podremos separarlo.
- No es obligatorio renombrar archivos originales de terceros, pero evita nombres duplicados dentro de la misma carpeta.
- Anota **de dónde descargaste** cada colección y su licencia; usa [FICHA_COLECCION.md](./FICHA_COLECCION.md) como referencia, y escríbeme el enlace de origen si lo prefieres. Sin licencia verificable, no incorporaremos activos de terceros a la versión pública.

## CONTROL AUTOMÁTICO
Al subir los archivos, GitHub Actions ejecuta `node scripts/revisar-modelos-3d.mjs` y muestra un **inventario de nombres, tamaños y formatos** en su resumen. Para GLB comprueba al menos cabecera, versión 2 y longitud. FBX/BLEND/ZIP se reconocen superficialmente; aún requerirán conversión o revisión. El informe es informativo y no bloquea otras publicaciones por un archivo que aún está pendiente.

**Importante sobre privacidad y derechos:** este repositorio GitHub es público: todo lo que subas al buzón será público en el **repositorio**, aunque no aparezca en la página del juego. No subas materiales privados ni protegidos si no tienes permiso para compartirlos.

## DESPUÉS DE LA REVISIÓN
Los modelos aprobados se optimizan y convierten a 12 piezas reutilizables de los seis tipos por color; solo entonces pasarán a `assets/models/community/` o a una colección versionada que autorices. Los seis modelos originales siguen en `assets/models/staunton/`. Ningún archivo del buzón se copia al sitio web.
