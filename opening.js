// ECOAJEDREZ 0.9 · cinematic media choreography. The game and WebXR remain independent.
// One ambient MP4 maximum, only on welcome/menu; photos animate gently on the side.
const FALLBACK_RELEASE='0.9.0-beta.1';
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
  const response=await fetch('./version.json?v=0.9.0',{cache:'no-store',headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('Release manifest unavailable');
  const body=await response.json();
  if(typeof body.version==='string'&&/^0\.[0-9]+\.[0-9]+-beta\.[0-9]+$/.test(body.version))resolvedVersion=body.version;
 }catch(error){
  // Connection loss should never prevent the guest game from opening.
 }finally{showVersion();}
}
function setupHero(){
 const showcase=document.getElementById('heroShowcase');
 if(!showcase)return;
 const slides=[...showcase.querySelectorAll('.heroSlide')];
 const dots=[...showcase.querySelectorAll('[data-hero-index]')];
 const welcomeVideo=document.getElementById('welcomeAmbientVideo');
 const menuVideo=document.getElementById('menuAmbientVideo');
 const toggleWelcome=document.getElementById('toggleAmbientVideo');
 const toggleMenu=document.getElementById('menuToggleAmbientVideo');
 const ambientVideos=[welcomeVideo,menuVideo].filter(Boolean);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const constrained=Boolean(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType));
 let enableVideos=!reduced&&!constrained;
 let introVisible=false,index=0;
 const cinema=document.getElementById('cinemaOverlay');
 const cinemaVideo=document.getElementById('cinemaVideo');
 const note=document.getElementById('cinemaNote');
 const skip=document.getElementById('skipIntroBtn');
 let lastFocus=null;

 function pauseScenes(){
  // Deliberately stop BOTH sources before activating one; avoids double media decoding on phones.
  for(const video of ambientVideos){
   video.pause();
   video.closest('.welcomeVideoBackdrop,.menuAtmosphere')?.classList.remove('videoReady');
  }
 }
 function currentView(){
  return document.body.dataset.view;
 }
 function playAmbient(){
  pauseScenes();
  if(!enableVideos||document.hidden||introVisible||document.body.classList.contains('xr-active'))return;
  const view=currentView();
  const video=view==='welcome'?welcomeVideo:view==='menu'?menuVideo:null;
  if(!video||video.dataset.failed==='1')return;
  if(!video.src){
   video.src=video.dataset.videoSrc;
   video.load(); // download only the video for the currently visible screen
  }
  const attempt=video.play();
  if(attempt?.catch)attempt.catch(()=>{
   video.closest('.welcomeVideoBackdrop,.menuAtmosphere')?.classList.remove('videoReady');
   // Keep picture visible when the browser blocks autoplay.
  });
 }
 function syncToggles(){
  for(const button of [toggleWelcome,toggleMenu]){
   if(!button)continue;
   button.textContent=enableVideos?'⏸ PAUSAR FONDO':'▶ ANIMAR FONDO';
   button.setAttribute('aria-pressed',String(enableVideos));
  }
 }
 for(const video of ambientVideos){
  video.addEventListener('playing',()=>{
   const expected=currentView()==='welcome'?welcomeVideo:currentView()==='menu'?menuVideo:null;
   if(video===expected && !introVisible && !document.hidden && enableVideos){
    video.closest('.welcomeVideoBackdrop,.menuAtmosphere')?.classList.add('videoReady');
   }
  });
  video.addEventListener('error',()=>{
   video.dataset.failed='1';
   video.closest('.welcomeVideoBackdrop,.menuAtmosphere')?.classList.remove('videoReady');
  });
  video.addEventListener('waiting',()=>{
   video.closest('.welcomeVideoBackdrop,.menuAtmosphere')?.classList.remove('videoReady');
  });
 }
 for(const img of document.querySelectorAll('.heroPoster')){
  img.addEventListener('error',()=>{
   const fallback=img.dataset.fallback;
   if(fallback&&img.getAttribute('src')!==fallback)img.src=fallback;
  });
 }
 function select(next){
  index=(next+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
   slide.classList.toggle('active',i===index);
   slide.setAttribute('aria-hidden',String(i!==index));
  });
  dots.forEach((dot,i)=>{
   dot.classList.toggle('active',i===index);
   dot.setAttribute('aria-pressed',String(i===index));
  });
 }
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
 function toggleAmbient(){
  enableVideos=!enableVideos;
  if(enableVideos)ambientVideos.forEach(video=>{delete video.dataset.failed;});
  syncToggles();
  playAmbient();
 }
 for(const button of [toggleWelcome,toggleMenu])button?.addEventListener('click',toggleAmbient);
 syncToggles();
 function closeIntro(){
  if(!cinema||cinema.hidden)return;
  cinemaVideo?.pause();
  cinema.hidden=true;
  cinema.setAttribute('aria-hidden','true');
  introVisible=false;
  if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
  playAmbient();
 }
 function startIntro(){
  if(!cinema||!cinemaVideo)return;
  lastFocus=document.activeElement;
  introVisible=true;
  pauseScenes();
  cinema.hidden=false;
  cinema.removeAttribute('aria-hidden');
  note.textContent='ECOAJEDREZ · Puedes omitir la introducción y empezar a jugar en cualquier momento.';
  skip?.focus({preventScroll:true});
  if(!cinemaVideo.src){
   cinemaVideo.src=cinemaVideo.dataset.videoSrc; // 13 MB only after explicit user action
   cinemaVideo.load();
  }
  try{cinemaVideo.currentTime=0;}catch(error){}
  const p=cinemaVideo.play();
  if(p?.catch)p.catch(()=>{note.textContent='No fue posible iniciar este video. Puedes continuar jugando como invitado.';});
 }
 document.getElementById('playIntroBtn')?.addEventListener('click',startIntro);
 document.getElementById('menuIntroBtn')?.addEventListener('click',startIntro);
 skip?.addEventListener('click',closeIntro);
 cinemaVideo?.addEventListener('ended',closeIntro);
 cinemaVideo?.addEventListener('error',()=>{note.textContent='Este video no pudo reproducirse; el juego permanece disponible.';});
 cinema?.addEventListener('pointerdown',e=>{if(e.target===cinema)closeIntro();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&introVisible)closeIntro();});

 function refresh(){
  const view=currentView();
  if(view==='game'||document.body.classList.contains('xr-active')){
   closeIntro();
   pauseScenes();
   return;
  }
  if(document.hidden){
   cinemaVideo?.pause();
   pauseScenes();
   return;
  }
  if(!introVisible)playAmbient();
  else pauseScenes();
 }
 new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['data-view','class']});
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('pagehide',()=>{
  pauseScenes();
  cinemaVideo?.pause();
 });
 if(slides.length){
  select(0);
  if(!reduced){
   setInterval(()=>{
    if(!document.hidden&&document.body.dataset.view==='welcome'&&!introVisible)select(index+1);
   },10500);
  }
 }
 refresh();
}
function decorateDynamicRoom(){
 const menu=document.getElementById('menuPanel');
 if(!menu)return;
 new MutationObserver(()=>{
  const room=document.getElementById('roomPanel');
  if(!room||!room.classList.contains('visible')||room.querySelector('[data-app-version]'))return;
  const badge=document.createElement('span');
  badge.className='appVersion';
  badge.setAttribute('data-app-version','');
  room.appendChild(badge);
  showVersion();
 }).observe(menu,{childList:true,subtree:true});
}
showVersion();
setupHero();
decorateDynamicRoom();
readVersion();
