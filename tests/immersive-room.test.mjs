import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SKYBOX_REALMS,SKYBOX_FACES,skyboxFaceUrls,realmForBoard} from '../skybox-config.js';
import {AR_ROOM_SIZES,arRoomSize} from '../immersive-room.js';
import {BOARD_SKINS} from '../board-skins.js';
const main=fs.readFileSync('main.js','utf8');
const room=fs.readFileSync('immersive-room.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');

test('All thirteen uploaded full cubemaps are paired with the selected real chessboard',()=>{
 const boards=BOARD_SKINS.filter(b=>b.file);
 assert.equal(boards.length,13);assert.equal(SKYBOX_REALMS.length,13);
 for(const b of boards){
  const realm=realmForBoard(b.id);
  assert.ok(realm, b.id);
  const faces=skyboxFaceUrls(realm.id);
  assert.equal(faces.length,6,realm.id);
  assert.deepEqual(faces,SKYBOX_FACES.map(name=>'./app/imagenes/skybox/'+realm.id+'/'+name+'.webp'));
  for(const path of faces){
   const buffer=fs.readFileSync(path);
   assert.ok(buffer.byteLength>=1024&&buffer.byteLength<=3000000,path);
   assert.equal(buffer.toString('ascii',0,4),'RIFF');
   assert.equal(buffer.toString('ascii',8,12),'WEBP');
  }
 }
 assert.match(main,/const sq=pick3DSquare\(x,y\),piece=sq&&game\.get\(sq\)/);
 assert.match(main,/realmImmersion\?\.enter\(\)/);
 assert.match(main,/boardSurface\.select\(catalogue\.getSelected\(\)\)/);
 assert.match(main,/new Chess\(\)/);
});
test('AR room has three sizes independently of the chessboard scale and is always translucent',()=>{
 assert.deepEqual(Object.keys(AR_ROOM_SIZES),['mesa','sala','gigante']);
 assert.equal(arRoomSize('mesa').width,2.6);
 assert.equal(arRoomSize('sala').width,4.8);
 assert.equal(arRoomSize('gigante').width,9);
 assert.equal(arRoomSize('invalid').width,4.8);
 assert.match(room,/new THREE\.BoxGeometry\(size\.width,size\.height,size\.width\)/);
 assert.match(room,/new THREE\.TextureLoader\(\)\.load\(url/);
 assert.match(room,/map:texture,side:THREE\.DoubleSide,transparent:true/);
 assert.match(room,/opacity=\.40/);
 assert.match(room,/Math\.min\(\.60/);
 assert.match(room,/depthWrite:false/);
 assert.match(room,/const request=token/);
 assert.match(room,/root\.visible=false;release\(\)/);
 assert.match(room,/currentBoard=boardId/);
 assert.doesNotMatch(room,/navigator\.xr\.requestSession|getUserMedia|game\.move\(|PeerMatch/);
});
test('AR room requires a detected hit-test board and can be hidden immediately',()=>{
 for(const id of ['arRoomSize','arBoardPreset','arRoomOpacity','arRoomToggle','arRoomStatus','arScale']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(main,/arRoom\?\.place\(window\.ecoBoardCatalogue\?\.getSelected\(\)\|\|'classic',world\.position\.clone\(\)\)/);
 assert.match(main,/arRoom\?\.clear\(\)/);
 assert.match(main,/arRoom\?\.moveTo\(world\.position\)/);
 assert.match(main,/arRoom\.setVisible\(!arRoom\.visible\(\)\)/);
 assert.match(main,/arRoom\?\.setOpacity\(event\.target\.value\)/);
 assert.match(main,/arRoom\?\.setSize\(event\.target\.value\)/);
 assert.match(main,/requestSession\('immersive-ar'/);
 assert.match(main,/requestHitTestSource/);
 assert.match(main,/lastHitResult\.createAnchor\(\)/);
 assert.match(main,/getPose\(spatialAnchor\.anchorSpace,arSpace\)/);
 assert.match(main,/arPortal\?\.setVisible\(false\)/);
 assert.ok(build.includes("'immersive-room.js'"));
 assert.ok(build.includes("'immersive-room.css'"));
});
