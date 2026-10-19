import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PIECE_MATERIALS,PIECE_GLOWS} from '../piece-materials.js';
import {armyContrastScore,armiesAreDistinct,chooseContrastingArmy,
 normalizeArmyLook,isValidWireLook} from '../army-appearance.js';
const main=fs.readFileSync('main.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const pvp=fs.readFileSync('pvp.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');

test('Enfrentamiento automático nunca repite material, brillo ni contraste bajo',()=>{
 for(const material of Object.keys(PIECE_MATERIALS)){
  for(const glow of Object.keys(PIECE_GLOWS)){
   const own={material,glow};
   const a=chooseContrastingArmy(own,null,{random:true,rng:()=>0});
   const b=chooseContrastingArmy(own,null,{random:true,rng:()=>.999999});
   for(const enemy of [a,b]){
    assert.notEqual(enemy.material,own.material);
    assert.notEqual(enemy.glow,own.glow);
    assert.ok(armiesAreDistinct(own,enemy),JSON.stringify([own,enemy]));
    assert.ok(armyContrastScore(own,enemy)>=.29);
   }
  }
 }
});
test('Dos jugadores: la elección del dueño siempre queda intacta',()=>{
 const user={material:'walnut',glow:'emerald'};
 const requested={material:'walnut',glow:'emerald'};
 const rival=chooseContrastingArmy(user,requested);
 assert.deepEqual(user,{material:'walnut',glow:'emerald'});
 assert.notDeepEqual(rival,user);
 assert.ok(armiesAreDistinct(user,rival));
 const okay={material:'marble',glow:'violet'};
 assert.deepEqual(chooseContrastingArmy(user,okay),okay);
});
test('Paquetes PBR nuevos reutilizan solo fuentes permitidas',()=>{
 const sources=['walnut','oak','stone','marble','obsidian','bronze','gold','ice','basalt'];
 for(const material of Object.values(PIECE_MATERIALS)){
  if(material.photoSource)assert.ok(sources.includes(material.photoSource));
 }
 assert.equal(Object.keys(PIECE_MATERIALS).length,20);
 assert.equal(Object.keys(PIECE_GLOWS).length,11);
});
test('Apariencias entrantes requieren identificadores de catálogo, nunca URLs ni datos arbitrarios',()=>{
 assert.ok(isValidWireLook({material:'silver',glow:'emerald'}));
 assert.equal(isValidWireLook({material:'../../secrets',glow:'team'}),false);
 assert.equal(isValidWireLook({material:'gold',glow:'<img>'}),false);
 assert.deepEqual(normalizeArmyLook({material:'noexiste',glow:'noexiste'}),{material:'arcane',glow:'team'});
 assert.match(pvp,/data\.type==='APPEARANCE'/);
 assert.match(main,/isValidWireLook\(data\)/);
});
test('Configuración conserva selector de tipos y muestra ambos ejércitos de forma jugable',()=>{
 for(const id of ['pieceSet','piecePreviewCanvas','piecePreviewType','pieceMaterial','pieceGlow',
  'rivalMaterial','rivalGlow','rivalAppearanceMode','rerollRival','pieceContrastStatus']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 for(const kind of ['q','k','n','r','b','p'])assert.match(html,new RegExp('<option value="'+kind+'">'));
 assert.match(main,/armyLooks\(\)\[p\.color\]/);
 assert.match(main,/refreshArmy\(\{reroll:true\}\)/);
 assert.match(build,/'army-appearance\.js'/);
 assert.match(html,/id="communityPieceOption" value="community" disabled/);
 for(const file of ['pawn','rook','knight','bishop','queen','king']){
  const gltf=JSON.parse(fs.readFileSync('assets/models/staunton/'+file+'.gltf','utf8'));
  assert.equal(gltf.asset.version,'2.0');
  assert.ok(gltf.meshes?.length>0);
  assert.ok(gltf.buffers?.[0]?.uri.startsWith('data:'),'Falta geometría para '+file);
 }
});
