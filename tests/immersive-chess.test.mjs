import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {realmForBoard,skyboxFaceUrls} from '../skybox-config.js';

const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const module=fs.readFileSync('immersive-chess.js','utf8');
const css=fs.readFileSync('immersive-chess.css','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');

test('3D immersion reuses the actual chessboard and maps every kingdom correctly',()=>{
 assert.equal(realmForBoard('cosmos')?.id,'galactico_cosmico');
 assert.deepEqual(skyboxFaceUrls('galactico_cosmico').map(x=>x.split('/').at(-1)),
 ['px.webp','nx.webp','py.webp','ny.webp','pz.webp','nz.webp']);
 for(const id of ['realmMiniControls','realmHudButton','realmFocusButton','realmGyroButton','realmExitButton','realmEnterBtn','realmQuickBtn'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(main,/createImmersiveChess\(/);
 assert.match(main,/realmImmersion\?\.isPanGesture\(\)/);
 assert.match(main,/realmImmersion\?\.enter\(\)/);
 assert.match(main,/realmImmersion\?\.exit\(\)/);
 assert.match(module,/new THREE\.CubeTextureLoader\(\)\.load\(skyboxFaceUrls\(realm\.id\)/);
 assert.match(module,/camera\.lookAt\(0,\.1,0\)/);
 assert.match(module,/floor\.visible=true/);
 assert.match(module,/getInteractivePiece\(event\.clientX,event\.clientY\)/);
 assert.match(css,/realm-hud-hidden #gameHud/);
 assert.match(css,/#realmMiniControls\[hidden\]/);
 assert.ok(build.includes("'immersive-chess.js'"));
 assert.ok(build.includes("'immersive-chess.css'"));
});
test('Immersion is optional, resets camera and never changes chess or passthrough',()=>{
 assert.match(module,/scene\.background=background/);
 assert.match(module,/scene\.background=null;restore\(\)/);
 assert.match(module,/if\(!realm\)/);
 assert.match(module,/requestPermission/);
 assert.doesNotMatch(module,/game\.move\(|match\.send\(|getUserMedia\(|navigator\.xr\.requestSession/);
 assert.match(main,/if\(view!=='game'\)realmImmersion\?\.exit\(\)/);
 assert.match(main,/async function startAR\(\)\{\s*realmImmersion\?\.exit\(\)/);
});
