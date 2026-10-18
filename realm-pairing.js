// ECOAJEDREZ 0.14.3 - fixed owner-uploaded realm / board pairing (3D only).
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
export const REALM_DIR='./app/imagenes/entornos/';
export const realmTheme=id=>BOARD_REALM_THEMES[id]||null;
export const realmURL=id=>realmTheme(id)?REALM_DIR+'entorno_'+id+'.webp':null;
let publishedPromise=null;
export function publishedRealms(){
 if(!publishedPromise)publishedPromise=fetch(REALM_DIR+'manifest.json?v=0.14.3',{cache:'no-store'})
  .then(r=>r.ok?r.json():{available:[]})
  .then(data=>new Set((Array.isArray(data.available)?data.available:[])
   .filter(file=>/^entorno_[a-z]+\.webp$/.test(file)&&realmTheme(file.slice(8,-5)))))
  .catch(()=>new Set());
 return publishedPromise;
}
export async function publishedRealmURL(id){
 const uri=realmURL(id);
 if(!uri)return null;
 return (await publishedRealms()).has(uri.split('/').at(-1))?uri:null;
}
