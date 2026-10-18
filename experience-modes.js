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
 try{
  const result=await fetch('./app/imagenes/skybox/manifest.json?v=0.14.8',{cache:'no-store'});
  if(result.ok){
   const data=await result.json(),entry=data?.realms?.[realm.id];
   if(entry?.ready)return {ready:true,realm};
   if(Array.isArray(entry?.missing)&&entry.missing.length){
    // Manifest may be stale during a fresh GitHub Pages publication. Check real faces below.
   }else if(entry?.reason)return {ready:false,realm,reason:entry.reason};
  }
 }catch(e){}
 try{
  const urls=skyboxFaceUrls(realm.id);
  const statuses=await Promise.all(urls.map(url=>fetch(url,{method:'HEAD',cache:'no-store'})));
  const missing=statuses.map((x,i)=>x.ok?null:urls[i].split('/').at(-1)).filter(Boolean);
  return missing.length===0?{ready:true,realm}:
   {ready:false,realm,reason:'Faltan '+missing.length+' caras WebP del reino '+realm.label+': '+missing.join(', ')+'.'};
 }catch(e){
  return {ready:false,realm,reason:'Sin conexión para verificar el reino. Conéctate a Internet y vuelve a intentarlo.'};
 }
}
