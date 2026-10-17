import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const opening=fs.readFileSync('opening.js','utf8');
const css=fs.readFileSync('opening.css','utf8');
const privacy=fs.readFileSync('privacy.html','utf8');
const meta=JSON.parse(fs.readFileSync('version.json','utf8'));
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
test('Public release version is single-source and displayed outside chess HUD',()=>{
 assert.match(meta.version,/^0\.\d+\.\d+-beta\.\d+$/);
 assert.ok(html.includes(meta.version),'fallback version matches version.json');
 for(const id of ['welcomeScreen','menuScreen','settingsScreen','diagnosticPanel','loadingPortal'])
  assert.ok(html.includes('id="'+id+'"'),'missing screen '+id);
 assert.ok((html.match(/data-app-version/g)||[]).length>=5,'version visible across menus');
 assert.ok(privacy.includes('data-app-version'),'privacy needs release badge');
 assert.match(opening,/fetch\('\.\/version\.json\?v=0\.8\.0'/);
 assert.match(opening,/cache:'no-store'/);
 const hud=html.split('<div id="gameHud">')[1].split('<div id="arHud"')[0];
 assert.doesNotMatch(hud,/data-app-version/,'version must be hidden during live chess');
 assert.match(css,/body\[data-view="game"\] \.appVersion/);
 assert.match(css,/body\.xr-active \.appVersion/);
});
test('Welcome has original illustrated two-scene lightweight autoplay opening',()=>{
 assert.match(html,/id="heroShowcase"/);
 assert.match(html,/id="loginGuestBtn"/);
 assert.match(html,/id="loginGoogleBtn"/);
 assert.match(html,/id="heroShowcase"[\s\S]*?data-hero-index="1"/);
 assert.match(opening,/prefers-reduced-motion/);
 assert.match(opening,/document\.hidden/);
 assert.match(css,/\.heroSlide\.active/);
 assert.match(css,/@media\(max-width:860px\)/);
 for(const name of ['forest-arena','portal-arena']){
  const p='assets/ui/'+name+'.svg';
  const art=fs.readFileSync(p,'utf8');
  assert.ok(art.startsWith('<svg'));
  assert.match(art,/<polygon/);
  assert.doesNotMatch(art,/<script|onload=|<foreignObject|(?:href|src)\s*=\s*['\"]https?:\/\//i);
  assert.ok(art.length<100_000,'keep art lightweight');
  assert.ok(html.includes(name+'.svg'),'welcome includes art '+name);
 }
});
test('Mode tiles, transition and Cloudflare/GitHub safe build include assets',()=>{
 for(const mode of ['bot','local','host','join'])assert.ok(html.includes('menuTile-'+mode));
 assert.match(css,/\.menuTile-bot:enabled:before/);
 assert.match(css,/\.portalBoard/);
 assert.match(html,/id="loadingPortal"/);
 assert.match(opening,/MutationObserver/);
 assert.match(build,/opening\.css/);
 assert.match(build,/opening\.js/);
 assert.match(build,/version\.json/);
 assert.match(build,/assets\/ui/);
 assert.doesNotMatch(opening,/firebaseConfig|client_secret|AIza/);
});
