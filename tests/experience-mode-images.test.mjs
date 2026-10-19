import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('experience-modes.css','utf8');
const build=fs.readFileSync('scripts/build-pages.mjs','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));
const dir='app/imagenes/interfaces/modos/';
const cards=[
 ['normal','01_3d_clasico.webp','3D CLÁSICO'],
 ['skybox','02_reino_360.webp','REINO 360°'],
 ['ar','03_ar_con_portal.webp','AR CON PORTAL']
];
test('Uploaded WebP illustrations match all three experience radios',()=>{
 assert.equal((html.match(/name="experienceMode"/g)||[]).length,3);
 for(const [mode,file,title] of cards){
  const data=fs.readFileSync(dir+file);
  assert.ok(data.length>=1024&&data.length<=3000000);
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
  const i=html.indexOf('name="experienceMode" value="'+mode+'"');
  assert.ok(i>=0,mode);
  const label=html.slice(i,html.indexOf('</label>',i));
  assert.ok(label.includes(dir+file),file);
  assert.ok(label.includes(title));
  assert.match(label,/width="1024" height="1024"/);
  assert.match(label,/loading="lazy"/);
  assert.ok(build.includes("'"+file+"'"),file);
 }
});
test('Responsive mode selector keeps images square and preserves selection',()=>{
 assert.match(css,/aspect-ratio:1\/1/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:790px\)/);
 assert.match(css,/experienceChoice:has\(input:checked\)/);
 assert.ok(html.includes('experience-modes.css?v=0.14.9'));
 assert.equal(version.version,'0.15.2-beta.1');
});
test('Pages build enforces approved WebP files only',()=>{
 assert.match(build,/const modeCardNames=\['01_3d_clasico.webp','02_reino_360.webp','03_ar_con_portal.webp'\]/);
 assert.match(build,/Missing approved experience mode WebP/);
 assert.match(build,/Invalid selected mode card WebP/);
});
