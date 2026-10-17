import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const code=fs.readFileSync('main.js','utf8');
const v=JSON.parse(fs.readFileSync('version.json','utf8'));

test('version and assets match',()=>{
  assert.ok(index.includes(v.version),'the UI should show the project version');
  assert.ok(index.includes('./main.js'),'the UI should load main.js');
  assert.ok(index.includes('./ecoajedrez.PNG'),'the logo should be used');
  assert.ok(fs.statSync('ecoajedrez.PNG').size > 0,'logo exists');
});
test('engine and controls present',()=>{
  for(const token of ['new Chess()','new THREE.WebGLRenderer','navigator.xr.requestSession','requestHitTestSource','requestReferenceSpace','chooseBot','squareFromHit','playMove']){
    assert.ok(code.includes(token),'missing: '+token);
  }
});
test('languages and mode supported',()=>{
  for(const lang of ["es:{","en:{","zh:{"]){assert.ok(code.includes(lang),'missing: '+lang);}
  assert.ok(index.includes('value="bot"'));assert.ok(index.includes('value="local"'));
});
test('handoff and model evidence documented',()=>{
  for(const f of ['AGENTS.md','README.md','docs/ESTADO_ACTUAL.md','docs/HOJA_DE_RUTA.md','docs/INVENTARIO_MODELOS.md','CHANGELOG.md']){
    assert.ok(fs.existsSync(f),'missing: '+f);
  }
});
