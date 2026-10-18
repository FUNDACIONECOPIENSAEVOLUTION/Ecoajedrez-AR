import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BOARD_SKINS,VISION_ART,boardURL,findBoard,boardMetrics} from '../board-skins.js';

const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const script=fs.readFileSync('board-catalog-ui.js','utf8');
const surface=fs.readFileSync('board-skins.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const prefetch=fs.readFileSync('asset-cache.js','utf8');
const worker=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));

test('User uploaded thirteen different playable textures and seven menu-only vistas',()=>{
 assert.equal(BOARD_SKINS.length,14); // Classic plus 13 user graphics.
 assert.equal(VISION_ART.length,7);
 const all=new Set();
 for(const skin of BOARD_SKINS){
  assert.ok(skin.id&&skin.label);
  if(!skin.file){assert.equal(skin.id,'classic');continue;}
  assert.match(skin.file,/^tablero_[^/]+\.webp$/u);
  assert.ok(!all.has(skin.file));all.add(skin.file);
  assert.ok(fs.existsSync('app/imagenes/tableros/'+skin.file),skin.file);
  assert.ok(build.includes(skin.file),skin.file+' unpublished');
  assert.ok(prefetch.includes(skin.file),skin.file+' no CacheStorage');
  assert.ok(worker.includes(skin.file),skin.file+' no SW cache');
  const bytes=fs.readFileSync('app/imagenes/tableros/'+skin.file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length<2500000);
  assert.ok(boardURL(skin).includes(encodeURIComponent(skin.file)));
 }
 for(const view of VISION_ART){
  assert.match(view.file,/^vista[-_].+\.webp$/u);
  assert.ok(!all.has(view.file));
  assert.ok(fs.existsSync('app/imagenes/tableros/'+view.file));
  assert.ok(build.includes(view.file),'missing decorative '+view.file);
  assert.ok(!prefetch.includes(view.file),'vista images must not be auto-cached as board');
  assert.ok(!worker.includes(view.file),'vista images are decorative');
 }
 assert.equal(findBoard('not-real').id,'classic');
});
test('Images are visual-only boards: playable tiles remain 64 and moves/raycast stay unchanged',()=>{
 assert.match(main,/for\(let row=0;row<8;row\+\+\) for\(let col=0;col<8;col\+\+\)/);
 assert.match(main,/boardSurface=createBoardSurface/);
 assert.match(main,/eco:board-skin-select/);
 assert.match(main,/syncBoardTexture\(active,width,depth\)/);
 assert.match(surface,/new THREE\.PlaneGeometry\(8,8\)/);
 assert.match(surface,/plane\.raycast=\(\)=>\{\}/);
 assert.match(surface,/plane\.scale\.set\(metrics\.width\/8,metrics\.depth\/8,1\)/);
 assert.match(surface,/THREE\.SRGBColorSpace/);
 assert.match(surface,/TextureLoader/);
 assert.doesNotMatch(surface,/game\.move|PeerMatch|game\.load|game\.undo|chess\.js/);
 assert.match(surface,/Math\.min\(8,renderer\.capabilities\.getMaxAnisotropy\(\)\)/);
});
test('Separate selectable real board and independent vista menu art; scaling independent from AR',()=>{
 for(const id of ['boardSkin','boardSkinPreview','toolsBoardSkin','visionGallery','visionArt','visionNext','visionPrev'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(script,/window\.ecoBoardCatalogue=/);
 assert.match(script,/localStorage\.setItem\('ecoajedrez-board-skin'/);
 assert.doesNotMatch(script,/eco:board-grid-coverage/);
 assert.match(script,/VISION_ART\[galleryIndex\]/);
 assert.match(script,/boardURL\(skin\)/);
 assert.match(main,/world\.scale\.setScalar/);
 assert.match(main,/boardSurface\.select/);
 assert.match(main,/boardSkin:\$\('boardSkin'\)\.value/);
 assert.ok(html.includes('board-catalog.css?v=0.14.3'));
 assert.equal(manifest.version,'0.14.3-beta.1');
});
test('Approved board texture list is lazy: initial downloads stay at 14 original resources',()=>{
 assert.match(prefetch,/const boardPaths=boardFiles\.map/);
 assert.match(prefetch,/new Set\(\[\.\.\.resourcePaths,\.\.\.boardPaths\]/);
 assert.match(prefetch,/const paths=modelsOnly\?modelPaths:resourcePaths/);
 assert.match(worker,/const boardPaths=boardNames\.map/);
 assert.match(worker,/url\.origin!==self\.location\.origin/);
 assert.match(build,/No.*unspecified|Never publish unspecified files/);
});

test('Each real board has bounded measured 8x8 grid coordinates and a correctly sized physical frame',()=>{
 for(const entry of BOARD_SKINS.filter(item=>item.file)){
   const g=entry.grid;
   assert.equal(g.length,4);
   assert.ok(g[0]>0&&g[1]>0&&g[2]<1&&g[3]<1);
   assert.ok(g[2]>g[0]&&g[3]>g[1]);
   assert.ok([7,8].includes(entry.cells));
   const m=boardMetrics(entry);
   assert.ok(m.width>=8&&m.depth>=8);
   const xLeft=m.centerX+(g[0]-.5)*m.width;
   const xRight=m.centerX+(g[2]-.5)*m.width;
   const zTop=m.centerZ+(g[1]-.5)*m.depth;
   const zBottom=m.centerZ+(g[3]-.5)*m.depth;
   for(const [actual,expected] of [[xLeft,-4],[xRight,4],[zTop,-4],[zBottom,4]])
     assert.ok(Math.abs(actual-expected)<1e-10,entry.id+' '+actual+' != '+expected);
 }
 assert.equal(BOARD_SKINS.filter(entry=>entry.cells===7).length,1);
 assert.equal(findBoard('cyber').cells,7);
 assert.match(surface,/new THREE.CanvasTexture\(corrected\)/);
 assert.match(surface,/srcCol=col===7\?5:col/);
 assert.match(main,/colorWrite:false,depthWrite:false/);
 assert.match(main,/boardTopMask/);
 assert.doesNotMatch(html,/id="boardCoverage"/);
});
