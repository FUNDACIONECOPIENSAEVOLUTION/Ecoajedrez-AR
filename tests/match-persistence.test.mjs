import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import fs from 'node:fs';
import {makeSnapshot,verifyAndRestore,saveLocalMatch,readLocalMatch} from '../match-state.js';
import {PeerMatch} from '../pvp.js';

class FakeGame{
 constructor(){this.reset();}
 reset(){this.list=[];}
 move(san){
  if(!['e4','e5','Nf3','Nc6'].includes(san))throw Error('Bad SAN');
  this.list.push(san);return {san};
 }
 history(){return [...this.list];}
 fen(){return this.list.length ? this.list.join(',') : 'start';}
}
class MemoryStorage{
 constructor(){this.m=new Map();}
 setItem(k,v){this.m.set(k,String(v));}
 getItem(k){return this.m.get(k)??null;}
}
test('network snapshot restores the complete move history',()=>{
 const host=new FakeGame();
 for(const san of ['e4','e5','Nf3','Nc6'])host.move(san);
 const guest=new FakeGame();guest.move('e4');
 const state=makeSnapshot(host,12);
 assert.equal(state.version,12);
 assert.equal(verifyAndRestore(guest,state),true);
 assert.deepEqual(guest.history(),host.history());
 assert.equal(guest.fen(),host.fen());
});
test('malformed remote state cannot damage the current chess game',()=>{
 const game=new FakeGame();game.move('e4');const original=game.fen();
 assert.equal(verifyAndRestore(game,{fen:'e4,wrong',history:['e4','e5']}),false);
 assert.equal(game.fen(),original);
 assert.equal(verifyAndRestore(game,{fen:'e4',history:['forged']}),false);
 assert.equal(game.fen(),original);
 assert.equal(verifyAndRestore(game,{fen:'x',history:new Array(2049).fill('e4')}),false);
 assert.equal(game.fen(),original);
});
test('local chess state is persisted and recovered separately by key',()=>{
 const storage=new MemoryStorage(),a=new FakeGame();a.move('e4');
 const key='ecoajedrez:local:user1';
 assert.equal(saveLocalMatch(storage,key,a,'bot',{theme:'jungle'}),true);
 assert.equal(storage.getItem('ecoajedrez:local:user2'),null);
 const restored=new FakeGame();
 assert.deepEqual(readLocalMatch(storage,key,restored),{mode:'bot',preferences:{theme:'jungle'}});
 assert.deepEqual(restored.history(),['e4']);
 assert.equal(saveLocalMatch(storage,key,a,'online',{}),false,'online games never saved as local');
});
test('PeerJS host filters malformed moves and guest gets state messages',()=>{
 class FakeConnection extends EventEmitter{
  constructor(){super();this.open=true;this.sent=[];}
  send(message){this.sent.push(message);}
 }
 const accepted=[];
 const host=new PeerMatch({onMove:m=>accepted.push(m)});
 host.host=true;
 const h=new FakeConnection();host.connect(h);
 h.emit('data',{type:'MOVE',from:'e2',to:'e4',version:0,promotion:'q'});
 h.emit('data',{type:'MOVE',from:'wrong',to:'e4',version:0});
 assert.equal(accepted.length,1);
 assert.deepEqual(accepted[0],{from:'e2',to:'e4',promotion:'q',version:0});
 const received=[];
 const guest=new PeerMatch({onState:s=>received.push(s)});guest.host=false;
 const g=new FakeConnection();guest.connect(g);
 g.emit('data',{type:'STATE',fen:'start',history:[],version:0});
 assert.equal(received.length,1);
 assert.equal(guest.send({type:'HELLO'}),true);
 assert.deepEqual(g.sent[0],{type:'HELLO'});
});
test('UI offers PGN export, local save and a documented Google login gesture',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const js=fs.readFileSync('main.js','utf8');
 const auth=fs.readFileSync('auth.js','utf8');
 assert.match(html,/id="downloadPgn"/);
 assert.match(html,/id="saveStatus"/);
 assert.match(js,/verifyAndRestore\(game,message\)/);
 assert.match(js,/saveLocalMatch\(/);
 assert.match(js,/readLocalMatch\(/);
 assert.match(js,/a\.download='ecoajedrez-'/);
 assert.match(auth,/return sdk\.signInWithPopup\(auth,provider\)/);
});

test('on-device diagnostics is wired into the real game menu',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const js=fs.readFileSync('main.js','utf8');
 for(const id of ['diagnoseBtn','diagnosticPanel','diagnosticOutput','closeDiagnostic','copyDiagnostic']){
   assert.ok(html.includes('id="'+id+'"'),'missing diagnostic control '+id);
 }
 for(const feature of ["isSessionSupported('immersive-ar')","authAvailable()","navigator.onLine","navigator.clipboard.writeText(diagnosticReport)"]){
   assert.ok(js.includes(feature),'missing diagnostic capability '+feature);
 }
});
