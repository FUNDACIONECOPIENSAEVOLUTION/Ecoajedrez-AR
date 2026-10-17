// Ecoajedrez: same-origin BFF authentication ONLY. No OAuth secrets or Firebase client keys here.
// GitHub Pages is a static host and has no /api backend: guest play stays available there.
// Google sign-in becomes active only after deploying Pages Functions under the SAME origin.
let enabled=false, listener=null;
export function authAvailable(){return enabled;}
export async function initializeAccountAuth(onUser,onError){
 listener=onUser;
 try{
  const response=await fetch('./api/auth/session',{method:'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
  if(!response.ok || !(response.headers.get('content-type')||'').includes('application/json'))throw new Error('No secure backend');
  const data=await response.json();
  enabled=data.available===true;
  if(!enabled){onUser(null);return false;}
  if(data.authenticated===true && typeof data.uid==='string' && /^u_[a-f0-9]{24}$/.test(data.uid)){
   onUser({uid:data.uid,name:'JUGADOR',provider:'google',verified:true});
  }else onUser(null);
  return true;
 }catch(error){
  enabled=false;onUser(null);
  // Static GitHub Pages does not support this endpoint. Never disclose internal details to players.
  onError?.(new Error('El servidor seguro de Google aún no está configurado; puedes jugar como invitado.'));
  return false;
 }
}
export function loginGoogle(){
 if(!enabled)throw new Error('Inicio Google disponible al activar el servidor seguro.');
 // Navigation, not JavaScript OAuth token exchange. Passwords and Google tokens never reach this app.
 window.location.assign('./api/auth/google/start');
}
export async function logoutFirebase(){
 if(!enabled)return;
 try{
  await fetch('./api/auth/logout',{
   method:'POST',credentials:'same-origin',cache:'no-store',
   headers:{'X-Eco-Action':'logout',Accept:'application/json'}
  });
 }finally{listener?.(null);}
}
export function disposeAuth(){listener=null;}
