# ECOAJEDREZ 3D/AR — Plan de evolución: cámara 360°, aventuras, APK, GPS y monetización
**Fecha:** 2026-10-18. **Estado:** Propuesta técnica y de producto para definir con el usuario en la siguiente sesión. **Versión base comprobada:** 0.15.1-beta.1 (79 tests, GitHub Actions OK al publicarla). No confundir plan con características ya publicadas.

## Objetivo
Convertir ECOAJEDREZ en un juego de ajedrez 3D/360°/AR con una progresión visual por caminos de fantasía, niveles graduales, misiones y jefes finales por reino, más una app Android actualizable y, después, excursiones opcionales de ajedrez AR en lugares públicos próximos. Continuar usando el mismo motor `chess.js`, la configuración de adversario (bot/local/PvP beta) y las 13 parejas oficiales de tablero/reino, con seis caras WebP por reino.

## Estado y diagnóstico verificable
- 13/13 Skyboxes, 78/78 caras: ya publicados. El usuario confirmó visualización de tablero y piezas en 360°, pero reportó dificultades al acercarse. La v0.15.1 añadió botones +/−, cámara cercana, vista superior, pellizco táctil, rueda del mouse y giroscopio opcional para **orientación**.
- El código actual de `immersive-chess.js` usa rueda del mouse para zoom y arrastre sobre fondo para GIRAR vista; aún **NO** contiene un gesto específico para elevar/bajar progresivamente la cámara. El giroscopio del celular mide orientación, NO posición/altura real. Un portátil/PC sin sensores no puede imitar un acelerómetro/giroscopio; sí puede usar mouse y teclado.
- AR experimental actual: WebXR hit-test, tablero sobre superficie, cámara real, arco decorativo/cuarto semitransparente con tamaño y transparencia. Requiere prueba física, no identifica zona transitada segura; no está listo para salir andando ocultando obstáculos.
- Web app GitHub Pages y GitHub Actions funcionan sin computador local encendido. No hay APK/AAB ni canal nativo de actualización publicado. No hay misiones GPS implementadas.
- Recursos adicionales panorámicos/extras están subidos, pero solo las seis caras oficiales se tratan como cubemap.

## Orden de trabajo recomendado — ejecutar en fases y pruebas con usuario
### Fase 0: Jugabilidad impecable ANTES del mapa (prioridad máxima)
**0A — Cámara 360° y claridad de entrada:**
1. Revalidar en móvil y escritorio que se selecciona una pieza propia y luego una casilla destino en el mismo tablero, que responde el BOT, y que el progreso se guarda.
2. Afinar sensibilidad y cámara: +/− / rueda mouse = acercar/alejar hacia centro tablero; botón superior = encima, botón tablero = vista de juego; arrastre sobre fondo = mirada 360°; sensores móviles opcionales = orientación de la mirada.
3. **Propuesta a implementar:** Shift + rueda del mouse = altura de cámara (subir/bajar), Ctrl + rueda = inclinar cámara si accesibilidad lo requiere; móvil, un control vertical deslizable de altura o gesto de dos dedos desplazados en paralelo (evitar ambigüedad con pinza para zoom). Añadir botones ↑/↓ alternativos accesibles. Mantener límites de distancia y altura para evitar atravesar piezas/suelo.
4. No permitir que gestos de cámara generen una jugada. En 3D/360/AR, raycast a casillas desde la cámara actual. Opcional: contorno visible de selección y casillas legales; ocultar decoración que estorbe al tablero. Con gyro, permitir «Volver al tablero».
5. Probar al menos: abrir 13 reinos; 3 jugadas legales en cada experiencia, deshacer, guardar/reanudar; ratón, táctil y AR con dispositivo compatible. Registrar 30 FPS objetivo en móviles medios y degradación gradual de texturas/sombras para equipos lentos.
**Criterio de aceptación:** jugar sin necesidad de introducir movimientos como texto; ninguna interacción de cámara juega accidentalmente; la vista regresa siempre al tablero y al salir restaura 3D clásico sin perder partida.

### Fase 1: Núcleo de misiones de ajedrez, sin GPS
**1A — Mapa de aventuras:** un camino con nodos conectados dentro del reino elegido; no reproducir ilustraciones/UI de otros juegos comerciales. Reutilizar imágenes actuales de reino y aportar indicadores ligeros (1, 2, 3, estrella, batalla final).
**1B — Vertical slice de 1 solo reino:** 8 nodos sugeridos y repetibles:
  1. mover caballo/torre (tutorial interactivo);
  2. capturar pieza sin perder reina;
  3. defender rey contra jaque;
  4. mate en una jugada;
  5. elegir entre dos rutas de estrategia;
  6. mini-partida con BOT fácil;
  7. desafío especial con límite de jugadas (no de tiempo);
  8. **Guardián del reino**: duelo final; recompensa un marco/tablero/cosmético y desbloquea el siguiente reino.
Nodos deben ser misiones de verdad, no solo un menú: usar FEN/PGN/objetivos de tablero validados por chess.js, dificultad y resultado reproducibles.
**1C — Progreso por cuenta/UID invitado:** desbloqueos, estrellas, misiones completadas, reintentos y estado de partida; guardado local primero, sincronización en Firebase Firestore solo al conectar y confirmar servicios/permisos. No depender de acceso diario ni de pagar para progresar.
**1D — 13 reinos:** completar el primer mapa estable y reutilizar plantilla de misiones con retos originales progresivos para los trece.
**Criterio:** completar y recuperar una ruta, reiniciar misión sin perder otras, el jefe final desbloquea 360°/recompensa si así se configura y no afecta partidas libres.

### Fase 2: Instalación Android y actualizaciones reales
1. Primero una PWA instalable, revisar `manifest.webmanifest`, service worker, actualizaciones de assets, soporte offline de misiones básicas y mensajes «Nueva versión disponible → Actualizar». Hacer backup de progreso antes de actualizar.
2. Evaluar **dos envolturas Android**, según lo que de verdad funcione con WebXR/ARCore en el teléfono:
   - Trusted Web Activity / Chrome para ejecutar la web instalada con motor Chrome (opción favorable a preservar WebXR si el dispositivo lo soporta, requiere pruebas reales).
   - Capacitor + Android Studio para GPS, archivos, monetización e integración nativa; una WebView **no garantiza** WebXR immersive-ar. Si la AR falla, integrar ARCore nativo o abrir una ruta web XR compatible: no prometer compatibilidad sin probar.
3. Compilar APK de prueba **firmado** con package ID estable, luego AAB firmado para Google Play. Versionar `versionCode` creciente, `versionName`, probar actualización sin pérdida de progreso. Distribución Google Play = actualizaciones a través de Play; APK fuera de Play = nueva APK firmada y proceso de actualización manual/asistido, no actualización silenciosa arbitraria.
4. Separar contenidos/misiones y assets de la app nativa para versiones compatibles, mediante manifest versionado y caché segura; **nunca ejecutar binarios descargados ni saltarse políticas de la tienda**. Validar CORS/CSP, almacenamiento, anuncios, consentimiento.
**Criterio:** instalar, cerrar, reabrir, actualizar a otra versión, conservar cuenta/avance y jugar offline las misiones descargadas; probar AR de verdad en Android, no asumir que funciona por ser APK.

### Fase 3: Mapa de progreso y contenido atractivo
- Camino gráfico con bifurcaciones, puntos para batalla, experiencia y retos diarios **opcionales**, mini-boss y guardián del reino. 13 reinos = 13 capítulos; iniciar con 1 capítulo completo, medir qué misiones son claras y luego ampliar.
- Partidas contra BOT, puzzles FEN (mate en 1/2), defensa, finales de peones, clasificación por estrellas y desafíos sin reloj para que sean accesibles.
- Monedas de juego SOLO cosméticas, efectos de fichas, skins del tablero, animaciones, insignias; nunca comprar jugadas mejores. Tutor inicial y modo accesible sin AR/GPS.

### Fase 4: Misiones físicas AR/GPS, opcionales y próximas
- Desbloqueo de modo «Explorar mi zona» solo después de que el juego base y APK sean estables. Si el jugador da permiso de ubicación **solo mientras usa la aplicación**, ofrecer retos a distancia caminable opcional (por ejemplo 300–800 m configurables, no obligación). Puede jugar desde casa con misión equivalente de dificultad similar.
- Seleccionar PUNTOS PÚBLICOS aptos de fuentes con licencia, datos comprobables y validación: parques accesibles, bibliotecas, plazas peatonales, centros comerciales autorizados. No crear puntos en casas, domicilios, carreteras, colegios sin autorización, áreas privadas o peligrosas; no revelar domicilio/origen ni posición exacta de un participante a otros jugadores. Evitar retos en horario nocturno.
- Flujo: jugador elige exploración → se piden permisos transparentes → se proponen lugares públicos cercanos y se descargan misiones → al llegar a un lugar seguro **se detiene** → se abre cámara AR y se ancla un tablero a una superficie. NO jugar AR mientras camina o cruza calle.
- Comprobación GPS tolerante y privada, sin seguir el recorrido permanentemente ni almacenar rutas personales; permiso aproximado cuando alcance; comprobar privacidad infantil, consentimiento parental si aplica, retención mínima, resistencia básica a GPS falso para recompensas no monetarias.
- Alternativa sin GPS/movilidad reducida: mismo progreso mediante misiones domiciliarias. No obligar a revelar dirección personal para competir. Modo multijugador cercano inicialmente con invitación privada/QR y controles de seguridad, nunca emparejar por ubicación exacta.
- «Gran torneo» del reino como final del camino, con 360° en casa o AR estático cuando el jugador está parado.

### Fase 5: Monetización transparente (después de pruebas, sin pay-to-win)
1. **Anuncios recompensados y voluntarios** solo entre partidas y misiones; recompensa: cosméticos, monedas limitadas o vista extra (no ventaja injusta). Probar anuncios de prueba oficiales de AdMob en versión Android; no mostrar anuncios bloqueando casillas, durante partida AR, en un cruce ni en zonas con cámara activa.
2. **Cosméticos**: skins de piezas/tableros, portales, efectos, marcos de perfil y decoraciones de reino. Compras in-app conforme a reglas de Google Play y mecanismos de restauración/soporte.
3. **Pase de temporada opcional** solo si hay comunidad y contenido suficiente; no empezar aquí ni prometer ingresos. Patrocinios de torneos/lugares solo bajo contrato/permiso, sin usar ubicación sensible en publicidad personalizada. Preferencia por recompensas educativas.
4. Medición cuidadosa: DAU/MAU agregados, retención, nivel completado, tasa de anuncios voluntarios, conversión; sin GPS ni información personal como telemetría.
5. Crear una cuenta de costes y riesgo: hosting, backend de progreso, API de lugares, mapas, AR/QA, cuentas de tienda, mantenimiento y licencias. Ingresos no garantizados.

### Fase 6: Gafas y agarre de piezas
- Especificar un modelo concreto de gafas/controlador y verificar WebXR hand-tracking o interfaz nativa según soporte real.
- Para el MVP: seleccionar por rayo/puntero y confirmar; después «pellizcar con la mano» (pinch) y mover pieza en espacio 3D con colisiones y feedback. Asegurar equivalente táctil para dispositivos sin tracking.
- Un cuarto gigante con fichas grandes es visualización; exige entorno libre y aviso de límites; no permitir locomoción virtual que dé sensación falsa de seguridad física.

## Decisiones que tomaremos al continuar (máximo tres)
1. Primera prueba: ¿controles cámara vertical con dos dedos o botones/slider ↑↓ como estándar en móvil? Recomendación: botones/slider primero para no romper selección, gesto luego.
2. Primer reino piloto para mapa con 8 misiones: ¿Galáctico, Mágico o el preferido? Recomendación: Galáctico por pruebas previas.
3. Ruta APK: ejecutar primero prototipo TWA con Chrome AR probado y comparar frente a Capacitor antes de comprometer integración AdMob/nativa.

## Tareas inmediatas posibles
- [ ] Verificación táctil en Android de 3D/360°/AR, 3 jugadas y 13 selecciones.
- [ ] Diseñar altura independiente de cámara (Shift+rueda PC, ↑↓/slider Android) con botones accesibles, límites y protección de raycast.
- [ ] Mapa de 8 nodos del primer reino (mock sin alterar menús actuales), puzzles FEN probados.
- [ ] Definir esquema de progreso local y migración Firebase futura.
- [ ] Probar compatibilidad WebXR en PWA instalada, Chrome y APK Android antes de elegir empaquetado.
- [ ] Probar actualización de versión sin pérdida de progreso ni partidas.
- [ ] Investigar lista blanca de lugares públicos (licencia de datos, accesibilidad y permisos).
- [ ] Diseñar prueba de recompensas cosméticas y anuncios de prueba, sin anuncios reales aún.

## Fuentes técnicas verificables
- Capacitor v8 web-to-native: https://capacitorjs.com/docs
- Capacitor crear proyecto desde web existente: https://capacitorjs.com/docs/getting-started
- Android App Bundles: https://developer.android.com/guide/app-bundle
- Android versionCode/versionName: https://developer.android.com/studio/publish/versioning
- Google WebXR AR hit-test: https://developers.google.com/ar/develop/webxr/hello-webxr
- Android permisos de ubicación en ejecución: https://developer.android.com/develop/sensors-and-location/location/permissions/runtime
- AdMob Android anuncios voluntarios recompensados: https://developers.google.com/admob/android/next-gen/rewarded
