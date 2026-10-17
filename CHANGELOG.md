# Historial de ECOAJEDREZ AR

## 0.3.0-beta.1 — 2026-10-17
- Creación de seis modelos originales de ajedrez glTF 2.0 (rey, dama, alfil, caballo, torre, peón), que el juego utiliza en 32 instancias.
- Selector Staunton/Fantasía geométrica/Clásico geométrico; materiales blancos y negros personalizables; movimiento animado.
- AR explícita adaptada de 3 LINE-AR: sesión WebXR con DOM overlay, detección de superficie, FIJAR TABLERO, TOCAR/APUNTAR, escala, SALIR y fallback holograma.
- `tests/models-ar.test.mjs` verifica integridad de glTF y controles; workflow ejecuta todas las pruebas antes del despliegue.
- Prueba física AR y navegador móvil pendiente; PvP online, Stockfish, animación de combate y APK siguen sin implementar.

# Cambios — Ecoajedrez AR

## 0.2.0-alpha — 2026-10-17
- Repositorio canónico propio de la Fundación.
- UI gamer responsive, logo suministrado, tablero de 64 casillas y 32 piezas generadas con geometría Three.js.
- Partida local y vs computadora experimental; reglas chess.js.
- Controles táctiles/clic y entrada por teclado, temas clásico/selva, i18n preliminar ES/EN/ZH.
- Acceso AR experimental WebXR hit-test; por verificar en Android real.
- Inicio de documentación para IA: AGENTS, estado, modelos, decisiones y ruta.
- Workflow GitHub Actions con `node --check`, pruebas de consistencia y despliegue Pages ejecutados con éxito (run `39040927867`). Sin prueba de navegador/WebXR física.

### Límites
Sin partidas online, títulos/rating FIDE calibrados, APK, anuncios, personajes GLB fantásticos ni garantía de soporte iOS.

- Se eliminó el borrador temporal de `3d-line/ecoajedrez-ar/`, conservando `3d-line` principal intacto.
