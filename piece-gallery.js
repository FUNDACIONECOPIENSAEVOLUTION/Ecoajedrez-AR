// Galería accesible: 9 fuentes PBR locales CC0 + variantes tintadas. Sin hotlinks ni claves.
export function setupMaterialGallery({root,select,materials,readManifest,assetRoot}){
 if(!root||!select)return;
 root.replaceChildren();
 const items=new Map();
 for(const [key,info] of Object.entries(materials)){
  if(key==='arcane')continue;
  const button=document.createElement('button');
  button.type='button';button.className='ecoPbrSample';
  button.dataset.material=key;
  button.style.setProperty('--ecoPbrColor',info.tint||info.base);
  button.setAttribute('aria-label','Elegir '+info.label);
  button.setAttribute('aria-pressed','false');
  const surface=document.createElement('span');surface.className='ecoPbrSurface';
  const caption=document.createElement('span');caption.className='ecoPbrCaption';caption.textContent=info.label;
  button.append(surface,caption);
  button.addEventListener('click',()=>{
   select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}));
  });
  items.set(key,{button,surface,info});
  root.append(button);
 }
 function sync(){
  for(const [key,{button}] of items){
   const active=key===select.value;button.classList.toggle('active',active);
   button.setAttribute('aria-pressed',String(active));
  }
 }
 select.addEventListener('change',sync);sync();
 const status=document.getElementById('ecoPbrStatus');
 readManifest().then(doc=>{
  let found=0;
  for(const [key,{button,surface,info}] of items){
   const source=info.photoSource||key,filename=doc?.materials?.[source]?.color;
   if(typeof filename!=='string'||
      !new RegExp('^'+source+'/color\\.(jpg|webp|png)$').test(filename))continue;
   const photo=document.createElement('img');
   photo.src=assetRoot+'/'+filename;
   photo.alt='';photo.loading='lazy';photo.decoding='async';
   if(info.photoSource){photo.className='ecoPbrTinted';surface.style.setProperty('--ecoTint',info.tint||info.base);}
   photo.addEventListener('load',()=>button.classList.add('hasPhoto'),{once:true});
   photo.addEventListener('error',()=>photo.remove(),{once:true});
   surface.append(photo);found++;
  }
  if(status)status.textContent=found?'Fototexturas CC0: '+Math.min(found,9)+' fuentes, '+found+' opciones (incluidas variantes tintadas).':
   'Fototexturas no publicadas: se conservan los materiales ligeros.';
 }).catch(()=>{if(status)status.textContent='Sin acceso a las fototexturas: materiales ligeros disponibles.'});
}
