import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BOARD_SKINS} from '../board-skins.js';
import {EXPERIENCES,validExperience,linkedRealm,gameRealmName} from '../experience-modes.js';

const page=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const catalogue=fs.readFileSync('board-catalog-ui.js','utf8');
const portal=fs.readFileSync('ar-portal.js','utf8');
const styling=fs.readFileSync('experience-modes.css','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');

test('Three play experiences selected independently of opponent',()=>{
 assert.deepEqual(EXPERIENCES.map(x=>x.id),['normal','skybox','ar']);
 assert.equal(validExperience('skybox'),'skybox');
 assert.equal(validExperience('invalid'),'normal');
 assert.equal((page.match(/name="experienceMode"/g)||[]).length,3);
 for(const type of ['normal','skybox','ar'])assert.ok(page.includes('name="experienceMode" value="'+type+'"'));
 for(const id of ['experienceStatus','experiencePicker','startConfigured','mode','boardSkin'])
  assert.ok(page.includes('id="'+id+'"'),id);
 assert.doesNotMatch(page,/id="skyboxTryBtn"/);
 assert.match(main,/if\(experience==='skybox'\)/);
 assert.match(main,/const check=await checkSkybox/);
 assert.match(main,/else if\(experience==='ar'\)startAR\(\)/);
 assert.match(main,/gotoView\('game'\)/);
 assert.match(styling,/color-scheme:dark/);
});
test('All thirteen named kingdoms correspond unambiguously to playable 8x8 boards',()=>{
 for(const board of BOARD_SKINS.filter(x=>x.file)){
  assert.ok(linkedRealm(board.id),board.id);
  assert.equal(gameRealmName(board.id),linkedRealm(board.id).label);
 }
 assert.equal(linkedRealm('cristales').id,'magico_ancestral');
 assert.equal(linkedRealm('alquimia').id,'alquimista_eter');
 assert.equal(linkedRealm('cosmos').id,'galactico_cosmico');
 assert.equal(gameRealmName('classic'),'Reino clásico');
 assert.match(catalogue,/gameRealmName\(entry\.id\)/);
 assert.match(catalogue,/skyRealm\.label/);
});
test('Portal is anchored decoration, never an opaque virtual room or chess logic',()=>{
 assert.match(main,/arPortal=createARChessPortal/);
 assert.match(main,/arPortal\?\.setVisible\(true\)/);
 assert.match(main,/arPortal\?\.setVisible\(false\)/);
 assert.match(main,/requestSession\('immersive-ar'/);
 assert.match(main,/requestHitTestSource/);
 assert.match(portal,/THREE\.TorusGeometry/);
 assert.match(portal,/item\.raycast=\(\)=>\{\}/);
 assert.doesNotMatch(portal,/game\.move\(|match\.send\(|navigator\.xr/);
 for(const name of ["'ar-portal.js'","'experience-modes.js'","'experience-modes.css'"])
  assert.ok(build.includes(name),name);
});
