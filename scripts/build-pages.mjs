// Publish only files required by the browser. Never copy server or auth secret files.
import fs from 'node:fs';
import path from 'node:path';
const dest='dist';
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
const files=['index.html','arcane.css','opening.css','opening.js','celestial.css','cinematic-fix.css','adventure.css','asset-cache.js','adventure-ui.js','sw.js','celestial-ui.js','arcane-ui.js','privacy.html','version.json','main.js','auth.js','commands.js','pvp.js','match-state.js','ecoajedrez.PNG','_headers'];
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
