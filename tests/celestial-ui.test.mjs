import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('celestial.css','utf8');
const js=fs.readFileSync('celestial-ui.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));
test('Released celestial art and styles render with responsive mobile fallback',()=>{
 const scene=fs.readFileSync('assets/ui/celestial-arena.svg','utf8');
 assert.match(scene,/<svg/);
 assert.match(scene,/<radialGradient/);
 assert.match(scene,/<path/);
 assert.doesNotMatch(scene,/<script|<foreignObject|onload=/i);
 assert.ok(scene.length<100_000);
 assert.match(css,/#loginPanel\s*\{/);
 assert.match(css,/#loginPanel::before/);
 assert.match(css,/#loginPanel \.loginContent/);
 assert.match(css,/\.celestialCourt/);
 assert.match(css,/\.arcanePiece/);
 assert.match(css,/@media\(max-width:960px\)/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/overflow-y:auto/);
 assert.doesNotMatch(html,/class="celestialCourt"/);
 assert.doesNotMatch(html,/class="arcanePiece pieceKing"/);
 const fix=fs.readFileSync('cinematic-fix.css','utf8');
 assert.match(fix,/#loginPanel > \.welcomeVideoBackdrop/);
 assert.match(fix,/object-fit:cover/);
 assert.match(fix,/#loginPanel \.loginContent/);
 assert.match(fix,/@media\(max-width:540px\)/);
 assert.ok(html.indexOf('class="welcomeVideoBackdrop"')<html.indexOf('class="loginContent"'),'background is sibling of actual login card');
});
test('Settings sidebar and visual biome preview bind only to real existing controls',()=>{
 for(const id of ['settingsGoMenu','settingsGoPlay','biomePreview','theme','pieceSet','backToMenu','startConfigured']){
   assert.ok(html.includes('id="'+id+'"'),'Missing control '+id);
 }
 assert.match(js,/back\.click\(\)/);
 assert.match(js,/start\.click\(\)/);
 assert.match(js,/theme\?\.addEventListener\('change',refreshPreview\)/);
 assert.match(js,/pieceSet\?\.addEventListener\('change',refreshPreview\)/);
 assert.match(css,/#settingsPanel \.settingGrid/);
 assert.match(css,/#settingsScreen/);
 assert.match(css,/#settingsNav/);
});
test('Safe static distribution and consistent current version',()=>{
 assert.equal(manifest.version,JSON.parse(fs.readFileSync('package.json','utf8')).version);
 assert.ok(html.includes('v'+manifest.version));
 assert.ok(build.includes("'celestial.css'"));
 assert.ok(build.includes("'cinematic-fix.css'"));
 assert.ok(build.includes("'celestial-ui.js'"));
 assert.match(html,/celestial\.css\?v=0\.10\.0/);
 assert.match(html,/celestial-ui\.js\?v=0\.10\.0/);
 assert.ok(fs.readFileSync('.github/workflows/pages.yml','utf8').includes('node --check celestial-ui.js'));
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|firebaseConfig|client_secret|AIza/);
});
