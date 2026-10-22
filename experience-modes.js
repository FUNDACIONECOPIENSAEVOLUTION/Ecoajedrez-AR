// ECOAJEDREZ - the opponent and the viewing experience are independent choices.
import {realmForBoard,skyboxFaceUrls} from './skybox-config.js?v=0.14.5';
export const EXPERIENCES=Object.freeze([
 {id:'normal',label:'3D CLÁSICO',description:'Juega con tu tablero y el paisaje del reino.'},
 {id:'skybox',label:'REINO 360°',description:'Juega dentro del mundo cúbico y mira alrededor.'},
 {id:'ar',label:'AR CON PORTAL',description:'Fija el tablero sobre el suelo o una mesa reales y muestra un portal mágico.'}
]);
export const validExperience=value=>EXPERIENCES.some(x=>x.id===value)?value:'normal';
export const linkedRealm=boardId=>realmForBoard(boardId);
export const gameRealmName=boardId=>realmForBoard(boardId)?.label||'Reino clásico';
export async function checkSkybox(boardId){
 const realm=realmForBoard(boardId);
 if(!realm)return {ready:false,reason:'Selecciona uno de los 13 tableros mágicos para entrar a un reino 360°.',realm:null};
 // A cached manifest can lag behind the real published images. Probe six faces
 // before entering the scene, even when the manifest still says "ready".
 try{
  const urls=skyboxFaceUrls(realm.id);
  const statuses=await Promise.all(urls.map(async url=>{
   const result=await fetch(url,{method:'HEAD',cache:'no-store'});
   return result.status===405?fetch(url,{cache:'force-cache'}):result;
  }));
  const missing=statuses.map((x,i)=>x.ok?null:urls[i].split('/').at(-1)).filter(Boolean);
  return missing.length===0?{ready:true,realm}:
   {ready:false,realm,reason:'Faltan '+missing.length+' caras WebP del reino '+realm.label+': '+missing.join(', ')+'.'};
 }catch(e){
  return {ready:false,realm,reason:'No fue posible verificar las seis imágenes del reino 360°. Revisa la conexión y vuelve a intentarlo.'};
 }
}
