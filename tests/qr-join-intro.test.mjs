import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseRoomQR} from '../qr-scanner.js';

const html=fs.readFileSync('index.html','utf8');
const scanner=fs.readFileSync('qr-scanner.js','utf8');
const main=fs.readFileSync('main.js','utf8');
const css=fs.readFileSync('readability-qr.css','utf8');
const opener=fs.readFileSync('opening.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const base='https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/';
test('QR accepts only valid 6-symbol room invitations belonging to this game origin/path',()=>{
 for(const value of ['ABC234','abc234',base+'?room=abc234',base+'index.html?room=ABC234']){
  assert.equal(parseRoomQR(value,base),'ABC234');
 }
 for(const value of ['','ABCDE','ABC23456','I23456','O23456','0AB234',base+'?room=BAD','https://evil.example/Ecoajedrez-AR/?room=ABC234','https://fundacionecopiensaevolution.github.io/3d-line/?room=ABC234',base+'?room=ABC234&room=BAD234','javascript:alert(1)','https://fundacionecopiensaevolution.github.io/Ecoajedrez-AR/other?room=ABC234'])
  assert.equal(parseRoomQR(value,base),null,value);
});
test('Join screen has real camera launch, preview, close, status and manual code entry',()=>{
 for(const id of ['joinPanel','joinCode','joinBtn','scanRoomQR','qrCameraVideo','qrScannerPanel','qrScannerStatus','closeQRScanner'])
   assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(scanner,/getUserMedia/);
 assert.match(scanner,/BarcodeDetector/);
 assert.match(scanner,/jsqr@1\.4\.0\/\+esm/);
 assert.match(scanner,/track\.stop\(\)/);
 assert.match(scanner,/panel\.hidden=true/);
 assert.match(main,/setupQrJoin/);
 assert.match(main,/\$\('joinBtn'\)\.click\(\)/);
 assert.match(main,/\$\('joinCode'\)\.value=code/);
 assert.match(main,/parse|setGameMode\('online'\)/);
 assert.match(css,/#joinPanel #qrCameraVideo/);
 assert.match(css,/@media\(max-width:440px\)/);
});
test('First opening launches video automatically per session; resource download starts during intro',()=>{
 assert.match(opener,/sessionStorage\.getItem\(INTRO_KEY\)/);
 assert.match(opener,/sessionStorage\.setItem\(INTRO_KEY,'1'\)/);
 assert.match(opener,/setTimeout\(\(\)=>startIntro\(true\),0\)/);
 assert.match(opener,/cinemaVideo\.currentTime>=INTRO_MAX_SECONDS/);
 assert.match(opener,/bufferingFallback=setTimeout/);
 assert.match(opener,/clearTimeout\(bufferingFallback\)/);
 const assets=fs.readFileSync('asset-cache.js','utf8');
 assert.match(assets,/setTimeout\(\(\)=>\{preparePublicAssets\(\)\.catch/);
 assert.match(assets,/\},120\)/);
 assert.match(opener,/eco:asset-progress/);
 assert.match(html,/id="cinemaAssetProgress"/);
});
test('Security and publishing include only needed added camera files with no secrets',()=>{
 assert.match(build,/'qr-scanner\.js'/);
 assert.match(build,/'readability-qr\.css'/);
 const sec=fs.readFileSync('scripts/security-check.mjs','utf8');
 assert.match(sec,/'qr-scanner\.js'/);
 assert.doesNotMatch(scanner,/api_secret|client_secret|private_key|AIza[A-Za-z0-9_-]{20,}/);
 assert.match(scanner,/url\.origin!==base\.origin/);
 assert.match(scanner,/url\.protocol!=='https:'/);
 assert.match(scanner,/new MutationObserver/);
 assert.match(css,/-webkit-text-fill-color:#edfffc!important/);
 assert.match(css,/#loginPanel \.loginContent \.version:last-child/);
});
