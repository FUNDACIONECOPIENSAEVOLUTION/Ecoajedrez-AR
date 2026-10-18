// ECOAJEDREZ lightweight scenery. Uses existing owner-approved assets for 2D distant
// atmosphere + procedural 3D trees/arches/fireflies. No paid providers or shaders.
// Visual only: no tile/square raycasts, no changes to Chess or WebXR anchors.
export const BIOME_BACKDROPS={
 classic:'./app/imagenes/tarjetas/07_ciudad_flotante.webp',
 wood:'./app/imagenes/tarjetas/05_bosque_encantado.webp',
 marble:'./app/imagenes/tarjetas/07_ciudad_flotante.webp',
 neon:'./app/imagenes/tarjetas/06_templo_arcano.webp',
 jungle:'./app/imagenes/tarjetas/05_bosque_encantado.webp',
 volcano:'./app/imagenes/tarjetas/08_volcan_celestial.webp',
 ice:'./app/imagenes/tarjetas/06_templo_arcano.webp'
};
export function createMagicWorld({THREE,world,scene,renderer,stage}){
 const sceneArt=new THREE.Group();
 sceneArt.name='LocalLightweightArena';world.add(sceneArt);
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
 let profile='auto', particles=null, particlePhase=[];
 const palettes={
 classic:[0x5de6cb,0xffe8a0],wood:[0xa6ff83,0xf8cf8e],
 marble:[0xabcaff,0xffecbe],neon:[0x45fff0,0x8b76ff],
 jungle:[0x83ffaa,0xffde92],volcano:[0xff845e,0xffd16a],
 ice:[0x73cafa,0xe4f9ff]
 };
 const deviceLow=()=>window.matchMedia?.('(max-width: 760px)')?.matches ||
    (navigator.deviceMemory&&navigator.deviceMemory<=4);
 function profileLevel(){return profile==='auto'?(deviceLow()?'low':'medium'):profile;}
 function clear(){
  for(const object of [...sceneArt.children]){
    sceneArt.remove(object);
    object.traverse(child=>{
      if(child.isMesh||child.isPoints){child.geometry?.dispose();child.material?.dispose();}
    });
  }
  particles=null;particlePhase=[];
 }
 function mesh(geo,material,x,y,z){
  const o=new THREE.Mesh(geo,material);
  o.position.set(x,y,z);o.raycast=()=>{};
  sceneArt.add(o);return o;
 }
 function rebuild(theme){
  clear();
  const level=profileLevel(),activeTheme=theme in BIOME_BACKDROPS?theme:'classic';
  stage.dataset.biome=activeTheme;
  stage.style.setProperty('--eco-world-image','url("'+BIOME_BACKDROPS[activeTheme]+'")');
  scene.background=null;
  renderer.setClearColor(0x000000,0);
  const colors=palettes[activeTheme]||palettes.classic;
  const cool=new THREE.MeshStandardMaterial({color:colors[0],roughness:.85});
  const warm=new THREE.MeshStandardMaterial({color:colors[1],roughness:.73});
  const stone=new THREE.MeshStandardMaterial({color:0x203b39,metalness:.3,roughness:.75});
  // Build free-standing decorations outside 8x8 chessboard; no gameplay intersections.
  const count=level==='low'?9:level==='high'?34:19;
  for(let i=0;i<count;i++){
    const a=(i/count)*Math.PI*2;
    const r=5.1+(i%5)*.44;
    const x=Math.cos(a)*r,z=Math.sin(a)*r,h=.65+(i%6)*.25;
    const trunk=mesh(new THREE.CylinderGeometry(.075,.16,h,6),stone,x,h*.5-.13,z);
    const foliage=activeTheme==='volcano'
      ?new THREE.OctahedronGeometry(.28+(i%3)*.07)
      :new THREE.ConeGeometry(.34+(i%3)*.11,h*.8,6);
    mesh(foliage,i%4===0?warm:cool,x,h*.93,z);
  }
  // Four low-poly magic beacons, deliberately beyond the chess tile grid.
  if(level!=='low'){
   for(let i=0;i<4;i++){
    const a=Math.PI*.25+i*Math.PI*.5,x=Math.cos(a)*6.8,z=Math.sin(a)*6.8;
    const pillar=mesh(new THREE.CylinderGeometry(.13,.23,1.7,8),stone,x,.78,z);
    pillar.rotation.z=Math.cos(a)*.04;
    const crystal=mesh(new THREE.OctahedronGeometry(.23),i%2?warm:cool,x,1.83,z);
    crystal.userData.glow=true;
   }
  }
  // Magic runes float on the non-playable rim; don't alter the chess 8x8 grid.
  const runeMat=new THREE.MeshBasicMaterial({
    color:colors[0],transparent:true,opacity:.52,
    side:THREE.DoubleSide,depthWrite:false
  });
  for(const x of [-4.12,4.12])for(const z of [-4.12,4.12]){
    const rune=mesh(new THREE.RingGeometry(.13,.195,18),runeMat.clone(),x,.066,z);
    rune.rotation.x=-Math.PI/2;
  }
  runeMat.dispose();
    // Up to 40 small sparkling points on high-quality mode only.
  const n=reduce?0:level==='low'?0:level==='high'?40:18;
  if(n){
   const positions=new Float32Array(n*3);
   for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2*3.7,r=4.8+(i%8)*.55;
    positions[i*3]=Math.cos(a)*r;
    positions[i*3+1]=.45+(i%9)*.3;
    positions[i*3+2]=Math.sin(a)*r;
    particlePhase.push(i*.71);
   }
   const geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
   particles=new THREE.Points(geo,new THREE.PointsMaterial({
     color:colors[1],size:.075,transparent:true,opacity:.7,depthWrite:false
   }));
   particles.raycast=()=>{};sceneArt.add(particles);
  }
  // No gameplay effect. Prevent accidental material disposal of the live chess meshes.
  // Materials shared by this decorative group are only ours and can be disposed in clear().
 }
 function setProfile(value,theme){
  profile=['auto','low','medium','high'].includes(value)?value:'auto';
  rebuild(theme);
 }
 function setAR(active){
  sceneArt.visible=!active;
  // Keep scenic background out of AR camera passthrough.
  if(active){scene.background=null;}else{scene.background=null;}
 }
 function tick(time){
  if(particles && !reduce && sceneArt.visible){
    particles.material.opacity=.52+.22*Math.sin(time*.001);
    particles.rotation.y=Math.sin(time*.00015)*.06;
  }
 }
 return {rebuild,setProfile,setAR,tick,profileLevel};
}
