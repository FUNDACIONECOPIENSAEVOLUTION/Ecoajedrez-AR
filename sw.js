/* ECOAJEDREZ service worker v0.11.0: cache ONLY public chess model/image assets.
   Never cache HTML, /api/, Firebase, credentials, OAuth, private or cross-origin requests. */
const CACHE_NAME='ecoajedrez-public-assets-v0.11.0';
const ASSETS=[
 'app/imagenes/tarjetas/01_vs_computadora.webp',
 'app/imagenes/tarjetas/02_dos_jugadores.webp',
 'app/imagenes/tarjetas/03_duelo_online.webp',
 'app/imagenes/tarjetas/04_unirme_partida.webp',
 'app/imagenes/tarjetas/05_bosque_encantado.webp',
 'app/imagenes/tarjetas/06_templo_arcano.webp',
 'app/imagenes/tarjetas/07_ciudad_flotante.webp',
 'app/imagenes/tarjetas/08_volcan_celestial.webp',
 ...['pawn','rook','knight','bishop','queen','king'].map(name=>'assets/models/staunton/'+name+'.gltf')
];
// v0.14: 13 approved gameplay boards, lazy fetched when user selects one.
const boardNames=["tablero_alquímico_de_líquidos_mágicos.webp","tablero_celta_mágico_de_ajedrez.webp","tablero_cibernético_de_neón_magenta_y_cian.webp","tablero_cósmico_de_nebulosas_y_obsidiana.webp","tablero_cósmico_de_plata_y_amatista.webp","tablero_de_ajedrez_mágico_con_vetas_doradas.webp","tablero_de_atlantis_en_nácar_y_oro.webp","tablero_de_hielo_mágico_con_runas_luminosas.webp","tablero_de_lava_y_basalto.webp","tablero_egipcio_de_oro_y_lapislázuli.webp","tablero_gótico_de_almas_espectrales.webp","tablero_místico_de_cristales_y_runas.webp","tablero_steampunk_de_engranajes_y_cobre.webp"];
const boardPaths=boardNames.map(name=>'app/imagenes/tableros/'+encodeURIComponent(name));
const allowed=new Set([...ASSETS,...boardPaths].map(path=>new URL(path,self.registration.scope).pathname));
self.addEventListener('install',event=>{
 // Don't force preload: bootstrap controls downloads/progress and user can skip intro.
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(x=>x.startsWith('ecoajedrez-public-assets-')&&x!==CACHE_NAME).map(x=>caches.delete(x)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||req.headers.has('range')||!allowed.has(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const saved=await cache.match(req,{ignoreSearch:true});
  if(saved)return saved;
  try{
   const response=await fetch(req);
   if(response.ok&&response.type==='basic'){
    try{await cache.put(req,response.clone());}catch(error){/* Full quota: still serve response. */}
   }
   return response;
  }catch(error){
   const fallback=await cache.match(req,{ignoreSearch:true});
   if(fallback)return fallback;
   throw error;
  }
 })());
});
