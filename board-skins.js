// ECOAJEDREZ 0.14 · User-uploaded, licensed-by-uploader board skins.
// Only tablero_*.webp are playable top-down surface skins.
// vista-*.webp are independent fantasy artwork for the menu, NEVER gameplay preview assets.
const BASE='./app/imagenes/tableros/';
export const BOARD_SKINS=[
 {id:'classic',label:'♟ Original · sin textura',file:null},
 {id:'alquimia',label:'Alquimia · líquidos mágicos',file:'tablero_alquímico_de_líquidos_mágicos.webp'},
 {id:'celta',label:'Celta mágico',file:'tablero_celta_mágico_de_ajedrez.webp'},
 {id:'cyber',label:'Cibernético neón magenta y cian',file:'tablero_cibernético_de_neón_magenta_y_cian.webp'},
 {id:'cosmos',label:'Nebulosas y obsidiana',file:'tablero_cósmico_de_nebulosas_y_obsidiana.webp'},
 {id:'amatista',label:'Cósmico plata y amatista',file:'tablero_cósmico_de_plata_y_amatista.webp'},
 {id:'dorado',label:'Ajedrez con vetas doradas',file:'tablero_de_ajedrez_mágico_con_vetas_doradas.webp'},
 {id:'atlantis',label:'Atlantis · nácar y oro',file:'tablero_de_atlantis_en_nácar_y_oro.webp'},
 {id:'hielo',label:'Hielo y runas luminosas',file:'tablero_de_hielo_mágico_con_runas_luminosas.webp'},
 {id:'lava',label:'Lava y basalto',file:'tablero_de_lava_y_basalto.webp'},
 {id:'egipto',label:'Egipcio oro y lapislázuli',file:'tablero_egipcio_de_oro_y_lapislázuli.webp'},
 {id:'gotico',label:'Gótico de almas espectrales',file:'tablero_gótico_de_almas_espectrales.webp'},
 {id:'cristales',label:'Cristales y runas',file:'tablero_místico_de_cristales_y_runas.webp'},
 {id:'steampunk',label:'Steampunk de engranajes y cobre',file:'tablero_steampunk_de_engranajes_y_cobre.webp'}
];
export const VISION_ART=[
 {label:'Viaje entre galaxias',file:'vista-ajedrez_cósmico_entre_galaxias.webp'},
 {label:'Colección de mundos fantásticos',file:'vista-coleccion_cinco_tableros_fantasticos.webp'},
 {label:'Hielo auroral',file:'vista-tablero_de_ajedrez_de_hielo_auroral.webp'},
 {label:'Lava dracónica',file:'vista-tablero_de_ajedrez_de_lava_draconico.webp'},
 {label:'Amatista mágica',file:'vista-tablero_de_ajedrez_mágico_de_amatista.webp'},
 {label:'Bosque encantado',file:'vista-tablero_místico_del_bosque_encantado.webp'},
 {label:'Ajedrez celestial encantado',file:'vista_de_ajedrez_celestial_encantado.webp'}
];
export const boardURL=entry=>entry?.file?BASE+encodeURIComponent(entry.file):null;
export function findBoard(id){return BOARD_SKINS.find(s=>s.id===id)||BOARD_SKINS[0];}
export function createBoardSurface({THREE,world,renderer,onStatus=()=>{}}){
 const surfaceGroup=new THREE.Group();
 surfaceGroup.name='BoardImageSkinsNotGameLogic';
 world.add(surfaceGroup);
 const plane=new THREE.Mesh(
   new THREE.PlaneGeometry(8,8),
   new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false})
 );
 plane.rotation.x=-Math.PI/2;
 plane.position.y=.0638; // tile tops are .0625; live chess-piece bases begin near .07
 plane.raycast=()=>{}; // transparent to selection; chess tiles own the hit targets
 plane.visible=false;
 plane.renderOrder=1;
 surfaceGroup.add(plane);
 // Independent 8x8 guide ensures visual squares stay aligned with chess logic
 // even if a user's artwork contains decorative framing or perspective elements.
 const helper=new THREE.GridHelper(8,8,0xd1fff4,0x9acfe3);
 helper.position.y=.0642;
 helper.material.transparent=true;
 helper.material.opacity=.24;
 helper.material.depthWrite=false;
 helper.raycast=()=>{};
 helper.visible=false;
 surfaceGroup.add(helper);
 const textureLoader=new THREE.TextureLoader();
 let generation=0,selected='classic',gridCoverage=.86;
 function clear(){
   const prior=plane.material.map;
   plane.material.map=null;
   plane.material.needsUpdate=true;
   if(prior)prior.dispose();
   plane.visible=false;helper.visible=false;
 }
 async function select(id){
   const entry=findBoard(id);
   selected=entry.id;
   const seq=++generation;
   if(!entry.file){clear();onStatus('Tablero clásico: 64 casillas listas para jugar.');return true;}
   onStatus('Preparando tablero «'+entry.label+'» para jugar…');
   let objectURL=null,texture=null;
   try{
     const path=boardURL(entry);
     let imageURL=path;
     if(window.ecoPublicAssets?.getResource){
       const response=await window.ecoPublicAssets.getResource(path);
       objectURL=URL.createObjectURL(await response.blob());
       imageURL=objectURL;
     }
     texture=await textureLoader.loadAsync(imageURL);
     if(seq!==generation){texture.dispose();return false;}
     texture.colorSpace=THREE.SRGBColorSpace;
     texture.wrapS=THREE.ClampToEdgeWrapping;
     texture.wrapT=THREE.ClampToEdgeWrapping;
     texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
     // Center-crop instead of stretching non-square artworks onto a square board.
     const w=texture.image?.naturalWidth||texture.image?.width||1;
     const h=texture.image?.naturalHeight||texture.image?.height||1;
     if(w>h){texture.repeat.set(h/w,1);texture.offset.set((1-h/w)/2,0);}
     else if(h>w){texture.repeat.set(1,w/h);texture.offset.set(0,(1-w/h)/2);}
     texture.needsUpdate=true;
     // The image includes a painted frame: center its actual 8x8 artwork
     // on the logical board and let the decorative frame extend outside.
     plane.scale.setScalar(1/gridCoverage);
     const old=plane.material.map;
     plane.material.map=texture;
     plane.material.needsUpdate=true;
     plane.visible=true;helper.visible=true;
     if(old&&old!==texture)old.dispose();
     onStatus('✓ «'+entry.label+'» aplicado a la superficie 8×8. Se conserva la cuadrícula jugable.');
     return true;
   }catch(err){
     if(texture)texture.dispose();
     if(seq!==generation)return false;
     clear();
     onStatus('No se pudo cargar este diseño; el tablero clásico sigue disponible. Reintentar desde configuración.');
     return false;
   }finally{if(objectURL)URL.revokeObjectURL(objectURL);}
 }
 function setCoverage(coverage){
   const value=Number(coverage);
   if(!Number.isFinite(value)||value<.65||value>1)return gridCoverage;
   gridCoverage=value;
   plane.scale.setScalar(1/gridCoverage);
   // Scale extends/retreats image frame; the underlying chess board stays fixed.
   return gridCoverage;
 }
 return {select,setCoverage,getCoverage:()=>gridCoverage,getSelected:()=>selected,isVisible:()=>plane.visible,dispose(){generation++;clear();plane.geometry.dispose();plane.material.dispose();helper.geometry.dispose();helper.material.dispose();world.remove(surfaceGroup);}};
}
