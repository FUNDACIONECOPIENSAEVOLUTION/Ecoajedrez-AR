// Browser-local first-use terms acknowledgement. NOT a camera/mic permission grant.
// No IP/account data recorded here. Essential gameplay only; no ad/tracking consent.
const KEY='ecoajedrez-terms-2026-10';
const dialog=document.getElementById('legalDialog');
const accept=document.getElementById('legalAccept');
const check=document.getElementById('legalCheck');
const box=document.getElementById('legalAcceptance');
const close=document.getElementById('legalClose');
let pending=null,focusBefore=null,memoryAccepted=false;
function accepted(){
 try{return memoryAccepted||localStorage.getItem(KEY)==='yes';}
 catch(e){return memoryAccepted;}
}
function open({agreement=false,button=null}={}){
 focusBefore=document.activeElement;
 pending=agreement?button:null;
 box.hidden=!agreement;
 check.checked=accepted();
 accept.disabled=!check.checked;
 dialog.hidden=false;
 document.getElementById('legalTitle').textContent=agreement?'✧ ANTES DE ENTRAR A LA ARENA':'✧ REGLAS DE LA ARENA';
 if(agreement)check.focus();else close.focus();
}
function hide(){
 dialog.hidden=true;
 const focus=focusBefore;focusBefore=null;
 focus?.focus?.({preventScroll:true});
 pending=null;
}
function acknowledge(){
 if(!check.checked)return;
 memoryAccepted=true;
 try{localStorage.setItem(KEY,'yes');}catch(error){}
 const trigger=pending;
 hide();
 trigger?.click(); // Replay only after acceptance; normal auth/guest handling remains intact.
}
function intercept(event){
 if(accepted())return;
 event.preventDefault();
 event.stopImmediatePropagation();
 open({agreement:true,button:event.currentTarget});
}
for(const id of ['loginGuestBtn','loginGoogleBtn']){
 document.getElementById(id)?.addEventListener('click',intercept,true);
}
check?.addEventListener('change',()=>{accept.disabled=!check.checked;});
accept?.addEventListener('click',acknowledge);
close?.addEventListener('click',hide);
dialog?.addEventListener('keydown',e=>{
 if(e.key==='Escape'){hide();return;}
 if(e.key==='Tab'){
  const focusables=[...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')].filter(x=>x.offsetParent!==null);
  if(!focusables.length)return;
  const first=focusables[0],last=focusables[focusables.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
document.getElementById('menuLegalInfo')?.addEventListener('click',()=>open());
window.ecoLegal={openInfo:()=>open(),accepted};
