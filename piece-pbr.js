// ECOAJEDREZ PBR: optional CC0 image maps hosted on the same GitHub Pages origin.
// Never hotlink a third-party CDN at game time; keeps player privacy/offline fallback.
export const PBR_ROOT='./assets/texturas-pbr';
const manifestCache={value:null,promise:null};
const textureSets=new Map(),pending=new Map();
export async function readPBRManifest(){
 if(manifestCache.value)return manifestCache.value;
 if(manifestCache.promise)return manifestCache.promise;
 manifestCache.promise=(async()=>{
  try{
   const response=await fetch(PBR_ROOT+'/manifest.json',{cache:'no-store'});
   if(!response.ok)return {materials:{}};
   const doc=await response.json();
   return doc?.version===1&&doc?.materials&&typeof doc.materials==='object'?doc:{materials:{}};
  }catch(error){return {materials:{}};}
 })();
 try{return manifestCache.value=await manifestCache.promise;}
 finally{manifestCache.promise=null;}
}
function textureOptions(THREE,tex,role){
 if(!tex)return null;
 tex.colorSpace=role==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.anisotropy=2;
 return tex;
}
function getTexture(THREE,filename,role){
 return new Promise((resolve,reject)=>{
  const loader=new THREE.TextureLoader();
  // Manifest names were checked and whitelisted by the Pages build.
  loader.load(PBR_ROOT+'/'+filename,t=>resolve(textureOptions(THREE,t,role)),undefined,reject);
 });
}
export async function loadPhotoPBR(THREE,key){
 if(textureSets.has(key))return textureSets.get(key);
 if(pending.has(key))return pending.get(key);
 const task=(async()=>{
  const manifest=await readPBRManifest(),files=manifest.materials?.[key];
  if(!files?.color)return null;
  const valid=(role,value)=>typeof value==='string'&&
   new RegExp('^'+key+'/'+role+'\\.(jpg|webp|png)$').test(value);
  if(!valid('color',files.color))return null;
  try{
   const result={};
   // The color is required; PBR normals and roughness may be absent.
   result.color=await getTexture(THREE,files.color,'color');
   await Promise.all(['normal','roughness','metalness'].map(async role=>{
    if(!valid(role,files[role]))return;
    try{result[role]=await getTexture(THREE,files[role],role);}
    catch(error){console.warn('Mapa PBR opcional no disponible:',key,role);}
   }));
   textureSets.set(key,result);
   return result;
  }catch(error){
   console.warn('Usando acabado anterior; no se cargó la fotografía PBR:',key,error);
   return null;
  }
 })();
 pending.set(key,task);
 try{return await task;}finally{pending.delete(key);}
}
export function getPhotoPBR(key){return textureSets.get(key)||null;}
export function pbrTextureLoaded(key){return textureSets.has(key);}
