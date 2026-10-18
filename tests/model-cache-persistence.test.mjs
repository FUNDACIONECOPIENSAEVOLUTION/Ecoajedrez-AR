import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('main.js','utf8');
const cached=fs.readFileSync('asset-cache.js','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));
const gltfNames=['pawn','rook','knight','bishop','queen','king'];

test('All six chess pieces are valid self-contained glTFs and selectable in settings',()=>{
 for(const name of gltfNames){
  const raw=fs.readFileSync('assets/models/staunton/'+name+'.gltf','utf8');
  const parsed=JSON.parse(raw);
  assert.equal(parsed.asset.version,'2.0');
  assert.match(parsed.buffers[0].uri,/^data:application\/octet-stream;base64,/);
 }
 for(const value of ['staunton','royal','fantasy','classic'])
  assert.ok(html.includes('value="'+value+'"'),'Missing selector '+value);
 assert.match(html,/id="downloadModels"/);
 assert.match(html,/id="modelDownloadProgress"/);
 assert.match(html,/id="modelCacheState"/);
 assert.match(main,/await loader\.parseAsync\(await response\.text\(\)/);
 assert.match(main,/await cached\.getResource\(path\)/);
 assert.match(main,/if\(modelsLoading\)return modelsLoading/);
 assert.match(main,/cache\.preparePublicAssets\(\{modelsOnly:true,force:true\}\)/);
 assert.match(main,/cached\.getResource|cache\.cacheReport/);
 assert.equal(version.version,'0.13.0-beta.1');
 assert.match(build,/'models-cache\.css'/);
});

test('Model glTF downloads are deduplicated and reused from persistent CacheStorage across sessions', async()=>{
 const store=new Map();let count=0;
 const cache={
  match:async req=>store.get(typeof req==='string'?req:req.url)?.clone(),
  put:async(req,res)=>{store.set(typeof req==='string'?req:req.url,res.clone());}
 };
 const platform={
  URL,Request,Response,Promise,Uint8Array,
  location:{origin:'https://example.test',protocol:'https:'},
  document:{baseURI:'https://example.test/Ecoajedrez-AR/'},
  caches:{open:async()=>cache},
  navigator:{storage:{persisted:async()=>false}},
  fetch:async request=>{
   count++;
   const url=new URL(request.url);
   const data=fs.readFileSync('.'+url.pathname.replace('/Ecoajedrez-AR',''),'utf8');
   return new Response(data,{status:200,headers:{'content-type':'model/gltf+json'}});
  },
  setTimeout:()=>0,
  window:{addEventListener() {},dispatchEvent(){}},
  CustomEvent:class {constructor(name,opts){this.type=name;this.detail=opts.detail;}}
 };
 const boot=()=>{const ctx={...platform,window:{...platform.window,caches:platform.caches}};vm.runInNewContext(cached,ctx);return ctx.window.ecoPublicAssets;};
 const first=boot();
 const urls=gltfNames.map(name=>'./assets/models/staunton/'+name+'.gltf');
 // Concurrent background prefetch and model loading ask for same bytes.
 const responses=await Promise.all([...urls.map(x=>first.getResource(x)),first.getResource(urls[0]),first.getResource(urls[2])]);
 assert.equal(responses.length,8);
 assert.equal(count,6,'only six unique network requests on first run');
 assert.equal((await first.cacheReport()).stored,6);
 const second=boot();
 await Promise.all(urls.map(x=>second.getResource(x)));
 assert.equal(count,6,'browser revisit uses cached models, no new network downloads');
 assert.equal((await second.cacheReport()).stored,6);
 await assert.rejects(first.getResource('https://untrusted.example/chess.gltf'),/no autorizado/);
 await assert.rejects(first.getResource('./private/secret.txt'),/no autorizado/);
 assert.ok([...store.keys()].every(x=>x.startsWith('https://example.test/Ecoajedrez-AR/assets/models/staunton/')));
});
