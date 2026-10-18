// ECOAJEDREZ 0.14.7 - Optional 360 kingdom mode inside the EXISTING chess game.
// A fixed 3D chessboard in a virtual cubemap. Never changes chess rules or AR.
import {realmForBoard,skyboxFaceUrls,SKYBOX_FACES} from './skybox-config.js?v=0.14.5';
export function createImmersiveChess({THREE,scene,camera,orbit,canvas,getBoardId,onInfo=()=>{},getInteractivePiece=()=>false}){
 const $=id=>document.getElementById(id);
 const mini=$('realmMiniControls'),showControls=$('realmHudButton');
 const focusButton=$('realmFocusButton'),exitButton=$('realmExitButton'),gyroButton=$('realmGyroButton');
 let active=false,background=null,pending=0,drag=null,gyro=false;
 let saved=null,pitch=0,yaw=0;
 const q0=new THREE.Quaternion(),worldZ=new THREE.Vector3(0,0,1);
 const sensorFix=new THREE.Quaternion(-Math.SQRT1_2,0,0,Math.SQRT1_2);
 const orientEuler=new THREE.Euler();
 let lastError='';
 const floor=new THREE.Mesh(
  new THREE.CircleGeometry(7.2,80),
  new THREE.MeshBasicMaterial({color:0x172c43,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide})
 );
 floor.rotation.x=-Math.PI/2;floor.position.y=-.415;floor.visible=false;
 floor.raycast=()=>{};scene.add(floor);
 function hideSensor(){
  if(!gyro)return;
  gyro=false;window.removeEventListener('deviceorientation',onOrientation);
  gyroButton.setAttribute('aria-pressed','false');gyroButton.textContent='◉ Sensores';
 }
 function focus(){
  if(!active)return;
  if(gyro)hideSensor();
  camera.position.set(0,4.2,11.8);
  camera.up.set(0,1,0);
  camera.lookAt(0,.1,0);
  camera.rotation.order='YXZ';
  pitch=camera.rotation.x;yaw=camera.rotation.y;
 }
 function showUI(visible){
  if(!active)return;
  document.body.classList.toggle('realm-hud-hidden',!visible);
  showControls.textContent=visible?'✕ Ocultar menú':'☰ Mostrar menú';
  showControls.setAttribute('aria-expanded',String(visible));
 }
 function restore(){
  if(!saved)return;
  camera.fov=saved.fov;camera.position.copy(saved.position);
  camera.quaternion.copy(saved.quaternion);camera.up.copy(saved.up);
  camera.updateProjectionMatrix();
  orbit.target.copy(saved.target);orbit.enabled=true;orbit.update();
  saved=null;
 }
 function exit(){
  ++pending;hideSensor();drag=null;active=false;
  document.body.classList.remove('realm-active','realm-hud-hidden');
  mini.hidden=true;floor.visible=false;
  if(background){background.dispose();background=null;}
  scene.background=null;restore();
 }
 async function ready(realm){
  const root='./app/imagenes/skybox/';
  try{
   const res=await fetch(root+'manifest.json?v=0.14.7',{cache:'no-store'});
   if(res.ok){const data=await res.json();if(data?.realms?.[realm.id]?.ready)return true;}
  }catch(error){}
  const urls=skyboxFaceUrls(realm.id);
  try{const list=await Promise.all(urls.map(url=>fetch(url,{method:'HEAD',cache:'no-store'})));return list.every(r=>r.ok);}
  catch(error){return false;}
 }
 async function enter(){
  const realm=realmForBoard(getBoardId());
  if(!realm){onInfo('Elige primero uno de los 13 tableros mágicos en Configuración.');return false;}
  if(active)exit();
  const token=++pending;
  onInfo('✦ Buscando el reino '+realm.label+'…');
  if(!await ready(realm)||token!==pending){
   if(token===pending)onInfo('Skybox pendiente: sube las seis caras de '+realm.label+' y espera GitHub Pages.');
   return false;
  }
  return new Promise(resolve=>{
   const map=new THREE.CubeTextureLoader().load(skyboxFaceUrls(realm.id),
   texture=>{
    if(token!==pending){texture.dispose();resolve(false);return;}
    background=texture;background.colorSpace=THREE.SRGBColorSpace;
    background.needsUpdate=true;
    saved={position:camera.position.clone(),quaternion:camera.quaternion.clone(),
     target:orbit.target.clone(),fov:camera.fov,up:camera.up.clone()};
    orbit.enabled=false;
    active=true;
    camera.fov=70;camera.updateProjectionMatrix();
    focus();
    scene.background=background;floor.visible=true;
    document.body.classList.add('realm-active');
    mini.hidden=false;showUI(false);
    onInfo('✦ Reino abierto. El tablero permanece en el suelo; gira para explorar y vuelve con ⊕ Tablero.');
    resolve(true);
   },undefined,()=>{
    if(token===pending)onInfo('Error al cargar las seis caras del reino. Comprueba tu conexión.');
    resolve(false);
   });
  });
 }
 function onOrientation(event){
  if(!active||!gyro||event.alpha==null||event.beta==null||event.gamma==null)return;
  const rad=Math.PI/180;
  const screenAngle=(screen.orientation?.angle||window.orientation||0)*rad;
  orientEuler.set(event.beta*rad,event.alpha*rad,-event.gamma*rad,'YXZ');
  camera.quaternion.setFromEuler(orientEuler).multiply(sensorFix)
   .multiply(q0.setFromAxisAngle(worldZ,-screenAngle));
 }
 async function toggleGyro(){
  if(!active)return;
  if(gyro){hideSensor();focus();return;}
  if(!('DeviceOrientationEvent' in window)){onInfo('Sensores no disponibles: arrastra sobre el entorno para mirar.');return;}
  try{
   if(typeof DeviceOrientationEvent.requestPermission==='function' &&
      await DeviceOrientationEvent.requestPermission()!=='granted')throw Error('permiso denegado');
   gyro=true;gyroButton.setAttribute('aria-pressed','true');
   gyroButton.textContent='◉ Desactivar sensores';
   window.addEventListener('deviceorientation',onOrientation,{passive:true});
   onInfo('Sensores activados. Gira el teléfono; el tablero queda en su lugar.');
  }catch(err){onInfo('No se pudieron activar sensores: '+(err.message||String(err)));}
 }
 function isPanGesture(){
  return Boolean(active&&drag&&drag.distance>12);
 }
 canvas.addEventListener('pointerdown',event=>{
  if(!active||gyro||event.button===2||getInteractivePiece(event.clientX,event.clientY))return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0};
 });
 canvas.addEventListener('pointermove',event=>{
  if(!active||gyro||!drag||drag.id!==event.pointerId)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  drag.x=event.clientX;drag.y=event.clientY;
  drag.distance+=Math.hypot(dx,dy);
  if(drag.distance<=12)return;
  yaw-=dx*.0045;
  pitch=Math.max(-Math.PI/2+.03,Math.min(Math.PI/2-.03,pitch-dy*.0045));
  camera.rotation.set(pitch,yaw,0,'YXZ');
 });
 canvas.addEventListener('pointerup',()=>{drag=null;});
 canvas.addEventListener('pointercancel',()=>{drag=null;});
 showControls.addEventListener('click',()=>showUI(document.body.classList.contains('realm-hud-hidden')));
 focusButton.addEventListener('click',focus);
 exitButton.addEventListener('click',()=>{exit();onInfo('Has salido del reino 360°. La partida continúa.');});
 gyroButton.addEventListener('click',toggleGyro);
 return {enter,exit,active:()=>active,isPanGesture,focus,showUI};
}
