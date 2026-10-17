# Cómo activar el intermediario protegido — SIN PUBLICAR CREDENCIALES

## Estado
El repositorio incluye código listo para Cloudflare Pages Functions pero **no se ha conectado ni desplegado un proyecto Cloudflare con secretos**. GitHub Pages es un alojamiento estático, no ejecuta funciones `/api`, por eso Google se desactiva allí de forma segura mientras la modalidad invitado funciona.

## Alojamiento gratuito de código y autenticación con el mismo dominio
1. En Cloudflare Workers & Pages, crear proyecto Pages y conectar GitHub `FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR` (no subir archivos manuales con credenciales).
2. Configurar compilación **`npm run build`** y directorio de salida **`dist`**. Esto sirve únicamente archivos estáticos y compila `functions/` por separado.
3. Elegir dirección gratuita del tipo `https://ecoajedrez-ar.pages.dev` (el nombre exacto será el que realmente asigne Cloudflare).
4. Crear credencial de tipo Aplicación Web en Google Cloud OAuth; en Authorized Redirect URIs registrar exactamente `https://<TU-DOMINIO-PAGES>/api/auth/google/callback`. Google realiza el login; **no se crean contraseñas de jugadores**.
5. En Cloudflare Pages → Settings → Variables and Secrets, agregar como variables cifradas (encrypted secrets) **`GOOGLE_CLIENT_ID`**, **`GOOGLE_CLIENT_SECRET`**, **`SESSION_SECRET`** (cadena criptográficamente aleatoria de 32+ bytes). `APP_ORIGIN` debe ser el origen HTTPS exacto de la página, sin barra final. En producción mantenerlos como secretos salvo APP_ORIGIN, que es público. No escribir valores en GitHub ni en ChatGPT.
6. Redesplegar Cloudflare Pages después de guardar secretos. Verificar `/api/auth/session` por HTTPS y comprobar que la respuesta sin iniciar sesión NO contiene credenciales personales.
7. Comprobar login Google, devolución al menú, sesión persistente en cookie protegida, cierre de sesión y funcionamiento en móvil. No compartir capturas con cookies ni tokens.
8. Activar reglas anti-bot/limitación de tasas y revisar solicitudes sospechosas desde el panel Cloudflare si la cuenta dispone de esas funciones.

**Importante:** El dominio GitHub Pages actual `https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/` seguirá siendo la versión gratuita de prueba como invitado. Para que login Google por BFF funcione necesita abrirse el juego en el dominio Cloudflare Pages (mismo origen del API). Un Worker separado en `workers.dev` con cookies de terceros NO es sustituto fiable.

## Dato especialmente importante sobre Firebase del otro juego
El código anterior `auth.js` incluía identificadores públicos de Firebase `d-line-g`. Se eliminó del código de la versión actual. Como el repositorio Git conserva commits antiguos, estos valores podrían seguir visibles en el historial. Son API keys de **aplicación web** (no contraseñas administrativas), pero igualmente hay que revisar las restricciones del API key y Auth Authorized Domains en Google/Firebase sin afectar `3 LINE-AR`. Ninguna clave privada real fue utilizada o publicada por este nuevo intermediario.

## Verificación del repositorio
GitHub Actions comprueba módulos JS, pruebas de estados y cifrado, análisis simple de secretos y compilación del directorio `dist`. El servidor mantiene los secretos fuera del paquete estático.

## Limitaciones
La solución BFF necesita la configuración de secretos y credenciales OAuth por un administrador del servicio, fuera de GitHub y de esta conversación. No afirmar que Google está operativo hasta completar y probar esa configuración.
