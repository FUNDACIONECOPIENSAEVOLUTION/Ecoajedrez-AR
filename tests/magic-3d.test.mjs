import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lastMoveInfo } from '../last-move-ghost.js';
import { BIOME_BACKDROPS } from '../magic-world.js';

const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const ghost=fs.readFileSync('last-move-ghost.js','utf8');
const world=fs.readFileSync('magic-world.js','utf8');
const css=fs.readFileSync('magic-game.css','utf8');
const legal=fs.readFileSync('legal-consent.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));

test('Last-move metadata is pure: origin/destination/piece; no chess or remote state mutations',()=>{
 assert.equal(lastMoveInfo([]),null);
 const history=[{from:'e2',to:'e4',piece:'p',color:'w',san:'e4'},{from:'g8',to:'f6',piece:'n',color:'b',san:'Nf6'}];
 const before=JSON.stringify(history);
 assert.deepEqual(lastMoveInfo(history),{from:'g8',to:'f6',piece:'n',color:'b',san:'Nf6'});
 assert.equal(JSON.stringify(history),before);
 assert.equal(lastMoveInfo([{from:'e2',to:'e9',piece:'p'}]),null);
 assert.match(ghost,/LocalOnlyLastMoveGhost/);
 assert.match(ghost,/timer=setTimeout\(clear,4500\)/);
 assert.doesNotMatch(ghost,/match\.send|game\.move|game\.undo|broadcastState/);
 assert.match(main,/ghostHint\?\.show\(game\.history\(\{verbose:true\}\)\)/);
 assert.match(main,/ghostHint\?\.clear\(\)/);
 assert.doesNotMatch(main,/const verbose=game\.history\(\{verbose:true\}\);\s*const latest=/);
});
test('AR quick action and game menu have real click handlers and move history / biome controls',()=>{
 for(const id of ['lastMoveBtn','quickArBtn','lastMoveMessage','gameTools','toolsContinue','toolsClose',
   'toolsLastMove','toolsAR','toolsTheme','toolsHistory','toolsSave','toolsLegal','toolsExit','quality'])
   assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(main,/\$\('quickArBtn'\)\.onclick=\(\)=>startAR\(\)/);
 assert.match(main,/\$\('toolsAR'\)\.onclick=/);
 assert.match(main,/\$\('toolsHistory'\)\.onclick=/);
 assert.match(main,/\$\('downloadPgn'\)\.click\(\)/);
 assert.match(main,/menuButton\.onclick=openGameTools/);
 assert.match(css,/\.magicQuickBar/);
 assert.match(css,/@media\(max-width:760px\)/);
});
test('Only existing approved scene artwork used; scenery is separate from chess squares and hidden in AR',()=>{
 for(const key of ['classic','jungle','wood','neon','marble','volcano','ice']){
  const asset=BIOME_BACKDROPS[key];
  assert.match(asset,/^\.\.?\//);
  assert.ok(fs.existsSync(asset.replace(/^\.\//,'')),asset);
 }
 assert.match(world,/scene\.background=null/);
 assert.match(world,/setClearColor\(0x000000,0\)/);
 assert.match(world,/sceneArt\.visible=!active/);
 assert.match(world,/renderer/);
 assert.match(world,/reduce/);
 assert.doesNotMatch(world,/fetch\(|localStorage|WebSocket/);
 assert.match(main,/magicEnv\?\.rebuild\(theme\)/);
 assert.match(main,/magicEnv\?\.setAR\(isAR\)/);
 assert.match(css,/body\.xr-active #scene/);
});
test('Terms/privacy first-use gate stores minimal local acknowledgement; permissions remain contextual',()=>{
 for(const id of ['legalDialog','legalAcceptance','legalCheck','legalAccept','legalClose','menuLegalInfo'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(fs.existsSync('terms.html'));
 assert.match(legal,/stopImmediatePropagation/);
 assert.match(legal,/localStorage\.setItem\(KEY,'yes'\)/);
 assert.match(legal,/legalGuestBtn|loginGuestBtn/);
 assert.doesNotMatch(legal,/getUserMedia|requestSession\(|SpeechRecognition|fetch\(/);
 const terms=fs.readFileSync('terms.html','utf8');
 for(const topic of ['modo online','cámara','privacidad'])assert.ok(terms.toLowerCase().includes(topic));
 assert.match(css,/\.legalDialog/);
 assert.match(css,/#legalAccept:disabled/);
});
test('Safe static bundling and version match added game module references',()=>{
 for(const p of ['magic-world.js','last-move-ghost.js','legal-consent.js','magic-game.css','terms.html']){
  assert.ok(build.includes("'"+p+"'"),p);
  assert.ok((p==='magic-world.js'||p==='last-move-ghost.js'?main:html).includes('./'+p),p);
 }
 assert.equal(manifest.version,'0.13.0-beta.1');
 assert.ok(html.includes('v'+manifest.version));
 assert.ok(manifest.lastMoveHint.localOnly);
});
