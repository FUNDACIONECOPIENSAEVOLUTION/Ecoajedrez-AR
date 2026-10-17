# ECOAJEDREZ 3D / AR
**Versión:** 0.3.0-beta.1 — 17/10/2026  
**Propietario:** Fundación Ecopiensa Evolution  
**Estado:** tablero 3D con modelos glTF, selector de colores y AR WebXR basado en 3 LINE-AR; validación física Android pendiente. No es APK ni PvP remoto.

## Prueba web
Repositorio: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR  
Dirección de GitHub Pages (acción de publicación completada; pendiente verificación visual del navegador): https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/

**Publicación:** comprobación sintáctica y despliegue Pages exitosos en GitHub Actions: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR/actions/runs/39040927867 . Si el enlace aún no abre, revisar Settings → Pages → Source: GitHub Actions y esperar propagación. No se ha comprobado la ejecución gráfica o cámara en móvil.

**Prueba local:** ejecutar `python -m http.server 8000` desde la raíz y visitar `http://localhost:8000`. Necesita conexión para las dependencias JS del CDN. La AR debe probarse por HTTPS en Android con navegador/WebXR compatibles.

## Incluye
- Tablero 3D con **6 modelos glTF originales** (<50 KB cada uno) y 32 instancias; selector Staunton/Fantasía/Clásico, colores por bando, animación de movimientos, biomas clásico y selva.
- Reglas legales (jaque, mate, tablas, enroque, promoción automática a dama) con `chess.js`.
- Contra computadora **demostrativa**: principiante aleatorio, intermedio heurístico y avanzado búsqueda básica de dos medias jugadas. **No** es Stockfish ni fuerza FIDE validada.
- Dos jugadores **en un mismo dispositivo**. Multijugador online **no implementado**.
- Controles 3D: toque o clic para seleccionar casilla, arrastrar para girar, teclado con formato `e2e4`.
- AR WebXR inspirado en 3 LINE-AR: botón ACTIVAR, detección opcional de superficies, FIJAR TABLERO, selección con dedo o apuntando a una casilla, ajuste de escala y SALIR. Sin hit-test ofrece un holograma no anclado. **La prueba física de cámara Android está pendiente**.
- Traducciones preliminares español, inglés y chino simplificado.

## Documentos para futuras sesiones o IAs
**Leer primero:** `AGENTS.md` → `docs/ESTADO_ACTUAL.md` → `docs/HOJA_DE_RUTA.md` → `docs/INVENTARIO_MODELOS.md`.  
El `CHANGELOG.md` y `version.json` guardan cambios y versión.
Toda implementación debe avanzar sobre este repositorio sin alterar la historia del proyecto 3 LINE-AR.

## Origen y advertencia comercial
Prototipo previo de usuario (referencia y modelos): https://github.com/instructorandradedcc/Ecoajedres-AR  
El código anterior presenta algunas ideas AR útiles pero también problemas de escala, precarga y carga de modelos; no se trasladó sin revisar. Los nombres de franquicia/personajes en esos GLB pueden plantear problemas de derechos de propiedad intelectual. **No redistribuir ni comercializar esos personajes/modelos hasta documentar licencia y titularidad**. Usar diseños originales de fantasía.

## Arquitectura de largo plazo
Web modular / PWA → WebXR → APK con Capacitor o solución nativa (sujeto a compatibilidad) → actualizaciones del contenido web vía servidor para capas permitidas por las reglas de las tiendas → PvP con backend y reglas verificadas → motor Stockfish bajo cumplimiento GPLv3 → escenarios originales y monetización responsable. El ejecutable nativo y plugins del APK pueden exigir reinstalación para actualizarse.

## Política de publicación
No afirmar "funciona en AR" hasta verificar dispositivo; distinguir código implementado de prueba completada. Documentar errores, límites de costos, licencias, pruebas y siguientes pasos en `docs/ESTADO_ACTUAL.md`.

## Entrega más reciente
Consultar [docs/ENTREGA_0.3.0.md](docs/ENTREGA_0.3.0.md) para modelos, enlaces CC0, diagnóstico AR y lista de pruebas que debe realizar una persona en un Android compatible.


## Versión 0.4.0-beta.1 — flujo gamer y multijugador experimental
Enlace: https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/

Bienvenida con Google (Firebase Auth existente del proyecto d-line-g) o invitado local. Menú principal con VS computadora, dos jugadores locales, crear sala online y unirse mediante código/URL/QR. El Google login necesita verificar dominio autorizado y proveedor activado; PvP por PeerJS es beta sin garantía de conexión en todas las redes.

La configuración del tablero ahora se realiza antes de jugar: siete variantes visuales (obsidiana, madera, mármol, neón, selva, volcán e hielo), estilos de piezas originales, colores, tamaño AR, idioma y dificultad. El tablero aparece a pantalla completa y se puede regresar al menú y continuar una partida.

Comandos: e2e4, e4, Nf3, Cf3, O-O, enroque corto, caballo de g1 a f3. Dictado opcional con Web Speech; las reglas se verifican con chess.js. Tocar o arrastrar piezas 3D y AR, con control de escala de mesa.

El usuario confirmó que la AR funcionaba en la versión previa. Esta actualización necesita prueba física regresiva en Android, más prueba de Google y PvP entre dos móviles.
Guía detallada: docs/ENTREGA_0.4.0.md


## Actualización 0.4.1-beta.1: recuperación y diagnóstico
- Historial íntegro de jugadas SAN con sincronización de FEN validada: el invitado online conserva anotaciones y se rechazan estados remotos inconsistentes.
- Partidas CPU/local guardadas **en el navegador** por cuenta o invitado; se restauran al volver a entrar (hasta 90 días, salvo eliminación de datos locales). Las partidas online NO se almacenan localmente como si fueran recuperables.
- Exportación de partida PGN desde el menú, con formato compatible con herramientas de ajedrez.
- Resaltado de la última jugada y la pieza seleccionada en tablero 3D y AR.
- DIAGNÓSTICO del dispositivo para verificar APIs WebXR/WebGL, disponibilidad de Firebase SDK, PeerJS, recursos 3D y copiar el informe voluntariamente.
- Popup Google se inicia directamente al tocar el botón, sin espera intermedia; queda pendiente comprobar autorización del dominio.
- Pruebas automatizadas ampliadas: `tests/match-persistence.test.mjs`.
**Estado:** versión desplegada automáticamente cuando GitHub Actions aprueba las pruebas; aún sin prueba del PvP entre dos celulares ni Google en el dominio. Leer `docs/ENTREGA_0.4.1.md`.
