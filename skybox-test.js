// ECOAJEDREZ skybox laboratory. The chessboard, gameplay and AR are untouched.
// Three.js renders a cubemap as the environment of a camera at the origin.
// This is rotational 3DoF 360° viewing, NOT six-degrees-of-freedom walking.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {SKYBOX_REALMS,skyboxFaceUrls,findSkyboxRealm} from './skybox-config.js?v=0.14.5';
const $=id=>document.getElementById(id);
const canvas=$('skyCanvas'),chooser=$('skyRealmSelect'),status=$('skyStatus');
const panel=$('skyMessage'),heading=$('skyMessageTitle'),explanation=$('skyMessageBody');
const upload=$('skyUpload'),gyroButton=$('skyGyro'),resetButton=$('skyReset');
const repository='https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR';
for(const realm of SKYBOX_REALMS){
 const option=document.createElement('option');option.value=realm.id;
 option.textContent=realm.label;chooser.appendChild(option);
}
const query=new URLSearchParams(location.search).get('reino');
chooser.value=findSkyboxRealm(query)?.id||SKYBOX_REALMS[0].id;
let renderer=null,scene=null,camera=null;
let renderPending=false,activeTexture=null,loadingToken=0,registry=null,gyroscope=false;
let yaw=0,pitch=0,drag=null;
function say(text){status.textContent=text;}
function showMessage(title,body){panel.hidden=false;heading.textContent=title;explanation.textContent=body;}
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
 const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
 renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();repaint();
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
 showMessage('Visor 3D no disponible','Tu navegador no ha permitido WebGL. Prueba Chrome o Edge actualizado.');
 say('No se pudo crear el visor WebGL: '+(error?.message||String(error)));
}
async function readManifest(){
 try{
  const response=await fetch('./app/imagenes/skybox/manifest.json?v=0.14.5',{cache:'no-store'});
  if(!response.ok)throw Error('Manifest no disponible');
  const data=await response.json();
  return data&&typeof data.realms==='object'?data.realms:{};
 }catch(error){say('Aún no hay manifiesto publicado; comprueba GitHub Actions.');return {};}
}
function unload(){
 if(activeTexture){activeTexture.dispose();activeTexture=null;}
 if(scene)scene.background=null;
 repaint();
}
function loadRealm(){
 const id=chooser.value,realm=findSkyboxRealm(id);
 const token=++loadingToken;unload();
 if(!realm)return;
 const gitFolder=repository+'/upload/main/app/imagenes/skybox/'+realm.id;
 upload.href=gitFolder;upload.textContent='⬆ Subir caras a '+realm.label;
 const entry=registry?.[id];
 const missing=Array.isArray(entry?.missing)?entry.missing:['px','nx','py','ny','pz','nz'];
 if(!entry?.ready){
  const reason=entry?.reason||'Faltan '+missing.length+' de las seis caras: '+missing.map(f=>f+'.webp').join(', ');
  showMessage('✧ '+realm.label,'Skybox pendiente. '+reason);
  say('Pendiente ('+(entry?.present?.length||0)+'/6): '+realm.label);
  return;
 }
 if(!renderer)return;
 showMessage('Invocando '+realm.label,'Descargando seis caras del reino…');
 say('Preparando cubemap '+entry.resolution+' × '+entry.resolution+' por cara; puede tardar unos segundos.');
 // CubeTextureLoader order: +X, -X, +Y, -Y, +Z, -Z. Six square faces, same size.
 const texture=new THREE.CubeTextureLoader().load(skyboxFaceUrls(id),
  loaded=>{
   if(token!==loadingToken){loaded.dispose();return;}
   activeTexture=loaded;
   loaded.colorSpace=THREE.SRGBColorSpace;
   loaded.needsUpdate=true;
   scene.background=loaded;
   panel.hidden=true;
   say('✓ '+realm.label+' · 6/6 caras · 360° listo. Arrastra para mirar alrededor o activa sensores.');
   repaint();
  },undefined,error=>{
   if(token!==loadingToken)return;
   texture.dispose();
   showMessage('Error al abrir el reino','No se pudieron decodificar las seis caras. Revisa WebP y las rutas publicadas.');
   say('Error de carga. Consulta la publicación en GitHub Actions.');
  });
 texture.colorSpace=THREE.SRGBColorSpace;
}
chooser.addEventListener('change',()=>{
 const url=new URL(location.href);url.searchParams.set('reino',chooser.value);
 history.replaceState(null,'',url);
 loadRealm();
});
canvas.addEventListener('pointerdown',event=>{
 if(!renderer||!scene.background||gyroscope)return;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY};
 try{canvas.setPointerCapture(event.pointerId);}catch{}
});
canvas.addEventListener('pointermove',event=>{
 if(!drag||drag.id!==event.pointerId||gyroscope)return;
 const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
 drag.x=event.clientX;drag.y=event.clientY;
 yaw-=dx*.0045;
 pitch=Math.max(-Math.PI/2+.02,Math.min(Math.PI/2-.02,pitch-dy*.0045));
 camera.rotation.set(pitch,yaw,0,'YXZ');repaint();
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])
 canvas.addEventListener(name,()=>{drag=null;});
resetButton.addEventListener('click',resetView);
const euler=new THREE.Euler(),axis=new THREE.Vector3(0,0,1);
const q0=new THREE.Quaternion(),q1=new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5));
const rad=Math.PI/180;
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
  resetView();say('Vista táctil activada; arrastra para girar.');
  return;
 }
 if(!('DeviceOrientationEvent' in window)){
  say('Este dispositivo/navegador no tiene orientación por sensores. Utiliza arrastre táctil.');
  return;
 }
 try{
  if(typeof DeviceOrientationEvent.requestPermission==='function'){
   const permission=await DeviceOrientationEvent.requestPermission();
   if(permission!=='granted')throw Error('Permiso de movimiento denegado');
  }
  gyroscope=true;
  gyroButton.setAttribute('aria-pressed','true');gyroButton.textContent='◉ Desactivar sensores';
  window.addEventListener('deviceorientation',onDeviceOrientation,{passive:true});
  say('Sensores activados. Gira el teléfono para explorar el cubo 360°.');
 }catch(error){say('No se activó la orientación: '+(error?.message||'Permiso no disponible'));}
});
readManifest().then(data=>{registry=data;loadRealm();});
