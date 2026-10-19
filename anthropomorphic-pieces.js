// ECOAJEDREZ original anthropomorphic chess army: free starter set.
// Generated from the supplied HTML: animated arms/legs and cyan/violet emissive gems.
// The original uploaded GLB contains 32 Walk clips. Attack/Death belong to demo JS only.
export const ANTHRO_GLB='./assets/models/anthropomorphic/anthropomorphic-chess.glb';
export const ANTHRO_MANIFEST='./assets/models/anthropomorphic/manifest.json';
export const ANTHRO_TYPES=Object.freeze({p:'Pawn',r:'Rook',n:'Knight',b:'Bishop',q:'Queen',k:'King'});
export function anthroRootName(color,type){
 const name=ANTHRO_TYPES[type];
 const number={p:1,r:1,n:2,b:3,q:4,k:5}[type];
 return name?(color==='w'?'White':'Black')+'_'+name+'_'+number:null;
}
export function collectAnthroSources(gltf){
 const templates=new Map();
 for(const color of ['w','b'])for(const type of Object.keys(ANTHRO_TYPES)){
  const name=anthroRootName(color,type);
  const node=gltf.scene.getObjectByName(name);
  const clip=gltf.animations?.find(a=>a.name===name+'_Walk');
  if(node&&clip)templates.set(color+type,{node,clip});
 }
 return templates;
}
const geometries=new WeakMap();
const glowTextures=new WeakMap();
const glowMaterials=new WeakMap();
function glowTexture(THREE,color){
 let textureMap=glowTextures.get(THREE);
 if(!textureMap){textureMap=new Map();glowTextures.set(THREE,textureMap);}
 if(textureMap.has(color))return textureMap.get(color);
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
 const ctx=canvas.getContext('2d');
 const grd=ctx.createRadialGradient(32,32,0,32,32,32);
 const rgb=color==='w'?'85,210,255':'184,85,255';
 grd.addColorStop(0,'rgba('+rgb+',.68)');
 grd.addColorStop(.19,'rgba('+rgb+',.34)');
 grd.addColorStop(.5,'rgba('+rgb+',.11)');
 grd.addColorStop(1,'rgba('+rgb+',0)');
 ctx.fillStyle=grd;ctx.fillRect(0,0,64,64);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 textureMap.set(color,tex);return tex;
}
function addGlowHalo(THREE,group,color,height){
 if(typeof document==='undefined')return;
 let list=glowMaterials.get(THREE);
 if(!list){list=new Map();glowMaterials.set(THREE,list);}
 if(!list.has(color))list.set(color,new THREE.SpriteMaterial({
  map:glowTexture(THREE,color),transparent:true,
  blending:THREE.AdditiveBlending,depthWrite:false,opacity:.68
 }));
 const glow=new THREE.Sprite(list.get(color));
 glow.scale.set(.95,1.15,1);
 glow.position.y=height;
 glow.name='Luz mágico-neón';
 group.add(glow);
}

function shared(THREE,name,create){
 let m=geometries.get(THREE);if(!m){m=new Map();geometries.set(THREE,m);}
 if(!m.has(name))m.set(name,create());return m.get(name);
}
export function createAnthroVisual(THREE,p,templates=null){
 const src=templates?.get(p.color+p.type);
 if(src){
  const clone=src.node.clone(true);clone.position.set(0,0,0);clone.rotation.set(0,0,0);
  const b=new THREE.Box3().setFromObject(clone),size=new THREE.Vector3();
  b.getSize(size);
  if(size.y>.001){
   clone.scale.multiplyScalar((p.type==='p'?1.03:p.type==='k'?1.57:1.32)/size.y);
  }
  const fixed=new THREE.Box3().setFromObject(clone),center=new THREE.Vector3();
  fixed.getCenter(center);
  clone.position.set(-center.x,-fixed.min.y,-center.z);
  const g=new THREE.Group();g.add(clone);
  clone.traverse(o=>{
   if(!o.isMesh)return;
   o.userData.sharedGeo=true;o.userData.ownedMaterial=true;
   o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();
   o.castShadow=true;
  });
  const mixer=new THREE.AnimationMixer(g),action=mixer.clipAction(src.clip);
  action.setLoop(THREE.LoopRepeat,Infinity);
  g.userData.anthro={kind:'glb',mixer,action,lastWalk:false};
  return g;
 }
 return procedural(THREE,p);
}
function procedural(THREE,p){
 const white=p.color==='w',g=new THREE.Group(),body=new THREE.Group();g.add(body);
 const mats={
  body:new THREE.MeshStandardMaterial({color:white?0xe0d8c8:0x1c0f2e,roughness:.37,metalness:white?.2:.6}),
  accent:new THREE.MeshStandardMaterial({color:white?0xd4b060:0x6a4a28,roughness:.2,metalness:.85}),
  gem:new THREE.MeshStandardMaterial({color:white?0x80e0ff:0xd060ff,emissive:white?0x40a0ff:0x8030ff,emissiveIntensity:3.1,roughness:.1})
 };
 function geo(shape,dimensions){const name=shape+':'+dimensions.join(':');
  return shared(THREE,name,()=>shape==='cy'?new THREE.CylinderGeometry(...dimensions):
   shape==='sp'?new THREE.SphereGeometry(...dimensions):
   shape==='bx'?new THREE.BoxGeometry(...dimensions):
   shape==='co'?new THREE.ConeGeometry(...dimensions):
   new THREE.TorusGeometry(...dimensions));
 }
 function add(parent,shape,dim,material,x=0,y=0,z=0){
  const mesh=new THREE.Mesh(geo(shape,dim),mats[material]);
  mesh.position.set(x,y,z);mesh.castShadow=true;
  mesh.userData.sharedGeo=true;mesh.userData.ownedMaterial=true;parent.add(mesh);return mesh;
 }
 const spec={p:[.19,.17,.37,.10],r:[.24,.21,.45,.13],n:[.21,.19,.40,.12],
  b:[.20,.16,.45,.10],q:[.22,.19,.49,.12],k:[.25,.20,.53,.13]}[p.type];
 const [base,armX,armY,legX]=spec;
 add(body,'cy',[base*.86,base,.14,14],'accent',0,.1);
 add(body,'cy',[base*.77,base*.85,.45,16],'body',0,.37);
 const band=add(body,'to',[base*.97,.024,6,24],'gem',0,.14);band.rotation.x=-Math.PI/2;
 if(p.type==='p'){
  add(body,'sp',[.17,14,10],'body',0,.70);add(body,'co',[.15,.21,12],'body',0,.85);
  add(body,'sp',[.07,8,6],'gem',0,1.02);
 }else if(p.type==='r'){
  add(body,'bx',[.34,.3,.34],'body',0,.77);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;add(body,'bx',[.10,.15,.10],'accent',Math.cos(a)*.14,.98,Math.sin(a)*.14);}
 }else if(p.type==='n'){
  add(body,'cy',[.10,.13,.28,10],'body',0,.70,.10).rotation.x=-.3;
  add(body,'bx',[.22,.24,.36],'body',0,.90,.2).rotation.x=.32;
  for(const d of [-1,1])add(body,'sp',[.042,8,6],'gem',d*.115,.94,.36);
 }else if(p.type==='b'){
  add(body,'sp',[.14,12,9],'body',0,.77);add(body,'co',[.13,.3,12],'body',0,1.00);
  add(body,'sp',[.063,9,7],'gem',0,1.19);
 }else if(p.type==='q'){
  add(body,'cy',[.18,.16,.12,12],'accent',0,.82);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;add(body,'sp',[.068,8,6],'gem',Math.cos(a)*.15,.99,Math.sin(a)*.15);}
 }else if(p.type==='k'){
  add(body,'cy',[.20,.17,.14,12],'accent',0,.9);
  add(body,'bx',[.07,.28,.07],'gem',0,1.14);
  add(body,'bx',[.21,.07,.07],'gem',0,1.18);
 }
 function limb(side,arm){
  const pivot=new THREE.Group();pivot.position.set((side?-1:1)*(arm?armX:legX),arm?armY:.27,0);body.add(pivot);
  add(pivot,'cy',arm?[.05,.043,.39,8]:[.064,.056,.41,8],'body',0,-.19);
  if(arm)add(pivot,'sp',[.075,8,6],'gem',0,-.39);
  else add(pivot,'bx',[.15,.10,.22],'accent',0,-.4,.06);
  return pivot;
 }
 const armL=limb(true,true),armR=limb(false,true),legL=limb(true,false),legR=limb(false,false);
 addGlowHalo(THREE,g,p.color,p.type==='k'?1.1:.75);
 g.userData.anthro={kind:'procedural',body,armL,armR,legL,legR,gem:mats.gem,idleOffset:Math.random()*7};
 return g;
}
export function tickAnthroVisuals(group,moving,time,delta){
 for(const piece of group.children){
  const a=piece.userData.anthro;if(!a)continue;
  const walking=Boolean(moving&&moving.piece===piece);
  if(a.kind==='glb'){
   if(walking&&!a.lastWalk)a.action.reset().play();
   if(!walking&&a.lastWalk){a.action.stop();a.mixer.setTime(0);}
   a.lastWalk=walking;if(walking)a.mixer.update(Math.min(.05,Math.max(0,delta)));
  }else{
   const wave=Math.sin(time*.015+a.idleOffset);
   a.armL.rotation.x=walking?-.43*wave:0;a.armR.rotation.x=walking?.43*wave:0;
   a.legL.rotation.x=walking?.55*wave:0;a.legR.rotation.x=walking?-.55*wave:0;
   a.body.position.y=walking?.03+Math.abs(wave)*.05:Math.sin(time*.0015+a.idleOffset)*.013;
   a.gem.emissiveIntensity=2.9+Math.sin(time*.0025+a.idleOffset)*.35;
  }
 }
}
