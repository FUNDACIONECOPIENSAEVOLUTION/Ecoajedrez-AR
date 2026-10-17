import {STATE_COOKIE,SESSION_COOKIE,unseal,seal,getCookie,cookieHeader,redirect,isConfigured,getAppOrigin,verifyGoogleIdToken} from '../../../../worker-lib/security.js';
export async function onRequestGet(context){
 if(!isConfigured(context))return new Response('Inicio de sesión no configurado.',{status:503,headers:{'Cache-Control':'no-store'}});
 const origin=getAppOrigin(context),url=new URL(context.request.url);
 const clearState=cookieHeader(STATE_COOKIE,'',0);
 const failed=()=>redirect(origin+'/?login=failed',[clearState]);
 const code=url.searchParams.get('code'),state=url.searchParams.get('state');
 if(!code||code.length>3000||!state||state.length>128||url.searchParams.has('error'))return failed();
 try{
  const pending=await unseal(context.env,getCookie(context.request,STATE_COOKIE));
  if(!pending||pending.state!==state||pending.expiry<Date.now()||pending.expiry>Date.now()+601000)return failed();
  const exchange=await fetch('https://oauth2.googleapis.com/token',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({
    code,client_id:context.env.GOOGLE_CLIENT_ID,
    client_secret:context.env.GOOGLE_CLIENT_SECRET,
    redirect_uri:origin+'/api/auth/google/callback',
    grant_type:'authorization_code',code_verifier:pending.verifier
   }).toString()
  });
  if(!exchange.ok)return failed();
  const tokens=await exchange.json();
  const sub=await verifyGoogleIdToken(tokens.id_token,context.env,pending.nonce);
  const session=await seal(context.env,{sub,exp:Date.now()+8*60*60*1000});
  return redirect(origin+'/',[clearState,cookieHeader(SESSION_COOKIE,session,8*60*60)]);
 }catch(error){
  // Never log or return OAuth code, tokens, secrets or personal identity.
  return failed();
 }
}
