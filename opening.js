// ECOAJEDREZ 0.8 · user-owned video opening, same-origin, lazy loading, never in WebXR.
// The actual MP4 files are hosted inside /videos/ in this same GitHub Pages site.
const FALLBACK_RELEASE='0.8.0-beta.1';
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
  const response=await fetch('./version.json?v=0.8.0',{cache:'no-store',headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('Release manifest unavailable');
  const body=await response.json();
  if(typeof body.version==='string'&&/^0\.[0-9]+\.[0-9]+-beta\.[0-9]+$/.test(body.version))resolvedVersion=body.version;
 }catch(error){
  // Offline or a cache error must never prevent opening the guest game.
 }finally{showVersion();}
}
function setupHero(){
 const showcase=document.getElementById('heroShowcase');
 if(!showcase)return;
 const slides=[...showcase.querySelectorAll('.heroSlide')];
 const buttons=[...showcase.querySelectorAll('[data-hero-index]')];
 const toggle=document.getElementById('toggleAmbientVideo');
 if(slides.length<2)return;
 let index=0;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const constrained=Boolean(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType));
 let enableVideos=!reduced&&!constrained;
 let introVisible=false;
 function welcomeVisible(){
  return document.body.dataset.view==='welcome'&&!document.hidden&&!document.body.classList.contains('xr-active')&&!introVisible;
 }
 function pauseScenes(){
  for(const slide of slides){
   const video=slide.querySelector('.heroVideo');
   video?.pause();
   slide.classList.remove('videoReady');
  }
 }
 function playback(){
  pauseScenes();
  if(!enableVideos||!welcomeVisible())return;
  const slide=slides[index],video=slide.querySelector('video.heroVideo');
  if(!video||video.dataset.failed==='1')return;
  if(!video.src){
   // This avoids downloading multiple 7 MB videos simultaneously on 4G.
   video.src=video.dataset.videoSrc;
   video.load();
  }
  const promise=video.play();
  if(promise?.catch)promise.catch(()=>{
   slide.classList.remove('videoReady');
   video.dataset.failed='1'; // keep the sharp PNG poster as fallback
  });
 }
 function select(next){
  index=(next+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
   slide.classList.toggle('active',i===index);
   slide.setAttribute('aria-hidden',String(i!==index));
  });
  buttons.forEach((button,i)=>{
   button.classList.toggle('active',i===index);
   button.setAttribute('aria-pressed',String(i===index));
  });
  playback();
 }
 function updateToggle(){
  if(!toggle)return;
  toggle.textContent=enableVideos?'⏸ PAUSAR ANIMACIÓN':'▶ ACTIVAR ANIMACIÓN';
  toggle.setAttribute('aria-pressed',String(enableVideos));
 }
 for(const slide of slides){
  const poster=slide.querySelector('.heroPoster');
  poster?.addEventListener('error',()=>{
   const fallback=poster.dataset.fallback;
   if(fallback&&poster.getAttribute('src')!==fallback)poster.src=fallback;
  });
  const video=slide.querySelector('.heroVideo');
  video?.addEventListener('playing',()=>{
   if(slides[index]===slide&&welcomeVisible()&&enableVideos)slide.classList.add('videoReady');
  });
  video?.addEventListener('error',()=>{
   video.dataset.failed='1';slide.classList.remove('videoReady');
  });
  video?.addEventListener('waiting',()=>slide.classList.remove('videoReady'));
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
 toggle?.addEventListener('click',()=>{
  enableVideos=!enableVideos;
  updateToggle();
  playback();
 });
 updateToggle();
 const cinema=document.getElementById('cinemaOverlay');
 const cinemaVideo=document.getElementById('cinemaVideo');
 const note=document.getElementById('cinemaNote');
 const skip=document.getElementById('skipIntroBtn');
 let lastFocus=null;
 function closeIntro(){
  if(cinema?.hidden)return;
  cinemaVideo?.pause();
  cinema.hidden=true;
  cinema.setAttribute('aria-hidden','true');
  introVisible=false;
  if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
  playback();
 }
 function startIntro(){
  if(!cinema||!cinemaVideo)return;
  lastFocus=document.activeElement;
  introVisible=true;
  pauseScenes();
  cinema.hidden=false;
  cinema.removeAttribute('aria-hidden');
  note.textContent='Intro de ECOAJEDREZ · puedes omitirla y comenzar a jugar en cualquier momento.';
  skip?.focus({preventScroll:true});
  if(!cinemaVideo.src){
   cinemaVideo.src=cinemaVideo.dataset.videoSrc; // only load 13 MB if user clicks "VER INTRO"
   cinemaVideo.load();
  }
  try{cinemaVideo.currentTime=0;}catch(error){}
  const promise=cinemaVideo.play();
  if(promise?.catch)promise.catch(()=>{note.textContent='Tu navegador no pudo reproducir este video. Puedes continuar el juego con normalidad.';});
 }
 document.getElementById('playIntroBtn')?.addEventListener('click',startIntro);
 document.getElementById('menuIntroBtn')?.addEventListener('click',startIntro);
 skip?.addEventListener('click',closeIntro);
 cinemaVideo?.addEventListener('ended',closeIntro);
 cinemaVideo?.addEventListener('error',()=>{note.textContent='No fue posible reproducir la intro. Revisa la conexión o el formato MP4.';});
 cinema?.addEventListener('pointerdown',event=>{if(event.target===cinema)closeIntro();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&introVisible)closeIntro();});
 function refresh(){
  if(document.body.dataset.view==='game'||document.body.classList.contains('xr-active')){
   closeIntro();
   pauseScenes();
  }else if(document.hidden){
   cinemaVideo?.pause();
   pauseScenes();
  }else if(document.body.dataset.view==='welcome'&&!introVisible)playback();
  else pauseScenes();
 }
 const observer=new MutationObserver(refresh);
 observer.observe(document.body,{attributes:true,attributeFilter:['data-view','class']});
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('pagehide',()=>{pauseScenes();cinemaVideo?.pause();});
 select(0);
 if(!reduced){
  setInterval(()=>{
   if(welcomeVisible())select(index+1);
  },9500); // longer scenes reduce downloads and avoid cutting loop mid-frame
 }
}
function decorateDynamicRoom(){
 const menu=document.getElementById('menuPanel');
 if(!menu)return;
 const observer=new MutationObserver(()=>{
  const room=document.getElementById('roomPanel');
  if(!room||!room.classList.contains('visible')||room.querySelector('[data-app-version]'))return;
  const badge=document.createElement('span');
  badge.className='appVersion';
  badge.setAttribute('data-app-version','');
  room.appendChild(badge);
  showVersion();
 });
 observer.observe(menu,{childList:true,subtree:true});
}
showVersion();
setupHero();
decorateDynamicRoom();
readVersion();
