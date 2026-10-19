import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BOARD_SKINS } from '../board-skins.js';
import {BOARD_REALM_THEMES,BOARD_REALM_IMAGES,realmCandidates,realmTheme,realmURL} from '../realm-pairing.js';

const main=fs.readFileSync('main.js','utf8');
const world=fs.readFileSync('magic-world.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const html=fs.readFileSync('index.html','utf8');
const chooser=fs.readFileSync('board-catalog-ui.js','utf8');
const css=fs.readFileSync('victory-fx.css','utf8');

test('Ten real uploaded WebP realms pair all 13 visual boards',()=>{
 const playable=BOARD_SKINS.filter(item=>item.file);
 assert.equal(playable.length,13);
 assert.equal(Object.keys(BOARD_REALM_THEMES).length,13);
 assert.equal(new Set(Object.values(BOARD_REALM_IMAGES)).size,10);
 for(const skin of playable){
  assert.ok(realmTheme(skin.id),skin.id);
  assert.ok(realmURL(skin.id).endsWith(BOARD_REALM_IMAGES[skin.id]),skin.id);
  assert.ok(fs.existsSync('app/imagenes/entornos/'+BOARD_REALM_IMAGES[skin.id]),skin.id);
  assert.equal(realmCandidates(skin.id)[0],'entorno_'+skin.id+'.webp');
 }
 assert.equal(realmTheme('classic'),null);
 assert.equal(realmURL('classic'),null);
 assert.ok(fs.existsSync('app/imagenes/entornos/README.md'));
});
test('Pairs use generated manifest, with no 404 preload or free-form directory publishing',()=>{
 assert.match(build,/const realmFiles=/);
 assert.match(build,/fs\.existsSync\(src\)/);
 assert.match(build,/data\.length>3000000/);
 assert.match(build,/manifest\.json/);
 assert.match(main,/syncSelectedRealm\(code\)/);
 assert.match(main,/publishedRealmURL\(id\)/);
 assert.match(world,/setRealmImage\(path\)/);
 assert.doesNotMatch(world,/fetch\(/);
 assert.match(html,/id="boardRealmPreview"/);
 assert.match(html,/id="boardRealmEmpty"/);
 assert.match(chooser,/previewRealm\(skin.id\)/);
 assert.match(css,/vista_de_ajedrez_celestial_encantado\.webp/);
 assert.match(main,/syncSelectedRealm\(catalogue\?\.getSelected\(\)\|\|'classic'\)/);
});
test('AR retains the camera; source assets and game moves do not change',()=>{
 assert.match(world,/sceneArt\.visible=!active/);
 assert.match(world,/scene\.background=null/);
 assert.match(main,/world\.scale\.setScalar/);
 assert.match(main,/getSelected\(\)/);
 const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));
 assert.equal(manifest.version,'0.15.4-beta.1');
 assert.equal(manifest.environments.pairCount,13);
 assert.equal(manifest.physicalARValidated,false);
});
