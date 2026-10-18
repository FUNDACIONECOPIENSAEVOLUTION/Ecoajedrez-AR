// ECOAJEDREZ 0.11: first-use public asset downloader, real progress and persistent CacheStorage.
// Image and model files only. No account data, secrets, audio/video or user game state stored here.
const VERSION='0.11.0';
const CACHE_NAME='ecoajedrez-public-assets-v'+VERSION;
const resources=[
 ...['01_vs_computadora','02_dos_jugadores','03_duelo_online','04_unirme_partida','05_bosque_encantado','06_templo_arcano','07_ciudad_flotante','08_volcan_celestial'].map(file=>'./app/imagenes/tarjetas/'+file+'.webp'),
 ...['pawn','rook','knight','bishop','queen','king'].map(file=>'./assets/models/staunton/'+file+'.gltf')
];
function progress(details){window.dispatchEvent(new CustomEvent('eco:asset-progress',{detail:details}));}
async function preparePublicAssets(){
 // A missing SW or CacheStorage never prevents the ordinary 3D chess game from running.
 let cache=null;
 try{
  if('serviceWorker' in navigator && location.protocol==='https:'){
   navigator.serviceWorker.register('./sw.js?v='+VERSION,{scope:'./',updateViaCache:'none'})
    .catch(()=>{});
  }
  if('caches' in window)cache=await caches.open(CACHE_NAME);
 }catch(error){cache=null;}
 const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const saveData=Boolean(conn?.saveData||['slow-2g','2g'].includes(conn?.effectiveType));
 let done=0,cached=0,downloaded=0,failed=0;
 const total=resources.length;
 progress({done,total,cached,downloaded,failed,stage:saveData?'limited':'preparing'});
 if(saveData){
  // Respect the user's preference not to spend mobile data on optional preloading.
  progress({done,total,cached,downloaded,failed,stage:'saving-data'});
  return;
 }
 let cursor=0;
 async function worker(){
  while(cursor<resources.length){
   const resource=resources[cursor++];
   try{
    const request=new Request(new URL(resource,document.baseURI),{credentials:'same-origin'});
    const found=await cache?.match(request,{ignoreSearch:true});
    if(found){cached++;}
    else{
     const res=await fetch(request,{cache:'force-cache'});
     if(!res.ok||res.type==='opaque')throw new Error('Resource unavailable');
     // CacheStorage is persistent across browser visits, subject to browser storage eviction.
     if(cache)try{await cache.put(request,res.clone());}catch(error){/* quota or private mode */}
     downloaded++;
    }
   }catch(error){failed++;}
   done++;
   progress({done,total,cached,downloaded,failed,stage:done===total?'complete':'downloading'});
  }
 }
 await Promise.all([worker(),worker()]);
 window.dispatchEvent(new CustomEvent('eco:assets-ready',{detail:{total,cached,downloaded,failed,stored:!!cache}}));
}
// Delay network prefetch very slightly so the optional first-visit intro paints immediately.
setTimeout(()=>{preparePublicAssets().catch(()=>{});},120);
