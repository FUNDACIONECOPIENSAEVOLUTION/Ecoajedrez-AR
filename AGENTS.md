# Instrucciones permanentes para ChatGPT, Codex y otras IAs — ECOAJEDREZ AR
Fecha: 2026-10-17. Repo canónico: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR

1. **Primero leer:** este archivo, \`docs/ESTADO_ACTUAL.md\`, \`docs/HOJA_DE_RUTA.md\`, \`docs/INVENTARIO_MODELOS.md\`, \`CHANGELOG.md\`. No comenzar releyendo conversaciones extensas.
2. Alcance: ajedrez 3D en navegador y AR con evolución a Android, escenarios fantasía originales, modos vs computadora/local/online y traducciones internacionales.
3. **Presupuesto cero:** evitar dependencias de pago, dominios de pago, backend con cargos o suscripciones. No configurar servicios con facturación sin aprobación.
4. **Repo:** este es el principal; el anterior \`instructorandradedcc/Ecoajedres-AR\` es referencia de modelos y diseño; no sobrescribirlo. No tocar el juego distinto \`FUNDACIONECOPIENSAEVOLUTION/3d-line\`.
5. Mantener la **misma lógica reglamentaria** entre 3D y AR: solo cambia presentación y entrada. Partidas remotas necesitarán autenticación, reglas de seguridad, sincronización y recuperación de desconexiones.
6. **AR:** verificar HTTPS/WebXR y hardware real. No confundir tablero local con anclaje espacial entre dos equipos; tampoco prometer soporte iOS no comprobado.
7. **Licencias:** no copiar personajes famosos ni modelos de derechos desconocidos para comercializar. Preferir CC0 con URL, autor, versión, evidencia y licencia archivadas. Comprimir y medir GLB con objetivo menor de 15 MB **por archivo**; además vigilar el peso total para móviles.
8. **Control de cambios:** incrementar \`version.json\`, versión visible en \`index.html\` y \`CHANGELOG.md\`. Escribir resumen de alcance, pruebas, defectos y pendiente en \`docs/ESTADO_ACTUAL.md\`. Cambios reversibles y commits pequeños.
9. **QA:** ejecutar \`node --check main.js\`, comprobar que se resuelven recursos externos y probar en ordenador y Android antes de declarar versión estable. GitHub Actions solo hace comprobaciones estáticas; no certifica navegador ni AR.
10. **Desarrollo:** primero estabilizar tablero 3D, WebXR y modelo/rig originales; después animaciones, Stockfish, PvP Firebase, i18n completo, OTA con políticas de Play, PWA y APK.
11. **Terminología FIDE:** ELO/rangos de práctica no equivalen a títulos oficiales otorgados por la FIDE.
12. Al terminar **actualiza este traspaso**, la fecha, el commit, los bloqueos y tareas prioritarias. Prioriza demostraciones reales, no promesas.
