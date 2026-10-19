import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {inspectModelFile,scanModelInbox,reportMarkdown} from '../scripts/revisar-modelos-3d.mjs';

const folder='assets/modelos-por-revisar';
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
test('A separate accessible model intake inbox exists with three bulk upload folders',()=>{
 assert.ok(fs.existsSync(path.join(folder,'README.md')));
 assert.ok(fs.existsSync(path.join(folder,'FICHA_COLECCION.md')));
 for(const name of ['coleccion-01','coleccion-02','coleccion-03']){
  assert.ok(fs.existsSync(path.join(folder,name,'README.md')));
  assert.match(fs.readFileSync(path.join(folder,name,'README.md'),'utf8'),/upload\/main/);
 }
});
test('3D intake identifies GLB 2.0, FBX, glTF+resources and ZIP without executing files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ecoajedrez-intake-'));
 try{
  fs.mkdirSync(path.join(dir,'coleccion-01'));
  const glb=Buffer.alloc(32);
  glb.write('glTF',0,'ascii');glb.writeUInt32LE(2,4);glb.writeUInt32LE(32,8);
  fs.writeFileSync(path.join(dir,'coleccion-01','pieza.glb'),glb);
  fs.writeFileSync(path.join(dir,'coleccion-01','modelo.fbx'),Buffer.from('Kaydara FBX Binary   ....................'));
  fs.writeFileSync(path.join(dir,'coleccion-01','escena.gltf'),JSON.stringify({
   asset:{version:'2.0'},buffers:[{uri:'escena.bin'}],images:[{uri:'textura.png'}]
  }));
  fs.writeFileSync(path.join(dir,'coleccion-01','pack.zip'),Buffer.concat([Buffer.from('PK'),Buffer.alloc(40)]));
  fs.writeFileSync(path.join(dir,'coleccion-01','not-model.exe'),Buffer.alloc(40));
  fs.writeFileSync(path.join(dir,'README.md'),'Folder description');
  const result=scanModelInbox(dir);
  assert.equal(result.items.length,5);
  const byExt=Object.fromEntries(result.items.map(x=>[x.format,x]));
  assert.equal(byExt['.glb'].status,'GLB 2.0');
  assert.equal(byExt['.fbx'].status,'CONVERTIR');
  assert.equal(byExt['.gltf'].status,'GLTF 2.0');
  assert.match(byExt['.gltf'].detail,/2 recursos externos/);
  assert.equal(byExt['.zip'].status,'DESCOMPRIMIR');
  assert.equal(byExt['.exe'].status,'REVISAR');
  assert.match(reportMarkdown(result),/Inventario automático/);
  fs.writeFileSync(path.join(dir,'coleccion-01','roto.glb'),Buffer.from('garbage bytes'));
  assert.equal(inspectModelFile(path.join(dir,'coleccion-01','roto.glb')).status,'NO VÁLIDO');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Intake is not published by GitHub Pages and game GLB loader stays restricted',()=>{
 assert.match(build,/fs\.cpSync\('assets\/models\/staunton'/);
 assert.doesNotMatch(build,/fs\.cpSync\('assets\/models',/);
 assert.doesNotMatch(build,/fs\.cpSync\('assets\/modelos-por-revisar'/);
 assert.match(build,/const presentCommunity=COMMUNITY_FILES\.filter/);
 assert.match(build,/presentCommunity\.length===COMMUNITY_FILES\.length/);
 assert.equal(scanModelInbox(folder).items.length,0,'All collection intake folders are initially empty.');
});
