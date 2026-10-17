# ECOAJEDREZ AR — Seguridad v0.5.0-beta.1 (17/10/2026)

## Resumen técnico para cualquier IA
El usuario exige que no se publique contraseñas, claves privadas, datos de cuentas ni tokens; quiere intermediario y protección antiataques. Conserva AR y 3D y el juego gratuito.
Repo: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR
Juego GitHub Pages: https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/

## Cambios implementados
- `auth.js` ya NO contiene la configuración Firebase anterior ni SDK que requiera clave en cliente. Consulta exclusivamente `./api/auth/session` en mismo origen. Si no existe API, Google se desactiva y el modo invitado sigue funcionando.
- Intermediario de autenticación para **Cloudflare Pages Functions** en `functions/api/auth/` + `worker-lib/security.js`: OAuth de Google Authorization Code con PKCE S256, state y nonce; Google ID token verificado con JWKS RS256; cifrado AES-GCM de estado/sesión, cookies `__Host-` HttpOnly Secure SameSite Lax y vencimiento a 8 h; identificador seudónimo calculado HMAC. Responde solo estado y seudónimo, NO correo, contraseña o token.
- Origen del servidor `APP_ORIGIN` exacto, validación de Origin y cabecera para cierre sesión por POST. Los secretos `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` solo se configuran en el panel Cloudflare.
- CSP restrictiva del sitio con hash del importmap y referencias permitidas; `_headers` agrega políticas HTTP para Cloudflare; en GitHub Pages no todas las cabeceras son configurables.
- `.gitignore` para variables de entorno, PEM, claves y cuentas administrativas.
- `scripts/security-check.mjs` rechaza patrones de secretos y versiones de Auth del navegador que lo requieran; no garantiza que no haya fugas de otros tipos de secretos.
- `scripts/build-pages.mjs` prepara `dist/` con lista cerrada de archivos web. GitHub Actions publica únicamente `dist`, no Functions, tests, documentación, ni archivos secretos.
- Salas PeerJS cambiaron a códigos aleatorios criptográficos de 12 caracteres, límites por tamaño (64 KB), validación de versión y frecuencia de mensajes. Todavía no hay identidad P2P autenticada ni backend antitrampas; son partidas amistosas.
- `privacy.html` publicado con aviso inicial de privacidad; `SECURITY.md` amenaza/medidas; `docs/DEPLOY_SEGURIDAD.md` explica configuración de Cloudflare/Google sin compartir secretos.
- Pruebas `tests/security-bff.test.mjs` validan cifrado, pseudónimo, origen y exclusión de archivos internos.

## LIMITACIÓN CLAVE
El intermediario server-side está preparado en GitHub pero NO desplegado con credenciales ni dominio real de Cloudflare. Google se desactiva deliberadamente en GitHub Pages, que no ejecuta Functions. Para habilitar Google sin exponer configuración en frontend, administrador debe conectar este repositorio en Cloudflare Pages (build `npm run build`, output `dist`), registrar OAuth redirect y cargar secrets en Cloudflare. No pedir que comparta contraseñas ni secretos por chat ni subirlos al repo.

## Advertencia sobre claves antiguas
El antiguo `auth.js` de Firebase web incluía valores públicos de configuración. Aunque se retiraron del HEAD/artefacto, el historial Git conserva las versiones anteriores. No confundir Firebase web API key con contraseña administrativa. Revisar restricciones/rotación con administrador de Google Cloud/Firebase SIN romper 3 LINE-AR. Reescritura Git destructiva NO efectuada.

## Lo que no está resuelto todavía
- Google Login con BFF en dominio Cloudflare real y QA end-to-end.
- Reglas de seguridad de backend propio, rate limit del servidor, TURN privado, auditoría real y anti trampas no confiando en anfitrión.
- PR/QR expone el código de sala a quien recibe el enlace. No usar salas para dinero o puntuaciones oficiales.
- Configuración de eliminación de cuenta y proceso de tratamiento de datos previo al lanzamiento comercial.
- Validación AR físico tras revisión y funcionamiento en todos los navegadores.

## Próxima ejecución
1. Verificar último GitHub Actions `check` y `deploy` exitosos.
2. Configurar Cloudflare Pages BFF con secretos cifrados vía panel de administrador, sin exponer valores.
3. Confirmar mismo origen, cookies HttpOnly, login/ logout, privacidad; probar en Android.
4. Probar PvP desde dos móviles, revisar mensajes y reconexiones, sin usar datos personales.
5. Actualizar esta nota y CHANGELOG/AGENTS/ESTADO_ACTUAL.

IMPORTANTE: No tocar la base del juego distinto `FUNDACIONECOPIENSAEVOLUTION/3d-line`. El modo invitado y AR no deben perderse.
