// ECOAJEDREZ · v0.16.1 interactive chooser for REAL board textures and
// independent decorative 'vista-' gallery. Does not manage game logic.
import {BOARD_SKINS,VISION_ART,boardURL,findBoard} from './board-skins.js?v=0.14.3';
import { publishedRealmURL } from './realm-pairing.js?v=0.16.1';
import {realmForBoard} from './skybox-config.js?v=0.14.5';
import {gameRealmName} from './experience-modes.js?v=0.14.8';
const setting=document.getElementById('boardSkin');
const menuSelect=document.getElementById('toolsBoardSkin');
const preview=document.getElementById('boardSkinPreview');
const caption=document.getElementById('boardSkinCaption');
const label=document.getElementById('boardSkinName');
const empty=document.getElementById('boardSkinEmpty');
const realmPreview=document.getElementById('boardRealmPreview');
const realmEmpty=document.getElementById('boardRealmEmpty');

let realmSequence=0;
const gallery=document.getElementById('visionGallery');
const photo=document.getElementById('visionArt');
const title=document.getElementById('visionTitle');
let galleryIndex=0;
for(const select of [setting,menuSelect]){
 if(!select)continue;
 select.replaceChildren();
 for(const entry of BOARD_SKINS){
  const option=document.createElement('option');
  option.value=entry.id;option.textContent=entry.id==='classic'?entry.label:gameRealmName(entry.id)+' — '+entry.label;
  select.add(option);
 }
}
async function previewRealm(id){
 const sequence=++realmSequence;
 if(realmPreview){realmPreview.onload=null;realmPreview.onerror=null;realmPreview.hidden=true;realmPreview.removeAttribute('src');}
 if(realmEmpty){
  realmEmpty.hidden=false;
  realmEmpty.textContent=id==='classic'?'Reino clásico · libre':'Comprobando imagen del reino…';
 }
 if(id==='classic')return;
 const url=await publishedRealmURL(id);
 if(sequence!==realmSequence)return;
 if(!url||!realmPreview){
  if(realmEmpty)realmEmpty.textContent='Sin vista de reino publicada; tablero disponible';
  return;
 }
 realmPreview.onload=()=>{
  if(sequence!==realmSequence)return;
  realmPreview.hidden=false;
  if(realmEmpty)realmEmpty.hidden=true;
 };
 realmPreview.onerror=()=>{
  if(sequence!==realmSequence)return;
  realmPreview.hidden=true;
  if(realmEmpty){realmEmpty.hidden=false;realmEmpty.textContent='No se pudo mostrar la vista del reino';}
 };
 realmPreview.alt='Reino 3D del tablero '+findBoard(id).label;
 realmPreview.src=url;
}
function updatePreview(id){
 const skin=findBoard(id);
 const skyRealm=realmForBoard(skin.id);

 previewRealm(skin.id).catch(()=>{});
 for(const node of [setting,menuSelect])if(node)node.value=skin.id;
 if(label)label.textContent=skin.id==='classic'?skin.label:(skyRealm.label+' · '+skin.label);
 if(caption)caption.textContent=skin.file?
   'Reino '+skyRealm.label+' seleccionado. Juega en 3D, 360° o AR con el mismo tablero y piezas.':
   'Diseño clásico nativo, sin imagen superpuesta.';
 if(preview){
  // Only the selected texture is loaded. Avoid fetching all 13 at once on mobile.
  const url=boardURL(skin);
  preview.hidden=!url;
  if(empty)empty.hidden=Boolean(url);
  if(url)preview.src=url;
  else preview.removeAttribute('src');
  preview.alt=url?'Superficie seleccionada: '+skin.label:'';
 }
}
function selectBoard(id,notify=true){
 const value=findBoard(id).id;
 updatePreview(value);
 if(notify){
  try{localStorage.setItem('ecoajedrez-board-skin',value);}catch(error){}
  document.dispatchEvent(new CustomEvent('eco:board-skin-select',{detail:{id:value}}));
 }
}
for(const node of [setting,menuSelect])node?.addEventListener('change',event=>selectBoard(event.target.value));
let initial='classic';
try{initial=localStorage.getItem('ecoajedrez-board-skin')||'classic';}catch(error){}
selectBoard(initial,false);
window.ecoBoardCatalogue={selectBoard,getSelected:()=>setting?.value||'classic'};
function drawGallery(){
 if(!photo||!title)return;
 const selected=VISION_ART[galleryIndex];
 photo.src='./app/imagenes/tableros/'+encodeURIComponent(selected.file);
 photo.alt='Ilustración decorativa del universo ECOAJEDREZ: '+selected.label;
 title.textContent=(galleryIndex+1)+' / '+VISION_ART.length+' · '+selected.label;
 if(gallery)gallery.dataset.slide=String(galleryIndex);
}
function navigate(offset){
 galleryIndex=(galleryIndex+offset+VISION_ART.length)%VISION_ART.length;
 drawGallery();
}
document.getElementById('visionPrev')?.addEventListener('click',()=>navigate(-1));
document.getElementById('visionNext')?.addEventListener('click',()=>navigate(1));
drawGallery();
