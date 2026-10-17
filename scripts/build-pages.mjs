// Publish only files required by the browser. Never copy server or auth secret files.
import fs from 'node:fs';
import path from 'node:path';
const dest='dist';
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
const files=['index.html','privacy.html','main.js','auth.js','commands.js','pvp.js','match-state.js','ecoajedrez.PNG','_headers'];
for(const name of files){
 if(!fs.existsSync(name))throw Error('Missing asset: '+name);
 fs.copyFileSync(name,path.join(dest,name));
}
fs.cpSync('assets/models',path.join(dest,'assets/models'),{recursive:true});
fs.writeFileSync(path.join(dest,'.nojekyll'),'');
for(const sensitive of ['worker-lib','functions','tests','docs','AGENTS.md','package.json','.env','.dev.vars']){
 if(fs.existsSync(path.join(dest,sensitive)))throw Error('Sensitive internal source in deployment: '+sensitive);
}
console.log('Safe static artifacts ready at dist/');
