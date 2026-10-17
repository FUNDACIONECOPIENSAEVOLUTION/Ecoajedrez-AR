import {getSession,isConfigured,pseudonym,json} from '../../../worker-lib/security.js';
export async function onRequestGet(context){
 if(!isConfigured(context))return json({available:false,authenticated:false},503);
 const session=await getSession(context);
 if(!session)return json({available:true,authenticated:false});
 return json({available:true,authenticated:true,provider:'google',uid:await pseudonym(context.env,session.sub)});
}
