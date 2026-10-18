// ECOAJEDREZ 0.11: all eight uploaded WebP artworks now back actual, functional DOM buttons.
// Portal choices use already-supported 3D biomes, never fake buttons or dummy gameplay.
const themeControl=document.getElementById('theme');
const arena=document.getElementById('arenaScreen');
const arenaCards=[...document.querySelectorAll('[data-arena-theme]')];
const back=document.getElementById('arenaBack');
function synchronizeArena(){
 const selected=themeControl?.value;
 for(const card of arenaCards){
  card.setAttribute('aria-pressed',String(card.dataset.arenaTheme===selected));
 }
}
document.getElementById('arenaPickerBtn')?.addEventListener('click',()=>{
 document.body.dataset.view='arena';
 synchronizeArena();
 back?.focus({preventScroll:true});
});
back?.addEventListener('click',()=>{document.body.dataset.view='menu';document.getElementById('arenaPickerBtn')?.focus({preventScroll:true});});
for(const card of arenaCards){
 card.addEventListener('click',()=>{
  const theme=card.dataset.arenaTheme;
  if(![...themeControl.options].some(opt=>opt.value===theme))return;
  themeControl.value=theme;
  // Uses the original Three.js game's live update handler and settings screen.
  themeControl.dispatchEvent(new Event('change',{bubbles:true}));
  synchronizeArena();
  document.body.dataset.view='menu';
  document.getElementById('menuSettings')?.click();
 });
}
themeControl?.addEventListener('change',synchronizeArena);
synchronizeArena();
// No privileged APIs, network, storage, dynamic imports, or changes to game/AR.
