# Política técnica de seguridad — ECOAJEDREZ AR (v0.5)
El juego permanece en beta. Para reportar una vulnerabilidad, no publiques credenciales ni datos personales en issues públicos; contacta privadamente a los responsables del repositorio en GitHub.

## Modelo de amenazas y medidas
- Las contraseñas no se recopilan ni almacenan por ECOAJEDREZ.
- Configuración OAuth y claves privadas de cuenta Google: solo servidor Cloudflare Pages Functions con variables cifradas. En GitHub Pages estático, Google no está disponible, invitado sí.
- El servidor OAuth utiliza Authorization Code + PKCE S256, state/nonce aleatorios, valida firma RS256 con JWKS de Google, emisor, público/audiencia, expiración y nonce.
- Sesiones cifradas AES-GCM, cookies `__Host-` con Secure, HttpOnly, SameSite=Lax y vencimiento de 8 horas. Se comparte únicamente un identificador seudónimo derivado mediante HMAC; no correo ni nombre.
- Política CSP restrictiva y cabeceras HTTP de protección en Cloudflare; GitHub Pages admite solo CSP por etiqueta meta (no todas las cabeceras). No usar `innerHTML` para datos de usuarios.
- Compilación con lista explícita de archivos públicos. No publicar Functions, material interno, pruebas ni variables de configuración.
- Revisión estática de secretos en GitHub Actions, pruebas de autenticación, origin checks y sesión. No sustituye una auditoría externa ni analizador de dependencias completo.
- Salas PeerJS con códigos aleatorios largos de 12 caracteres, límites de tamaño/frecuencia, reglas de juego validadas por anfitrión, sin textos arbitrarios expuestos al DOM. Las salas **no son un backend antitrampas confiable**: el anfitrión puede alterar su propio código; no es apto para apuestas, torneos o premios sin arbitraje independiente.
- Datos locales por cuenta pseudónima e invitado, sin sync cloud por defecto.
- Usar HTTPS exclusivamente. HTTPS del hosting protege el tránsito hasta el servidor, pero las bibliotecas CDN implican terceros.
- Principio de permisos mínimos en GitHub Actions. No activar servicios de pago ni subir credenciales a commits.

## Pendientes de endurecimiento comercial
1. Sustituir señalización pública PeerJS por backend controlado, autenticado y con limitación de tasas para PvP público/rankings.
2. Analizar dependencias con lockfiles y, preferiblemente, servir bibliotecas JS desde el propio sitio en vez de CDN.
3. Auditoría profesional de autorización, privacidad y anti-trampas antes de monetizar o recibir menores.
4. Registrar consentimiento y crear borrado de cuentas/datos en backend cuando se habilite almacenamiento remoto.
5. Configurar en Cloudflare reglas de limitación de tráfico para endpoints OAuth; monitorear intentos anormales sin guardar tokens.
6. Revisar reglas de Firestore/Realtime Database y API key de Firebase de cualquier proyecto histórico. Las antiguas claves de configuración web pueden existir en el historial Git: retirar del archivo actual NO las borra de commits anteriores. Esas claves de cliente no son secretos administrativos; si se desea minimizar exposición, restringir API y dominios desde consola sin romper otros juegos.

## Privacidad visible para jugadores
La página `privacy.html` contiene el aviso preliminar y se debe actualizar con los contactos formales y mecanismos legales antes del lanzamiento comercial.
