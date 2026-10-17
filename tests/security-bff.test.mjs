import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomToken,seal,unseal,pseudonym,getAppOrigin,isConfigured,getSession} from '../worker-lib/security.js';
const env={
  SESSION_SECRET:'x'.repeat(48),
  GOOGLE_CLIENT_ID:'placeholder-client-id-for-unit-tests',
  GOOGLE_CLIENT_SECRET:'placeholder-secret-for-unit-tests',
  APP_ORIGIN:'https://ecoajedrez.pages.dev'
};
function context(url='https://ecoajedrez.pages.dev/api/auth/session',cookie=''){
 return {request:new Request(url,{headers:{cookie}}),env};
}
test('secret-free frontend and encrypted HttpOnly session primitives',async()=>{
 const source=fs.readFileSync('auth.js','utf8');
 assert.doesNotMatch(source,/AIza|firebaseConfig|client_secret\s*=/);
 assert.match(source,/api\/auth\/session/);
 assert.match(source,/api\/auth\/google\/start/);
 const session={sub:'123456789012345678901',exp:Date.now()+60000};
 const cookie=await seal(env,session);
 assert.ok(!cookie.includes(session.sub),'session must be ciphertext');
 assert.deepEqual(await unseal(env,cookie),session);
 assert.equal(await unseal(env,cookie.slice(0,-3)+'abc'),null);
 const parsed=await getSession(context('https://ecoajedrez.pages.dev/api/auth/session','__Host-eco_session='+cookie));
 assert.deepEqual(parsed,session);
});
test('CSRF-safe server origin and pseudonymous account IDs',async()=>{
 assert.equal(getAppOrigin(context()),env.APP_ORIGIN);
 assert.equal(getAppOrigin(context('https://attacker.invalid/api/auth/session')),null);
 assert.equal(isConfigured(context()),true);
 assert.equal(isConfigured({...context(),env:{...env,GOOGLE_CLIENT_SECRET:''}}),false);
 const id=await pseudonym(env,'123456789012345678901');
 assert.match(id,/^u_[a-f0-9]{24}$/);
 assert.equal(id,await pseudonym(env,'123456789012345678901'));
 assert.notEqual(id,await pseudonym(env,'123456789012345678902'));
 assert.ok(randomToken(24).length>=32);
});
test('secret files and server routes are excluded from published artifact',()=>{
 const built=fs.existsSync('dist')?'dist':'';
 if(built){
  for(const forbidden of ['functions','worker-lib','docs','AGENTS.md','tests','package.json','scripts']){
   assert.equal(fs.existsSync(built+'/'+forbidden),false,forbidden+' must not be public');
  }
 }
 const wf=fs.readFileSync('.github/workflows/pages.yml','utf8');
 assert.match(wf,/path: dist/);
 assert.match(wf,/node scripts\/security-check.mjs/);
 assert.match(wf,/node scripts\/build-pages.mjs/);
});
