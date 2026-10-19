// Apariencia por EJÉRCITO. Sin estado ni DOM: mismas reglas en 3D, Skybox, AR y PvP.
// Solo cambia el aspecto visual; chess.js sigue siendo el único árbitro.
import {PIECE_MATERIALS,PIECE_GLOWS,validPieceMaterial,validPieceGlow,pieceGlowHex} from './piece-materials.js?v=0.15.7';

export function normalizeArmyLook(value){
 return {
  material: validPieceMaterial(value?.material),
  glow: validPieceGlow(value?.glow)
 };
}
function rgb(hex){
 const h=String(hex||'#888888').replace('#','');
 return h.length===6?[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)):[128,128,128];
}
function distance(a,b){
 const p=rgb(a),q=rgb(b);
 return Math.hypot(...p.map((c,i)=>c-q[i]))/Math.sqrt(3*255*255);
}
function luminance(hex){
 return rgb(hex).map(v=>{
  const c=v/255;
  return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
 }).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
}
export function armyContrastScore(first,second){
 const a=normalizeArmyLook(first),b=normalizeArmyLook(second);
 if(a.material===b.material || a.glow===b.glow)return -1;
 const m=PIECE_MATERIALS, aHex=m[a.material].tint||m[a.material].base,
  bHex=m[b.material].tint||m[b.material].base;
 const baseDistance=distance(aHex,bHex),
  lightDistance=Math.abs(luminance(aHex)-luminance(bHex));
 const glowDistance=distance(pieceGlowHex(a.glow,'w'),pieceGlowHex(b.glow,'b'));
 // Diferencias de reflejo (metal/madera/piedra) suman legibilidad.
 const metalDifference=Math.abs(m[a.material].metalness-m[b.material].metalness);
 return baseDistance*.46+lightDistance*.9+glowDistance*.65+metalDifference*.17;
}
export function armiesAreDistinct(first,second){
 const score=armyContrastScore(first,second);
 return score>=.29;
}
export function chooseContrastingArmy(own,requested=null,{random=false,rng=Math.random}={}){
 const player=normalizeArmyLook(own),wish=requested?normalizeArmyLook(requested):null;
 if(!random&&wish&&armiesAreDistinct(player,wish))return wish;
 const candidateMaterials=Object.keys(PIECE_MATERIALS);
 const candidateGlows=Object.keys(PIECE_GLOWS);
 const options=[];
 for(const material of candidateMaterials)for(const glow of candidateGlows){
  const look={material,glow},score=armyContrastScore(player,look);
  if(score<.29)continue;
  // Si el segundo jugador eligió algo incompatible, priorizar conservar
  // su material o su brillo. No modificar jamás la elección del primero.
  const preference=(!random&&wish?
    (material===wish.material ? 0.52 : 0)+(glow===wish.glow ? 0.22 : 0):0);
  options.push({look,score:score+preference});
 }
 options.sort((a,b)=>b.score-a.score);
 if(!options.length)return {material:'marble',glow:'violet'};
 if(!random)return options[0].look;
 // Aleatorio entre las mejores 8 combinaciones: contraste alto sin repetición.
 const pool=options.slice(0,Math.min(8,options.length));
 const index=Math.min(pool.length-1,Math.max(0,Math.floor(Number(rng())*pool.length)||0));
 return pool[index].look;
}
export const isValidWireLook=value=>Boolean(value&&typeof value==='object'&&
 typeof value.material==='string'&&Object.hasOwn(PIECE_MATERIALS,value.material)&&
 typeof value.glow==='string'&&Object.hasOwn(PIECE_GLOWS,value.glow));
