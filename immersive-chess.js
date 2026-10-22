// ECOAJEDREZ 0.15.1: close-up, overhead and 360 free look on the SAME playable chessboard.
// Touch piece + destination continues to use main.js/chess.js, not a second chess engine.
import {realmForBoard,skyboxFaceUrls} from './skybox-config.js?v=0.14.5';
export function createImmersiveChess({THREE,scene,camera,orbit,canvas,decorations,getBoardId,onInfo=()=>{},getInteractivePiece=()=>false}){
 const $=id=>document.getElementById(id);
 const mini=$('realmMiniControls'),showControls=$('realmHudButton');
 const focusButton=$('realmFocusButton'),topButton=$('realmTopButton');
 const closer=$('realmZoomIn'),farther=$('realmZoomOut');
 const higher=$('realmCameraUp'),lower=$('realmCameraDown');
 const exitButton=$('realmExitButton'),gyroButton=$('realmGyroButton');
 const hint=$('realmPlayStatus'),turn=$('realmTurnMini'),moves=$('realmMovesMini');
 let active=false,background=null,pending=0,drag=null,gyro=false,saved=null;
 let pitch=0,yaw=0,gestureSuppressed=false,pinchDistance=0,decorationVisibility=null;
 const pointers=new Map(),target=new THREE.Vector3(0,.05,0);
 const q0=new THREE.Quaternion(),worldZ=new THREE.Vector3(0,0,1);
 const sensorFix=new THREE.Quaternion(-Math.SQRT1_2,0,0,Math.SQRT1_2);
 const orientEuler=new THREE.Euler();
 const floor=new THREE.Mesh(
  new THREE.CircleGeometry(7.2,80),
  new THREE.MeshBasicMaterial({color:0x172c43,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide})
 );
 floor.rotation.x=-Math.PI/2;floor.position.y=-.415;floor.visible=false;
 floor.raycast=()=>{};scene.add(floor);
 const clamp=(number,min,max)=>Math.min(max,Math.max(min,number));
 function refreshStatus(){
  if(!active)return;
  turn.textContent=$('status')?.textContent||'Partida en curso';
  moves.textContent='Jugadas: '+($('history')?.textContent||'—');
 }
 function hideSensor(){
  if(!gyro)return;
  gyro=false;window.removeEventListener('deviceorientation',onOrientation);
  gyroButton.setAttribute('aria-pressed','false');gyroButton.textContent='◉ Sensores';
 }
 function pointAtBoard(){
  camera.up.set(0,1,0);
  camera.lookAt(0,.1,0);
  camera.rotation.order='YXZ';pitch=camera.rotation.x;yaw=camera.rotation.y;
 }
 function focus(){
  if(!active)return;
  hideSensor();
  const portrait=camera.aspect<.85;
  camera.fov=portrait?74:54;
  camera.updateProjectionMatrix();
  // Perspective view from the near edge of the board; no more tiny distant chessboard.
  camera.position.set(0,portrait?10.1:6.5,portrait?12.5:7.3);
  pointAtBoard();
  onInfo('♟ Vista de juego: toca una pieza y su casilla de destino. Acércate con + o pellizca la pantalla.');
 }
 function overhead(){
  if(!active)return;
  hideSensor();
  const portrait=camera.aspect<.85;
  camera.fov=portrait?70:50;camera.updateProjectionMatrix();
  camera.position.set(0,portrait?13:11.5,.025);
  pointAtBoard();
  onInfo('♟ Vista superior: selecciona una pieza y toca su destino. Usa + o − para ajustar.');
 }
 function zoom(factor){
  if(!active)return;
  // Dolly toward board center, independent of the direction the player is looking.
  const diff=camera.position.clone().sub(target);
  const d=diff.length();
  if(d<.001)return;
  const next=clamp(d*factor,5.2,26);
  camera.position.copy(target).add(diff.multiplyScalar(next/d));
 }
 function changeElevation(delta){
  if(!active)return;
  // Elevation is a deliberate camera movement, not a gyro-detected translation.
  // Never allow the virtual view below the chessboard or far beyond the play arena.
  hideSensor();
  camera.position.y=clamp(camera.position.y+delta,2.2,18);
  pointAtBoard();
  onInfo('Altura de cámara ajustada. El tablero y las piezas siguen fijos.');
 }
 function showUI(visible){
  if(!active)return;
  document.body.classList.toggle('realm-hud-hidden',!visible);
  showControls.textContent=visible?'✕ Ocultar menú':'☰ Mostrar menú';
  showControls.setAttribute('aria-expanded',String(visible));
  refreshStatus();
 }
 function restore(){
  if(!saved)return;
  camera.fov=saved.fov;camera.position.copy(saved.position);
  camera.quaternion.copy(saved.quaternion);camera.up.copy(saved.up);
  camera.updateProjectionMatrix();
  orbit.target.copy(saved.target);orbit.enabled=saved.orbitEnabled;orbit.update();
  canvas.style.touchAction=saved.touchAction;
  if(decorations&&decorationVisibility!==null)decorations.visible=decorationVisibility;
  decorationVisibility=null;saved=null;
 }
 function exit(){
  ++pending;hideSensor();drag=null;pointers.clear();gestureSuppressed=false;pinchDistance=0;active=false;
  document.body.classList.remove('realm-active','realm-hud-hidden');
  mini.hidden=true;hint.hidden=true;floor.visible=false;
  if(background){background.dispose();background=null;}
  scene.background=null;restore();
 }
 async function ready(realm){
  const root='./app/imagenes/skybox/';
  try{
   const res=await fetch(root+'manifest.json?v=0.15.1',{cache:'no-store'});
   if(res.ok){const data=await res.json();if(data?.realms?.[realm.id]?.ready)return true;}
  }catch(error){}
  try{
   const list=await Promise.all(skyboxFaceUrls(realm.id).map(url=>fetch(url,{method:'HEAD',cache:'no-store'})));
   return list.every(r=>r.ok);
  }catch(error){return false;}
 }
 async function enter(){
  const realm=realmForBoard(getBoardId());
  if(!realm){onInfo('Elige uno de los 13 tableros mágicos en Configuración.');return false;}
  if(active)exit();
  const token=++pending;
  onInfo('✦ Abriendo reino '+realm.label+'…');
  if(!await ready(realm)||token!==pending){
   if(token===pending)onInfo('Reino no disponible: faltan imágenes del Skybox. La partida 3D sigue funcionando.');
   return false;
  }
  return new Promise(resolve=>{
   new THREE.CubeTextureLoader().load(skyboxFaceUrls(realm.id),
    texture=>{
     if(token!==pending){texture.dispose();resolve(false);return;}
     background=texture;background.colorSpace=THREE.SRGBColorSpace;background.needsUpdate=true;
     saved={position:camera.position.clone(),quaternion:camera.quaternion.clone(),up:camera.up.clone(),
      target:orbit.target.clone(),fov:camera.fov,orbitEnabled:orbit.enabled,touchAction:canvas.style.touchAction};
     orbit.enabled=false;canvas.style.touchAction='none';
     if(decorations){decorationVisibility=decorations.visible;decorations.visible=false;}
     active=true;focus();scene.background=background;floor.visible=true;
     document.body.classList.add('realm-active');
     mini.hidden=false;hint.hidden=false;showUI(false);refreshStatus();
     onInfo('♟ Tablero del reino '+realm.label+' listo: usa +/−, vista superior, toca piezas o explora el paisaje.');
     resolve(true);
    },undefined,()=>{
     if(token===pending)onInfo('Error al cargar las seis caras. Comprueba tu conexión y vuelve a intentarlo.');
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
  if(!('DeviceOrientationEvent' in window)){onInfo('No hay sensores: arrastra sobre el paisaje para mirar.');return;}
  try{
   if(typeof DeviceOrientationEvent.requestPermission==='function' &&
       await DeviceOrientationEvent.requestPermission()!=='granted')throw Error('permiso denegado');
   gyro=true;gyroButton.setAttribute('aria-pressed','true');
   gyroButton.textContent='◉ Desactivar sensores';
   window.addEventListener('deviceorientation',onOrientation,{passive:true});
   onInfo('Gira el teléfono para explorar. Pulsa ⊕ Tablero para regresar a jugar.');
  }catch(err){onInfo('No fue posible activar sensores: '+(err.message||String(err)));}
 }
 function isPanGesture(){
  // Called by main.js before this controller receives pointerup; suppress misclicks after pinch.
  return Boolean(active&&(gestureSuppressed||(drag&&drag.distance>19)||pointers.size>=2));
 }
 function distanceBetweenPointers(){
  const values=[...pointers.values()];
  return values.length<2?0:Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y);
 }
 canvas.addEventListener('pointerdown',event=>{
  if(!active||event.button===2)return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size>=2){
   gestureSuppressed=true;drag=null;pinchDistance=distanceBetweenPointers();return;
  }
  if(!gyro&&!getInteractivePiece(event.clientX,event.clientY))
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0};
 });
 canvas.addEventListener('pointermove',event=>{
  if(!active||!pointers.has(event.pointerId))return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size>=2){
   const next=distanceBetweenPointers();
   if(pinchDistance>3&&next>3)zoom(clamp(pinchDistance/next,.7,1.4));
   pinchDistance=next;return;
  }
  if(gyro||!drag||drag.id!==event.pointerId)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  drag.x=event.clientX;drag.y=event.clientY;drag.distance+=Math.hypot(dx,dy);
  if(drag.distance<=19)return;
  yaw-=dx*.0045;
  pitch=clamp(pitch-dy*.0045,-Math.PI/2+.03,Math.PI/2-.03);
  camera.rotation.set(pitch,yaw,0,'YXZ');
 });
 const release=event=>{
  pointers.delete(event.pointerId);
  if(drag?.id===event.pointerId)drag=null;
  if(pointers.size<2)pinchDistance=0;
  if(!pointers.size)gestureSuppressed=false;
 };
 canvas.addEventListener('pointerup',release);
 canvas.addEventListener('pointercancel',release);
 canvas.addEventListener('wheel',event=>{
  if(!active)return;event.preventDefault();
  if(event.shiftKey){
   changeElevation(event.deltaY<0?1.15:-1.15);
  }else{
   zoom(event.deltaY<0?.83:1.2);
  }
 },{passive:false});
 showControls.addEventListener('click',()=>showUI(document.body.classList.contains('realm-hud-hidden')));
 focusButton.addEventListener('click',focus);
 topButton.addEventListener('click',overhead);
 closer.addEventListener('click',()=>zoom(.8));
 farther.addEventListener('click',()=>zoom(1.25));
 higher.addEventListener('click',()=>changeElevation(1.5));
 lower.addEventListener('click',()=>changeElevation(-1.5));
 exitButton.addEventListener('click',()=>{exit();onInfo('Saliste del reino 360°. Tu partida continúa.');});
 gyroButton.addEventListener('click',toggleGyro);
 return {enter,exit,active:()=>active,isPanGesture,focus,overhead,zoom,changeElevation,showUI,refreshStatus};
}
