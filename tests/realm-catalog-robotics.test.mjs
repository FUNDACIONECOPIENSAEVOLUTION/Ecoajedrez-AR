import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {BOARD_SKINS,VISION_ART} from '../board-skins.js';
import {BOARD_REALM_IMAGES,BOARD_REALM_THEMES,REALM_SKYBOX_FALLBACK,publishedRealmURL} from '../realm-pairing.js';
import {SKYBOX_FACES,SKYBOX_REALMS,skyboxFaceUrls,realmForBoard} from '../skybox-config.js';

const exists=file=>fs.existsSync(path.resolve(file));
const isWebP=file=>{
 const handle=fs.openSync(file,'r'),b=Buffer.alloc(12);
 try{fs.readSync(handle,b,0,12,0);}finally{fs.closeSync(handle);}
 return b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';
};

test('13 selectable fantasy boards and 7 decorative images exist',()=>{
 const playable=BOARD_SKINS.filter(b=>b.file);
 assert.equal(playable.length,13);assert.equal(VISION_ART.length,7);
 for(const image of [...playable,...VISION_ART]){
  const file=path.join('app/imagenes/tableros',image.file);
  assert.ok(exists(file),'Missing board/decorative image: '+file);
  assert.ok(isWebP(file),'Invalid WebP header: '+file);
 }
});

test('every board has the expected themed background and a 360 realm',()=>{
 const playable=BOARD_SKINS.filter(b=>b.file);
 assert.equal(Object.keys(BOARD_REALM_THEMES).length,13);
 for(const skin of playable){
  assert.ok(BOARD_REALM_THEMES[skin.id],'Missing theme: '+skin.id);
  const realm=realmForBoard(skin.id);
  assert.ok(realm,'Missing matching 360 realm: '+skin.id);
  const image=BOARD_REALM_IMAGES[skin.id];
  assert.ok(image,'Missing linked 3D backdrop: '+skin.id);
  const file=path.join('app/imagenes/entornos',image);
  assert.ok(exists(file),'Missing realm background: '+file);
  assert.ok(isWebP(file),'Invalid realm WebP: '+file);
 }
});

test('all 13 360 realms include 6 real faces',()=>{
 assert.equal(SKYBOX_REALMS.length,13);
 for(const realm of SKYBOX_REALMS){
  const urls=skyboxFaceUrls(realm.id);
  assert.equal(urls.length,SKYBOX_FACES.length);
  for(const url of urls){
   const file=url.replace(/^\.\//,'');
   assert.ok(exists(file),'Missing 360 face: '+file);
   assert.ok(isWebP(file),'Invalid 360 WebP: '+file);
  }
 }
});

test('missing dedicated Alchemy/Amethyst/Gothic previews use own 360 artwork',async()=>{
 const pairs={alquimia:'alquimista_eter',amatista:'espejo_vacio',gotico:'nigromante_gotico'};
 assert.deepEqual(REALM_SKYBOX_FALLBACK,pairs);
 const original=globalThis.fetch;
 globalThis.fetch=async(url)=>({
  ok:Object.values(pairs).some(id=>String(url).endsWith('/'+id+'/pz.webp')),
  status:Object.values(pairs).some(id=>String(url).endsWith('/'+id+'/pz.webp'))?200:404
 });
 try{
  for(const [board,realm] of Object.entries(pairs)){
   const url=await publishedRealmURL(board);
   assert.equal(url,'./app/imagenes/skybox/'+realm+'/pz.webp');
  }
 }finally{globalThis.fetch=original;}
});

test('six robotic models and portraits have valid file headers',()=>{
 for(const name of ['peon','torre','caballo','alfil','reina','rey']){
  const model=path.join('app/imagenes/fichas/roboticos/modelos',name+'.glb');
  const image=path.join('app/imagenes/fichas/roboticos/imagenes',name+'.jpg');
  assert.ok(exists(model),'Missing robotic GLB '+name);
  assert.ok(exists(image),'Missing robotic portrait '+name);
  const header=Buffer.alloc(12),fd=fs.openSync(model,'r');
  try{fs.readSync(fd,header,0,12,0);}finally{fs.closeSync(fd);}
  assert.equal(header.toString('ascii',0,4),'glTF',name+' GLB header');
  assert.equal(header.readUInt32LE(4),2,name+' GLB version');
  assert.equal(header.readUInt32LE(8),fs.statSync(model).size,name+' GLB declared length');
  assert.ok(fs.statSync(model).size<=15000000,name+' GLB size');
  const jpeg=Buffer.alloc(3),jfd=fs.openSync(image,'r');
  try{fs.readSync(jfd,jpeg,0,3,0);}finally{fs.closeSync(jfd);}
  assert.equal(jpeg[0],0xff);assert.equal(jpeg[1],0xd8);assert.equal(jpeg[2],0xff);
 }
});
