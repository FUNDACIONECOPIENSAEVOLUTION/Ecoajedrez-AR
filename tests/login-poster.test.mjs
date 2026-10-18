import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pngPath='app/imagenes/interfaces/login_post_intro_fondo.png';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('login-scene.css','utf8');
const js=fs.readFileSync('opening.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));

test('Exactly the approved clean GitHub image becomes the full login backdrop and is safely packaged',()=>{
 assert.ok(fs.existsSync(pngPath));
 const image=fs.readFileSync(pngPath);
 assert.ok(image.length>1024&&image.length<6000000);
 assert.ok(image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
 assert.ok(html.includes('src="./'+pngPath+'"'));
 assert.ok(css.includes('url("./'+pngPath+'")'));
 assert.ok(build.includes("const loginImage='"+pngPath+"'"));
 assert.match(build,/const pngMagic=Buffer\.from/);
 assert.match(build,/app\/imagenes\/interfaces/);
 assert.match(html,/login-scene\.css\?v=0\.11\.1/);
});
test('First visit cinematic ends after up to 10 playback seconds and leaves fixed background, never loops',()=>{
 assert.match(js,/const INTRO_MAX_SECONDS=10/);
 assert.match(js,/cinemaVideo\.currentTime>=INTRO_MAX_SECONDS/);
 assert.match(js,/cinemaVideo\?\.addEventListener\('ended',closeIntro\)/);
 assert.match(js,/function recordIntroSeen/);
 assert.match(js,/function hasWatchedIntro/);
 assert.match(js,/setTimeout\(\(\)=>startIntro\(true\),0\)/);
 assert.match(js,/if\(currentView\(\)==='welcome'\)return/);
 assert.match(html,/id="cinemaVideo"[^>]* muted playsinline/);
 assert.match(html,/id="skipIntroBtn"/);
 assert.match(html,/id="playIntroBtn"/);
 assert.doesNotMatch(html,/<video id="welcomeAmbientVideo"[^>]*\bloop\b/);
 assert.match(css,/#loginPanel > \.welcomeVideoBackdrop \.ambientVideo\s*\{/);
 assert.match(css,/display:none!important/);
});
test('Desktop, tablet and phone controls remain visible and version increments',()=>{
 assert.equal(version.version,'0.14.2-beta.1');
 assert.ok(html.includes('v'+version.version));
 assert.match(css,/@media\(max-width:1080px\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:440px\)/);
 assert.match(css,/white-space:nowrap/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/#loginPanel \.loginContent \.brand/);
 assert.match(html,/id="loginGuestBtn"/);
 assert.match(html,/id="loginGoogleBtn"/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
