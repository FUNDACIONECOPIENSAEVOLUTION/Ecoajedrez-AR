# Estado actual y traspaso — 2026-10-17

## Lectura ultrarrápida para otra IA
**Objetivo:** videojuego Ecoajedrez 3D/AR comercializable, bajo presupuesto cero; evolución gamer/fantasía tipo tablero animado (diseños 100% originales), español/inglés/chino, rival con niveles, PvP online, APK con actualizaciones.

**Código canónico:** https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR  
**Fuente histórica para estudiar, NO reemplazar ni redistribuir personajes por defecto:** https://github.com/instructorandradedcc/Ecoajedres-AR  
**Proyecto 3 LINE-AR independiente:** https://github.com/FUNDACIONECOPIENSAEVOLUTION/3d-line — no mezclar.

## Entregado
- \`index.html\` vista responsive y logo \`ecoajedrez.PNG\` suministrado por propietario.
- \`main.js\` Three.js con tablero 3D, piezas geométricas básicas, controles ratón/toque, entradas por teclado, temas clásico/selva, iluminación.
- \`chess.js\` reglas legales, casillas de destino, mate/tablas, promoción automática a dama.
- Modo Vs IA experimental con tres **escalones informales**, y PvP local en un dispositivo.
- Interfaz i18n básica español/inglés/mandarín simplificado; textos auxiliares por revisar.
- WebXR con hit-test y colocación de tablero (código experimental, **no prueba en celular**).
- Workflow de publicación Pages y documentación, sujeto a activación Pages por propietario.

## Verificación / pendientes
- [x] Repositorio nuevo existe y con permisos de administración/escritura comprobados.
- [x] Código fuente enviado al repositorio.
- [ ] GitHub Pages activado y dirección accesible verificada.
- [ ] Prueba end-to-end de render Three.js en navegador real.
- [ ] Prueba física en Chrome Android compatible: activar AR, detectar mesa, colocar tablero y mover piezas.
- [ ] Revisar control de selección en AR, rendimiento en GPU móvil y redimensionamiento táctil.
- [ ] Probar todas las reglas: enroque, captura al paso, coronación, mate y tablas.
- [ ] Reemplazar IA demo por Stockfish WASM para niveles consistentes.
- [ ] Sistema PvP remoto: no iniciado, requiere backend y controles anti-trampa.
- [ ] Guardado de progreso y servicio de actualización OTA/app: no iniciado.
- [ ] Diseños propios de figuras fantásticas, animaciones y GLB optimizados: no iniciado.

## Problemas del proyecto previo detectados
- GLB pesados, muchos >15 MB; catálogo en \`docs/INVENTARIO_MODELOS.md\`.
- Definición de set 'futuristic' tiene URLs vacías; al seleccionarlo las piezas pueden aparecer invisibles.
- Carga glTF usa ID generado de URL completa y selector \`#URL\` no fiable; necesita IDs estables.
- Datos de posición de piezas con orientación z divergente entre render y conversor de casilla: revisar antes de portar.
- Modo AR anterior ligado a A-Frame; fuera de AR el tablero no aparece como 3D jugable.
- IA vieja elige jugada al azar, no corresponde a nivel FIDE.
- No se encontró Firebase/PvP remoto implementado en el HTML inspeccionado.
- Referencias visibles a personajes y casas de una franquicia protegida: riesgo comercial; derechos no confirmados.

## Próxima tarea recomendada
Validar Pages y carga de dependencias; probar desde PC. Después probar AR en Android compatible, conservar registro de errores concretos y corregir interacción. Solo tras eso evaluar un set de modelos propios/reutilizables y optimización Blender.

## Estado comercial y costos
Sin anuncios, ingresos ni compras integradas. No existen jugadores remotos, métricas oficiales FIDE ni APK. Hosting Pages gratis para ensayo y fuente abierta públicamente, sujeto a límites/políticas. No prometer actualizaciones remotas irrestrictas de APK: código empaquetado y componentes nativos pueden necesitar una nueva versión.
