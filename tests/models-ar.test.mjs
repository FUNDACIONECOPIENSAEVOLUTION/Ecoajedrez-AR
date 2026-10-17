import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const js=fs.readFileSync('main.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const expected=['pawn','rook','knight','bishop','queen','king'];
test('All six independent glTF chess meshes are valid and tiny',()=>{
 for(const name of expected){
  const file=path.join(root,'assets/models/staunton/'+name+'.gltf');
  const text=fs.readFileSync(file,'utf8'), g=JSON.parse(text);
  assert.equal(g.asset.version,'2.0');
  assert.ok(fs.statSync(file).size<15_000_000,name+' too large');
  assert.equal(g.meshes.length,1);
  assert.equal(g.nodes.length,1);
  const uri=g.buffers[0].uri;
  assert.match(uri,/^data:application\/octet-stream;base64,/);
  const binary=Buffer.from(uri.split(',')[1],'base64');
  assert.equal(binary.byteLength,g.buffers[0].byteLength);
  const pos=g.accessors[0],normal=g.accessors[1],indices=g.accessors[2];
  assert.equal(pos.count,normal.count);
  assert.equal(pos.type,'VEC3');
  assert.equal(normal.type,'VEC3');
  assert.ok(indices.count>=3 && indices.count%3===0);
  for(const view of g.bufferViews){assert.ok(view.byteOffset+view.byteLength<=binary.byteLength,name+' bufferView exceeds bounds');}
  const indexView=g.bufferViews[indices.bufferView],positionsView=g.bufferViews[pos.bufferView];
  for(let i=0;i<indices.count;i++){
   const idx=binary.readUInt16LE(indexView.byteOffset+i*2);
   assert.ok(idx<pos.count,name+' triangle index out of bounds');
  }
  for(let i=0;i<pos.count;i++)for(let k=0;k<3;k++){
   const v=binary.readFloatLE(positionsView.byteOffset+i*12+k*4);
   assert.ok(Number.isFinite(v),name+' invalid coordinate');
  }
 }
});
test('Asset selector and GLTFLoader use files from this repo',()=>{
 assert.match(html,/id="pieceSet"/);assert.match(html,/id="whiteColor"/);
 assert.ok(js.includes('assets/models/staunton/'),'GLTFLoader must load local chess models');
});
test('XR session provides touch, aim, placement, and fallback',()=>{
 assert.match(html,/id="startArBtn"/);
 for(const id of ['placeArBtn','exitArBtn','arTouchBtn','arAimBtn','arScale','arSelectBtn','arHud'])
   assert.ok(html.includes('id="'+id+'"'),id+' missing');
 for(const feature of ['requestSession(\'immersive-ar\'','requestHitTestSource','setHologram','closestARSquare','onARPointerDown','onARPointerUp','selectAimedSquare','renderer.xr.setSession','beforexrselect'])
   assert.ok(js.includes(feature),feature+' missing');
});

test('Royal fantasy chess uses original glTF templates and highlights moves',()=>{
 assert.match(html,/value="royal"/);
 assert.match(js,/modelSet==='royal'/);
 assert.match(js,/OctahedronGeometry/);
 assert.match(js,/ownedMaterial/);
 assert.match(js,/arcaneUI\?\.tick/);
});
test('AR interrupted by phone lock restores 3D instead of blank screen',()=>{
 for(const snippet of ["visibilitychange","offerARRecovery","arRecoveryPanel","arRecover2d","arRecoverAR","arFixBtn","finishAR","onARPointerMove","world.quaternion.identity()"])
  assert.ok(html.includes(snippet)||js.includes(snippet),'Missing '+snippet);
 assert.match(js,/Promise\.resolve\(arSession\.end\(\)\)/);
 assert.match(js,/voluntaryArExit/);
});
