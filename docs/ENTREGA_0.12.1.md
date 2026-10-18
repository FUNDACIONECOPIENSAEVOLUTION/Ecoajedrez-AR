# ECOAJEDREZ 3D/AR — Modelos disponibles y caché v0.12.1-beta.1
Fecha 2026-10-18.

## Inventario comprobado
En GitHub main sí existen los seis modelos originales de ajedrez: `assets/models/staunton/{pawn,rook,knight,bishop,queen,king}.gltf`. Tamaños ~16–50 KB por archivo, glTF 2.0 con geometría base64 autocontenida, verificados en `tests/models-ar.test.mjs`.

El selector de Configuración de batalla tiene cuatro estilos:
- **Staunton 3D original**: carga los seis glTF descargables.
- **Realeza arcana 3D**: reutiliza esos seis glTF y añade ornamentos geométricos.
- **Fantasía encantada**: geometrías 3D integradas/procedurales, no es un paquete GLB externo.
- **Clásico ligero**: geometrías 3D integradas/procedurales.

**Importante:** los antiguos GLB de personajes comerciales/famosos del repositorio previo no se copiaron, por licencia no documentada y peso elevado. No confundirlos con estos seis glTF propios. Tampoco se garantiza que los seis GLTF actuales sean igual de detallados que el arte conceptual de menús.

## Qué cambió
- `asset-cache.js`: CacheStorage de imágenes y modelos públicos. Ahora expone `window.ecoPublicAssets.getResource(path)`, `cacheReport()`, `preparePublicAssets({modelsOnly:true,force:true})` y `requestPersistentStorage()`. Usa mapa `inFlight` para que intro y motor pidan UNA sola vez cada archivo en paralelo. Valida rutas exactas del juego y mismo origen; no copia cuentas, claves, cookies ni contenido privado.
- Se mantiene `CACHE_NAME='ecoajedrez-public-assets-v0.11.0'` deliberadamente: los seis archivos glTF e imágenes aprobadas no han cambiado y el usuario **no pierde la caché que ya descargó**. Solo incrementar este identificador cuando cambie el contenido de modelos públicos. `sw.js` se deja en ese mismo identificador, por igual razón.
- `main.js`: el `GLTFLoader` parsea el texto glTF entregado por el caché, en vez de descargarlo de nuevo con `loader.loadAsync`; no requiere web al volver a cargar ese recurso siempre que el navegador retenga el CacheStorage. Si CacheStorage no está disponible sigue usando la carga antigua por red, con respaldo geométrico.
- `index.html` + `models-cache.css`: junto al selector de estilos hay botón «Preparar / comprobar piezas 3D», barra de seis piezas y estado: cargadas para jugar vs guardadas en almacenamiento. Al pulsar se intenta solicitar persistencia de almacenamiento (concesión NO garantizada). Si faltan archivos, prepara el paquete; si ya están, los reutiliza.
- `tests/model-cache-persistence.test.mjs`: simula dos visitas con CacheStorage compartido y comprueba que los seis archivos generan solo seis solicitudes en total, no doce ni catorce; bloquea rutas que no son públicas. Se preserva el test estructural de los seis glTF válidos.

## Limitaciones y prueba real
- Ningún navegador promete retener indefinidamente el caché; limpieza del historial/datos, falta de espacio, cambios de perfil, incógnito o decisiones de cuota pueden borrar recursos. Al volver, se descargan solo los faltantes. Solicitar persistencia mejora la probabilidad cuando el navegador lo concede.
- Ni la simple existencia en GitHub ni los tests de CI demuestran que GLTFLoader funcione en **todos** los teléfonos o que el paquete artístico sea «ultrarrealista». Prueba física del usuario pendiente.
- El usuario debe abrir la configuración en PC o móvil, escoger Staunton/Realeza y pulsar Preparar/Comprobar. Resultado esperado: «6 / 6 modelos activos» y «6 de 6 archivos almacenados». Reiniciar página: el paquete debería seguir como almacenado.
- No se tocaron AR, reglas chess.js, Google Auth, Firebase, PeerJS ni otro juego. $0 COP, sin servicios nuevos. 
