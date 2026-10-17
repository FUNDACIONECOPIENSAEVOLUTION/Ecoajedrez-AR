// Server-only security helpers for Cloudflare Pages Functions.
// Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, APP_ORIGIN
// in Cloudflare Pages encrypted Variables & Secrets. NEVER commit their values.
export const SESSION_COOKIE='__Host-eco_session';
export const STATE_COOKIE='__Host-eco_oauth';
const encoder=new TextEncoder();
function encode64(bytes){
 let result='';for(let i=0;i<bytes.length;i+=0x4000)result+=String.fromCharCode(...bytes.slice(i,i+0x4000));
 return btoa(result).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode64(value){
 if(typeof value!=='string'||value.length>20000||!/^[A-Za-z0-9_-]*$/.test(value))throw new Error('Invalid base64');
 const s=value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'=');
 return Uint8Array.from(atob(s),c=>c.charCodeAt(0));
}
export function randomToken(bytes=32){const b=crypto.getRandomValues(new Uint8Array(bytes));return encode64(b);}
export async function sha256(value){return new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function aesKey(env){
 if(typeof env.SESSION_SECRET!=='string'||env.SESSION_SECRET.length<32)throw new Error('Session server secret missing');
 const bytes=await sha256(env.SESSION_SECRET);
 return crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt','decrypt']);
}
export async function seal(env,object){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(env),encoder.encode(JSON.stringify(object))));
 return encode64(iv)+'.'+encode64(ciphertext);
}
export async function unseal(env,value){
 try{
  const parts=String(value||'').split('.');if(parts.length!==2)return null;
  const iv=decode64(parts[0]),encrypted=decode64(parts[1]);if(iv.length!==12||encrypted.length>4096)return null;
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},await aesKey(env),encrypted)));
 }catch(error){return null;}
}
export function getCookie(request,name){
 const found=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
 return found?found.slice(name.length+1):'';
}
export function cookieHeader(name,value,maxAge){
 return name+'='+value+'; Path=/; Max-Age='+maxAge+'; Secure; HttpOnly; SameSite=Lax';
}
export function responseHeaders(){
 return {'Cache-Control':'private, no-store, max-age=0','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'};
}
export function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{...responseHeaders(),'Content-Type':'application/json; charset=utf-8'}});
}
export function redirect(location,cookies=[]){
 const headers=new Headers({...responseHeaders(),Location:location});
 for(const item of cookies)headers.append('Set-Cookie',item);
 return new Response(null,{status:303,headers});
}
export function getAppOrigin(context){
 const origin=context.env.APP_ORIGIN;
 if(typeof origin!=='string'||!/^https:\/\/[a-z0-9.-]+$/i.test(origin))return null;
 if(new URL(context.request.url).origin!==origin)return null;
 return origin;
}
export function isConfigured(context){
 return Boolean(getAppOrigin(context) && typeof context.env.GOOGLE_CLIENT_ID==='string' &&
 context.env.GOOGLE_CLIENT_ID.length>15 && typeof context.env.GOOGLE_CLIENT_SECRET==='string' &&
 context.env.GOOGLE_CLIENT_SECRET.length>12 && typeof context.env.SESSION_SECRET==='string' &&
 context.env.SESSION_SECRET.length>=32);
}
export async function getSession(context){
 if(!isConfigured(context))return null;
 const session=await unseal(context.env,getCookie(context.request,SESSION_COOKIE));
 if(!session||typeof session.sub!=='string'||!/^[0-9]{6,30}$/.test(session.sub)||
    typeof session.exp!=='number'||session.exp<Date.now()||session.exp>Date.now()+9*60*60*1000)return null;
 return session;
}
export async function pseudonym(env,sub){
 const raw=await crypto.subtle.importKey('raw',await sha256(env.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=new Uint8Array(await crypto.subtle.sign('HMAC',raw,encoder.encode('eco-user:'+sub)));
 return 'u_'+[...sig.slice(0,12)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function verifyGoogleIdToken(token,env,expectedNonce){
 if(typeof token!=='string'||token.length>12000)throw new Error('Invalid token');
 const parts=token.split('.');if(parts.length!==3)throw new Error('Invalid JWT');
 const header=JSON.parse(new TextDecoder().decode(decode64(parts[0])));
 const payload=JSON.parse(new TextDecoder().decode(decode64(parts[1])));
 if(header.alg!=='RS256'||typeof header.kid!=='string')throw new Error('Unknown signing algorithm');
 const now=Math.floor(Date.now()/1000);
 if(!['accounts.google.com','https://accounts.google.com'].includes(payload.iss)||
    payload.aud!==env.GOOGLE_CLIENT_ID||payload.nonce!==expectedNonce||
    !Number.isSafeInteger(payload.exp)||payload.exp<=now||
    !Number.isSafeInteger(payload.iat)||payload.iat>now+60||
    typeof payload.sub!=='string'||!/^[0-9]{6,30}$/.test(payload.sub))throw new Error('OIDC claims invalid');
 const jwksResponse=await fetch('https://www.googleapis.com/oauth2/v3/certs');
 if(!jwksResponse.ok)throw new Error('Keys unavailable');
 const {keys}=await jwksResponse.json();
 const jwk=keys.find(key=>key.kid===header.kid&&key.kty==='RSA'&&key.use==='sig');
 if(!jwk)throw new Error('Signature key missing');
 const publicKey=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',publicKey,decode64(parts[2]),encoder.encode(parts[0]+'.'+parts[1]));
 if(!verified)throw new Error('Invalid signature');
 return payload.sub;
}
