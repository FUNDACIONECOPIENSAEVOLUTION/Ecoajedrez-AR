import {randomToken,sha256,seal,STATE_COOKIE,cookieHeader,redirect,isConfigured,getAppOrigin} from '../../../../worker-lib/security.js';
function urlsafe(bytes){
 let binary='';for(const n of bytes)binary+=String.fromCharCode(n);
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function onRequestGet(context){
 if(!isConfigured(context))return new Response('El inicio seguro no está configurado.',{status:503,headers:{'Cache-Control':'no-store'}});
 const origin=getAppOrigin(context);
 const state=randomToken(24),nonce=randomToken(24),verifier=randomToken(32);
 const challenge=urlsafe(await sha256(verifier));
 const pending=await seal(context.env,{state,nonce,verifier,expiry:Date.now()+600000});
 const google=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 google.search=new URLSearchParams({
  response_type:'code',client_id:context.env.GOOGLE_CLIENT_ID,
  redirect_uri:origin+'/api/auth/google/callback',
  scope:'openid',state,nonce,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'
 }).toString();
 return redirect(google.toString(),[cookieHeader(STATE_COOKIE,pending,600)]);
}
