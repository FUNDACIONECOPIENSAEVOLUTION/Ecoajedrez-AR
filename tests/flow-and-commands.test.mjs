import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseMoveCommand} from '../commands.js';
import {normalizeRoomCode} from '../pvp.js';

const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('main.js','utf8');
test('Spanish spoken/UCI/SAN commands work',()=>{
 assert.deepEqual(parseMoveCommand('caballo de g1 a f3'),{from:'g1',to:'f3',promotion:'q'});
 assert.deepEqual(parseMoveCommand('e2e4'),{from:'e2',to:'e4',promotion:'q'});
 assert.deepEqual(parseMoveCommand('e2 a e4'),{from:'e2',to:'e4',promotion:'q'});
 assert.equal(parseMoveCommand('Cf3'),'Nf3');
 assert.equal(parseMoveCommand('Nf3','en'),'Nf3');
 assert.equal(parseMoveCommand('e4'),'e4');
 assert.equal(parseMoveCommand('enroque corto'),'O-O');
 assert.equal(parseMoveCommand('enroque largo'),'O-O-O');
 assert.deepEqual(parseMoveCommand('caballo de ge uno a efe tres'),{from:'g1',to:'f3',promotion:'q'});
 assert.equal(parseMoveCommand('peón a e4'),'e4');
});
test('Welcome, settings, board-only game and private duels are present',()=>{
 for(const id of ['welcomeScreen','menuScreen','settingsScreen','scene','gameHud','loginGoogleBtn','loginGuestBtn','menuBot','menuLocal','menuHost','menuJoin','joinCode','moveInput','playMove','arCommand','arPlayMove','voiceBtn','arVoiceBtn','boardSize','theme','whiteColor','blackColor']){
  assert.ok(html.includes('id="'+id+'"'),'missing '+id);
 }
 for(const mode of ['classic','wood','marble','neon','jungle','volcano','ice'])
  assert.ok(html.includes('value="'+mode+'"'),'missing '+mode);
});
test('One chess.js validates commands and host validates network moves',()=>{
 assert.ok(game.includes('new Chess(game.fen())'),'notation validation');
 assert.ok(game.includes("source==='remote'"),'remote moves authorized by host');
 assert.ok(game.includes("move.version!==roomVersion"),'version guards remote moves');
 assert.ok(game.includes('match.connected()'),'remote availability');
 assert.ok(game.includes('requestSession('),'XR entry remains available');
 assert.ok(game.includes('closestARSquare('),'AR touch must remain');
});
test('Loading and visual mode actions exist as real functions',()=>{
 for(const name of ['loadChessModels','startSpeech','transitionTo','applyNotation','gotoView','startAR','closestARSquare','onARPointerUp']){
  assert.ok(game.includes('function '+name+'(') || game.includes('async function '+name+'('),'missing '+name);
 }
 assert.ok(html.includes('id="resumeGame"'));
});
test('Room codes remove unsafe characters',()=>{
 assert.equal(normalizeRoomCode(' abc-def '),'ABCDEF');
 assert.equal(normalizeRoomCode('<foo>xyz'),'FOOXYZ');
 assert.equal(normalizeRoomCode('ABCDEFGHIJKLMN'),'ABCDEFGHIJKL');
});

test('strong room codes and CSP protections are documented in the game',()=>{
 assert.match(fs.readFileSync('pvp.js','utf8'),/ROOM_SIZE=12/);
 assert.match(fs.readFileSync('pvp.js','utf8'),/MAX_MESSAGE_BYTES=64000/);
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/maxlength="12"/);
});
