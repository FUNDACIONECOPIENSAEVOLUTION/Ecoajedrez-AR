import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getVictoryMessage} from '../victory-fx.js';

const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const css=fs.readFileSync('victory-fx.css','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));

test('Correct winner for player, computer, online host/guest and local turns',()=>{
 const whiteWin={checkmate:true,turn:'b'},blackWin={checkmate:true,turn:'w'};
 assert.equal(getVictoryMessage({...whiteWin,mode:'bot'}).kind,'win');
 assert.equal(getVictoryMessage({...blackWin,mode:'bot'}).kind,'loss');
 assert.equal(getVictoryMessage({...whiteWin,mode:'online',isHost:true}).kind,'win');
 assert.equal(getVictoryMessage({...whiteWin,mode:'online',isHost:false}).kind,'loss');
 assert.equal(getVictoryMessage({...blackWin,mode:'online',isHost:false}).kind,'win');
 assert.match(getVictoryMessage({...blackWin,mode:'local'}).title,/NEGRAS/);
 assert.match(getVictoryMessage({...whiteWin,mode:'local'}).title,/BLANCAS/);
 assert.equal(getVictoryMessage({draw:true}).kind,'draw');
 assert.equal(getVictoryMessage({}),null);
 assert.equal(getVictoryMessage({...whiteWin,lang:'en'}).title,'✦ YOU WON! ✦');
 assert.match(getVictoryMessage({...whiteWin,lang:'zh'}).title,/赢/);
});
test('Celebration is dismissible, motion-conscious and separate from game logic',()=>{
 for(const id of ['victoryOverlay','victoryCard','victoryTitle','victoryText','victoryNewGame','victoryMenu','victoryClose','victorySparkles'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/victoryOverlay"[^>]*hidden>/);
 assert.ok(html.includes('victory-fx.css?v=0.14.3'));
 assert.match(main,/createVictoryFX\(/);
 assert.match(main,/syncVictory\(\)/);
 assert.match(main,/victoryFX\?\.reset\(\)/);
 assert.match(css,/\.ecoVictoryOverlay\[hidden\]\{display:none!important\}/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const fx=fs.readFileSync('victory-fx.js','utf8');
 assert.doesNotMatch(fx,/game\.move\(|game\.undo\(|game\.reset\(|match\.send\(|fetch\(/);
 assert.match(fx,/newButton\.hidden=mode==='online'&&!isHost/);
 assert.match(build,/'victory-fx\.js'/);
 assert.match(build,/'victory-fx\.css'/);
 assert.match(workflow,/node --check victory-fx\.js/);
 assert.equal(manifest.version,'0.15.5-beta.1');
});
