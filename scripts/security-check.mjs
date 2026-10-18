import fs from 'node:fs';
import path from 'node:path';
const paths=['index.html','main.js','arcane-ui.js','celestial-ui.js','adventure-ui.js','qr-scanner.js','asset-cache.js,'sw.js','auth.js','pvp.js','commands.js','match-state.js','version.json','worker-lib/security.js'];
const patterns=[
 ['Google/Firebase API keys',/AIza[A-Za-z0-9_-]{20,}/],
 ['Private keys',/-----BEGIN\s+(?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
 ['Hard-coded Firebase app settings',/(?:const|let)\s+firebaseConfig\s*=/],
 ['Hard-coded sensitive variables',/(?:client_secret|session_secret|api_secret|admin_token|private_key)\s*[:=]\s*['"][^'"]{8,}/i],
 ['OpenAI service secrets',/sk-[A-Za-z0-9_-]{28,}/]
];
let bad=false;
for(const name of paths){
 const source=fs.readFileSync(name,'utf8');
 for(const [label,re] of patterns){if(re.test(source)){console.error('SECURITY CHECK FAILED: '+label+' in '+name);bad=true;}}
}
const index=fs.readFileSync('index.html','utf8');
if(!index.includes('http-equiv="Content-Security-Policy"')){console.error('Missing CSP meta');bad=true;}
const auth=fs.readFileSync('auth.js','utf8');
if(!auth.includes('./api/auth/session')||auth.includes('firebaseConfig')){console.error('Auth must only use same-origin BFF');bad=true;}
const ignore=fs.readFileSync('.gitignore','utf8');
for(const file of ['.env','.dev.vars','*.pem','credentials.json']){
 if(!ignore.includes(file)){console.error('Missing secret ignore rule: '+file);bad=true;}
}
if(fs.existsSync('dist')){
 for(const unsafe of ['worker-lib','functions','tests','docs','AGENTS.md','package.json']){
  if(fs.existsSync(path.join('dist',unsafe))){console.error('Sensitive source in dist: '+unsafe);bad=true;}
 }
}
if(bad)process.exit(1);
console.log('Security scan: no embedded credential patterns, secure BFF adapter, safe artifact.');
