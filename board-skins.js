// ECOAJEDREZ 0.14.1 · Per-design 8x8 alignment; framed textures and 7x7 repair.
// Only tablero_*.webp are playable top-down surface skins.
// vista-*.webp are independent fantasy artwork for the menu, NEVER gameplay preview assets.
const BASE='./app/imagenes/tableros/';
export const BOARD_SKINS=[
 {id:'classic',label:'♟ Original · sin textura',file:null},
 {id:'alquimia',label:'Alquimia · líquidos mágicos',file:'tablero_alquímico_de_líquidos_mágicos.webp',grid:[0.037,0.038,0.965,0.964],cells:8},
 {id:'celta',label:'Celta mágico',file:'tablero_celta_mágico_de_ajedrez.webp',grid:[0.109,0.1,0.892,0.897],cells:8},
 {id:'cyber',label:'Cibernético neón magenta y cian',file:'tablero_cibernético_de_neón_magenta_y_cian.webp',grid:[0.042,0.041,0.958,0.949],cells:7},
 {id:'cosmos',label:'Nebulosas y obsidiana',file:'tablero_cósmico_de_nebulosas_y_obsidiana.webp',grid:[0.01,0.011,0.992,0.99],cells:8},
 {id:'amatista',label:'Cósmico plata y amatista',file:'tablero_cósmico_de_plata_y_amatista.webp',grid:[0.039,0.039,0.963,0.964],cells:8},
 {id:'dorado',label:'Ajedrez con vetas doradas',file:'tablero_de_ajedrez_mágico_con_vetas_doradas.webp',grid:[0.065,0.054,0.936,0.942],cells:8},
 {id:'atlantis',label:'Atlantis · nácar y oro',file:'tablero_de_atlantis_en_nácar_y_oro.webp',grid:[0.059,0.064,0.941,0.95],cells:8},
 {id:'hielo',label:'Hielo y runas luminosas',file:'tablero_de_hielo_mágico_con_runas_luminosas.webp',grid:[0.056,0.055,0.944,0.948],cells:8},
 {id:'lava',label:'Lava y basalto',file:'tablero_de_lava_y_basalto.webp',grid:[0.041,0.038,0.959,0.959],cells:8},
 {id:'egipto',label:'Egipcio oro y lapislázuli',file:'tablero_egipcio_de_oro_y_lapislázuli.webp',grid:[0.084,0.077,0.916,0.918],cells:8},
 {id:'gotico',label:'Gótico de almas espectrales',file:'tablero_gótico_de_almas_espectrales.webp',grid:[0.067,0.068,0.934,0.934],cells:8},
 {id:'cristales',label:'Cristales y runas',file:'tablero_místico_de_cristales_y_runas.webp',grid:[0.046,0.045,0.952,0.956],cells:8},
 {id:'steampunk',label:'Steampunk de engranajes y cobre',file:'tablero_steampunk_de_engranajes_y_cobre.webp',grid:[0.077,0.072,0.923,0.926],cells:8}
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
// Artwork grid boundaries (top-left-origin normalized coordinates) were inspected
// against each source WebP, not inferred from the full image's 1:1 dimensions.
// Square centers remain x/z = -3.5 .. 3.5, independent of borders and AR scale.
export function boardMetrics(skin){
 const [l,t,r,b]=skin.grid||[0,0,1,1];
 if(!(l>=0&&t>=0&&r<=1&&b<=1&&r>l&&b>t))throw Error('Invalid board grid bounds');
 const width=8/(r-l),depth=8/(b-t);
 return {width,depth,
   centerX:(.5-(l+r)/2)*width,
   centerZ:(.5-(t+b)/2)*depth};
}

// One original WebP contains seven columns/rows despite its square image size.
// Rebuild ONLY its playable grid from source tiles, retaining its own decorative
// frame. Checkerboard parity and all 64 playable locations are preserved.
export function repairGridImage(image,skin){
 if(skin.cells===8)return null;
 if(skin.cells!==7)throw Error('Unsupported source board grid');
 const size=Math.min(1536,Math.max(512,image.naturalWidth||image.width||1024));
 const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
 const context=canvas.getContext('2d');
 if(!context)throw Error('Canvas 2D unavailable for grid repair');
 context.drawImage(image,0,0,size,size);
 const [left,top,right,bottom]=skin.grid;
 const sourceWidth=image.naturalWidth||image.width;
 const sourceHeight=image.naturalHeight||image.height;
 const cellW=(right-left)*sourceWidth/7,cellH=(bottom-top)*sourceHeight/7;
 const targetW=(right-left)*size/8,targetH=(bottom-top)*size/8;
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
   // Use alternating matching cells for column/row 8, not stretched 7x7.
   const srcCol=col===7?5:col,srcRow=row===7?5:row;
   const dx=left*size+col*targetW,dy=top*size+row*targetH;
   context.drawImage(image,
     (left*sourceWidth)+srcCol*cellW,(top*sourceHeight)+srcRow*cellH,
     cellW,cellH,dx,dy,targetW+.1,targetH+.1);
 }
 return canvas;
}
export function createBoardSurface({THREE,world,renderer,onStatus=()=>{},onSurfaceChange=()=>{}}){
 const surfaceGroup=new THREE.Group();
 surfaceGroup.name='BoardImageSkinsNotGameLogic';
 world.add(surfaceGroup);
 const plane=new THREE.Mesh(
   new THREE.PlaneGeometry(8,8),
   new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false})
 );
 plane.rotation.x=-Math.PI/2;
 plane.position.y=.064; // chess tile top=.0625; top color and depth masked when image is active.
 plane.raycast=()=>{}; // 64 original square meshes remain authoritative for raycast.
 plane.visible=false;
 surfaceGroup.add(plane);
 const textureLoader=new THREE.TextureLoader();
 let generation=0,selected='classic';
 function clear(){
   const prior=plane.material.map;
   plane.material.map=null;
   plane.material.needsUpdate=true;
   plane.visible=false;
   if(prior)prior.dispose();
   onSurfaceChange({active:false,width:8.45,depth:8.45});
 }
 async function select(id){
   const entry=findBoard(id);
   selected=entry.id;
   const seq=++generation;
   if(!entry.file){
     clear();onStatus('Tablero clásico: 64 casillas listas para jugar.');return true;
   }
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
     const corrected=repairGridImage(texture.image,entry);
     if(corrected){
       texture.dispose();
       texture=new THREE.CanvasTexture(corrected);
     }
     texture.colorSpace=THREE.SRGBColorSpace;
     texture.wrapS=THREE.ClampToEdgeWrapping;
     texture.wrapT=THREE.ClampToEdgeWrapping;
     texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
     texture.needsUpdate=true;
     const metrics=boardMetrics(entry);
     // Source image (including its own full frame) maps to a matching 3D base.
     // The measured grid bounds occupy exactly 8x8 game units, no user slider.
     plane.scale.set(metrics.width/8,metrics.depth/8,1);
     plane.position.x=metrics.centerX;
     plane.position.z=metrics.centerZ;
     const old=plane.material.map;
     plane.material.map=texture;
     plane.material.needsUpdate=true;
     plane.visible=true;
     // Mask original TOP tile faces; their selectable meshes and side walls remain.
     // This fixes mobile WebGL z-fighting, which rendered cyan/purple triangles.
     onSurfaceChange({active:true,width:metrics.width,depth:metrics.depth});
     if(old&&old!==texture)old.dispose();
     onStatus('✓ «'+entry.label+'»: 64 casillas alineadas automáticamente con su marco.');
     return true;
   }catch(err){
     if(texture&&texture!==plane.material.map)texture.dispose();
     if(seq!==generation)return false;
     clear();
     onStatus('No se pudo cargar el diseño; el tablero clásico sigue disponible.');
     return false;
   }finally{if(objectURL)URL.revokeObjectURL(objectURL);}
 }
 return {select,getSelected:()=>selected,isVisible:()=>plane.visible,dispose(){
   generation++;clear();plane.geometry.dispose();plane.material.dispose();world.remove(surfaceGroup);
 }};
}
