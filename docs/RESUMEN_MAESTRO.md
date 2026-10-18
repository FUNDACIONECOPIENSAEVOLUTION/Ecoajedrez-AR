# ECOAJEDREZ 3D/AR · RESUMEN MAESTRO PARA LA PRÓXIMA IA
**Revisión vigente:** 0.11.0-beta.1 · 2026-10-18. Leer **este archivo primero**; consultar AGENTS.md y código solo si la tarea lo requiere. Evitar reanalizar conversaciones largas.

## Identidad y fuentes de verdad
- Repositorio canónico con permisos de escritura: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR (rama main).
- Web gratuita: https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/
- Otro juego **DISTINTO**: 3 LINE-AR y su Firebase `d-line-g`; no modificar ni mezclar.
- Firebase institucional `ecoajedrez-3d` existe en Spark, pero Google OAuth/BFF aún **NO está desplegado**. Acceso invitado siempre debe funcionar. No publicar secretos, tokens ni cuentas.
- Presupuesto obligatorio $0 COP (solo infraestructura oficial gratuita). Monetización posterior al producto estable, nunca prometer ingresos.

## Jugabilidad e infraestructura actual
- Motor: Three.js 0.180 + chess.js 1.4, piezas originales Staunton de seis tipos `assets/models/staunton/*.gltf`, temas procedural 3D y WebXR AR hit-test; el usuario informó AR operativa en versiones previas. No seguimiento real de dedos en el aire ni oclusión de mano.
- Modos: versus IA heurística básica, dos jugadores locales y duelo online **beta casual** por PeerJS (código de seis caracteres + QR). No Stockfish ni ranking FIDE oficial. PvP no tiene backend autoritativo ni antitrampas.
- Persistencia de partidas local existente en `match-state.js`; videos usuario en `videos/` y una intro MP4 de ~13.6MB.
- Producción: GitHub Actions `.github/workflows/pages.yml` ejecuta `node --test tests/*.test.mjs`, `node scripts/security-check.mjs`, y paquete **permitido** `scripts/build-pages.mjs` antes de publicar `dist/`.

## Interfaz gamer y recursos
- Las ocho imágenes **ya están subidas** a `app/imagenes/tarjetas/`:
  01_vs_computadora.webp, 02_dos_jugadores.webp, 03_duelo_online.webp, 04_unirme_partida.webp,
  05_bosque_encantado.webp, 06_templo_arcano.webp, 07_ciudad_flotante.webp, 08_volcan_celestial.webp.
- `index.html`: botones jugables reales y pantalla nueva `arenaScreen` con cuatro portales; `adventure.css`: fondos, tarjetas y adaptación móvil; `adventure-ui.js`: selecciona temas EXISTENTES, envía `change` al selector `#theme` y abre configuración. Mapeo visual: bosque→jungle, templo→neon, ciudad→marble, volcán→volcano. Las imágenes son arte 2D, no escenas 3D descargables.
- Módulos previos: `opening.js`, `opening.css`, `celestial.css`, `cinematic-fix.css`, `celestial-ui.js` siguen presentes. `adventure.css` se importa el último para resolver conflictos de estilo.
- La intro MP4 se abre automáticamente en la **primera visita de ese navegador**, si permite autoplay silenciado; siempre se puede omitir y reproducir manualmente. Marca de reproducción en localStorage `ecoajedrez-intro-played-v1`. Si autoplay se bloquea, botones de control y omitir permanecen.
- `asset-cache.js` y `sw.js`: primera visita prepara con barra REAL **8 WebP + 6 glTF** y guarda solo material **público** en CacheStorage, salvo modo ahorro de datos. No se predescargan MP4 (pesados), no se cachea autenticación/API, no se garantiza juego offline ni retención eterna: navegadores pueden eliminar caché.
- Versión visible en todas las pantallas salvo partida/AR mediante `version.json`. Incrementarla y sincronizar cache-busting JS/CSS y pruebas en cada release.

## Restricciones imprescindibles
1. No usar assets de franquicias sin licencia comercial; las ilustraciones WebP son propiedad del usuario.
2. No comprometer AR/WebXR, invitado, partidas o privacidad por cambios visuales.
3. Sin cuentas nuevas, llaves/API en cliente, Cloudflare de pago ni Firebase Spark excedido.
4. Todo commit debe pasar CI, chequeos de seguridad y despliegue Pages; no afirmar pruebas físicas si no hechas.
5. Para cambios de UI, pedir/usar capturas reales Android/desktop; el mockup aprobado del usuario muestra fondo fantasía verde/azul/oro, cuatro tarjetas altas de modos, cuatro portales y configuración translúcida.

## Qué verificar ahora
- Desktop/móvil: intro primera visita, omitir, progresos de archivos verdaderos y segunda visita sin intro automática.
- Ver 4 tarjetas de modalidades y 4 escenarios correctamente enlazados; clic cambia bioma y entra a configuración. Empezar partida local/computadora. Ver modelos 6/6.
- Confirmar caché en DevTools Application → Cache storage después de descarga, susceptible a cuota; probar después sin desconectar librerías CDN.
- Validar AR y PvP físicamente; ninguna prueba de código los sustituye.

**Documentación detallada de esta entrega:** `docs/ENTREGA_0.11.md`; historia: `CHANGELOG.md`. 
