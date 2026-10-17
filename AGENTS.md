# Instrucciones permanentes para ChatGPT, Codex y otras IAs — ECOAJEDREZ AR
Fecha: 2026-10-17. Repo canónico: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR

1. **Primero leer:** este archivo, `docs/ESTADO_ACTUAL.md`, `docs/HOJA_DE_RUTA.md`, `docs/INVENTARIO_MODELOS.md`, `CHANGELOG.md`. No comenzar releyendo conversaciones extensas.
2. Alcance: ajedrez 3D en navegador y AR con evolución a Android, escenarios fantasía originales, modos vs computadora/local/online y traducciones internacionales.
3. **Presupuesto cero:** evitar dependencias de pago, dominios de pago, backend con cargos o suscripciones. No configurar servicios con facturación sin aprobación.
4. **Repo:** este es el principal; el anterior `instructorandradedcc/Ecoajedres-AR` es referencia de modelos y diseño; no sobrescribirlo. No tocar el juego distinto `FUNDACIONECOPIENSAEVOLUTION/3d-line`.
5. Mantener la **misma lógica reglamentaria** entre 3D y AR: solo cambia presentación y entrada. Partidas remotas necesitarán autenticación, reglas de seguridad, sincronización y recuperación de desconexiones.
6. **AR:** verificar HTTPS/WebXR y hardware real. No confundir tablero local con anclaje espacial entre dos equipos; tampoco prometer soporte iOS no comprobado.
7. **Licencias:** no copiar personajes famosos ni modelos de derechos desconocidos para comercializar. Preferir CC0 con URL, autor, versión, evidencia y licencia archivadas. Comprimir y medir GLB con objetivo menor de 15 MB **por archivo**; además vigilar el peso total para móviles.
8. **Control de cambios:** incrementar `version.json`, versión visible en `index.html` y `CHANGELOG.md`. Escribir resumen de alcance, pruebas, defectos y pendiente en `docs/ESTADO_ACTUAL.md`. Cambios reversibles y commits pequeños.
9. **QA:** ejecutar `node --check main.js`, comprobar que se resuelven recursos externos y probar en ordenador y Android antes de declarar versión estable. GitHub Actions solo hace comprobaciones estáticas; no certifica navegador ni AR.
10. **Desarrollo:** primero estabilizar tablero 3D, WebXR y modelo/rig originales; después animaciones, Stockfish, PvP Firebase, i18n completo, OTA con políticas de Play, PWA y APK.
11. **Terminología FIDE:** ELO/rangos de práctica no equivalen a títulos oficiales otorgados por la FIDE.
12. Al terminar **actualiza este traspaso**, la fecha, el commit, los bloqueos y tareas prioritarias. Prioriza demostraciones reales, no promesas.

## Desde 0.3.0-beta.1
- `assets/models/staunton/`: seis modelos glTF originales autocontenidos (no material de Harry Potter), cargados por GLTFLoader. No borrar su respaldo geométrico.
- AR usa sesión explícita `navigator.xr.requestSession('immersive-ar')` y DOM overlay, con hit-test, botón fijar tablero, toques y apuntar con selección de casilla mediante cámaras XR, adaptado de 3 LINE-AR. Fallback holograma no significa anclaje.
- Ejecutar `node --check main.js` y `node --test tests/*.test.mjs`; verificar también funcionamiento físico antes de declarar AR funcional.
- Leer `docs/ENTREGA_0.3.0.md` para qué probar y qué sigue pendiente.


## Estado 0.4.0-beta.1
Leer docs/ENTREGA_0.4.0.md antes de retomar. Ahora el flujo es bienvenida, menú, configuración, partida y opción de continuar. Modulos auth.js, commands.js, pvp.js son importados por main.js.

Comandos con SAN/UCI y español se verifican con chess.js; voz es experimental y con permisos. AR reportada funcional por el usuario en 0.3, conservar y verificar regresión en móvil.

Firebase d-line-g se reutiliza SOLO para Authentication, nunca para progreso de 3 LINE-AR. Si Google no abre, verificar dominio fundacionecopiensaevolution.github.io y proveedor Google autorizado. PvP PeerJS es beta, sin ranking, matchmaking, TURN ni anti-trampas fuertes, el anfitrión valida movimientos con chess.js.

QA: node --check main.js; node --check auth.js; node --check commands.js; node --check pvp.js; node --test tests/*.test.mjs. Actualizar versión, CHANGELOG y ESTADO_ACTUAL cuando cambie funcionamiento.


## Continuidad desde 0.4.1-beta.1
1. **Leer `docs/ENTREGA_0.4.1.md`** antes de trabajar con redes, partidas o ajustes.
2. Nuevo módulo `match-state.js`: `makeSnapshot()` incluye FEN+historial SAN completo; `verifyAndRestore()` prueba todas las jugadas en un tablero separado antes de mutar el juego. No regresar a `game.load(fen)` a secas para sincronización, porque borra historial.
3. Guardado local por UID o invitado en LocalStorage; no almacenar partidas online como persistentes. Al cerrar sesión limpiar juego en RAM sin sobreescribir otra cuenta.
4. Botón GUARDAR PARTIDA PGN y panel DIAGNÓSTICO de dispositivo deben conservarse al modificar el menú. Nunca incluir tokens ni claves privadas en los diagnósticos; solo información básica del equipo compartida voluntariamente.
5. Google popup se invoca inmediatamente desde el clic de usuario después de que Firebase Auth ya inicializó persistencia. No insertar un `await` antes de `signInWithPopup` en el handler.
6. Pruebas `tests/match-persistence.test.mjs` más todas las previas deben pasar, y el usuario debe volver a verificar AR 0.4.1 y PvP entre dos celulares.


## Seguridad 0.5.0-beta.1 (OBLIGATORIO)
Antes de modificar autenticación, red o datos: leer `docs/ENTREGA_SEGURIDAD_0.5.md`, `SECURITY.md`, `docs/DEPLOY_SEGURIDAD.md`.
No publicar contraseñas, cookies, access tokens, refresh tokens, claves privadas, archivos .env, credenciales Google ni Firebase Admin. No mostrarlos en el chat, consola, informe de diagnóstico, errores o GitHub.
GitHub Pages NO ejecuta Cloudflare Pages Functions. Por seguridad, Google permanece desactivado en la URL github.io, mientras el modo invitado sigue en funcionamiento.
El BFF (Backend for Frontend) Google se activa solamente desde Cloudflare Pages con secretos cargados por administrador. Usa OAuth con PKCE, state/nonce, ID token firmado verificado, AES-GCM y cookie HttpOnly. No retirar estas comprobaciones ni regresar a claves incrustadas en auth.js.
Workflow publica solo dist/ por allowlist, nunca worker-lib/functions/docs/tests. Ejecutar node scripts/security-check.mjs, node --test tests/*.test.mjs.
PvP PeerJS tiene código aleatorio 12 caracteres, límites de mensajes; todavía no es antitrampas ni apropiado para dinero o rankings. No prometer seguridad absoluta.
No reescribir historial Git sin autorización: configuración web Firebase antigua puede permanecer en commits previos; revisar restricciones/rotación sin afectar 3 LINE-AR.


## REGLA ECONÓMICA GLOBAL DEL USUARIO — prioridad permanente (2026-10-17)
- El propietario no dispone actualmente de presupuesto. **Presupuesto por defecto: 0 COP / 0 USD** para desarrollo, alojamientos, credenciales, dominios, servidores, APIs y pruebas. No suponer tarjeta de crédito disponible.
- Objetivo estratégico tras terminar cada proyecto: ayudar a conseguir recursos reales mediante monetización legítima, ventas, convocatorias, alianzas y fondos; nunca declarar ingresos o postulaciones conseguidas sin evidencia.
- Priorizar servicios **oficiales** con planes gratuitos verificables (GitHub Pages/Actions, Cloudflare Pages Free, Firebase Spark), comparando límites, requisitos de cuenta y cuotas antes de recomendar. Nada de pruebas gratis que requieran tarjeta o de configurar Blaze/Pay-as-you-go sin autorización explícita y revisión del riesgo de cobros.
- Mantener aplicaciones utilizables sin servidor de pago; activar OAuth protegido con BFF y secretos en el servidor solo cuando haya plataforma gratuita apropiada y se pruebe su configuración.
- No solicitar ni publicar contraseñas, tokens, claves privadas, cookies, credenciales de OAuth, archivos .env o Firebase Admin. Los valores de configuración **web Firebase** no son contraseñas: proteger el acceso con reglas de Firestore/Realtime Database, IAM, restricciones de API, App Check cuando proceda y límites de uso.
- No romper modos 3D/AR ni inicio de sesión de un juego por trasladar arquitectura de otro. Hacer cambios reversibles y mantener cada repositorio/recursos separados.
- Registrar instrucciones, costos, pruebas reales, despliegues y restricciones en AGENTS.md y documentos de traspaso para que otras IAs o próximas conversaciones no tengan que releer todo.


## Hosting comercial: condición oficial que no debemos olvidar
GitHub Pages es apropiado como **demostración y prueba**. Según los límites oficiales de GitHub, no debe usarse como hosting gratuito principal de un negocio online o software comercial SaaS. Para lanzamiento monetizado, evaluar Cloudflare Pages Free u otro servicio oficial cuyas condiciones permitan la actividad, sin inventar costes ni desplegar servicios cobrables.
Cloudflare Pages puede vincular el repositorio con GitHub y actualizar automáticamente; su URL gratuita es *.pages.dev. Verificar límites en https://developers.cloudflare.com/pages/platform/limits/ .

## DECISIÓN OPERATIVA ACTIVA: coste cero y cuotas de seguridad
Antes de activar Cloudflare, App Check, bases de datos, facturación o lanzar nuevas versiones de producción, leer `docs/PLAN_SEGURIDAD_0_COP.md`. La decisión vigente es: proteger ahora cuentas/código y reglas de acceso necesarias; reservar recursos y despliegues de nube para MVP y releases significativos; no habilitar Blaze ni servicios con tarjeta sin autorización explícita. El siguiente paso del usuario es GitHub passkey/2FA, luego comprobar Spark Firebase sin cambiar servicios.


## Separación de cuentas Google y proyectos Firebase (decisión del propietario, 2026-10-17)
- 3 LINE-AR corresponde a la cuenta de Google **personal del desarrollador**. Su proyecto Firebase existente se identifica como `d-line-g` (en consola puede mostrarse el nombre `3d-line-g`), plan Spark. No asumir que está bajo la cuenta Google de la Fundación.
- ECOAJEDREZ 3D/AR corresponde a la cuenta de Google **institucional de la Fundación**. Debe tener identidad y datos separados de `d-line-g`; no enlazar ECOAJEDREZ al Firebase personal ni mezclar UID, progreso o reglas.
- En la cuenta de la Fundación solo se vio un proyecto de ejemplo de Firebase; **NO reutilizarlo automáticamente**. No crear un nuevo proyecto hasta que el juego lo necesite realmente y se compruebe el plan gratuito.
- El código BFF Google de ECOAJEDREZ está preparado, pero sin servidor Cloudflare/credenciales desplegados. Mantener invitado y no prometer autenticación Google operativa.
- No escribir correos de titulares, contraseñas, credenciales, claves privadas o tokens en archivos públicos, commits, logs ni documentación. Si se requiere comprobar propiedad o permisos, hacerlo en cada consola con el titular.
- Presupuesto máximo actual 0 COP / 0 USD: no crear servicios, activar facturación ni pasar a Blaze sin aprobación expresa. Realizar la configuración de seguridad paso por paso.


## Firebase institucional de ECOAJEDREZ (confirmación visual 2026-10-17)
- El usuario mostró **proyecto Firebase propio ya creado**, con **nombre `EcoAjedrez-3D` e ID `ecoajedrez-3d`**, en plan Spark gratuito. La captura muestra `+ Agregar app`; no se verificaron todavía aplicaciones web registradas, Authentication, Firestore ni permisos administrativos.
- Este proyecto corresponde a la **cuenta Google institucional de la Fundación**, distinta de la cuenta personal que administra `d-line-g` para 3 LINE-AR. Nunca escribir datos de ECOAJEDREZ en `d-line-g`.
- El complemento oficial Firebase aparece **instalado y habilitado**, pero **sus acciones no están expuestas en esta sesión de chat**; no afirmar acceso administrativo efectivo a `ecoajedrez-3d`. Para verificarlo es necesario abrir Codex / entorno que cargue el complemento Firebase, autenticar la cuenta institucional y consultar el proyecto primero en modo solo lectura.
- No crear proyecto adicional ni activar Firestore, Blaze, App Check obligatorio, proveedores o escritura hasta que el usuario lo solicite y se confirme el plan de seguridad gratuito. Mantener el invitado.
- No publicar direcciones de correo, credenciales ni tokens en Git o documentación; credenciales se autorizan mediante OAuth directamente en el proveedor.


## ECOAJEDREZ v0.6.0-beta.1 — continuidad obligatoria (2026-10-17)
Leer `docs/ENTREGA_0.6.md` antes de modificar UI, WebXR, modelos o salas. El usuario confirmó con capturas que el modo invitado/AR funcionaban en 0.5, pero la revisión 0.6 **requiere nuevas pruebas físicas**.
Interfaz temática `arcane.css` y `arcane-ui.js` ahora dentro de la lista pública de `scripts/build-pages.mjs`. No reemplazar sin pruebas el CSS del HTML ni abrir fuentes externas en CSP.
Salas código/QR de 6 caracteres (en lugar de 12) para invitaciones casuales, con validación/tasa de mensajes, no autenticación formal ni aptas para premios. La URL larga permanece solo codificada en el QR, no se muestra en pantalla. Conserva el modo invitado sin Firebase.
Modelos: 6 glTF Staunton originales + `royal` como variante geométrica propia con cristales y corona; sin materiales de franquicias. No se descargaron otros modelos comerciales.
AR: interrupción por bloqueo termina WebXR y muestra recuperación 3D/AR en gesto nuevo; anclaje plano XZ. Arrastre táctil en pantalla y apuntar. NO hay oclusión de mano real ni pinza en el aire. No afirmar que se lograron sin prueba real.
No mezclar con Firebase personal de 3 LINE-AR. Costo $0, sin nuevas suscripciones.


## 0.7 — Apertura visual + versionado único (decisión 2026-10-17)
Leer `docs/ENTREGA_0.7.md` antes de editar opening o versión. Código nuevo: `opening.js`, `opening.css`, `assets/ui/forest-arena.svg` y `assets/ui/portal-arena.svg`. Son ilustraciones vectoriales **originales inspiradas en las capturas**, no imágenes extraídas idénticas. Versionado `version.json` leído sin caché e insertado en todas las pantallas fuera de partida (incluyendo privacidad, diagnóstico y sala online). No mostrar versión durante tablero/AR. Actualizar fallback HTML, version.json, URL cache-busting de main.js/opening.js y CHANGELOG juntos. Mantener el modo invitado y Google BFF sin cambios, presupuesto 0 COP. Validar GitHub Actions + test Android.
