import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SKYBOX_REALMS,SKYBOX_FACES,skyboxFaceUrls,realmForBoard,findSkyboxRealm} from '../skybox-config.js';
import {BOARD_SKINS} from '../board-skins.js';

const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const viewer=fs.readFileSync('skybox-test.js','utf8');
const page=fs.readFileSync('skybox-test.html','utf8');
const game=fs.readFileSync('index.html','utf8');
const chooser=fs.readFileSync('board-catalog-ui.js','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));

test('Thirteen realms each have README and correct six cubemap face names',()=>{
 assert.equal(SKYBOX_REALMS.length,13);
 assert.deepEqual(SKYBOX_FACES,['px','nx','py','ny','pz','nz']);
 assert.equal(new Set(SKYBOX_REALMS.map(r=>r.id)).size,13);
 assert.equal(new Set(SKYBOX_REALMS.map(r=>r.board)).size,13);
 assert.deepEqual(new Set(SKYBOX_REALMS.map(r=>r.board)),
  new Set(BOARD_SKINS.filter(s=>s.file).map(s=>s.id)));
 for(const realm of SKYBOX_REALMS){
  assert.equal(findSkyboxRealm(realm.id)?.board,realm.board);
  assert.equal(realmForBoard(realm.board)?.id,realm.id);
  assert.ok(fs.existsSync('app/imagenes/skybox/'+realm.id+'/README.md'));
  assert.deepEqual(skyboxFaceUrls(realm.id),SKYBOX_FACES.map(face=>'./app/imagenes/skybox/'+realm.id+'/'+face+'.webp'));
 }
 assert.deepEqual(skyboxFaceUrls('unknown'),[]);
 assert.equal(realmForBoard('classic'),null);
});
test('Pages only publishes complete, matching, validated six-face WebP sets',()=>{
 for(const p of ["'skybox-test.html'","'skybox-test.css'","'skybox-test.js'","'skybox-config.js'"])
  assert.ok(build.includes(p),p);
 assert.match(build,/const \{SKYBOX_REALMS,SKYBOX_FACES\}=await import/);
 assert.match(build,/if\(missing\.length\)continue/);
 assert.match(build,/buf\.length>3000000/);
 assert.match(build,/d\.width!==d\.height/);
 assert.match(build,/d\.width!==first\?\.width/);
 assert.match(build,/manifest\.json/);
 assert.ok(fs.existsSync('app/imagenes/skybox/README.md'));
});
test('360 degree tester uses CubeTextureLoader, drag, gyro permission and no chess or XR mutation',()=>{
 assert.match(viewer,/new THREE\.CubeTextureLoader\(\)\.load\(skyboxFaceUrls\(id\)/);
 assert.match(viewer,/method:'HEAD'/);
 assert.match(viewer,/const checked=fromManifest\?\.ready\?fromManifest:await probeFaces\(id\)/);
 assert.match(viewer,/enterButton\.addEventListener\('click',enterRealm\)/);
 assert.match(viewer,/retryButton\.addEventListener\('click'/);
 assert.match(viewer,/exitButton\.addEventListener\('click',exitRealm\)/);
 assert.doesNotMatch(viewer,/getUserMedia/);
 assert.match(viewer,/camera\.position\.set\(0,0,0\)/);
 assert.match(viewer,/DeviceOrientationEvent\.requestPermission/);
 assert.match(viewer,/pointermove/);
 assert.match(viewer,/loaded\.colorSpace=THREE\.SRGBColorSpace/);
 assert.doesNotMatch(viewer,/game\.move\(|match\.send\(|navigator\.xr\.requestSession/);
 assert.match(viewer,/menuToggle\.addEventListener\('click'/);
 for(const id of ['skyCanvas','skyRealmSelect','skyGyro','skyReset','skyStatus','skyEnter','skyRetry','skyExit','skyMenuToggle'])
  assert.ok(page.includes('id="'+id+'"'));
 assert.doesNotMatch(game,/id="skyboxTryBtn"/);
 assert.match(chooser,/realmForBoard\(skin\.id\)/);
 assert.equal(version.version,'0.15.6-beta.1');
 assert.equal(version.skybox360.realmCount,13);
 assert.equal(version.skybox360.fullCubemapsUploadedAtRelease,13);
 assert.equal(version.physicalARValidated,false);
});
