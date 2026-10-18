# ECOAJEDREZ 3D/AR · RESUMEN MAESTRO PARA LA PRÓXIMA IA
**Revisión vigente:** 0.14.6-beta.1 · 2026-10-18. **Leer primero la sección más reciente al final.** Leer **este archivo primero**; consultar AGENTS.md y código solo si la tarea lo requiere. Evitar reanalizar conversaciones largas.

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

## Cambio puntual 0.11.1 (bienvenida)
Imagen limpia del usuario verificada en `app/imagenes/interfaces/login_post_intro_fondo.png` (2.96 MB). `login-scene.css` ahora va al final de los estilos y coloca ese PNG a pantalla completa bajo los botones reales; título ECOAJEDREZ en una sola línea, responsive PC/tablet/celular. `opening.js` deja reproducir la introducción en primera visita como máximo 10 segundos de tiempo de video; luego fondo **estático** sin loop adicional. Botón manual repite video, Omitir sigue funcional. `scripts/build-pages.mjs` permite exactamente el PNG con validación. **No modificar otras pantallas** por esta tarea. Ver `docs/ENTREGA_0.11.1.md`.

## 0.12.0-beta.1 (2026-10-18)
Portada más legible usando `readability-qr.css` (último CSS), intro automática por pestaña/sesión al comenzar y precarga paralela de 14 archivos con barra real, intro saltable y limitada a 10s de reproducción; no se reproduce en bucle. El menú Unirme ahora incluye cámara `qr-scanner.js` para QR de sala, con verificación del origen y código de 6 caracteres, cierre seguro de la cámara y alternativa de conexión manual. Deep link QR de cámara nativa puede conectar tras entrar como invitado. Nuevos tests en `tests/qr-join-intro.test.mjs`. Ver `docs/ENTREGA_0.12.md` para el detalle. Requiere prueba real dos teléfonos; no modificar AR ni Firebase.

## 0.12.1-beta.1 · Corrección de modelos 3D y caché
Hay **seis** archivos glTF originales autocontenidos bajo `assets/models/staunton/`. Configuración permite Staunton y Realeza arcana con esos glTF; Fantasía y Clásico son geometrías procedurales. `asset-cache.js` y `main.js` ahora comparten `window.ecoPublicAssets.getResource()` con promesas en vuelo deduplicadas y CacheStorage persistido entre visitas, en lugar de solicitudes paralelas del preloader y GLTFLoader. Mantener `CACHE_NAME=ecoajedrez-public-assets-v0.11.0` y `sw.js` sin cambiar para no destruir lo ya descargado; incrementar solo al actualizar los bytes de assets. En Configuración hay botón `downloadModels`, barra `modelDownloadProgress`, estado `modelCacheState`; intento de persistencia de almacenamiento solo tras clic. No garantizar retención indefinida ni que modelos de franquicias viejos estén aquí; no están incluidos. Test de caché dos visitas en `tests/model-cache-persistence.test.mjs`. Entrega detallada en `docs/ENTREGA_0.12.1.md`.

## Cambios v0.13.0-beta.1 — Magia 3D, última jugada local, AR rápido y legal (2026-10-18)
- **Fondo inmersivo 3D ligero (NO panorama 360 real):** `magic-world.js`, `magic-game.css` muestran cuatro fondos WebP ya existentes del usuario (bosque, templo, ciudad, volcán) detrás del canvas transparente; 3D geométrico de plantas/cristales/runas y brillo ligero en las casillas, sin modificar cuadrícula ni ajedrez. Material ambiental añadido OCULTO en AR; AR conserva cámara y anclaje. Selector de calidad auto/low/medium/high para móvil (preferencia en localStorage), reducción de partículas con `prefers-reduced-motion`.
- **Última jugada solo quien consulta:** `last-move-ghost.js` obtiene `game.history({verbose:true})` y crea halo origen, destino, trazo + silueta fantasma 4,5 s. No envía evento PeerJS, no hace undo, no modifica posición/turno. Botón `#lastMoveBtn` junto a estrella, también `#toolsLastMove`. Resaltado permanente anterior retirado.
- **Acciones dentro de partida:** `#quickArBtn` abre `startAR()` por gesto real; `#gameTools` abre menú de continuar, última jugada, AR, cambio entorno, historial SAN, PGN, legal y salida. La partida permanece activa salvo salir voluntariamente. El online sigue siendo beta.
- **Legal:** `terms.html` borrador + `privacy.html` ampliado, `legal-consent.js` muestra aviso de primer uso al entrar por invitado/Google y guarda aceptación en navegador (NO activa cámara/micrófono). Permisos del navegador se piden después cuando se necesiten. Revisión de abogado requerida antes de lanzar comercialmente; NO es protección jurídica garantizada.
- **Release v0.13:** `version.json`, `index.html`, `opening.js`, `CHANGELOG.md`, build Pages allowlist y tests actualizados. Nuevo `tests/magic-3d.test.mjs`. Intro/QR/CacheStorage 8 WebP + 6 glTF de releases anteriores conservados; $0 COP. Documentación completa `docs/ENTREGA_0.13.md`.
- **Pendiente:** pruebas físicas real Android + multijugador + permisos, verdadera panorámica 360/AR portal a escala real, mejoras de modelado 3D avanzado y revisión legal. No prometer funciones que no se han probado.

## Actualización v0.14.0-beta.1 — Tableros de imagen reales y vistas decorativas
- **El usuario aclaró:** hay **13** WebP `tablero_...` que muestran tablero real con marco, piezas deben jugar ENCIMA; y **7** WebP `vista-...` que son solo imágenes bonitas para ambientar el menú (NO vistas previas de tableros). Catálogo exacto en `board-skins.js` y visor en `board-catalog-ui.js`.
- Pantalla Configuración: selector `#boardSkin`, miniatura del tablero real, `#boardCoverage` (encuadre 65–100% con valor inicial 86% para marcos). En menú de partida `#toolsBoardSkin` cambia el diseño durante una partida sin afectar estado chess.js ni PeerJS.
- `board-skins.js`: textura WebP sRGB en superficie plana 3D 8×8 sobre casillas existentes, sin raycast; `THREE.GridHelper` tenue revela límites. La superficie es hija de `world`, así se escala automáticamente con el tablero en AR. Si falla carga se queda diseño clásico. **No se conoce todavía el recorte exacto dentro de cada imagen:** el slider permite afinar y es importante comprobar físicamente alineación tras publicación.
- Menú principal: `#visionGallery` contiene arte `vista-` con botones anterior/siguiente, sin vincularlo con selección de tablero.
- CacheStorage/SW incluye 13 tableros como rutas permitidas ON-DEMAND; no cargar automáticamente 13 x 0.5–0.8 MB al inicio, solo el elegido. Mantener id de caché `v0.11.0` para no volver a descargar antiguos 14 recursos. Las vistas usan caché HTTP normal de navegador.
- Build whitelist publica únicamente 13 + 7 archivos autorizados y valida WebP. `board-catalog.css` responsive, tests en `tests/board-skins.test.mjs`. Detalles `docs/ENTREGA_0.14.md`.
- No se han probado físicamente todos los encuadres ni la modalidad AR con estas imágenes. No tocar jugabilidad/reglas/autenticación en esta entrega.

## 0.14.1-beta.1 — Corrección visual de tableros (2026-10-18)
- Capturas: triángulos turquesa/violeta por superposición de caras 3D y casillas de imagen descentradas respecto a fichas. Se corrigió en board-skins.js mediante calibración de cada WebP, mapeo 8×8 exacto, marco en su lugar y render del tablero sin z-fighting.
- La imagen cyber original tenía solo 7×7 casillas y se recompone visualmente en CanvasTexture a 8×8, conservando su original WebP. Las casillas 3D siguen siendo las únicas que reciben clic.
- El ajuste manual genérico (%) de 0.14.0 fue retirado: se usan metadatos grid/cells por cada diseño. Las siete imágenes vista- siguen como decoraciones del menú, NO tableros jugables.
- El usuario comunicó que visualmente quedó bien. Falta comprobar todas las combinaciones en navegadores móviles y AR real. Las notas 0.14.0 anteriores son históricas, NO volver a introducir slider.

## 0.14.2-beta.1 — Efectos de victoria y documento central (2026-10-18)
- Archivos nuevos victory-fx.js / victory-fx.css: fin de partida con anillo giratorio, partículas ligeras CSS, textos de victoria, derrota y tablas. Soporta es/en/zh y reduce movimiento por accesibilidad.
- chess.js determina bando ganador: humano blanco vs computadora, partida local con ganador blanco/negro y online host blanco/invitado negro. El invitado online NO puede reiniciar la sala.
- Controles reales del modal: NUEVA PARTIDA, VOLVER AL MENÚ y VER TABLERO (ocultar sin modificar la posición final).
- main.js llama la presentación desde updateStatus(), la limpia al reset(), y la sincroniza al entrar a la vista game. No altera reglas, piezas, transacciones PeerJS, autenticación ni la sesión WebXR.
- Build Pages incorpora los nuevos archivos a la allowlist. Tests de lógica en tests/victory-fx.test.mjs; workflow valida sintaxis del nuevo JS. Pruebas en Android/AR físico y dos dispositivos pendientes.

### Menú rápido para una próxima sesión (leer solo lo necesario)
1. LEER PRIMERO este resumen y AGENTS.md. Después únicamente código de la función que se pretende cambiar y el commit HEAD. No releer chats completos.
2. Juego, IA heurística, movimiento, render y AR → main.js; comandos → commands.js; partida remota PeerJS beta → pvp.js y match-state.js; no hay servidor autoritativo ni antitrampas.
3. Tableros reales: board-skins.js, board-catalog-ui.js, board-catalog.css y app/imagenes/tableros/. Trece WebP tablero_ jugables y siete vista- decorativas, todos preservados.
4. Celebración de finales: victory-fx.js / victory-fx.css. Para nuevas traducciones/efectos editar primero esos archivos.
5. UI/ambientación: index.html, magic-world.js, adventure-ui.js, magic-game.css, celestial.css; seis glTF de piezas en assets/models/staunton/.
6. Publicación: scripts/build-pages.mjs → dist/ segura; CI en .github/workflows/pages.yml: node --test tests/*.test.mjs y node scripts/security-check.mjs. GitHub Pages al aprobar acciones, sin publicar docs/tests/secretos.
7. Historial y realidad técnica: CHANGELOG.md, version.json (browserValidated y physicalARValidated continúan false), este documento canónico.
8. Validar: mate jugador vs CPU, mate CPU, empate, ambos ganadores locales, online host/invitado, cerrar panel, reiniciar, vista final, AR y tamaños de pantalla. No afirmar pruebas físicas sin ejecutarlas.
9. Próxima fase: comprobar efectos en dispositivos y, tras aprobación, audio opcional; mejorar bot, online, PWA/APK solo después de estabilizar.

**Norma:** al finalizar cada cambio, añadir aquí nueva sección de máximo una página con versión, cambios reales, archivos tocados, pruebas, pendientes y enlace a commit. Evitar documentos maestros duplicados.

## 0.14.3-beta.1 — Pares automáticos tablero + reino 3D (2026-10-18)

- **Única carpeta de subida:** `app/imagenes/entornos/`. Los nombres exactos y las instrucciones de GitHub están en su `README.md`. Son **13 archivos opcionales** `entorno_ID.webp` a medida que el propietario los cargue; todavía no se han suministrado estos fondos de reino.
- `realm-pairing.js` enlaza determinísticamente los 13 tableros jugables a un bioma temático y un fondo real mediante `manifest.json` generado **durante cada build de GitHub Pages**. No intenta cargar fondos faltantes ni modificar texturas originales.
- `scripts/build-pages.mjs` valida y copia solamente nombres de reino autorizados, archivos realmente presentes WebP de menos de 3 MB. La carpeta no se copia completa; sin accesos privados, costes ni descargas anticipadas.
- `board-catalog-ui.js` / `board-catalog.css` muestran **TABLERO + REINO** juntos en Configuración. Si falta el reino, la miniatura explica que está pendiente. Un único selector determina ambos. El selector libre de bioma se mantiene exclusivamente para `classic`.
- `magic-world.js` conserva el ambiente por defecto si falta un fondo y reemplaza el fondo del escenario por el reino seleccionado si fue publicado. **WebXR no recibe imágenes de reino**: cámara y entorno físico reales, para prevenir confundir imagen artificial con superficies ancladas.
- Resultado de victoria, derrota y tablas ahora tiene una de las ilustraciones decorativas `vista_de_ajedrez_celestial_encantado.webp` detrás del modal, con sombreado legible y partículas CSS intactas.
- Tests `tests/realm-pairing.test.mjs` y los tests de versión sincronizados. CI valida scripts, tests y publicación segura; prueba física móvil/AR real sigue pendiente.
- **Próxima acción del propietario:** cargar imágenes 16:9 en la carpeta, con nombres exactos `entorno_alquimia.webp` etc.; comprobar selección y el fondo relacionado en 3D tras el commit y despliegue automático.

## 0.14.4-beta.1 — 10 fondos reales de los 13 reinos (2026-10-18)
- Se confirmó en GitHub que el usuario cargó 10 WebP en `app/imagenes/entornos/` con nombres enumerados `01_...` a `10_...`; el código anterior esperaba `entorno_ID.webp` y los omitía en Pages.
- `realm-pairing.js` contiene ahora el **mapeo real por nombre original** de 10 imágenes a 13 tableros, sin renombrar/copiar recursos repetidos. `scripts/build-pages.mjs` usa el mismo objeto como whitelist y genera `manifest.json` con solo archivos presentes y válidos.
- Diez tableros poseen fondo propio disponible; `alquimia` comparte `02_entorno_magico_fantasia_ancestral.webp`, `amatista` comparte `01_entorno_galactico_cosmico.webp`, `gotico` comparte `03_entorno_medieval_leyenda_fantasia.webp`. Esas tres imágenes exclusivas son las únicas faltantes. La prioridad futura es `entorno_alquimia.webp`, `entorno_amatista.webp`, `entorno_gotico.webp`, opcionales.
- Referencia completa y cargas futuras en `app/imagenes/entornos/README.md`. 3D usa fondo del reino, AR conserva cámara y decoraciones 3D se ocultan. Verificar GitHub Actions y muestras en móviles para la validación física.

## 0.14.5-beta.1 — Skybox 360°: infraestructura y prueba aislada (2026-10-18)
- Se crearon 13 carpetas bajo app/imagenes/skybox/ para el Galáctico/Cósmico y 12 reinos adicionales. Cada una contiene README y admite exactamente px.webp, nx.webp, py.webp, ny.webp, pz.webp, nz.webp; al completarse son 78 WebP. No hay todavía caras cargadas.
- skybox-config.js contiene 13 IDs de reino y relación futura con los 13 tableros. No se incorpora skybox a las partidas actuales ni a AR: se prepara para futuras batallas finales por reino.
- scripts/build-pages.mjs publica exclusivamente conjuntos completos de seis WebP reales cuadrados de la misma resolución (512-4096 px, hasta 3MB por cara) y genera un manifiesto público con estados. No publica caras sueltas ni archivos arbitrarios; seis mal emparejadas quedan pendientes sin impedir publicación.
- skybox-test.html, skybox-test.css, skybox-test.js forman un laboratorio Three.js CubeTextureLoader, rotación por arrastre o giroscopio opcional con autorización. En Configuración hay enlace para abrir el laboratorio directamente en el reino asociado al tablero.
- Los skyboxes rotan desde un único centro virtual (3DoF) y parecen distantes; NO permiten caminar con paralaje real ni garantizan más nitidez que sus imágenes fuente. Futura fase VR 6DoF requeriría geometría real. AR sigue usando cámara real.
- Validación pendiente: cargar al menos 6 caras WebP de un mismo panorama cúbico y comprobar continuidad de bordes, techo/suelo y sensores en teléfonos.

## 0.14.6-beta.1 — Skybox Galáctico detectado en móvil y botón de entrada (2026-10-18)
- Usuario subió las seis caras WebP de galactico_cosmico y además seis archivos de nombre largo idénticos por SHA; las caras cortas px/nx/py/ny/pz/nz son las únicas usadas. CI de Pages había confirmado 1/13 cubos completos, 66/66 pruebas.
- Captura Android mostró falso negativo «faltan 6» en skybox-test.html. Motivo práctico: el frontend confiaba exclusivamente en manifest.json; si GitHub Pages entregaba una versión sin manifest o aún sin actualizar, el código asumía 0 caras.
- Corregido skybox-test.js: si manifest no confirma conjunto listo, hace seis consultas HEAD a URLs reales publicadas y solo reporta faltantes cuando da HTTP negativo; errores de red se indican como verificación pendiente.
- UI ahora tiene ENTRAR AL REINO 360°, Comprobar imágenes y Salir del reino. La cámara Three.js está en origen del cubemap y no solicita cámara trasera del teléfono: giro por dedo o sensores opcionales. Sigue sin batallas, desplazamiento 6DoF ni alteraciones de AR.
- Pendiente confirmar en móvil que aparece ENTRAR y el cubo carga/permite mirar todas las direcciones, además de inspeccionar costuras/orientación con fotografías.
