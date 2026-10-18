// ECOAJEDREZ · v0.14 interactive chooser for REAL board textures and
// independent decorative 'vista-' gallery. Does not manage game logic.
import {BOARD_SKINS,VISION_ART,boardURL,findBoard} from './board-skins.js?v=0.14.0';
const setting=document.getElementById('boardSkin');
const menuSelect=document.getElementById('toolsBoardSkin');
const preview=document.getElementById('boardSkinPreview');
const caption=document.getElementById('boardSkinCaption');
const label=document.getElementById('boardSkinName');
const gallery=document.getElementById('visionGallery');
const photo=document.getElementById('visionArt');
const title=document.getElementById('visionTitle');
let galleryIndex=0;
for(const select of [setting,menuSelect]){
 if(!select)continue;
 select.replaceChildren();
 for(const entry of BOARD_SKINS){
  const option=document.createElement('option');
  option.value=entry.id;option.textContent=entry.label;
  select.add(option);
 }
}
function updatePreview(id){
 const skin=findBoard(id);
 for(const node of [setting,menuSelect])if(node)node.value=skin.id;
 if(label)label.textContent=skin.label;
 if(caption)caption.textContent=skin.file?
   'Textura real sobre las 64 casillas; las piezas y movimientos siguen en 3D.':
   'Diseño clásico nativo, sin imagen superpuesta.';
 if(preview){
  // Only the selected texture is loaded. Avoid fetching all 13 at once on mobile.
  const url=boardURL(skin);
  preview.hidden=!url;
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
