// Publish only files required by the browser. Never copy server or auth secret files.
import fs from 'node:fs';
import path from 'node:path';
const dest='dist';
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
const files=['index.html','arcane.css','opening.css','opening.js','celestial.css','cinematic-fix.css','adventure.css','login-scene.css','readability-qr.css','models-cache.css','magic-game.css','victory-fx.css','victory-fx.js','immersive-chess.js','immersive-chess.css','immersive-room.js','immersive-room.css','quest-map.js','quest-map.css','experience-modes.js','experience-modes.css','community-models.js','anthropomorphic-pieces.js','piece-materials.js','piece-pbr.js','piece-gallery.js','army-appearance.js','piece-combat.js','piece-preview.js','piece-preview.css','ar-portal.js','board-catalog.css','realm-pairing.js','board-skins.js','board-catalog-ui.js','magic-world.js','last-move-ghost.js','legal-consent.js','terms.html','qr-scanner.js','asset-cache.js','adventure-ui.js','sw.js','celestial-ui.js','arcane-ui.js','privacy.html','version.json','skybox-test.html','skybox-test.css','skybox-test.js','skybox-config.js','main.js','auth.js','commands.js','pvp.js','match-state.js','ecoajedrez.PNG','_headers'];
for(const name of files){
 if(!fs.existsSync(name))throw Error('Missing asset: '+name);
 fs.copyFileSync(name,path.join(dest,name));
}
// Only publish game-approved model directories. NEVER publish the 3D intake folder.
fs.mkdirSync(path.join(dest,'assets/models'),{recursive:true});
fs.cpSync('assets/models/staunton',path.join(dest,'assets/models/staunton'),{recursive:true});
fs.cpSync('assets/ui',path.join(dest,'assets/ui'),{recursive:true});

// Owner-supplied robotic chess army: publish ONLY these six validated game models
// and six matching selection portraits; no raw intake folders or reference videos.
const roboticBase='app/imagenes/fichas/roboticos';
const roboticNames=['peon','torre','caballo','alfil','reina','rey'];
const roboticModelDest=path.join(dest,roboticBase,'modelos');
const roboticImageDest=path.join(dest,roboticBase,'imagenes');
fs.mkdirSync(roboticModelDest,{recursive:true});
fs.mkdirSync(roboticImageDest,{recursive:true});
let roboticBytes=0;
for(const name of roboticNames){
 const modelPath=path.join(roboticBase,'modelos',name+'.glb');
 const imagePath=path.join(roboticBase,'imagenes',name+'.jpg');
 if(!fs.existsSync(modelPath)||!fs.existsSync(imagePath))
  throw Error('Missing uploaded robotic chess model/portrait: '+name);
 const bytes=fs.readFileSync(modelPath);
 if(bytes.length<256||bytes.length>15000000||bytes.toString('ascii',0,4)!=='glTF'||
    bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)
  throw Error('Invalid GLB robotic chess piece: '+name);
 const jsonLength=bytes.readUInt32LE(12);
 if(jsonLength<30||jsonLength>bytes.length-20||bytes.toString('ascii',16,20)!=='JSON')
  throw Error('Missing GLB JSON chunk in robotic piece: '+name);
 const gltf=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
 if(!Array.isArray(gltf.meshes)||!gltf.meshes.length||!Array.isArray(gltf.nodes)||!gltf.nodes.length)
  throw Error('Robotic chess model has no usable geometry: '+name);
 roboticBytes+=bytes.length;
 if(roboticBytes>75000000)throw Error('Robotic set exceeds the combined 75 MB budget');
 const image=fs.readFileSync(imagePath);
 if(image.length<512||image.length>3000000||
    image[0]!==0xff||image[1]!==0xd8||image[2]!==0xff)
  throw Error('Invalid JPG portrait of robotic piece: '+name);
 fs.writeFileSync(path.join(roboticModelDest,name+'.glb'),bytes);
 fs.writeFileSync(path.join(roboticImageDest,name+'.jpg'),image);
}
fs.writeFileSync(path.join(dest,roboticBase,'manifest.json'),
 JSON.stringify({version:'0.16.1-beta.1',ready:true,
  models:roboticNames.map(name=>'modelos/'+name+'.glb'),
  portraits:roboticNames.map(name=>'imagenes/'+name+'.jpg'),
  rigged:false,clips:0},null,2)+'\\n');
console.log('Guardianes robóticos: 6 / 6 GLB y 6 / 6 imágenes publicados ('+roboticBytes+' bytes).');

// Eight user-uploaded and specifically approved visual cards: only these named files.
const cardNames=[
 '01_vs_computadora.webp','02_dos_jugadores.webp','03_duelo_online.webp','04_unirme_partida.webp',
 '05_bosque_encantado.webp','06_templo_arcano.webp','07_ciudad_flotante.webp','08_volcan_celestial.webp'
];
const cardDest=path.join(dest,'app/imagenes/tarjetas');
fs.mkdirSync(cardDest,{recursive:true});
for(const name of cardNames){
 const src=path.join('app/imagenes/tarjetas',name);
 if(!fs.existsSync(src))throw Error('Missing approved fantasy card: '+name);
 const file=fs.readFileSync(src);
 if(file.length<1024||file.length>3000000 || file.toString('ascii',0,4)!=='RIFF'||file.toString('ascii',8,12)!=='WEBP')
  throw Error('Invalid or unexpectedly large WebP: '+name);
 fs.writeFileSync(path.join(cardDest,name),file);
}


// Optional visual mode cards prepared by the owner (not gameplay assets).
// Use only exact file names and never publish arbitrary directory contents.
const modeCardNames=['01_3d_clasico.webp','02_reino_360.webp','03_ar_con_portal.webp'];
const modeCardSource='app/imagenes/interfaces/modos';
const modeCardDest=path.join(dest,modeCardSource);
fs.mkdirSync(modeCardDest,{recursive:true});
for(const name of modeCardNames){
 const src=path.join(modeCardSource,name);
 if(!fs.existsSync(src))throw Error('Missing approved experience mode WebP: '+name);
 const data=fs.readFileSync(src);
 if(data.length<1024||data.length>3000000||
    data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP')
   throw Error('Invalid selected mode card WebP: '+name);
 fs.writeFileSync(path.join(modeCardDest,name),data);
}

// Publish only explicitly approved PBR maps; never copy arbitrary downloaded ZIPs.
const allowedPBR=['walnut','oak','stone','marble','obsidian','bronze','gold','ice','basalt'];
const pbrDest=path.join(dest,'assets/texturas-pbr');
fs.mkdirSync(pbrDest,{recursive:true});
const pbrManifest={version:1,materials:{}};
let pbrBytes=0;
for(const id of allowedPBR){
 const maps={};
 const source=path.join('assets/texturas-pbr',id);
 for(const role of ['color','normal','roughness','metalness','height']){
  for(const extension of ['webp','jpg','png']){
   const name=role+'.'+extension,local=path.join(source,name);
   if(!fs.existsSync(local))continue;
   const file=fs.readFileSync(local);
   const valid=(extension==='webp'?file.toString('ascii',0,4)==='RIFF'&&file.toString('ascii',8,12)==='WEBP':
    extension==='jpg'?file.length>4&&file[0]===255&&file[1]===216&&file[2]===255:
    file.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
   if(!valid||file.length<256||file.length>2000000)throw Error('Invalid PBR texture (expected <=2MB): '+local);
   pbrBytes+=file.length;
   if(pbrBytes>30000000)throw Error('Real PBR texture library exceeds 30MB overall');
   const destination=path.join(pbrDest,id);
   fs.mkdirSync(destination,{recursive:true});
   fs.writeFileSync(path.join(destination,name),file);
   maps[role]=id+'/'+name;
   break;
  }
 }
 if(maps.color)pbrManifest.materials[id]=maps;
 else if(Object.keys(maps).length)console.log('Skipping incomplete PBR preset lacking color map: '+id);
}
fs.writeFileSync(path.join(pbrDest,'manifest.json'),JSON.stringify(pbrManifest,null,2)+'\n');
console.log('Approved PBR photographed materials: '+Object.keys(pbrManifest.materials).length+' / 9. Uploads optional.');

// Original anthropomorphic chess GLB supplied by the user: one file for 32 figures.
const anthroPath='assets/models/anthropomorphic/anthropomorphic-chess.glb';
if(fs.existsSync(anthroPath)){
 const bin=fs.readFileSync(anthroPath);
 if(bin.length<10000||bin.length>8000000||bin.toString('ascii',0,4)!=='glTF'||
    bin.readUInt32LE(4)!==2||bin.readUInt32LE(8)!==bin.length)
   throw Error('Invalid anthropomorphic chess GLB');
 const chunkBytes=bin.readUInt32LE(12);
 if(chunkBytes<50||chunkBytes>bin.length-20||bin.toString('ascii',16,20)!=='JSON')
   throw Error('Missing anthropomorphic GLB JSON chunk');
 const json=JSON.parse(bin.toString('utf8',20,20+chunkBytes));
 const roots=(json.nodes||[]).filter(n=>/^(White|Black)_(Pawn|Rook|Knight|Bishop|Queen|King)_\d+$/.test(n.name||''));
 const names=(json.animations||[]).map(a=>a.name||'');
 if(roots.length!==32||!roots.every(n=>names.includes(n.name+'_Walk')))
   throw Error('Anthropomorphic GLB must contain 32 named pieces and 32 Walk clips');
 const destination=path.join(dest,'assets/models/anthropomorphic');
 fs.mkdirSync(destination,{recursive:true});
 fs.writeFileSync(path.join(destination,'anthropomorphic-chess.glb'),bin);
 fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify({
  ready:true,pieces:32,walkClips:32,format:'glTF 2.0',bytes:bin.length
 },null,2)+'\n');
 console.log('Approved free anthropomorphic GLB: 32 figures and 32 walking clips.');
}else{
 console.log('Anthropomorphic GLB pending upload; procedural free walking figures available.');
}

// Owner-reviewed optional community GLB chess pieces: publish ONLY a verified complete set.
const {COMMUNITY_FILES}=await import('../community-models.js');
const sourceCommunity='assets/models/community';
const presentCommunity=COMMUNITY_FILES.filter(name=>fs.existsSync(path.join(sourceCommunity,name)));
if(presentCommunity.length===COMMUNITY_FILES.length){
 const dst=path.join(dest,sourceCommunity);
 fs.mkdirSync(dst,{recursive:true});
 let total=0;
 for(const name of COMMUNITY_FILES){
  const raw=fs.readFileSync(path.join(sourceCommunity,name));
  const glb=raw.length>=24&&raw.length<=3000000&&raw.toString('ascii',0,4)==='glTF'&&
   raw.readUInt32LE(4)===2&&raw.readUInt32LE(8)===raw.length;
  if(!glb)throw Error('Invalid approved community chess GLB: '+name);
  total+=raw.length;
  if(total>24000000)throw Error('Community chess piece assets too large');
  fs.writeFileSync(path.join(dst,name),raw);
 }
 fs.writeFileSync(path.join(dst,'manifest.json'),JSON.stringify({ready:true,files:COMMUNITY_FILES},null,2)+'\n');
 console.log('Optional community chess GLB set: 12 / 12 (verified).');
}else{
 console.log('Community chess GLBs: '+presentCommunity.length+' / 12. Original Staunton fallback retained.');
}

// User-approved, real gameplay boards (13) and decorative vista artwork (7).
// Never publish unspecified files from app/imagenes/tableros.
const boardFiles=[
 "tablero_alquímico_de_líquidos_mágicos.webp",
 "tablero_celta_mágico_de_ajedrez.webp",
 "tablero_cibernético_de_neón_magenta_y_cian.webp",
 "tablero_cósmico_de_nebulosas_y_obsidiana.webp",
 "tablero_cósmico_de_plata_y_amatista.webp",
 "tablero_de_ajedrez_mágico_con_vetas_doradas.webp",
 "tablero_de_atlantis_en_nácar_y_oro.webp",
 "tablero_de_hielo_mágico_con_runas_luminosas.webp",
 "tablero_de_lava_y_basalto.webp",
 "tablero_egipcio_de_oro_y_lapislázuli.webp",
 "tablero_gótico_de_almas_espectrales.webp",
 "tablero_místico_de_cristales_y_runas.webp",
 "tablero_steampunk_de_engranajes_y_cobre.webp"
];
const decorativeVistaFiles=[
 "vista-ajedrez_cósmico_entre_galaxias.webp",
 "vista-coleccion_cinco_tableros_fantasticos.webp",
 "vista-tablero_de_ajedrez_de_hielo_auroral.webp",
 "vista-tablero_de_ajedrez_de_lava_draconico.webp",
 "vista-tablero_de_ajedrez_mágico_de_amatista.webp",
 "vista-tablero_místico_del_bosque_encantado.webp",
 "vista_de_ajedrez_celestial_encantado.webp"
];
const boardDest=path.join(dest,'app/imagenes/tableros');
fs.mkdirSync(boardDest,{recursive:true});
for(const name of [...boardFiles,...decorativeVistaFiles]){
 const src=path.join('app/imagenes/tableros',name);
 if(!fs.existsSync(src))throw Error('Missing approved fantasy board artwork: '+name);
 const data=fs.readFileSync(src);
 if(data.length<1024||data.length>2500000
    ||data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP')
  throw Error('Invalid board WebP '+name);
 fs.writeFileSync(path.join(boardDest,name),data);
}
console.log('Approved board images: '+boardFiles.length+' playable, '+decorativeVistaFiles.length+' decorative.');

// Only whitelist owner-approved uploaded backgrounds (no wildcards / user files).
// Import the same data as the UI so every 3D board & realm keep identical names.
const {BOARD_REALM_IMAGES,BOARD_REALM_THEMES,REALM_SKYBOX_FALLBACK}=await import('../realm-pairing.js');
const realmFiles=[...new Set([
 ...Object.values(BOARD_REALM_IMAGES),
 ...Object.keys(BOARD_REALM_IMAGES).map(id=>'entorno_'+id+'.webp')
])];
const realmBase='app/imagenes/entornos',realmDest=path.join(dest,realmBase);
fs.mkdirSync(realmDest,{recursive:true});
const availableRealms=[];
for(const name of realmFiles){
 const src=path.join(realmBase,name);
 if(!fs.existsSync(src))continue;
 const data=fs.readFileSync(src);
 if(data.length<1024||data.length>3000000||data.toString('ascii',0,4)!=='RIFF'
    ||data.toString('ascii',8,12)!=='WEBP')throw Error('Invalid realm WebP: '+name);
 fs.writeFileSync(path.join(realmDest,name),data);
 availableRealms.push(name);
}
fs.writeFileSync(path.join(realmDest,'manifest.json'),
 JSON.stringify({available:availableRealms},null,2)+'\n');
console.log('Uploaded kingdom environments: '+availableRealms.length+' published.');

// Optional owner-uploaded cubemaps for the *separate 360° test viewer*.
// Publish only when all six square WebP faces match the same dimensions.
const {SKYBOX_REALMS,SKYBOX_FACES}=await import('../skybox-config.js');
function webpDimensions(data){
 if(data.length<30||data.toString('ascii',0,4)!=='RIFF'||
    data.toString('ascii',8,12)!=='WEBP')return null;
 const kind=data.toString('ascii',12,16);
 if(kind==='VP8X'){
  const width=1+data[24]+(data[25]<<8)+(data[26]<<16);
  const height=1+data[27]+(data[28]<<8)+(data[29]<<16);
  return {width,height};
 }
 if(kind==='VP8 '&&data[23]===0x9d&&data[24]===0x01&&data[25]===0x2a){
  return {width:data.readUInt16LE(26)&0x3fff,height:data.readUInt16LE(28)&0x3fff};
 }
 if(kind==='VP8L'&&data[20]===0x2f){
  return {
   width:1+(data[21]|((data[22]&0x3f)<<8)),
   height:1+((data[22]>>6)|(data[23]<<2)|((data[24]&0x0f)<<10))
  };
 }
 return null;
}
const skyRoot='app/imagenes/skybox';
const skyDest=path.join(dest,skyRoot);
fs.mkdirSync(skyDest,{recursive:true});
const skyManifest={version:1,realms:{}};
let completeSkyboxes=0;
for(const entry of SKYBOX_REALMS){
 const directory=path.join(skyRoot,entry.id);
 const present=SKYBOX_FACES.filter(face=>fs.existsSync(path.join(directory,face+'.webp')));
 const missing=SKYBOX_FACES.filter(face=>!present.includes(face));
 const result={ready:false,present,missing};
 skyManifest.realms[entry.id]=result;
 if(missing.length)continue; // Do not publish half a cubemap.
 const data=SKYBOX_FACES.map(face=>fs.readFileSync(path.join(directory,face+'.webp')));
 const dimensions=data.map(webpDimensions);
 const first=dimensions[0];
 if(data.some(buf=>buf.length<1024||buf.length>3000000) ||
    dimensions.some(d=>!d||d.width!==d.height||d.width<512||d.width>4096||
     d.width!==first?.width||d.height!==first?.height)){
  result.reason='Las 6 caras deben ser WebP cuadrados de idéntica resolución (512–4096 px), con máximo 3 MB por cara.';
  continue; // Safely retain the rest of the game deployment.
 }
 const destination=path.join(skyDest,entry.id);
 fs.mkdirSync(destination,{recursive:true});
 SKYBOX_FACES.forEach((face,i)=>fs.writeFileSync(path.join(destination,face+'.webp'),data[i]));
 result.ready=true;result.resolution=first.width;
 completeSkyboxes++;
}
fs.writeFileSync(path.join(skyDest,'manifest.json'),JSON.stringify(skyManifest,null,2)+'\n');
console.log('Complete 360 skybox kingdoms published: '+completeSkyboxes+' / '+SKYBOX_REALMS.length+'.');
// Validate every game board has an actual 3D background in the built artifact:
// dedicated/approved flat WebP or the already verified face of its own 360 realm.
const unresolvedBoards=Object.keys(BOARD_REALM_THEMES).filter(id=>{
 const hasImage=availableRealms.includes('entorno_'+id+'.webp')||
   availableRealms.includes(BOARD_REALM_IMAGES[id]);
 const hasCubeFallback=Boolean(REALM_SKYBOX_FALLBACK[id] &&
   skyManifest.realms[REALM_SKYBOX_FALLBACK[id]]?.ready);
 return !hasImage&&!hasCubeFallback;
});
if(unresolvedBoards.length)throw Error('Playable boards without a published kingdom backdrop: '+unresolvedBoards.join(', '));
console.log('Paired realm catalogue: '+Object.keys(BOARD_REALM_THEMES).length+' / 13 boards have a background.');


// Exact single owner-uploaded post-intro background (not arbitrary directory publishing).
const loginImage='app/imagenes/interfaces/login_post_intro_fondo.png';
const loginBytes=fs.readFileSync(loginImage);
const pngMagic=Buffer.from([137,80,78,71,13,10,26,10]);
if(loginBytes.length<1024||loginBytes.length>6000000||!loginBytes.subarray(0,8).equals(pngMagic))
 throw Error('Invalid or missing approved login backdrop: '+loginImage);
fs.mkdirSync(path.join(dest,'app/imagenes/interfaces'),{recursive:true});
fs.writeFileSync(path.join(dest,loginImage),loginBytes);

// Explicitly publish the user-approved game media. Never publish whole arbitrary directories.
const mediaFiles=[
  ['ECOAJEDREZ_ Tablero Místico del Planeta-1.png',6000000],
  ['Ecoajedrez_ La Arena Cobra Vida-2.png',6000000],
  ['Ecoajedrez_ Portales del Bosque Mágico-3.png',6000000],
  ['Vídeo sin título-17_10_2026, 16_58.mp4',20000000],
  ['Vídeo sin título-17_10_2026, 17_08.mp4',20000000],
  ['Vídeo sin título-17_10_2026, 17_10.mp4',20000000]
];
fs.mkdirSync(path.join(dest,'videos'),{recursive:true});
for(const [name,maxSize] of mediaFiles){
  const src=path.join('videos',name);
  if(!fs.existsSync(src)||!fs.statSync(src).isFile())throw Error('Missing media asset: '+name);
  const size=fs.statSync(src).size;
  if(size<128||size>maxSize)throw Error('Unexpected media size: '+name+' '+size);
  const header=Buffer.alloc(12);
  const handle=fs.openSync(src,'r');
  try{fs.readSync(handle,header,0,12,0);}finally{fs.closeSync(handle);}
  const isPng=name.endsWith('.png');
  if(isPng&&!header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Not a PNG: '+name);
  if(!isPng&&header.subarray(4,8).toString()!=='ftyp')throw Error('Not an MP4: '+name);
  fs.copyFileSync(src,path.join(dest,'videos',name));
}

fs.writeFileSync(path.join(dest,'.nojekyll'),'');
for(const sensitive of ['worker-lib','functions','tests','docs','AGENTS.md','package.json','.env','.dev.vars']){
 if(fs.existsSync(path.join(dest,sensitive)))throw Error('Sensitive internal source in deployment: '+sensitive);
}
console.log('Safe static artifacts ready at dist/');
