// 3D piece preview reuses the exact selected piece constructor (game mesh or GLB).
// Extra WebGL context created lazily only when the configuration screen is visible.
export function createPiecePreview({THREE,canvas,createVisual,isShowing=()=>true}){
 let renderer=null,scene=null,camera=null,pair=null,pieces=[],last=0,drag=null,angle=.35,type='q';
 const names={p:'Peón',r:'Torre',n:'Caballo',b:'Alfil',q:'Dama',k:'Rey'};
 function init(){
  if(renderer)return true;
  try{
   renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
   renderer.outputColorSpace=THREE.SRGBColorSpace;
   scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xdaeefa,0x142a42,2));
   const light=new THREE.DirectionalLight(0xffe6ba,2.5);light.position.set(3,5,5);scene.add(light);
   camera=new THREE.PerspectiveCamera(42,1,.01,30);
   camera.position.set(0,2.0,5.3);camera.lookAt(0,.68,0);
   pair=new THREE.Group();scene.add(pair);
   return true;
  }catch(err){console.warn('Visor 3D no disponible en este dispositivo:',err);return false;}
 }
 function clear(){
  if(!pair)return;
  for(const g of pieces){pair.remove(g);
   g.traverse(node=>{
    if(node.isMesh){
     if(node.geometry&&!node.userData.sharedGeo)node.geometry.dispose();
     const mats=Array.isArray(node.material)?node.material:[node.material];
     if(node.userData.ownedMaterial)for(const m of mats) m?.dispose?.();
    }
   });
  }
  pieces=[];
 }
 function rebuild(nextType=type){
  type=names[nextType]?nextType:'q';
  if(!renderer&&!isShowing())return;
  if(!init())return;
  clear();
  for(const [color,x] of [['w',-1],['b',1]]){
   const piece=createVisual({type,color,square:color==='w'?'d1':'d8'});
   piece.position.set(x,.05,0);pair.add(piece);pieces.push(piece);
  }
 }
 function resize(){
  if(!renderer)return;
  const width=Math.max(200,Math.min(900,Math.round(canvas.clientWidth||360)));
  const height=Math.max(120,Math.round(canvas.clientHeight||200));
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
 }
 function tick(time){
  if(!isShowing())return;
  if(!init())return;
  if(!pieces.length)rebuild(type);
  if(time-last<50)return; // <=20FPS for mobile battery and WebXR readiness.
  last=time;resize();
  if(!drag&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)angle+=.005;
  pair.rotation.y=angle;
  renderer.render(scene,camera);
 }
 canvas.addEventListener('pointerdown',e=>{
  drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture?.(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(drag?.id===e.pointerId){angle+=(e.clientX-drag.x)*.012;drag.x=e.clientX;}
 });
 const release=e=>{if(drag?.id===e.pointerId)drag=null};
 canvas.addEventListener('pointerup',release);
 canvas.addEventListener('pointercancel',release);
 return {rebuild,tick,clear,get type(){return type}};
}
