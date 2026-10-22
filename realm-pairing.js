import {realmForBoard} from './skybox-config.js?v=0.16.2';
// ECOAJEDREZ v0.16.2 · Official realm pairings for user-uploaded WebP artwork.
// 13 playable boards share 10 available 3D kingdoms; optional dedicated backgrounds
// override the fallback as the owner uploads them. No renaming or image duplication.
export const BOARD_REALM_THEMES={
 "alquimia": "neon",
 "celta": "jungle",
 "cyber": "neon",
 "cosmos": "neon",
 "amatista": "neon",
 "dorado": "marble",
 "atlantis": "marble",
 "hielo": "ice",
 "lava": "volcano",
 "egipto": "marble",
 "gotico": "classic",
 "cristales": "ice",
 "steampunk": "wood"
};
export const BOARD_REALM_IMAGES={
 "alquimia": "02_entorno_magico_fantasia_ancestral.webp",
 "celta": "04_entorno_celta_bosque_encantado.webp",
 "cyber": "10_entorno_cyberpunk_sintetico.webp",
 "cosmos": "01_entorno_galactico_cosmico.webp",
 "amatista": "01_entorno_galactico_cosmico.webp",
 "dorado": "03_entorno_medieval_leyenda_fantasia.webp",
 "atlantis": "08_entorno_atlante_submarino.webp",
 "hielo": "06_entorno_glacial_reino_de_hielo.webp",
 "lava": "05_entorno_volcanico_inframundo.webp",
 "egipto": "09_entorno_egipcio_faraonico.webp",
 "gotico": "03_entorno_medieval_leyenda_fantasia.webp",
 "cristales": "02_entorno_magico_fantasia_ancestral.webp",
 "steampunk": "07_entorno_steampunk_mecanico.webp"
};
// Three realms have complete 360° artwork, but no dedicated flat backdrop.
// Use the existing front cube face instead of mislabelling a different kingdom.
export const REALM_SKYBOX_FALLBACK=Object.freeze({
  alquimia:'alquimista_eter',
  amatista:'espejo_vacio',
  gotico:'nigromante_gotico'
});
export const REALM_DIR='./app/imagenes/entornos/';
export const realmTheme=id=>BOARD_REALM_THEMES[id]||null;
export const realmCandidates=id=>BOARD_REALM_IMAGES[id]?
 ['entorno_'+id+'.webp',BOARD_REALM_IMAGES[id]]:[];
export const realmURL=id=>BOARD_REALM_IMAGES[id]?REALM_DIR+BOARD_REALM_IMAGES[id]:null;
let publishedPromise=null;
export function publishedRealms(){
 if(!publishedPromise)publishedPromise=fetch(REALM_DIR+'manifest.json?v=0.16.1',{cache:'no-store'})
  .then(r=>r.ok?r.json():{available:[]})
  .then(data=>new Set((Array.isArray(data.available)?data.available:[])
    .filter(file=>Object.values(BOARD_REALM_IMAGES).includes(file)||
      Object.keys(BOARD_REALM_IMAGES).some(id=>file==='entorno_'+id+'.webp'))))
  .catch(()=>new Set());
 return publishedPromise;
}
// Each board is a fixed pair: its existing flat artwork or the FRONT of
// its OWN 360° kingdom. Never display an unrelated kingdom as the fallback.
export function realmImageCandidates(id){
 const realm=realmForBoard(id);
 if(!realm||!realmTheme(id))return [];
 const ownFront='./app/imagenes/skybox/'+realm.id+'/pz.webp';
 // The three later-created realms do NOT have a unique flat WebP yet.
 // Prefer their distinct 360° artwork over another kingdom's shared image.
 if(REALM_SKYBOX_FALLBACK[id])return [ownFront];
 const flat=BOARD_REALM_IMAGES[id];
 return [...new Set([REALM_DIR+encodeURIComponent(flat),ownFront])];
}

// A previous HEAD request could fail while an image GET worked on GitHub
// Pages/mobile caches. Test the actual <img> decode path instead.
const imageURLs=new Map();
function canRenderImage(url){
 return new Promise(resolve=>{
  const probe=new Image();
  let ended=false;
  const finish=value=>{
   if(ended)return;ended=true;
   clearTimeout(timeout);probe.onload=null;probe.onerror=null;
   resolve(value);
  };
  const timeout=setTimeout(()=>finish(false),12000);
  probe.onload=()=>finish(probe.naturalWidth>0);
  probe.onerror=()=>finish(false);
  probe.src=url;
  if(probe.complete&&probe.naturalWidth>0)finish(true);
 });
}
export async function publishedRealmURL(id){
 if(!realmTheme(id))return null;
 if(imageURLs.has(id))return imageURLs.get(id);
 const work=(async()=>{
  for(const url of realmImageCandidates(id)){
   if(await canRenderImage(url))return url;
  }
  return null;
 })();
 imageURLs.set(id,work);
 const result=await work;
 if(!result)imageURLs.delete(id); // Allow recovery after failed network loads.
 return result;
}
