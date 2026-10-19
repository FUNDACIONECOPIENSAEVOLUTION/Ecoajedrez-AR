# ECOAJEDREZ — Evaluación de piezas externas y primera APK
**19 de octubre de 2026 · Fase de preparación; no se ha generado una APK.**

## Conjuntos de ajedrez 3D encontrados (descargas y licencias)
| Fuente | Formatos | Descarga anunciada | Geometría / licencia | Evaluación |
| --- | --- | --- | --- | --- |
| [Polyy.AI — 3D Chess Pieces Pack](https://polyyai.itch.io/3d-chess-pieces-pack) | GLB | Pack low-poly 22 MB; 12 modelos blancos/negros | 3.600–4.600 triángulos por modelo; CC0 **declarada** | **Prioritario:** GLB directos, versiones ligeras. Antes de subir comprobar tamaño de cada GLB y condiciones vigentes. |
| [Omie's Assets — Low Poly Chess/Checkers](https://omies-assets.itch.io/3d-chesscheckers-set) | FBX, BLEND, texturas | ZIP 15 MB | 1.000–2.000 triángulos por modelo; CC0 | Buen rendimiento móvil, necesita exportar 12 GLB Blender. Sin IA generativa según autor. |
| [Polyy.AI — 3D Chess Sets Pack 1](https://polyyai.itch.io/3d-chess-sets-pack-1) | GLB | 48 low-poly en ZIP 87 MB | CC0 declarada; algunos 1.300–6.700 triángulos | Para ejércitos temáticos Egipto, Sci-fi, Art Déco y Bauhaus tras optimización y revisión. |
| [KayKit — Board Game Bits](https://kaylousberg.itch.io/board-game-bits) | glTF/OBJ/FBX | Versión básica gratuita; EXTRA de pago | CC0 | **NO** tomar piezas de ajedrez de la versión básica: la web indica que chess/checkers están en EXTRA de pago. |

**Nota jurídica:** CC0 indicada por el autor habilita en principio uso comercial y modificaciones. Algunas páginas también indican que no revendas el pack bruto sin modificar; revisar la licencia exacta y guardar evidencia de fuente/fecha. No se ha descargado ningún GLB externo aún; los links de itch.io requieren completar el flujo de descarga en el sitio. Nunca importar recursos sin licencia verificable ni reclamar autoría de la obra ajena.

## Importación segura y reversible
- Carpeta lista: `assets/models/community/`, con 12 nombres exactos y README.
- Juego: opción **Staunton CC0** deshabilitada hasta que los 12 archivos `w-*.glb` y `b-*.glb` existan, sean GLB 2.0 válidos y el build publique su `manifest.json`.
- El motor del juego sigue usando chess.js, las casillas y los movimientos existentes. El cargador opcional centra cada malla y corrige la altura por figura. Si un modelo falla, muestra la figura geométrica original. Es preferible comenzar con los archivos de baja complejidad, no los de ~55.000 triángulos.
- Pruebas de aceptación: una partida completa sobre 3D normal, Skybox, AR (hardware), colores correctos, proporciones, 30+ FPS objetivo, tap y drag piezas, giro caballo negro, memoria y tiempos de carga.
- No actualizar los seis modelos base de `assets/models/staunton/` ni reemplazarlos para no perder el respaldo; archivos de terceros solo en la nueva carpeta.

## APK Android: hallazgo importante
1. El portal `https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/` se aloja bajo un **subdirectorio**, no bajo el origen raíz. Para una Trusted Web Activity validada, la asociación de Android/Chrome necesita un `assetlinks.json` en **`https://fundacionecopiensaevolution.github.io/.well-known/assetlinks.json`**, no dentro de `/Ecoajedrez-AR/.well-known/`. Esto implica controlar la raíz del hosting de la organización, o usar un dominio propio verificado. Aún no existe constancia de esta configuración.
2. Crear manifest.webmanifest con inicio y alcance de la app, iconos válidos 192×192/512×512 y nombre oficial; probar PWA instalable y offline limitado antes de construir la APK.
3. Probar TWA/Chrome Android en el mismo celular donde WebXR ya haya funcionado; el contenido se renderiza por el navegador compatible. Capacitor/WebView puede no soportar `immersive-ar`, por lo que NO elegirlo para empaquetar sin validación específica.
4. Para tienda: APK de pruebas firmado y AAB publicado, `versionCode` incremental, certificado de firma y canal de actualizaciones Google Play. Actualizaciones de contenidos web no sustituyen actualizaciones nativas.
5. Sin claves privadas/certificados en GitHub y sin requerir GPS para partidas tradicionales. Una vez que el usuario confirme teléfono/dispositivo y requisitos de publicación, crear paquete Android técnico y pruebas de actualización.

## Fuentes técnicas de Android
- TWA Chrome: https://developer.chrome.com/docs/android/trusted-web-activity
- Ubicación obligatoria de Digital Asset Links en raíz del dominio: https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide
- Bubblewrap oficial: https://github.com/GoogleChromeLabs/bubblewrap
- Formato Android App Links assetlinks.json: https://developer.android.com/training/app-links/configure-assetlinks
- Paquetes Android AAB: https://developer.android.com/guide/app-bundle

## Secuencia en los siguientes turnos
1. Usuario prueba cámara ↑/↓ y 8 misiones Galácticas; ajustes tras capturas.
2. Usuario descarga versión low-poly CC0 del autor y carga los doce GLB, o se acuerda conversión en Blender de FBX/BLEND; validar materiales de ambos bandos.
3. Se habilita la opción Staunton CC0 y se prueba rendimiento en los tres modos.
4. Preparar iconos y manifest PWA, después evaluar TWA/Capacitor en dispositivo WebXR concreto y resolver origen raíz Digital Asset Links.
5. Ampliar camino del primer reino a los 13 reinos, progresión cuenta sincronizada cuando haya servicio conectado.
