import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('adventure.css','utf8');
const ui=fs.readFileSync('adventure-ui.js','utf8');
const opening=fs.readFileSync('opening.js','utf8');
const loader=fs.readFileSync('asset-cache.js','utf8');
const worker=fs.readFileSync('sw.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));
const names=['01_vs_computadora','02_dos_jugadores','03_duelo_online','04_unirme_partida','05_bosque_encantado','06_templo_arcano','07_ciudad_flotante','08_volcan_celestial'];

test('All eight user-uploaded real WebP cards are uploaded, valid, directly referenced, and allowlisted for Pages',()=>{
 for(const name of names){
  const path='app/imagenes/tarjetas/'+name+'.webp';
  assert.ok(fs.existsSync(path),'Missing uploaded card '+path);
  const raw=fs.readFileSync(path);
  assert.ok(raw.length>1024&&raw.length<3000000,path);
  assert.equal(raw.toString('ascii',0,4),'RIFF',path);
  assert.equal(raw.toString('ascii',8,12),'WEBP',path);
  assert.ok(html.includes('./'+path),'No card UI reference '+path);
  assert.ok(build.includes("'"+name+".webp'"),'Asset not deployed '+name);
 }
 assert.match(html,/class="modeCardImage"/);
 assert.match(css,/#menuPanel \.menuTile \.modeCardImage/);
 assert.match(css,/#menuPanel \.menuGrid/);
});
test('Realm portal enables four real 3D biomes with safe paths back to original settings',()=>{
 assert.match(html,/id="arenaScreen"/);
 assert.match(html,/id="arenaPickerBtn"/);
 for(const theme of ['jungle','neon','marble','volcano'])assert.ok(html.includes('data-arena-theme="'+theme+'"'));
 assert.match(ui,/themeControl\.dispatchEvent\(new Event\('change'/);
 assert.match(ui,/document\.getElementById\('menuSettings'\)\?\.click\(\)/);
 assert.match(ui,/themeControl\.options/);
 assert.match(css,/\.arenaGrid/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('The intro is first-visit-only, muted, replayable, always skippable and reports actual file progress',()=>{
 assert.match(opening,/ecoajedrez-intro-session-v2/);
 assert.match(opening,/sessionStorage\.getItem/);
 assert.match(opening,/sessionStorage\.setItem/);
 assert.match(opening,/setTimeout\(\(\)=>startIntro\(true\)/);
 assert.match(opening,/addEventListener\('click',closeIntro\)/);
 assert.match(html,/id="cinemaVideo"[^>]* muted playsinline/);
 assert.match(html,/id="skipIntroBtn"/);
 assert.match(html,/id="cinemaAssetProgress"/);
 assert.match(html,/id="downloadProgress"/);
 assert.match(opening,/eco:asset-progress/);
 assert.match(loader,/new CustomEvent\('eco:asset-progress'/);
 assert.match(opening,/done\*100\/total/);
 assert.match(loader,/asset-progress/);
 assert.equal(version.version,'0.14.4-beta.1');
});
test('Cache holds ONLY public images and six Staunton glTFs, never videos or accounts',()=>{
 for(const name of names)assert.ok(loader.includes(name));
 for(const name of ['pawn','rook','knight','bishop','queen','king'])assert.ok(loader.includes("'"+name+"'"));
 assert.match(loader,/caches\.open\(CACHE_NAME\)/);
 assert.match(loader,/navigator\.serviceWorker\.register/);
 assert.match(loader,/conn\?\.saveData/);
 assert.match(worker,/req\.method!=='GET'/);
 assert.match(worker,/url\.origin!==self\.location\.origin/);
 assert.match(worker,/req\.headers\.has\('range'\)/);
 assert.match(worker,/allowed\.has\(url\.pathname\)/);
 assert.doesNotMatch(worker,/fetch\(['"]\/api\/|caches\.open\(['"]firebase|localStorage|client_secret/);
 assert.doesNotMatch(worker,/\.mp4/);
 assert.match(build,/'sw\.js'/);
 assert.match(build,/'asset-cache\.js'/);
 assert.match(build,/'adventure-ui\.js'/);
});
