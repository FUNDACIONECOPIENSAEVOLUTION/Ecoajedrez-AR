# ECOAJEDREZ v0.12.0-beta.1 · Intro inicial, legibilidad y escáner QR
Fecha: 2026-10-18. Canon: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR

## Petición concreta
1. Al abrir nueva sesión, introducir automáticamente el video de introducción (10 segundos como máximo de reproducción), permitiendo omitir, mostrando progreso REAL de descargas/actualizaciones de fondos y fichas GLTF mientras se reproduce.
2. En la imagen limpia de bienvenida, corregir contraste especialmente en letras pequeñas, título y opciones de ingreso, respetando la composición aprobada.
3. Añadir a «Unirme a partida» botón «Escanear QR» con la cámara, aceptando el QR generado en «Crear duelo online», además del código manual de seis símbolos.

## Implementación
- `opening.js`: marcador temporal de sesión `sessionStorage ecoajedrez-intro-session-v2`, no localStorage permanente. Autostart al final de carga inicial del DOM, respeta permisos/autoplay y preferencias reducción de movimiento/ahorro de datos, omisión, reintento manual; se corta al terminar o tras 10s de tiempo de video, o pasados 20s si un buffering se eterniza. El MP4 original permanece local en `videos/`; poster permanente en `app/imagenes/interfaces/login_post_intro_fondo.png`. El video de bienvenida NO vuelve a loop tras terminar.
- `asset-cache.js`: precarga ~120ms después de mostrar la pantalla, 8 WebP y 6 GLTF existentes; eventos de progreso por número de archivos realmente procesados, en el overlay de video. Mantiene el mismo cache public assets v0.11 para evitar redescargas tras actualizaciones solo visuales, mientras navegador conserve CacheStorage. El MP4 NO se precarga por 13MB, lo administra navegador, sin indicador fingido de bytes. Las descargas pueden continuar después del clip.
- `readability-qr.css`: capa final de CSS en portada sin cambiar fondo, corrige .brand transparente definido por arcane.css; relleno opaco y sombras para título y palabras, contraste del bloque, resaltar textos auxiliares, botones y versión, responsive 1030/760/440 px.
- `index.html`: panel QR dentro de joinPanel ya existente: input seis caracteres y CONECTAR se mantienen, se añaden ESCANEAR QR, previsualización y CERRAR CÁMARA; hoja CSS y versión 0.12.
- `qr-scanner.js`: permiso de cámara solo por clic; escáner nativo BarcodeDetector o jsQR 1.4.0 descargado bajo demanda de jsdelivr (ya permitido en CSP). Valida QR: o código exacto de 6 símbolos de alfabeto PeerJS o URL de invitación HTTPS, mismo origen y misma ruta del juego, exactamente un parámetro room. No sigue URL externas, no envía imágenes ni tiene cuentas/credenciales. Para cerrar, se cancelan fotogramas y tracks de la cámara. La ruta de login/entrada por QR del lector del sistema también pasa por validación y se une al entrar como invitado.
- `main.js`: llama a `setupQrJoin` y en la lectura valida/coloca código y ejecuta el evento conectar ya existente. No altera la lógica de validación del tablero, ajedrez y AR; no añade backend.
- Build: `readability-qr.css` y `qr-scanner.js` en lista blanca GitHub Pages, scaneo de secretos y chequeo sintaxis en workflow.
- Tests: `tests/qr-join-intro.test.mjs` cubre entradas inválidas, deep links, UI y lógica de sesión; suite anterior actualizada al número de versión 0.12.

## Precauciones y limitaciones
- WebQR requiere HTTPS y permisos de cámara del navegador. Algunos dispositivos no admiten BarcodeDetector y necesitan poder descargar jsQR desde CDN; si falla, conservar modo manual de seis símbolos o cámara normal del teléfono para abrir enlace.
- El QR host contiene URL `?room=ABC234` y no comparte secretos de cuenta, pero la sala PeerJS es beta, no autoritativa ni resistente a trampas ni garantizada detrás de NAT.
- Autoplay en móvil no se puede asegurar: navegador puede bloquearlo o sistema tiene reducción de movimiento/datos. En ese caso deja fondo y controles, botón «Ver intro» funciona.
- La caché de archivos es persistente de mejor esfuerzo, eliminable por navegador. El archivo de vídeo no se almacena compulsivamente. El progreso del juego por número de assets no representa bytes transmitidos ni carga de servidor externo.
- No se han hecho pruebas físicas de cámara en dos dispositivos ni screenshots de la nueva versión hasta recibir confirmación del usuario. No hay garantías de conectividad PeerJS en todas las redes. Presupuesto $0.
