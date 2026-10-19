import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PBR_ROOT,loadPhotoPBR,getPhotoPBR,pbrTextureLoaded} from '../piece-pbr.js?v=0.15.6';
import {PIECE_MATERIALS,applyPieceAppearance} from '../piece-materials.js';
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const main=fs.readFileSync('main.js','utf8');
const preview=fs.readFileSync('piece-preview.js','utf8');
const root='assets/texturas-pbr';

test('A PBR material download workspace exists without unverified third-party images',()=>{
 for(const id of ['walnut','oak','stone','marble','obsidian','bronze','gold','ice','basalt']){
  assert.ok(fs.existsSync(root+'/'+id+'/README.md'));
  assert.ok(PIECE_MATERIALS[id]);
 }
 assert.equal(PBR_ROOT,'./assets/texturas-pbr');
 assert.ok(fs.existsSync(root+'/README.md'));
});
test('Build validates approved maps and publishes only whitelisted local PBR images',()=>{
 assert.match(build,/const allowedPBR=\['walnut','oak','stone','marble','obsidian','bronze','gold','ice','basalt'\]/);
 assert.match(build,/const pbrManifest=\{version:1,materials:\{\}\}/);
 assert.match(build,/if\(maps\.color\)pbrManifest\.materials\[id\]=maps/);
 assert.match(build,/file\.length>2000000/);
 assert.match(build,/file\.toString\('ascii',8,12\)==='WEBP'/);
 assert.match(build,/Skipping incomplete PBR preset lacking color/);
 assert.doesNotMatch(build,/fs\.cpSync\('assets\/texturas-pbr'/);
});
test('Real PBR is loaded on-demand from GitHub Pages with correct color spaces',async()=>{
 const original=globalThis.fetch;
 const requested=[];
 try{
  globalThis.fetch=async url=>{
   assert.equal(url,PBR_ROOT+'/manifest.json');
   return {ok:true,json:async()=>({version:1,materials:{walnut:{
    color:'walnut/color.jpg',normal:'walnut/normal.jpg',roughness:'walnut/roughness.jpg'
   }}})};
  };
  class TextureLoader{load(url,done){requested.push(url);done({url});}}
  const THREE={TextureLoader,SRGBColorSpace:'srgb',NoColorSpace:'linear',RepeatWrapping:1000};
  const result=await loadPhotoPBR(THREE,'walnut');
  assert.equal(result.color.colorSpace,'srgb');
  assert.equal(result.normal.colorSpace,'linear');
  assert.equal(result.roughness.colorSpace,'linear');
  assert.ok(requested.every(x=>x.startsWith(PBR_ROOT+'/walnut/')));
  assert.equal(requested.length,3);
  assert.equal(getPhotoPBR('walnut'),result);
  assert.equal(pbrTextureLoaded('walnut'),true);
 }finally{globalThis.fetch=original;}
});
test('The real material keeps original magic gems and adds normal/roughness maps',()=>{
 const pbr=getPhotoPBR('walnut');
 class Color{constructor(x){this.value=x}set(x){this.value=x}}
 const material={color:new Color(),emissive:new Color(),roughness:.5,metalness:.1,
  emissiveIntensity:0,normalScale:{set(x,y){this.xy=[x,y]}}};
 const gem={color:new Color(),emissive:new Color(),emissiveIntensity:3,roughness:.1};
 const nodes=[{isMesh:true,material,userData:{ecoMaterialRole:'body'}},
  {isMesh:true,material:gem,userData:{ecoMaterialRole:'glow'}}];
 const root={userData:{},traverse(fn){for(const n of nodes)fn(n)}};
 applyPieceAppearance({SRGBColorSpace:'srgb'},root,{material:'walnut',glow:'cyan',color:'w'});
 assert.equal(material.map,pbr.color);
 assert.equal(material.normalMap,pbr.normal);
 assert.equal(material.roughnessMap,pbr.roughness);
 assert.deepEqual(material.normalScale.xy,[.50,.50]);
 assert.ok(gem.emissive.value);
 assert.equal(gem.emissiveIntensity,3);
 assert.match(main,/loadPhotoPBR\(THREE,source\)/);
 assert.match(main,/piecePreview\?\.rebuild\(\)/);
 assert.match(preview,/camera\.position\.set\(0,1\.55,3\.55\)/);
});
