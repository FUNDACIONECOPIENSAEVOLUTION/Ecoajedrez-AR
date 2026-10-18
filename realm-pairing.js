// ECOAJEDREZ v0.14.4 · Official realm pairings for user-uploaded WebP artwork.
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
export const REALM_DIR='./app/imagenes/entornos/';
export const realmTheme=id=>BOARD_REALM_THEMES[id]||null;
export const realmCandidates=id=>BOARD_REALM_IMAGES[id]?
 ['entorno_'+id+'.webp',BOARD_REALM_IMAGES[id]]:[];
export const realmURL=id=>BOARD_REALM_IMAGES[id]?REALM_DIR+BOARD_REALM_IMAGES[id]:null;
let publishedPromise=null;
export function publishedRealms(){
 if(!publishedPromise)publishedPromise=fetch(REALM_DIR+'manifest.json?v=0.14.4',{cache:'no-store'})
  .then(r=>r.ok?r.json():{available:[]})
  .then(data=>new Set((Array.isArray(data.available)?data.available:[])
    .filter(file=>Object.values(BOARD_REALM_IMAGES).includes(file)||
      Object.keys(BOARD_REALM_IMAGES).some(id=>file==='entorno_'+id+'.webp'))))
  .catch(()=>new Set());
 return publishedPromise;
}
export async function publishedRealmURL(id){
 if(!realmTheme(id))return null;
 const available=await publishedRealms();
 for(const file of realmCandidates(id))if(available.has(file))return REALM_DIR+file;
 return null;
}
