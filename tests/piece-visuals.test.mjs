import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 PIECE_MATERIALS,PIECE_GLOWS,validPieceMaterial,validPieceGlow,pieceGlowHex
} from '../piece-materials.js';
import {faceMovement,createChessCombat} from '../piece-combat.js';
const main=fs.readFileSync('main.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('piece-preview.css','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const preview=fs.readFileSync('piece-preview.js','utf8');

test('Twenty selectable finishes and eleven glowing colors are available to both armies',()=>{
 assert.equal(Object.keys(PIECE_MATERIALS).length,20);
 assert.equal(Object.keys(PIECE_GLOWS).length,11);
 for(const name of ['walnut','oak','stone','marble','obsidian','bronze','gold','ice','basalt']){
  assert.ok(PIECE_MATERIALS[name].label);
 }
 assert.equal(validPieceMaterial('marble'),'marble');
 assert.equal(validPieceMaterial('random'),'arcane');
 assert.equal(validPieceGlow('violet'),'violet');
 assert.equal(validPieceGlow('invalid'),'team');
 assert.notEqual(pieceGlowHex('team','w'),pieceGlowHex('team','b'));
 assert.equal(pieceGlowHex('amber','w'),pieceGlowHex('amber','b'));
});
test('Direction-aware chess walking handles left, right and vertical/diagonal travel',()=>{
 const actor={rotation:{y:0}};
 assert.equal(faceMovement(actor,0,1),0);
 assert.ok(Math.abs(faceMovement(actor,1,0)-Math.PI/2)<1e-8);
 assert.ok(Math.abs(faceMovement(actor,-1,0)+Math.PI/2)<1e-8);
 assert.ok(Math.abs(faceMovement(actor,-1,-1)+Math.PI*.75)<1e-8);
 assert.equal(faceMovement(actor,0,0),0);
 assert.match(main,/faceMovement\(target,b\.x-a\.x,b\.z-a\.z\)/);
 assert.match(main,/target\.position\.set\(a\.x,\.07,a\.z\)/);
});
test('Duel keeps defender visible during impact and removes it after its defeat',()=>{
 class Vector{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}clone(){return new Vector(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}multiplyScalar(k){return this.set(this.x*k,this.y*k,this.z*k)}}
 class Group{
  constructor(){this.children=[];this.name=''}
  add(o){this.children.push(o)}
  remove(o){this.children=this.children.filter(x=>x!==o)}
 }
 let disposal=0;const world=new Group();
 const effect=createChessCombat({THREE:{Group},world,disposePiece:()=>disposal++});
 const defender={position:new Vector(),rotation:{y:0,z:0},scale:new Vector(1,1,1),userData:{anthro:{armR:{rotation:{x:0}},armL:{rotation:{x:0}}}}};
 const attacker={rotation:{y:0,z:0}};
 assert.equal(effect.start({defender,attacker,from:{x:0,z:3},to:{x:1,z:1},start:0,duration:800}),true);
 assert.equal(effect.active(),true);
 assert.equal(world.children.length,1);
 effect.tick(550);
 assert.ok(defender.rotation.z!==0);
 assert.ok(defender.userData.anthro.armR.rotation.x!==0);
 effect.tick(720);
 assert.ok(defender.scale.y<1);
 effect.tick(800);
 assert.equal(effect.active(),false);
 assert.equal(disposal,1);
});
test('Preview has actual 3D canvas and material/glow controls and uses game visuals',()=>{
 for(const id of ['piecePreviewCanvas','piecePreviewType','pieceMaterial','pieceGlow','piecePreviewPanel']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(html,/piece-preview\.css\?v=0\.15\.6/);
 assert.match(css,/grid-template-columns/);
 assert.match(css,/@media\(max-width:750px\)/);
 assert.match(main,/piecePreview=createPiecePreview/);
 assert.match(main,/createVisual:p=>createPieceVisual\(p\)/);
 assert.match(main,/piecePreview\?\.tick\(timestamp\|\|performance\.now\(\)\)/);
 assert.match(main,/applyPieceAppearance\(THREE,g,/);
 assert.match(main,/eco-piece-material/);
 assert.match(main,/eco-piece-glow/);
 assert.match(preview,/powerPreference:'low-power'/);
 assert.match(preview,/time-last<50/);
 assert.match(preview,/getBoundingClientRect|clientWidth/);
 for(const f of ['piece-materials.js','piece-preview.js','piece-combat.js','piece-preview.css']){
  assert.ok(build.includes("'"+f+"'"),f);
 }
});
test('Captured opponent is detached before the board is reconstructed, including en passant',()=>{
 assert.match(main,/function detachCapturedPiece\(moved\)/);
 assert.match(main,/moved\.to\[0\]\+moved\.from\[1\]/);
 assert.match(main,/victim=detachCapturedPiece\(moved\)/);
 assert.match(main,/renderPieces\(\);animateMove\(from,to,captured,victim\)/);
 assert.match(main,/combatFX\?\.start\(/);
 assert.match(main,/combatFX\?\.tick\(timestamp\|\|performance\.now\(\)\)/);
 assert.match(main,/game\.move\(\{from,to,promotion\}\)/);
});
