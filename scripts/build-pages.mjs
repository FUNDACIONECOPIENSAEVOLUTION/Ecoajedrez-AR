// Publish only files required by the browser. Never copy server or auth secret files.
import fs from 'node:fs';
import path from 'node:path';
const dest='dist';
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
const files=['index.html','arcane.css','opening.css','opening.js','celestial.css','cinematic-fix.css','adventure.css','login-scene.css','readability-qr.css','models-cache.css','magic-game.css','victory-fx.css','victory-fx.js','board-catalog.css','realm-pairing.js','board-skins.js','board-catalog-ui.js','magic-world.js','last-move-ghost.js','legal-consent.js','terms.html','qr-scanner.js','asset-cache.js','adventure-ui.js','sw.js','celestial-ui.js','arcane-ui.js','privacy.html','version.json','main.js','auth.js','commands.js','pvp.js','match-state.js','ecoajedrez.PNG','_headers'];
for(const name of files){
 if(!fs.existsSync(name))throw Error('Missing asset: '+name);
 fs.copyFileSync(name,path.join(dest,name));
}
fs.cpSync('assets/models',path.join(dest,'assets/models'),{recursive:true});
fs.cpSync('assets/ui',path.join(dest,'assets/ui'),{recursive:true});

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

// Optional and exact owner-uploaded 3D kingdoms (no arbitrary user files).
const realmIds=["alquimia","celta","cyber","cosmos","amatista","dorado","atlantis","hielo","lava","egipto","gotico","cristales","steampunk"];
const realmBase='app/imagenes/entornos',realmDest=path.join(dest,realmBase);
fs.mkdirSync(realmDest,{recursive:true});
const availableRealms=[];
for(const id of realmIds){
 const name='entorno_'+id+'.webp',src=path.join(realmBase,name);
 if(!fs.existsSync(src))continue;
 const data=fs.readFileSync(src);
 if(data.length<1024||data.length>3000000||data.toString('ascii',0,4)!=='RIFF'
    ||data.toString('ascii',8,12)!=='WEBP')throw Error('Invalid realm WebP: '+name);
 fs.writeFileSync(path.join(realmDest,name),data);
 availableRealms.push(name);
}
fs.writeFileSync(path.join(realmDest,'manifest.json'),
 JSON.stringify({available:availableRealms},null,2)+'\n');
console.log('Kingdoms paired: '+availableRealms.length+' / 13.');
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
