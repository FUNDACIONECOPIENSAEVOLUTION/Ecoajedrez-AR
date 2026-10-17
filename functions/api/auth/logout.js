import {SESSION_COOKIE,cookieHeader,json,isConfigured,getAppOrigin} from '../../../worker-lib/security.js';
export function onRequestPost(context){
 if(!isConfigured(context))return json({available:false},503);
 const origin=getAppOrigin(context);
 if(context.request.headers.get('origin')!==origin||
   context.request.headers.get('X-Eco-Action')!=='logout')return json({error:'Solicitud no autorizada'},403);
 const response=json({ok:true});
 response.headers.append('Set-Cookie',cookieHeader(SESSION_COOKIE,'',0));
 return response;
}
