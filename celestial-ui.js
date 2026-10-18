// ECOAJEDREZ 0.10.0: visual-only enhancement with real settings actions.
// Deliberately separate from Three.js, rules, auth and WebXR.
const preview=document.getElementById('biomePreview');
const theme=document.getElementById('theme');
const pieceSet=document.getElementById('pieceSet');
const sceneSymbols={classic:'♜',wood:'♞',marble:'♕',neon:'♚',jungle:'♞',volcano:'♜',ice:'♝'};
const pieceSymbols={royal:'♚',fantasy:'♞',staunton:'♛',classic:'♟'};
function refreshPreview(){
 if(!preview)return;
 const biome=theme?.value||'classic';
 preview.dataset.biome=biome;
 const glyph=preview.querySelector('.previewChess');
 if(glyph)glyph.textContent=pieceSymbols[pieceSet?.value]||sceneSymbols[biome]||'♞';
 const caption=preview.querySelector('.previewCaption');
 if(caption){
  const label=theme?.selectedOptions?.[0]?.textContent||'ARENA DE AJEDREZ';
  caption.textContent='✦ '+label.toUpperCase();
 }
}
theme?.addEventListener('change',refreshPreview);
pieceSet?.addEventListener('change',refreshPreview);
refreshPreview();
// The sidebar controls use the game's existing, tested button handlers.
document.getElementById('settingsGoMenu')?.addEventListener('click',()=>{
 const back=document.getElementById('backToMenu');
 if(back&&!back.disabled)back.click();
});
document.getElementById('settingsGoPlay')?.addEventListener('click',()=>{
 const start=document.getElementById('startConfigured');
 if(start&&!start.disabled)start.click();
});
// Ensure settings art matches freshly selected game mode when arriving from menu.
const root=document.body;
if(root){
 new MutationObserver(()=>{
  if(root.dataset.view==='settings')refreshPreview();
 }).observe(root,{attributes:true,attributeFilter:['data-view']});
}
// Interaction respects prefers-reduced-motion and uses only declarative CSS transforms.
