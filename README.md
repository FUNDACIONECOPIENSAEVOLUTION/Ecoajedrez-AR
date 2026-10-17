# ECOAJEDREZ 3D / AR
**Versión:** 0.2.0-alpha — 17/10/2026  
**Propietario:** Fundación Ecopiensa Evolution  
**Estado:** Código 3D + intento experimental WebXR publicados en repositorio; validación de navegador real y cámara pendiente. No es un juego final ni un APK.

## Prueba web
Repositorio: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR  
Dirección prevista de Pages (solo después de activar GitHub Pages y verificar el despliegue): https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/

**Activar Pages:** Settings → Pages → Build and deployment → **Source: GitHub Actions** → Save. Hay un workflow en \`.github/workflows/pages.yml\` para comprobar la sintaxis y publicar los archivos. Si no existe Pages, la URL anterior no funciona todavía.

**Prueba local:** ejecutar \`python -m http.server 8000\` desde la raíz y visitar \`http://localhost:8000\`. Necesita conexión para las dependencias JS del CDN. La AR debe probarse por HTTPS en Android con navegador/WebXR compatibles.

## Incluye
- Tablero y 32 piezas clásicos **generados mediante geometría Three.js** (sin copiar material protegido); selector de tema clásico y selva con plantas animadas.
- Reglas legales (jaque, mate, tablas, enroque, promoción automática a dama) con \`chess.js\`.
- Contra computadora **demostrativa**: principiante aleatorio, intermedio heurístico y avanzado búsqueda básica de dos medias jugadas. **No** es Stockfish ni fuerza FIDE validada.
- Dos jugadores **en un mismo dispositivo**. Multijugador online **no implementado**.
- Controles 3D: toque o clic para seleccionar casilla, arrastrar para girar, teclado con formato \`e2e4\`.
- AR experimental: botón inmersivo con WebXR hit-test; tocar la superficie detectada para colocar tablero y luego tocar piezas/casillas. No implementa anclaje compartido, gestos avanzados ni soporte universal iOS.
- Traducciones preliminares español, inglés y chino simplificado.

## Documentos para futuras sesiones o IAs
**Leer primero:** \`AGENTS.md\` → \`docs/ESTADO_ACTUAL.md\` → \`docs/HOJA_DE_RUTA.md\` → \`docs/INVENTARIO_MODELOS.md\`.  
El \`CHANGELOG.md\` y \`version.json\` guardan cambios y versión.
Toda implementación debe avanzar sobre este repositorio sin alterar la historia del proyecto 3 LINE-AR.

## Origen y advertencia comercial
Prototipo previo de usuario (referencia y modelos): https://github.com/instructorandradedcc/Ecoajedres-AR  
El código anterior presenta algunas ideas AR útiles pero también problemas de escala, precarga y carga de modelos; no se trasladó sin revisar. Los nombres de franquicia/personajes en esos GLB pueden plantear problemas de derechos de propiedad intelectual. **No redistribuir ni comercializar esos personajes/modelos hasta documentar licencia y titularidad**. Usar diseños originales de fantasía.

## Arquitectura de largo plazo
Web modular / PWA → WebXR → APK con Capacitor o solución nativa (sujeto a compatibilidad) → actualizaciones del contenido web vía servidor para capas permitidas por las reglas de las tiendas → PvP con backend y reglas verificadas → motor Stockfish bajo cumplimiento GPLv3 → escenarios originales y monetización responsable. El ejecutable nativo y plugins del APK pueden exigir reinstalación para actualizarse.

## Política de publicación
No afirmar "funciona en AR" hasta verificar dispositivo; distinguir código implementado de prueba completada. Documentar errores, límites de costos, licencias, pruebas y siguientes pasos en \`docs/ESTADO_ACTUAL.md\`.
