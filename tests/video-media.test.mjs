import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('opening.js','utf8');
const css=fs.readFileSync('opening.css','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));
const media=[
 ['ECOAJEDREZ_ Tablero Místico del Planeta-1.png',6000000],
 ['Ecoajedrez_ La Arena Cobra Vida-2.png',6000000],
 ['Ecoajedrez_ Portales del Bosque Mágico-3.png',6000000],
 ['Vídeo sin título-17_10_2026, 16_58.mp4',20000000],
 ['Vídeo sin título-17_10_2026, 17_08.mp4',20000000],
 ['Vídeo sin título-17_10_2026, 17_10.mp4',20000000]
];

test('The six uploaded original media files exist, are valid types, sized safely, and publicly allowlisted',()=>{
 for(const [name,max] of media){
  const path='videos/'+name;
  assert.ok(fs.existsSync(path),'Missing upload '+path);
  const size=fs.statSync(path).size;
  assert.ok(size>100&&size<max,'Invalid size: '+name);
  const file=fs.openSync(path,'r');
  const header=Buffer.alloc(12);
  try{fs.readSync(file,header,0,header.length,0);}
  finally{fs.closeSync(file);}
  if(name.endsWith('.png'))assert.ok(header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),name);
  else assert.equal(header.subarray(4,8).toString(),'ftyp',name);
  assert.ok(build.includes(name),'Missing from safe deployment allowlist: '+name);
  assert.ok(html.includes(encodeURIComponent(name)),'Not linked in the page: '+name);
 }
 assert.equal(media.length,6);
});

test('Real cinematic intro is optional, skippable and not required to enter the guest game',()=>{
 assert.match(html,/id="cinemaOverlay"/);
 assert.match(html,/id="cinemaVideo"/);
 assert.match(html,/id="skipIntroBtn"/);
 assert.match(html,/id="playIntroBtn"/);
 assert.match(html,/id="menuIntroBtn"/);
 assert.match(html,/id="loginGuestBtn"/);
 assert.match(js,/addEventListener\('click',closeIntro\)/);
 assert.match(js,/cinemaVideo\.dataset\.videoSrc/);
 assert.match(js,/cinemaVideo\.play\(\)/);
 assert.match(js,/cinemaVideo\?\.pause\(\)/);
 assert.match(css,/\.cinemaOverlay\[hidden\]/);
 assert.match(css,/\.cinemaVideo/);
});

test('Background clips play one at a time without cropping, with static fallback and mobile power safeguards',()=>{
 assert.match(html,/id="welcomeAmbientVideo"/);
 assert.match(html,/id="menuAmbientVideo"/);
 assert.match(html,/class="welcomeVideoBackdrop"/);
 assert.match(html,/class="menuAtmosphere"/);
 assert.match(html,/id="menuToggleAmbientVideo"/);
 assert.match(js,/pauseScenes/);
 assert.match(js,/const video=view==='welcome'\?welcomeVideo:view==='menu'\?menuVideo:null/);
 assert.doesNotMatch(html,/class="heroVideo"/,'Side illustration should be gently animated still image, not video');
 assert.match(css,/@keyframes arcaneGalleryFloat/);
 assert.match(css,/#loginPanel \.loginContent:before/);
 assert.match(css,/\.menuAtmosphere\.videoReady/);
 assert.match(html,/data-fallback="\.\/assets\/ui\/forest-arena\.svg"/);
 assert.match(html,/data-fallback="\.\/assets\/ui\/portal-arena\.svg"/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(js,/connection\?\.saveData/);
 assert.match(js,/document\.hidden/);
 assert.match(js,/\.pause\(\)/);
 assert.match(js,/\.dataset\.videoSrc/);
 assert.match(js,/document\.body\.dataset\.view==='welcome'/);
 assert.match(css,/\.heroSlide \.heroVideo/);
 assert.match(css,/object-fit:contain/);
 assert.match(html,/muted loop playsinline preload="none"/);
 assert.match(html,/id="toggleAmbientVideo"/);
 assert.match(html,/data-app-version>v0\.14\.2-beta\.1/);
 assert.equal(manifest.version,'0.14.2-beta.1');
});

test('User uploaded media does not weaken the CSP or bundle server secrets',()=>{
 assert.match(html,/media-src 'self' blob:/);
 assert.doesNotMatch(js,/AIza[A-Za-z0-9_-]{20,}|client_secret|private_key\s*=/);
 for(const restricted of ['worker-lib','functions','.env','.dev.vars']){
  assert.ok(build.includes(restricted),'Build must still exclude '+restricted);
 }
});
