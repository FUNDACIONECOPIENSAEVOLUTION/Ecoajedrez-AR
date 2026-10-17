# Hoja de ruta Ecoajedrez AR

| Etapa | Meta | Criterio de salida |
|---|---|---|
| 0. Base web | Repositorio, logo, tablero completo, controles, reglas | Página abre sin errores de JS; jugadas legales y cámara funcional |
| 1. AR real | Hit-test, fijación de tablero, toques precisos en Android | Video y pruebas en 2 teléfonos Android compatibles; fallos documentados |
| 2. Arte 3D original | Figuras estándar personalizables + mundo mágico original | GLB por fichero <15 MB; presupuesto total por escena; licencias comerciales verificadas |
| 3. Niveles reales | Stockfish WASM, límites ELO orientativos y enseñanza | 5 niveles calibrados, pruebas de legalidad y rendimiento |
| 4. PvP mundial | Salas, códigos/QR, reconexión, turnos, reloj, guardado | Dos móviles sincronizan partidas con validación backend |
| 5. Multijugador AR | Tablero local sincronizado; anclaje físico compartido como fase separada | Diferenciar claramente sincronía lógica vs alineación espacial |
| 6. Personalización | Temas de selva, montaña, ruinas, efectos gamer y animación | 60 FPS objetivo en móviles medianos, modo bajo consumo |
| 7. APK y actualizaciones | Android con envoltura WebView/Capacitor o integración nativa, PWA | Cumplir políticas de Google Play, revisión OTA, pruebas reales |
| 8. Monetización | Skins originales opcionales, publicidad de prueba y analítica respetuosa | IDs reales autorizados, privacidad, consentimiento y métricas verificadas |

## Arquitectura
- **Reglas:** única instancia de `chess.js` para tablero 3D y AR; FEN/PGN en partidas.
- **Render:** Three.js y WebXR hit-test; materiales/biomas intercambiables.
- **IA:** motor local Stockfish (GPLv3; revisión de licenciamiento y distribución).
- **Backend futuro:** Firebase Authentication + Firestore/Realtime Database con cuota gratuita; reglas de seguridad contra jugadas ilegales. Ninguno configurado todavía en Ecoajedrez.
- **Persistencia:** localStorage o IndexedDB offline en prototipo; remoto al activar backend.
- **OTA:** actualizaciones web hospedadas en servidor para componentes permitidos, cache/version.json; binarios/plugin nativos se actualizan por tienda; plan conforme a seguridad/políticas.

## Prioridad estricta
No empezar por monstruos animados, facturación o rankings antes de tener ajedrez correcto, AR verificable y base multijugador segura.
