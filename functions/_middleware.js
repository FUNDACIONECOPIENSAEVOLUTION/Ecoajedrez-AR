// Headers are enforced on server-hosted Pages Functions; Pages static _headers handles assets.
export async function onRequest(context){
 const response=await context.next();
 const headers=new Headers(response.headers);
 headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','no-referrer');
 headers.set('X-Frame-Options','DENY');
 headers.set('Permissions-Policy','camera=(self), microphone=(self), geolocation=(), xr-spatial-tracking=(self)');
 if(new URL(context.request.url).pathname.startsWith('/api/'))headers.set('Cache-Control','private, no-store, max-age=0');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
