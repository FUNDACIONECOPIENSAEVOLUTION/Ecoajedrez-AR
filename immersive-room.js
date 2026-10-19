// ECOAJEDREZ 0.15.0 — WebXR room as an anchored, translucent preview.
// Six face filenames and their mappings are identical to the existing 3D skybox.
// The room visualizes a kingdom but DOES NOT detect real walls, obstacles or a safe walking boundary.
// No rule engine, hand tracking, camera controls or WebXR sessions are created here.
import {realmForBoard,skyboxFaceUrls} from './skybox-config.js?v=0.14.5';

export const AR_ROOM_SIZES=Object.freeze({
  mesa:{label:'Cámara pequeña',width:2.6,height:2.6},
  sala:{label:'Sala inmersiva',width:4.8,height:3.5},
  gigante:{label:'Arena gigante',width:9,height:6.5}
});
export function arRoomSize(id){return AR_ROOM_SIZES[id]||AR_ROOM_SIZES.sala;}

export function createARImmersionRoom({THREE,scene,onInfo=()=>{}}){
 const root=new THREE.Group();
 root.name='ARImmersionRoom';root.visible=false;scene.add(root);
 let token=0,geometry=null,wall=null,frame=null,mode='sala',opacity=.40,visible=true,ready=false;
 let images=[],currentBoard=null;
 const clampOpacity=value=>Math.max(.15,Math.min(.60,Number(value)||.40));
 function release(){
   if(wall){root.remove(wall);wall.geometry.dispose();wall.material.forEach(m=>m.dispose());wall=null;}
   if(frame){root.remove(frame);frame.geometry.dispose();frame.material.dispose();frame=null;}
   for(const img of images)img.dispose();images=[];ready=false;
 }
 function createGeometry(){
   if(!images.length)return;
   const size=arRoomSize(mode);
   const mats=images.map((texture,i)=>{
     const m=new THREE.MeshBasicMaterial({
       map:texture,side:THREE.DoubleSide,transparent:true,
       opacity:opacity*(i===2?.42:i===3?.35:1),
       depthWrite:false,toneMapped:false
     });
     return m;
   });
   const cube=new THREE.BoxGeometry(size.width,size.height,size.width);
   wall=new THREE.Mesh(cube,mats);
   // Separate from chess 'world' scaling, which represents the physical board size.
   wall.position.y=size.height/2-.05;
   wall.name='SixFacesRoom';wall.raycast=()=>{};
   root.add(wall);
   const frameGeometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(size.width,size.height,size.width));
   frame=new THREE.LineSegments(frameGeometry,
     new THREE.LineBasicMaterial({color:0x71fde3,transparent:true,opacity:.25,depthWrite:false}));
   frame.position.copy(wall.position);frame.raycast=()=>{};
   root.add(frame);
   root.visible=visible;ready=true;
 }
 function rebuild(){
   if(!ready)return;
   const pos=root.position.clone();
   if(wall){root.remove(wall);wall.geometry.dispose();wall.material.forEach(m=>m.dispose());wall=null;}
   if(frame){root.remove(frame);frame.geometry.dispose();frame.material.dispose();frame=null;}
   root.position.copy(pos);createGeometry();
 }
 function setSize(next){
   mode=Object.hasOwn(AR_ROOM_SIZES,next)?next:'sala';
   rebuild();return arRoomSize(mode);
 }
 function setOpacity(next){
   opacity=clampOpacity(next);
   if(wall)wall.material.forEach((m,i)=>m.opacity=opacity*(i===2?.42:i===3?.35:1));
   return opacity;
 }
 function setVisible(next){
   visible=Boolean(next);
   root.visible=Boolean(ready&&visible);
   return root.visible;
 }
 function moveTo(position){
   if(position)root.position.copy(position);
 }
 function clear(){
   ++token;root.visible=false;release();
   currentBoard=null;
 }
 async function place(boardId,position){
   clear();
   currentBoard=boardId;
   const realm=realmForBoard(boardId);
   if(!realm){onInfo('El tablero clásico no tiene un cuarto de reino. El portal AR sigue disponible.');return false;}
   const urls=skyboxFaceUrls(realm.id);
   if(urls.length!==6)return false;
   const request=token;
   moveTo(position);
   try{
     const loaded=await Promise.all(urls.map(url=>new Promise((resolve,reject)=>{
       new THREE.TextureLoader().load(url,resolve,undefined,reject);
     })));
     if(request!==token){loaded.forEach(t=>t.dispose());return false;}
     images=loaded;
     // BoxGeometry materials use +X,-X,+Y,-Y,+Z,-Z, just like CubeTextureLoader.
     for(const img of images){img.colorSpace=THREE.SRGBColorSpace;img.anisotropy=2;img.needsUpdate=true;}
     createGeometry();
     onInfo('✦ Cuarto '+realm.label+' listo. Puedes cambiar tamaño y transparencia sin mover el tablero. No camines guiándote por las paredes digitales.');
     return true;
   }catch(err){
     if(request===token){release();root.visible=false;onInfo('No se pudo cargar el cuarto de '+realm.label+'. El tablero AR sigue jugable.');}
     return false;
   }
 }
 return {place,clear,setSize,setOpacity,setVisible,moveTo,
  ready:()=>ready,visible:()=>root.visible,mode:()=>mode,
  get group(){return root;},get board(){return currentBoard;}};
}
