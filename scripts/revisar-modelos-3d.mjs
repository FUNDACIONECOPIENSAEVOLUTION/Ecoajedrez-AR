// Informational catalog of USER-UPLOADED 3D MODELS waiting for review.
// This script does not execute, convert or publish these files.
// Use: node scripts/revisar-modelos-3d.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const DEFAULT_INBOX='assets/modelos-por-revisar';
const formats=new Set(['.glb','.gltf','.fbx','.blend','.obj','.zip']);
const attachments=new Set(['.bin','.mtl','.png','.jpg','.jpeg','.webp','.ktx2','.bmp','.tga','.gif']);
const docNames=new Set(['README.md','FICHA_COLECCION.md','LICENCIA.md','LICENCIA.txt','LICENSE','LICENSE.txt','LICENSE.md','.gitkeep']);

function headOf(file,length=32){
 const fd=fs.openSync(file,'r');
 try{const buf=Buffer.alloc(length);const bytes=fs.readSync(fd,buf,0,length,0);return buf.subarray(0,bytes);}
 finally{fs.closeSync(fd);}
}

export function inspectModelFile(file,filename=path.basename(file)){
 const stat=fs.statSync(file),ext=path.extname(filename).toLowerCase();
 const result={name:filename,format:ext||'sin formato',bytes:stat.size,status:'PENDIENTE',detail:'Revisión manual'};
 if(stat.size>25*1024*1024){
  result.status='GRANDE';
  result.detail='Más de 25 MiB: evita subirlo desde la interfaz web; convierte/optimiza o usa otra vía';
 }
 if(!formats.has(ext)){
  if(attachments.has(ext)){result.status='ANEXO';result.detail='Textura o recurso relacionado con el modelo';}
  else{result.status='REVISAR';result.detail='Tipo no reconocido: no será importado automáticamente';}
  return result;
 }
 if(stat.size<12){result.status='NO VÁLIDO';result.detail='Archivo demasiado pequeño';return result;}
 const h=headOf(file,32);
 if(ext==='.glb'){
  if(h.toString('ascii',0,4)==='glTF'&&h.readUInt32LE(4)===2&&h.readUInt32LE(8)===stat.size){
   result.status='GLB 2.0';
   result.detail='Cabecera válida; pendiente de licencia, mallas, texturas, escala y rendimiento';
  }else{result.status='NO VÁLIDO';result.detail='Cabecera GLB, versión o longitud incorrecta';}
 }else if(ext==='.gltf'){
  if(stat.size>12*1024*1024){result.status='REVISAR';result.detail='glTF JSON demasiado grande para inspección básica';}
  else{try{
   const doc=JSON.parse(fs.readFileSync(file,'utf8'));
   if(doc?.asset?.version==='2.0'){
    result.status='GLTF 2.0';
    const resources=[...(doc.buffers||[]),...(doc.images||[])].filter(x=>x.uri&&!x.uri.startsWith('data:'));
    result.detail=resources.length?'JSON válido, '+resources.length+' recursos externos que deben acompañarlo':'JSON válido, sin recursos externos declarados';
   }else{result.status='NO VÁLIDO';result.detail='glTF asset.version distinta de 2.0';}
  }catch(e){result.status='NO VÁLIDO';result.detail='No se pudo leer como glTF JSON válido';}}
 }else if(ext==='.fbx'){
  result.status='CONVERTIR';
  result.detail=h.toString('ascii',0,18).startsWith('Kaydara FBX Binary')?'FBX binario; convertir a GLB con Blender':'FBX/ASCII: confirmar formato y convertir a GLB';
 }else if(ext==='.blend'){
  result.status=h.toString('ascii',0,7)==='BLENDER'?'CONVERTIR':'REVISAR';
  result.detail='Proyecto Blender; exportar GLB y revisar licencia';
 }else if(ext==='.zip'){
  if(h.subarray(0,2).toString()==='PK'){result.status='DESCOMPRIMIR';result.detail='ZIP detectado; no se abre ni publica automáticamente';}
  else{result.status='NO VÁLIDO';result.detail='No parece ser un archivo ZIP';}
 }else if(ext==='.obj'){
  result.status='CONVERTIR';result.detail='OBJ: puede requerir MTL y texturas; convertir a GLB';
 }
 return result;
}

export function scanModelInbox(root=DEFAULT_INBOX){
 const items=[],warnings=[];
 if(!fs.existsSync(root))return {items,warnings:['Carpeta de recepción todavía no existe'],totalBytes:0};
 function descend(folder,level=0){
  if(level>5){warnings.push('Profundidad máxima alcanzada: '+folder);return;}
  for(const entry of fs.readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
   const file=path.join(folder,entry.name);
   if(entry.isSymbolicLink()){warnings.push('Se omite enlace simbólico: '+file);continue;}
   if(entry.isDirectory()){descend(file,level+1);continue;}
   if(!entry.isFile()||docNames.has(entry.name))continue;
   if(items.length>=500){warnings.push('Se alcanzó el límite de 500 archivos en el informe');return;}
   try{const result=inspectModelFile(file,entry.name);result.name=path.relative(root,file).split(path.sep).join('/');items.push(result);}
   catch(e){warnings.push('No se pudo inspeccionar: '+file);}
  }
 }
 descend(root);
 return {items,warnings,totalBytes:items.reduce((x,y)=>x+y.bytes,0)};
}
const esc=value=>String(value).replaceAll('|','\\|').replace(/[\r\n]+/g,' ').slice(0,180);
export function reportMarkdown(result){
 const byStatus=Object.groupBy?Object.groupBy(result.items,x=>x.status):result.items.reduce((obj,x)=>((obj[x.status]??=[]).push(x),obj),{});
 const status=Object.entries(byStatus).map(([key,value])=>key+': '+value.length).join(' · ');
 const text=['## ECOAJEDREZ — Inventario automático de modelos por revisar',
 'Estos archivos **solo están en GitHub para revisión**. No se publican en GitHub Pages ni se incorporan al juego.',
 '',
 '**Archivos detectados:** '+result.items.length+' · **Peso total:** '+(result.totalBytes/1048576).toFixed(2)+' MiB',
 status?'**Estado:** '+status:'**Estado:** carpeta preparada, sin modelos todavía.',
 '',
 '| Archivo | Tamaño | Formato / resultado | Revisión pendiente |',
 '| --- | ---: | --- | --- |'];
 for(const row of result.items.slice(0,200)){
  text.push('| '+esc(row.name)+' | '+(row.bytes/1048576).toFixed(2)+' MiB | '+esc(row.status)+' | '+esc(row.detail)+' |');
 }
 if(result.items.length>200)text.push('Se muestran los primeros 200 archivos de '+result.items.length+'.');
 for(const warn of result.warnings)text.push('- ⚠ '+esc(warn));
 text.push('','**Acción siguiente:** indicar origen/licencia de cada colección; seleccionar y optimizar modelos aprobados; no sustituir automáticamente las piezas actuales.');
 return text.join('\n')+'\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=scanModelInbox();
 const output=reportMarkdown(result);
 console.log(output);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,output);
}
