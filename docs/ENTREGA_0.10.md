# Entrega 0.10.0-beta.1 · Arena celestial interactiva
Fecha: 2026-10-17. Proyecto canónico: https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR

## Solicitud y origen del diseño
El usuario aprobó las imágenes conceptuales de la interfaz gamer con islas flotantes, ajedrez luminoso, portales y configuración sobre paisaje galáctico; solicitó trasladar la estética a la página real, incluir movimiento y publicar cambios.

**Distinción importante:** las propuestas generadas son composiciones estáticas que contienen letras y botones rasterizados. No se incrustan sin más como interfaz interactiva. Aquí se crea una **reinterpretación funcional original** con gráficos SVG/CSS para las islas, el portal galáctico y piezas flotantes, respetando IDs y eventos reales del juego. La visualización no es todavía una reconstrucción píxel por píxel de los fotogramas aprobados. Archivos conceptuales originales pueden incorporarse como backgrounds limpios en un release posterior sin incrustar texto/controles duplicados; GitHub connector tiene escritura UTF-8 y Git blob base64, pero la sesión no dispone de transferencia binaria desde filesystem a dicho conector.

## Implementación directa en GitHub
- `assets/ui/celestial-arena.svg`: arte vectorial original panorámico con islas flotantes, cascadas, cielo estrellado, espiral galáctica y piezas de ajedrez; escala con la pantalla y pesa mucho menos que un video. No añade peticiones externas.
- `celestial.css`: nueva portada inmersiva a pantalla completa. Conserva vídeo ambiental ya integrado **por debajo del bloque de marca y botones**, y sitúa un anillo galáctico, piezas animadas y destellos a la derecha. El antiguo lateral con collage de imágenes queda oculto solo visualmente, mientras los originales permanecen sin alteración. Mejora el contraste y botones realmente operativos.
- Menú: banner con panorama de arena y tarjetas de cuatro modalidades, fondos animados existentes y contenedores más luminosos; cuadrícula de cuatro tarjetas en escritorio, dos o una columna en móvil.
- Configuración: paisaje galáctico tras panel translúcido, barra lateral de navegación (menú e iniciar) con botones vinculados a los controles existentes, vista previa decorativa de bioma que sigue el selector real, iconos de campos, tamaños legibles, versión visible.
- Adaptación: los `.screen` tienen `height:100dvh;overflow-y:auto` y los paneles no están centrados de manera que recorten logo ni acciones. Contenido inferior accesible por scroll si la ventana es baja. Breakpoints 960, 620 y 380 px; `prefers-reduced-motion`.
- `celestial-ui.js`: activa acciones de navegación existentes y sincroniza vista previa de escena y piezas. No modifica auth, WebXR, Three.js, control de ajedrez o PeerJS.
- `version.json`, `privacy.html`, `opening.js`, `index.html` y `tests`: versión 0.10.0-beta.1 consistente. CSS cargado después de opening.css para prevalecer sobre estilo anterior.
- El bundle de GitHub Pages incluye explícitamente CSS/JS nuevos y SVG original mediante assets/ui. Security check escanea el nuevo JS. Pruebas `tests/celestial-ui.test.mjs` más suite preexistente.

## Seguridad y costo
Costo $0, sin nuevos dominios, Google Fonts, servidores, Firebase, privilegios, herramientas pagas, banners externos ni telemetría. Continúa modo invitado; Google sigue pendiente del BFF privado. No copiar personajes de películas sin licencia. Los vídeos originales del propietario continúan desde `videos/`, con pausa al comenzar partido o AR.

## Pruebas pendientes
1. GitHub Actions check/deploy completos.
2. Captura desktop 1366x720: logo entero, tres botones, versión, partículas/piezas flotantes y accesibilidad del footer con desplazamiento.
3. Captura móvil vertical: botones enteros y desplazamiento; no dejar que CSS del fondo impida tocar.
4. En menú: cuatro tarjetas gamer, responsive, video en fondo. Mantener enlaces QR de salas.
5. Configuración: todos los campos visibles, cambiar bioma y piezas actualiza ilustración. Botones reales: volver, iniciar.
6. Jugar contra computador, comandos y modelo glTF, conservar AR y reanudar tras bloqueo móvil.
7. Animación fluida con movimiento reducido y ahorro de datos. Verificar encuadre/fidelity con diseño aprobado; aceptar ajustes después de capturas.
