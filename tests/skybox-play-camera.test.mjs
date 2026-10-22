import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createImmersiveChess} from '../immersive-chess.js';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('main.js','utf8');
const css=fs.readFileSync('immersive-chess.css','utf8');

function createElement(){
 const listeners={};
 return {hidden:true,textContent:'',style:{},
  addEventListener(type,fn){(listeners[type]??=[]).push(fn)},
  emit(type,data={}){for(const fn of listeners[type]||[])fn(data)},
  setAttribute(name,value){this[name]=value},
  getAttribute(name){return this[name]},
  ...{listeners}
 };
}
class Vec{
 constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
 clone(){return new Vec(this.x,this.y,this.z)}
 copy(v){return this.set(v.x,v.y,v.z)}
 set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
 sub(v){return this.set(this.x-v.x,this.y-v.y,this.z-v.z)}
 add(v){return this.set(this.x+v.x,this.y+v.y,this.z+v.z)}
 length(){return Math.hypot(this.x,this.y,this.z)}
 multiplyScalar(n){return this.set(this.x*n,this.y*n,this.z*n)}
}
class Quat{clone(){return new Quat()}copy(){return this}setFromEuler(){return this}multiply(){return this}setFromAxisAngle(){return this}}
class Material{dispose(){}}
class Mesh{constructor(geometry,material){this.geometry=geometry;this.material=material;this.rotation={x:0};this.position=new Vec();this.visible=true}raycast(){}}
const THREE={Vector3:Vec,Quaternion:Quat,Euler:class{},Mesh,CircleGeometry:class{},
 MeshBasicMaterial:Material,DoubleSide:1,SRGBColorSpace:'srgb',
 CubeTextureLoader:class{load(paths,loaded){assert.equal(paths.length,6);const texture={dispose(){},needsUpdate:false};loaded(texture);return texture;}}
};
test('360 kingdom gameplay zooms/recenters/overhead, hides scenery, and suppresses accidental pinch clicks',async()=>{
 const keys=['realmMiniControls','realmHudButton','realmFocusButton','realmTopButton','realmZoomIn','realmZoomOut','realmCameraUp','realmCameraDown','realmExitButton','realmGyroButton','realmPlayStatus','realmTurnMini','realmMovesMini','status','history'];
 const elements=Object.fromEntries(keys.map(k=>[k,createElement()]));
 elements.status.textContent='Turno blancas';elements.history.textContent='1. e4  e5';
 const classSet=new Set();
 const oldDoc=globalThis.document,oldFetch=globalThis.fetch,oldWindow=globalThis.window;
 globalThis.document={getElementById:id=>elements[id],body:{classList:{
  add:x=>classSet.add(x),remove:x=>classSet.delete(x),contains:x=>classSet.has(x),toggle(x,v){if(v)classSet.add(x);else classSet.delete(x)}
 }}};
 globalThis.fetch=async()=>({ok:true,json:async()=>({realms:{galactico_cosmico:{ready:true}}})});
 globalThis.window={addEventListener(){},removeEventListener(){}};
 try{
  const canvas=createElement(),scene={background:null,add(){}};
  canvas.style.touchAction='auto';
  const camera={position:new Vec(8,10,11),up:new Vec(0,1,0),quaternion:new Quat(),rotation:{x:0,y:0,order:'XYZ',set(x,y){this.x=x;this.y=y}},aspect:1.8,fov:49,
   lookAt(){this.rotation.x=-.6;this.rotation.y=0},updateProjectionMatrix(){}};
  const orbit={target:new Vec(0,0,0),enabled:true,update(){}};
  const decorations={visible:true};
  const game=createImmersiveChess({THREE,scene,camera,orbit,canvas,decorations,getBoardId:()=> 'cosmos'});
  assert.equal(await game.enter(),true);
  assert.equal(game.active(),true);
  assert.equal(decorations.visible,false,'trees hidden while playing');
  assert.equal(orbit.enabled,false,'OrbitControls cannot overwrite the 360 camera');
  assert.match(elements.realmTurnMini.textContent,/Turno blancas/);
  assert.match(elements.realmMovesMini.textContent,/e4/);
  const initial=camera.position.clone().length();
  elements.realmZoomIn.emit('click');
  assert.ok(camera.position.length()<initial,'zoom in moves toward the board');
  elements.realmZoomOut.emit('click');
  assert.ok(camera.position.length()>0);
  const startingHeight=camera.position.y;
  elements.realmCameraUp.emit('click');
  assert.ok(camera.position.y>startingHeight,'up button raises virtual camera');
  elements.realmCameraDown.emit('click');
  assert.ok(camera.position.y<startingHeight+1.5,'down button lowers virtual camera');
  elements.realmTopButton.emit('click');
  assert.ok(camera.position.z<.1);
  assert.equal(camera.fov,50);
  elements.realmFocusButton.emit('click');
  assert.ok(camera.position.z>5,'focus returns to the playable board');
  canvas.emit('wheel',{deltaY:-130,shiftKey:true,preventDefault(){}});
  assert.ok(camera.position.y>=2.2&&camera.position.y<=18,'Shift+wheel clamps elevation');
  canvas.emit('pointerdown',{pointerId:1,button:0,clientX:50,clientY:50});
  canvas.emit('pointermove',{pointerId:1,clientX:91,clientY:60});
  assert.equal(Boolean(game.isPanGesture()),true);
  canvas.emit('pointerup',{pointerId:1});
  assert.equal(Boolean(game.isPanGesture()),false);
  canvas.emit('pointerdown',{pointerId:2,button:0,clientX:40,clientY:40});
  canvas.emit('pointerdown',{pointerId:3,button:0,clientX:120,clientY:40});
  assert.equal(Boolean(game.isPanGesture()),true,'pinch cannot be misread as a chess move');
  canvas.emit('pointermove',{pointerId:3,clientX:150,clientY:40});
  canvas.emit('pointerup',{pointerId:2});
  assert.equal(Boolean(game.isPanGesture()),true);
  canvas.emit('pointerup',{pointerId:3});
  assert.equal(Boolean(game.isPanGesture()),false);
  game.exit();
  assert.equal(decorations.visible,true,'decorations restored');
  assert.equal(orbit.enabled,true,'classic orbit restored');
  assert.equal(canvas.style.touchAction,'auto');
  assert.equal(scene.background,null);
 }finally{
  globalThis.document=oldDoc;globalThis.fetch=oldFetch;globalThis.window=oldWindow;
 }
});
test('Classic 3D, 360 and AR keep the same move engine and distinguish selection from looking around',()=>{
 for(const id of ['realmTopButton','realmZoomIn','realmZoomOut','realmPlayStatus','realmTurnMini','realmMovesMini'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(js,/const square=pick3DSquare\(event\.clientX,event\.clientY\)/);
 assert.match(js,/if\(realmImmersion\?\.isPanGesture\(\)\)/);
 assert.match(js,/getInteractivePiece:\(x,y\)=>\{/);
 assert.match(js,/return Boolean\(pick3DSquare\(x,y\)\)/);
 assert.match(js,/realmImmersion\?\.refreshStatus\?\.\(\)/);
 assert.match(js,/decorations,\s*getBoardId/);
 assert.match(js,/function onARPointerUp\(event\)/);
 assert.match(js,/function playMove\(/);
 assert.match(css,/realm-hud-hidden #gameHud/);
 assert.match(css,/#realmPlayStatus/);
});
