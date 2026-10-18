// ECOAJEDREZ · Camera-based QR invitation scanner. No images leave this device.
// Native BarcodeDetector where available; lazy jsQR fallback for other browsers.
// Only six-character room codes or invitations from THIS game/origin are accepted.
const CODE=/^[A-HJ-NP-Z2-9]{6}$/;
export function parseRoomQR(raw,originURL=location.href){
 const value=String(raw||'').trim();
 if(value.length>2048)return null;
 if(CODE.test(value.toUpperCase()))return value.toUpperCase();
 try{
  const base=new URL(originURL);
  const url=new URL(value);
  const cleanPath=s=>s.replace(/\/index\.html$/i,'/').replace(/\/+$/,'/');
  if(url.protocol!=='https:'||url.origin!==base.origin||cleanPath(url.pathname)!==cleanPath(base.pathname))return null;
  const code=url.searchParams.get('room');
  if(url.searchParams.getAll('room').length!==1||!code||!CODE.test(code.toUpperCase()))return null;
  return code.toUpperCase();
 }catch(error){return null;}
}
export function setupQrJoin({onRoom,onStatus,hideJoinPanel}={}){
 const start=document.getElementById('scanRoomQR');
 const stop=document.getElementById('closeQRScanner');
 const panel=document.getElementById('qrScannerPanel');
 const video=document.getElementById('qrCameraVideo');
 const hint=document.getElementById('qrScannerStatus');
 if(!start||!stop||!panel||!video)return {stop(){}};
 let stream=null,active=false,frame=0,last=0,busy=false,detector=null,decoder=null;
 const say=message=>{if(hint)hint.textContent=message;onStatus?.(message);};
 function shutdown(){
  active=false;
  if(frame)cancelAnimationFrame(frame);frame=0;
  video.pause();
  video.srcObject=null;
  for(const track of stream?.getTracks()||[])track.stop();
  stream=null;busy=false;
  panel.hidden=true;
  start.disabled=false;
 }
 async function initializeDecoder(){
  if(typeof BarcodeDetector!=='undefined'){
   try{
    const formats=await BarcodeDetector.getSupportedFormats?.();
    if(!formats||formats.includes('qr_code'))detector=new BarcodeDetector({formats:['qr_code']});
   }catch(error){detector=null;}
  }
  if(!detector){
   // jsQR runs entirely in-browser; dependency only loads if native detector unavailable.
   const module=await import('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm');
   decoder=module.default||module.jsQR;
   if(typeof decoder!=='function')throw Error('No se pudo preparar el lector QR.');
  }
 }
 const canvas=document.createElement('canvas');
 const context=canvas.getContext('2d',{willReadFrequently:true});
 async function scanFrame(now){
  if(!active)return;
  frame=requestAnimationFrame(scanFrame);
  if(busy||now-last<125||!video.videoWidth||!video.videoHeight)return;
  last=now;busy=true;
  try{
   let scanned=null;
   if(detector){
    const found=await detector.detect(video);
    scanned=found[0]?.rawValue||null;
   } else if(decoder&&context){
    const w=Math.min(video.videoWidth,720);
    const h=Math.max(1,Math.round(w*video.videoHeight/video.videoWidth));
    canvas.width=w;canvas.height=h;
    context.drawImage(video,0,0,w,h);
    scanned=decoder(context.getImageData(0,0,w,h).data,w,h,{inversionAttempts:'attemptBoth'})?.data||null;
   }
   if(!active||!scanned)return;
   const room=parseRoomQR(scanned);
   if(!room){say('Este QR no pertenece a una sala de ECOAJEDREZ. Prueba con el código de seis caracteres.');return;}
   shutdown();
   onRoom?.(room);
  }catch(error){
   if(detector){
    detector=null;
    try{await initializeDecoder();}catch(fallbackError){
     say('No se pudo usar el lector QR. Puedes introducir el código manualmente.');
     shutdown();
    }
   }else{
    say('Error al leer el QR. Prueba con buena iluminación o introduce el código.');
    shutdown();
   }
  }finally{busy=false;}
 }
 async function begin(){
  if(active)return;
  if(!navigator.mediaDevices?.getUserMedia||!window.isSecureContext){
   say('Esta cámara requiere HTTPS y permisos del navegador. Usa el código de seis caracteres.');
   return;
  }
  start.disabled=true;
  panel.hidden=false;
  say('Solicitando permiso para la cámara… No se guarda ni se envía ningún video.');
  try{
   // Ask permission only after the user's explicit button press.
   stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
   video.srcObject=stream; video.muted=true;video.playsInline=true;
   await video.play();
   say('Enfoca el QR que aparece en el teléfono del anfitrión.');
   await initializeDecoder();
   active=true;
   frame=requestAnimationFrame(scanFrame);
  }catch(error){
   const message=error?.name==='NotAllowedError'?'Permiso de cámara denegado. Actívalo en el navegador o escribe el código.'
      :error?.name==='NotFoundError'?'No se encontró una cámara disponible. Introduce el código.'
      :'El lector no pudo iniciarse. Puedes introducir el código manualmente.';
   say(message);
   shutdown();
  }
 }
 start.addEventListener('click',begin);
 stop.addEventListener('click',shutdown);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)shutdown();});
 window.addEventListener('pagehide',shutdown);
 new MutationObserver(()=>{
  if(document.body.dataset.view!=='menu'||hideJoinPanel?.())shutdown();
 }).observe(document.body,{attributes:true,attributeFilter:['data-view']});
 return {stop:shutdown};
}
