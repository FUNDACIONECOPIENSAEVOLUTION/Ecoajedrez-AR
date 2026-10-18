// ECOAJEDREZ v0.14.6 - isolated, click-to-enter virtual 360° cubemap laboratory.
// Fix: a missing/stale Pages manifest is NOT proof that the six faces are absent.
// Fall back to HEAD checks of real published files. No chess mutations or rear camera.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {SKYBOX_REALMS,skyboxFaceUrls,findSkyboxRealm,SKYBOX_FACES} from './skybox-config.js?v=0.14.5';
const $=id=>document.getElementById(id);
const canvas=$('skyCanvas'),chooser=$('skyRealmSelect'),status=$('skyStatus');
const panel=$('skyMessage'),heading=$('skyMessageTitle'),explanation=$('skyMessageBody');
const upload=$('skyUpload'),gyroButton=$('skyGyro'),resetButton=$('skyReset');
const enterButton=$('skyEnter'),retryButton=$('skyRetry'),exitButton=$('skyExit');
const repository='https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR';
for(const realm of SKYBOX_REALMS){
 const option=document.createElement('option');option.value=realm.id;
 option.textContent=realm.label;chooser.appendChild(option);
}
const query=new URLSearchParams(location.search).get('reino');
chooser.value=findSkyboxRealm(query)?.id||SKYBOX_REALMS[0].id;
let renderer=null,scene=null,camera=null,renderPending=false,texture=null,loadToken=0;
let registry={},readyToEnter=false,gyroscope=false,yaw=0,pitch=0,drag=null;
function say(message){status.textContent=message;}
function showMessage(title,message){panel.hidden=false;heading.textContent=title;explanation.textContent=message;}
function repaint(){
 if(!renderer||document.hidden||renderPending)return;
 renderPending=true;
 requestAnimationFrame(()=>{renderPending=false;if(renderer&&!document.hidden)renderer.render(scene,camera);});
}
function resetView(){
 yaw=0;pitch=0;
 if(!gyroscope&&camera){camera.quaternion.identity();repaint();}
}
function resize(){
 if(!renderer||!camera)return;
 const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();repaint();
}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(75,1,.01,100);
 camera.position.set(0,0,0);camera.rotation.order='YXZ';
 resize();
 window.addEventListener('resize',resize);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)resize();});
}catch(error){
 showMessage('Visor 3D no disponible','No se pudo iniciar WebGL. Abre esta página en Chrome o Edge actualizado.');
 say('WebGL no disponible: '+(error?.message||String(error)));
}
async function loadManifest(){
 try{
  // Network fetch only: neither HTML nor manifest is part of the site's service-worker cache.
  const response=await fetch('./app/imagenes/skybox/manifest.json?v=0.14.6',{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  registry=(data&&data.realms&&typeof data.realms==='object')?data.realms:{};
 }catch(error){
  registry={}; // HEAD fallback is authoritative when Pages serves the raw branch.
 }
}
function unload(){
 if(texture){texture.dispose();texture=null;}
 if(scene)scene.background=null;
 exitButton.hidden=true;
 repaint();
}
async function probeFaces(id){
 const faces=skyboxFaceUrls(id);
 const results=await Promise.all(faces.map(async(url,i)=>{
  try{
   const response=await fetch(url,{method:'HEAD',cache:'no-store'});
   return {face:SKYBOX_FACES[i],ok:response.ok,status:response.status};
  }catch(error){
   return {face:SKYBOX_FACES[i],ok:null,status:null};
  }
 }));
 const missing=results.filter(x=>x.ok===false).map(x=>x.face);
 const unknown=results.filter(x=>x.ok===null).map(x=>x.face);
 return {ready:results.every(x=>x.ok===true),missing,unknown,
  present:results.filter(x=>x.ok===true).map(x=>x.face)};
}
async function prepareRealm({refresh=false}={}){
 const id=chooser.value,realm=findSkyboxRealm(id),token=++loadToken;
 if(!realm)return;
 unload();
 readyToEnter=false;enterButton.hidden=true;retryButton.hidden=false;
 upload.href=repository+'/upload/main/app/imagenes/skybox/'+id;
 upload.textContent='⬆ Subir caras a '+realm.label;
 showMessage('✧ '+realm.label,'Comprobando las seis caras publicadas del reino…');
 say('Verificando skybox '+realm.label+'…');
 if(refresh)await loadManifest();
 if(token!==loadToken)return;
 const fromManifest=registry[id];
 // If the manifest is stale, verify the actual files instead of declaring them missing.
 const checked=fromManifest?.ready?fromManifest:await probeFaces(id);
 if(token!==loadToken)return;
 if(checked?.ready){
  readyToEnter=true;enterButton.hidden=false;
  retryButton.hidden=true;
  showMessage('✦ '+realm.label,
   'Las seis caras están listas. Pulsa ENTRAR AL REINO para abrir el mundo inmersivo.');
  say('✓ 6/6 caras del reino detectadas. Pulsa ENTRAR AL REINO 360°.');
  return;
 }
 const missing=Array.isArray(checked?.missing)?checked.missing:[];
 const unknown=Array.isArray(checked?.unknown)?checked.unknown:[];
 const available=Array.isArray(checked?.present)?checked.present.length:0;
 if(unknown.length){
  showMessage('✧ '+realm.label,
   'No se pudieron verificar todas las imágenes por la red. Puedes reintentar cuando la conexión esté estable.');
  say('Comprobación incompleta: '+unknown.join(', ')+'.');
 }else{
  showMessage('✧ '+realm.label,
   'Todavía no están disponibles las seis caras desde la web: '+missing.map(f=>f+'.webp').join(', ')+'. Si acabas de subirlas, espera la publicación y pulsa Comprobar imágenes.');
  say('Caras disponibles: '+available+'/6. Reintenta después del despliegue de GitHub Pages.');
 }
}
function enterRealm(){
 if(!readyToEnter||!scene||!renderer)return;
 const realm=findSkyboxRealm(chooser.value),id=realm?.id;
 if(!id)return;
 const token=++loadToken;
 readyToEnter=false;
 enterButton.hidden=true;
 retryButton.hidden=true;
 showMessage('Invocando '+realm.label,'Descargando y uniendo las seis caras…');
 say('Entrando al reino '+realm.label+'…');
 // CubeTextureLoader order: +X, -X, +Y, -Y, +Z, -Z; real WebP faces.
 const loadedTexture=new THREE.CubeTextureLoader().load(skyboxFaceUrls(id),
  loaded=>{
   if(token!==loadToken){loaded.dispose();return;}
   texture=loaded;loaded.colorSpace=THREE.SRGBColorSpace;loaded.needsUpdate=true;
   scene.background=loaded;resetView();
   panel.hidden=true;exitButton.hidden=false;
   say('✓ Dentro de '+realm.label+' · gira con el dedo o activa los sensores del teléfono.');
   repaint();
  },undefined,error=>{
   if(token!==loadToken)return;
   loadedTexture.dispose();
   enterButton.hidden=false;readyToEnter=true;retryButton.hidden=false;
   showMessage('Error al entrar al reino',
    'Las seis imágenes no se pudieron abrir. Comprueba tu conexión y vuelve a intentarlo.');
   say('No se pudo cargar el cubo. Pulsa ENTRAR AL REINO para reintentar.');
  });
 loadedTexture.colorSpace=THREE.SRGBColorSpace;
}
function exitRealm(){
 ++loadToken;unload();resetView();
 prepareRealm();
}
chooser.addEventListener('change',()=>{
 const url=new URL(location.href);url.searchParams.set('reino',chooser.value);
 history.replaceState(null,'',url);
 prepareRealm();
});
enterButton.addEventListener('click',enterRealm);
retryButton.addEventListener('click',()=>prepareRealm({refresh:true}));
exitButton.addEventListener('click',exitRealm);
canvas.addEventListener('pointerdown',event=>{
 if(!renderer||!scene.background||gyroscope)return;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY};
 try{canvas.setPointerCapture(event.pointerId);}catch(error){}
});
canvas.addEventListener('pointermove',event=>{
 if(!drag||drag.id!==event.pointerId||gyroscope||!camera)return;
 const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
 drag.x=event.clientX;drag.y=event.clientY;
 yaw-=dx*.0045;
 pitch=Math.max(-Math.PI/2+.02,Math.min(Math.PI/2-.02,pitch-dy*.0045));
 camera.rotation.set(pitch,yaw,0,'YXZ');repaint();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])
 canvas.addEventListener(event,()=>{drag=null;});
resetButton.addEventListener('click',resetView);
const euler=new THREE.Euler(),axis=new THREE.Vector3(0,0,1);
const q0=new THREE.Quaternion(),q1=new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5)),rad=Math.PI/180;
function onDeviceOrientation(event){
 if(!gyroscope||!camera||event.alpha==null||event.beta==null||event.gamma==null)return;
 const orient=(screen.orientation?.angle||window.orientation||0)*rad;
 euler.set(event.beta*rad,event.alpha*rad,-event.gamma*rad,'YXZ');
 camera.quaternion.setFromEuler(euler).multiply(q1).multiply(q0.setFromAxisAngle(axis,-orient));
 repaint();
}
gyroButton.addEventListener('click',async()=>{
 if(gyroscope){
  gyroscope=false;window.removeEventListener('deviceorientation',onDeviceOrientation);
  gyroButton.setAttribute('aria-pressed','false');gyroButton.textContent='◉ Girar con teléfono';
  resetView();say('Vista táctil activada: arrastra para girar.');
  return;
 }
 if(!('DeviceOrientationEvent' in window)){
  say('Este dispositivo no ofrece sensores de orientación; usa el dedo para mirar.');
  return;
 }
 try{
  if(typeof DeviceOrientationEvent.requestPermission==='function'){
   const permission=await DeviceOrientationEvent.requestPermission();
   if(permission!=='granted')throw Error('Permiso de movimiento denegado');
  }
  gyroscope=true;gyroButton.setAttribute('aria-pressed','true');
  gyroButton.textContent='◉ Desactivar sensores';
  window.addEventListener('deviceorientation',onDeviceOrientation,{passive:true});
  say('Sensores activados. Gira el teléfono para mirar dentro del reino.');
 }catch(error){say('No se activaron sensores: '+(error?.message||String(error)));}
});
loadManifest().then(()=>prepareRealm());
