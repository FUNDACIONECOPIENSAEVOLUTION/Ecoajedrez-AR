import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GALACTIC_QUESTS,questAvailable,successfulQuestMove,readQuestProgress,questKey} from '../quest-map.js';
const main=fs.readFileSync('main.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
test('Galactic quest path has eight original, sequential and chess-readable challenges',()=>{
 assert.equal(GALACTIC_QUESTS.length,8);
 assert.deepEqual(GALACTIC_QUESTS.map(x=>x.id),[1,2,3,4,5,6,7,8]);
 for(const q of GALACTIC_QUESTS){
  assert.ok(q.title&&q.hint);
  assert.ok(q.fen==='start'||q.fen.split(' ').length===6);
 }
 assert.equal(questAvailable(1,0),true);
 assert.equal(questAvailable(2,0),false);
 assert.equal(questAvailable(2,1),true);
 assert.equal(questAvailable(8,7),true);
 assert.equal(questAvailable(8,0),false);
});
test('Chess quest objectives require the intended chess.js move and a real mate',()=>{
 for(const q of GALACTIC_QUESTS.slice(0,7)){
  assert.equal(successfulQuestMove(q,{from:q.from,to:q.to,promotion:q.promotion||'q'},{isCheckmate:()=>true,turn:()=> 'b'}),true);
  assert.equal(successfulQuestMove(q,{from:'a1',to:'a2',promotion:'q'},{isCheckmate:()=>true,turn:()=> 'b'}),false);
 }
 assert.equal(successfulQuestMove(GALACTIC_QUESTS[5],{from:'g6',to:'g7',promotion:'q'},{isCheckmate:()=>false,turn:()=> 'b'}),false);
 assert.equal(successfulQuestMove(GALACTIC_QUESTS[7],{from:'g6',to:'g7'},{isCheckmate:()=>false,turn:()=> 'b'}),false);
 assert.equal(successfulQuestMove(GALACTIC_QUESTS[7],{from:'g6',to:'g7'},{isCheckmate:()=>true,turn:()=> 'b'}),true);
});
test('Mission progress persists locally without writing to the normal match slot',()=>{
 const storage={getItem(key){return key===questKey?'{"completed":3}':null}};
 assert.equal(readQuestProgress(storage),3);
 assert.equal(readQuestProgress({getItem(){return '{bad';}}),0);
 assert.equal(readQuestProgress(null),0);
 assert.match(main,/missionPrior=\{fen:game\.fen\(\),pgn:game\.pgn\(\)/);
 assert.match(main,/game\.loadPgn\(restore\.pgn\)/);
 assert.match(main,/\|\|missionActive\)return/);
 assert.match(main,/missionActive && successfulQuestMove/);
 assert.match(main,/missionActive\.goal!=='checkmate'/);
 assert.match(main,/setGameMode\(quest\.goal==='checkmate'\?'bot':'local'\)/);
 assert.match(main,/window\.ecoBoardCatalogue\?\.selectBoard\('cosmos'\)/);
 assert.match(html,/id="questMap"/);
 assert.match(html,/id="questExitGame"/);
 assert.match(html,/id="questOpen"/);
 assert.match(html,/id="questHint"/);
 assert.ok(build.includes("'quest-map.js'")&&build.includes("'quest-map.css'"));
});
