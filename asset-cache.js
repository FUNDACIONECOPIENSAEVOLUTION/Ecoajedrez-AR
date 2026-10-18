// ECOAJEDREZ v0.12.1 · one public resource request shared by prefetch and Three.js.
// Keep cache format v0.11.0 while the files are unchanged, so users retain prior downloads.
// NEVER cache HTML, scripts, authentication, URLs outside this app or personal data.
const VERSION='0.11.0';
const CACHE_NAME='ecoajedrez-public-assets-v'+VERSION;
const resourcePaths=[
 ...['01_vs_computadora','02_dos_jugadores','03_duelo_online','04_unirme_partida','05_bosque_encantado','06_templo_arcano','07_ciudad_flotante','08_volcan_celestial'].map(file=>'./app/imagenes/tarjetas/'+file+'.webp'),
 ...['pawn','rook','knight','bishop','queen','king'].map(file=>'./assets/models/staunton/'+file+'.gltf')
];
const resources=new Set(resourcePaths.map(file=>new URL(file,document.baseURI).pathname));
const modelPaths=resourcePaths.filter(path=>path.endsWith('.gltf'));
const inFlight=new Map();
let cachePromise=null;
function openCache(){
 if(!('caches' in window))return Promise.resolve(null);
 if(!cachePromise)cachePromise=caches.open(CACHE_NAME).catch(()=>null);
 return cachePromise;
}
function checkedURL(path){
 const url=new URL(path,document.baseURI);
 if(url.origin!==location.origin || !resources.has(url.pathname))
  throw Error('Archivo no autorizado para caché público');
 return url.href;
}
async function getResource(path){
 const url=checkedURL(path);
 if(inFlight.has(url))return (await inFlight.get(url)).clone();
 const task=(async()=>{
  const cache=await openCache();
  const request=new Request(url,{credentials:'same-origin'});
  const previous=await cache?.match(request,{ignoreSearch:true}).catch(()=>null);
  if(previous)return previous;
  // CacheStorage persists across page visits, subject to browser storage eviction.
  const res=await fetch(request,{cache:'force-cache'});
  if(!res.ok||res.type==='opaque')throw Error('Recurso no disponible: '+new URL(url).pathname);
  if(cache){
   try{await cache.put(request,res.clone());}
   catch(error){/* Low storage/private mode: still return the valid online response. */}
  }
  return res;
 })();
 inFlight.set(url,task);
 try{return (await task).clone();}
 finally{inFlight.delete(url);}
}
async function cacheReport(paths=modelPaths){
 const cache=await openCache();
 let stored=0,bytes=0;
 if(cache){
  for(const path of paths){
   const response=await cache.match(checkedURL(path),{ignoreSearch:true}).catch(()=>null);
   if(response){
    stored++;
    const len=Number(response.headers.get('content-length'));
    if(Number.isFinite(len)&&len>0)bytes+=len;
   }
  }
 }
 return {stored,total:paths.length,bytes,available:Boolean(cache),persistent:await storageIsPersistent()};
}
async function storageIsPersistent(){
 try{return Boolean(await navigator.storage?.persisted?.());}
 catch(error){return false;}
}
function progress(details){window.dispatchEvent(new CustomEvent('eco:asset-progress',{detail:details}));}
async function preparePublicAssets({modelsOnly=false,force=false}={}){
 const paths=modelsOnly?modelPaths:resourcePaths;
 const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const saveData=Boolean(conn?.saveData||['slow-2g','2g'].includes(conn?.effectiveType));
 let done=0,cached=0,downloaded=0,failed=0;
 const total=paths.length;
 if(saveData&&!force){
  progress({done,total,cached,downloaded,failed,stage:'saving-data',modelsOnly});
  return {done,total,cached,downloaded,failed,skipped:true};
 }
 progress({done,total,cached,downloaded,failed,stage:'preparing',modelsOnly});
 let cursor=0;
 async function worker(){
  while(cursor<paths.length){
   const path=paths[cursor++];
   try{
    const before=await (await openCache())?.match(checkedURL(path),{ignoreSearch:true}).catch(()=>null);
    await getResource(path);
    if(before)cached++;else downloaded++;
   }catch(error){failed++;}
   done++;
   progress({done,total,cached,downloaded,failed,stage:done===total?'complete':'downloading',modelsOnly});
  }
 }
 await Promise.all([worker(),worker()]);
 const report=await cacheReport(modelPaths);
 window.dispatchEvent(new CustomEvent('eco:assets-ready',{detail:{total,cached,downloaded,failed,stored:report.stored,modelsOnly}}));
 return {done,total,cached,downloaded,failed,stored:report.stored};
}
async function requestPersistentStorage(){
 try{
  if(!navigator.storage?.persist)return false;
  return Boolean(await navigator.storage.persist());
 }catch(error){return false;}
}
// Shared global is installed synchronously before the main.js module loads; no duplicate GLTF GET.
window.ecoPublicAssets={
 getResource,cacheReport,preparePublicAssets,requestPersistentStorage,modelPaths,CACHE_NAME
};
if('serviceWorker' in navigator && location.protocol==='https:'){
 navigator.serviceWorker.register('./sw.js?v='+VERSION,{scope:'./',updateViaCache:'none'}).catch(()=>{});
}
// The intro begins while this same cache is populated in parallel (2 concurrent files).
setTimeout(()=>{preparePublicAssets().catch(()=>{});},120);
