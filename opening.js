// ECOAJEDREZ 0.7: Visual opening and release metadata, independent from WebXR or sign-in.
// No passwords, no analytics, no backend and no third-party font/video requests.
const FALLBACK_RELEASE='0.7.0-beta.1';
const versionTags=()=>Array.from(document.querySelectorAll('[data-app-version]'));
let resolvedVersion=FALLBACK_RELEASE;
function showVersion(){
  for(const tag of versionTags()){
    tag.textContent='v'+resolvedVersion;
    tag.setAttribute('title','ECOAJEDREZ AR · versión pública '+resolvedVersion);
  }
}
async function readVersion(){
  try{
    const response=await fetch('./version.json?v=0.7.0',{cache:'no-store',headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('Release manifest unavailable');
    const body=await response.json();
    if(typeof body.version==='string' && /^0\.[0-9]+\.[0-9]+-beta\.[0-9]+$/.test(body.version)){
      resolvedVersion=body.version;
    }
  }catch(error){
    // Display the build's baked-in version even if offline; never show secrets or internal errors.
  }finally{showVersion();}
}
function setupHero(){
  const showcase=document.getElementById('heroShowcase');
  if(!showcase)return;
  const slides=[...showcase.querySelectorAll('.heroSlide')];
  const buttons=[...showcase.querySelectorAll('[data-hero-index]')];
  if(slides.length<2)return;
  let index=0;
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
  function select(indexNext){
    index=(indexNext+slides.length)%slides.length;
    slides.forEach((slide,i)=>{
      slide.classList.toggle('active',i===index);
      slide.setAttribute('aria-hidden',String(i!==index));
    });
    buttons.forEach((button,i)=>{
      button.classList.toggle('active',i===index);
      button.setAttribute('aria-pressed',String(i===index));
    });
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
  select(0);
  if(!reduceMotion){
    // One lightweight timer: switch only while the opening is actually visible.
    setInterval(()=>{
      if(!document.hidden && document.body.dataset.view==='welcome')select(index+1);
    },6200);
  }
}
function decorateDynamicRoom(){
  const menu=document.getElementById('menuPanel');
  if(!menu)return;
  const observe=new MutationObserver(()=>{
    const room=document.getElementById('roomPanel');
    if(!room||!room.classList.contains('visible')||room.querySelector('[data-app-version]'))return;
    const badge=document.createElement('span');
    badge.className='appVersion';
    badge.setAttribute('data-app-version','');
    room.appendChild(badge);
    showVersion();
  });
  observe.observe(menu,{childList:true,subtree:true});
}
showVersion();
setupHero();
decorateDynamicRoom();
readVersion();
