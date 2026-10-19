import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ANTHRO_TYPES,ANTHRO_GLB,ANTHRO_MANIFEST,anthroRootName,
 collectAnthroSources,createAnthroVisual,tickAnthroVisuals} from '../anthropomorphic-pieces.js';
const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');

test('Antropomorfas is selectable FREE and replaces none of the existing game modes',()=>{
 assert.match(html,/value="anthro" selected>.*GRATIS/);
 assert.match(html,/value="staunton"/);
 assert.match(html,/value="royal"/);
 assert.match(html,/value="community" disabled/);
 assert.match(main,/createAnthroVisual\(THREE,p,anthroSources\)/);
 assert.match(main,/tickAnthroVisuals\(pieces,moving,t,/);
 assert.match(main,/loadAnthroModel\(\)/);
 assert.match(main,/if\(modelSet==='anthro'\)/);
 assert.match(main,/function playMove\(from,to,promotion/);
 assert.match(main,/game\.move\(\{from,to,promotion\}\)/);
 assert.equal(ANTHRO_GLB,'./assets/models/anthropomorphic/anthropomorphic-chess.glb');
 assert.equal(ANTHRO_MANIFEST,'./assets/models/anthropomorphic/manifest.json');
});
test('One uploaded GLB can provide the twelve types/colours and walking clips',()=>{
 assert.deepEqual(Object.keys(ANTHRO_TYPES),['p','r','n','b','q','k']);
 assert.equal(anthroRootName('w','p'),'White_Pawn_1');
 assert.equal(anthroRootName('b','k'),'Black_King_5');
 const names=['w','b'].flatMap(c=>Object.keys(ANTHRO_TYPES).map(t=>anthroRootName(c,t)));
 const clips=names.map(n=>({name:n+'_Walk'}));
 const nodes=new Set(names);
 const asset={scene:{getObjectByName:n=>nodes.has(n)?{name:n}:null},animations:clips};
 assert.equal(collectAnthroSources(asset).size,12);
 assert.equal(collectAnthroSources({...asset,animations:clips.slice(0,11)}).size,11);
 assert.match(build,/Anthropomorphic GLB must contain 32 named pieces and 32 Walk clips/);
 assert.match(build,/if\(fs.existsSync\(anthroPath\)\)/);
 assert.match(build,/readUInt32LE\(8\)!==bin\.length/);
 assert.match(build,/Approved free anthropomorphic GLB/);
});
test('Animated free fallback genuinely swings opposite arms and legs while moving',()=>{
 class Vec{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z=0){this.x=x;this.y=y;this.z=z}}
 class Object3D{
  constructor(){this.children=[];this.userData={};this.position=new Vec();this.rotation=new Vec();this.castShadow=false}
  add(x){this.children.push(x)}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}
 }
 class Mesh extends Object3D{constructor(geo,mat){super();this.geometry=geo;this.material=mat;this.isMesh=true}}
 class Material{constructor(args){Object.assign(this,args)}}
 const Geo=class{};
 const THREE={Group:Object3D,Mesh,MeshStandardMaterial:Material,
  CylinderGeometry:Geo,SphereGeometry:Geo,BoxGeometry:Geo,ConeGeometry:Geo,TorusGeometry:Geo};
 const white=createAnthroVisual(THREE,{color:'w',type:'p'});
 const black=createAnthroVisual(THREE,{color:'b',type:'n'});
 assert.equal(white.userData.anthro.kind,'procedural');
 assert.equal(black.userData.anthro.kind,'procedural');
 assert.ok(white.children.length>=1);
 const scene={children:[white,black]};
 const moving={piece:white};
 tickAnthroVisuals(scene,moving,110,0.016);
 const a=white.userData.anthro;
 assert.ok(Math.abs(a.armL.rotation.x)>0);
 assert.equal(a.armL.rotation.x,-a.armR.rotation.x);
 assert.equal(a.legL.rotation.x,-a.legR.rotation.x);
 assert.ok(a.gem.emissiveIntensity>2);
 tickAnthroVisuals(scene,null,220,0.016);
 assert.equal(a.armL.rotation.x,0);
 assert.equal(a.legL.rotation.x,0);
});
test('No speculative native billing or videos are activated by the FREE character set',()=>{
 assert.ok(fs.existsSync('assets/models/anthropomorphic/README.md'));
 assert.doesNotMatch(main,/rewardedAd\.show|MobileAds\.initialize|buyPremiumArmy/);
 assert.match(build,/fs\.writeFileSync\(path\.join\(destination,'manifest.json'\)/);
});
