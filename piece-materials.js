import {getPhotoPBR} from './piece-pbr.js?v=0.15.5';
// ECOAJEDREZ: lightweight, procedurally painted 128px fantasy materials.
// Shared textures, per-piece material colors and selectable emitted-light palettes.
export const PIECE_MATERIALS=Object.freeze({
 arcane:{label:'Original mágico',base:'#e4d9c8',roughness:.32,metalness:.40,pattern:'none'},
 walnut:{label:'Madera nogal',base:'#704125',roughness:.72,metalness:.02,pattern:'wood'},
 oak:{label:'Roble claro',base:'#c59865',roughness:.73,metalness:.02,pattern:'wood'},
 stone:{label:'Piedra ancestral',base:'#8b909a',roughness:.91,metalness:.02,pattern:'stone'},
 marble:{label:'Mármol imperial',base:'#e3e5e6',roughness:.28,metalness:.06,pattern:'marble'},
 obsidian:{label:'Obsidiana',base:'#29233b',roughness:.19,metalness:.38,pattern:'stone'},
 bronze:{label:'Bronce encantado',base:'#a66a36',roughness:.31,metalness:.78,pattern:'metal'},
 gold:{label:'Oro arcano',base:'#e0b15e',roughness:.22,metalness:.82,pattern:'metal'},
 ice:{label:'Hielo rúnico',base:'#9eddeb',roughness:.29,metalness:.12,pattern:'marble'},
 basalt:{label:'Basalto volcánico',base:'#4a3937',roughness:.87,metalness:.09,pattern:'stone'}
});
export const PIECE_GLOWS=Object.freeze({
 team:{label:'Según ejército',white:'#40bfff',black:'#a14bff'},
 cyan:{label:'Cian galáctico',white:'#44e7ff',black:'#44e7ff'},
 violet:{label:'Violeta mágico',white:'#c37aff',black:'#c37aff'},
 emerald:{label:'Verde esmeralda',white:'#55f2a5',black:'#55f2a5'},
 amber:{label:'Ámbar',white:'#ffcf65',black:'#ffcf65'},
 scarlet:{label:'Carmesí',white:'#ff707b',black:'#ff707b'}
});
export function validPieceMaterial(id){return Object.hasOwn(PIECE_MATERIALS,id)?id:'arcane'}
export function validPieceGlow(id){return Object.hasOwn(PIECE_GLOWS,id)?id:'team'}
export function pieceGlowHex(palette,color){
 const p=PIECE_GLOWS[validPieceGlow(palette)];
 return color==='b'?p.black:p.white;
}
const textureCache=new WeakMap();
function textureFor(THREE,key){
 let map=textureCache.get(THREE);
 if(!map){map=new Map();textureCache.set(THREE,map);}
 if(map.has(key))return map.get(key);
 if(typeof document==='undefined')return null;
 const preset=PIECE_MATERIALS[key];
 if(!preset||preset.pattern==='none')return null;
 const cv=document.createElement('canvas');cv.width=cv.height=128;
 const ctx=cv.getContext('2d');if(!ctx)return null;
 ctx.fillStyle=preset.base;ctx.fillRect(0,0,128,128);
 // Seeded value noise without costly PNG downloads or texture request chains.
 let seed=key.split('').reduce((a,c)=>a*33+c.charCodeAt(0),2166136261)>>>0;
 function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 if(preset.pattern==='wood'){
  for(let x=-100;x<250;x+=2+random()*5){
   const shade=Math.floor(30+random()*35);
   ctx.strokeStyle='rgba(26,11,6,'+(shade/230).toFixed(2)+')';
   ctx.lineWidth=.5+random()*1.5;ctx.beginPath();
   for(let y=0;y<129;y+=4){
    const xx=x+Math.sin(y*.055+x*.034)*6+Math.sin(y*.18+x)*1.1;
    if(y===0)ctx.moveTo(xx,y);else ctx.lineTo(xx,y);
   }ctx.stroke();
  }
 }else if(preset.pattern==='marble'){
  for(let i=0;i<17;i++){
   ctx.beginPath();ctx.lineWidth=.45+random()*1.65;
   ctx.strokeStyle='rgba(37,60,77,'+(.11+random()*.16).toFixed(2)+')';
   const start=random()*180-30;
   for(let y=0;y<=128;y+=3){
    const x=start+y*.3+Math.sin(y*.05+i)*12;
    if(y===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }ctx.stroke();
  }
 }else{
  for(let i=0;i<1850;i++){
   const v=random()>.5?'255,246,224':'0,0,0';
   ctx.fillStyle='rgba('+v+','+(.025+random()*.13).toFixed(3)+')';
   const r=random()*1.8+.2;ctx.fillRect(random()*128,random()*128,r,r);
  }
 }
 const texture=new THREE.CanvasTexture(cv);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.anisotropy=2;
 map.set(key,texture);return texture;
}
// Materials are already cloned per GLB piece; only diffuse meshes are re-themed.
export function applyPieceAppearance(THREE,root,config={}){
 const name=validPieceMaterial(config.material||'arcane');
 const glow=validPieceGlow(config.glow||'team');
 const color=config.color==='b'?'b':'w';
 const base=PIECE_MATERIALS[name],energy=pieceGlowHex(glow,color);
 root.traverse(obj=>{
  if(obj.isSprite&&obj.name==='Luz mágico-neón'){
   if(obj.material?.color?.set) obj.material.color.set(energy);
   return;
  }
  if(!obj.isMesh||!obj.material)return;
  const list=Array.isArray(obj.material)?obj.material:[obj.material];
  const role=obj.userData.ecoMaterialRole||'auto';
  for(const m of list){
   const emission=role==='glow'||(
    role==='auto'&&m.emissive&&m.emissiveIntensity>1.0
   );
   if(emission){
    if(m.emissive?.set)m.emissive.set(energy);
    if(m.color?.set)m.color.set(energy);
    if('emissiveIntensity' in m)m.emissiveIntensity=Math.max(2.2,m.emissiveIntensity||0);
    continue;
   }
   if(name!=='arcane'&&role!=='accent'){
    const pbr=getPhotoPBR(name);
    m.map=pbr?.color||textureFor(THREE,name);
    m.normalMap=pbr?.normal||null;
    m.roughnessMap=pbr?.roughness||null;
    m.metalnessMap=pbr?.metalness||null;
    if(m.normalMap&&m.normalScale?.set)m.normalScale.set(.32,.32);
    if(m.color?.set)m.color.set(color==='b'?'#b2abb8':'#ffffff');
    if('roughness' in m)m.roughness=base.roughness;
    if('metalness' in m)m.metalness=base.metalness;
    m.needsUpdate=true;
   }
  }
 });
 root.userData.ecoAppearance={material:name,glow,color};
 return root;
}
