// Galería accesible de nueve acabados. Renderiza fotografías LOCALES del manifest filtrado.
// No usa CDNs del navegador y mantiene siempre el selector clásico como respaldo.
export function setupMaterialGallery({root,select,materials,readManifest,assetRoot}){
 if(!root||!select)return;
 root.replaceChildren();
 const items=new Map();
 for(const [key,info] of Object.entries(materials)){
  if(key==='arcane')continue;
  const button=document.createElement('button');
  button.type='button';button.className='ecoPbrSample';
  button.dataset.material=key;button.style.setProperty('--ecoPbrColor',info.base);
  button.setAttribute('aria-label','Elegir '+info.label);
  button.setAttribute('aria-pressed','false');
  const surface=document.createElement('span');surface.className='ecoPbrSurface';
  const caption=document.createElement('span');caption.className='ecoPbrCaption';caption.textContent=info.label;
  button.append(surface,caption);
  button.addEventListener('click',()=>{
   select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}));
  });
  items.set(key,{button,surface});
  root.append(button);
 }
 const sync=()=>{
  for(const [key,{button}] of items){
   const current=key===select.value;
   button.classList.toggle('active',current);
   button.setAttribute('aria-pressed',String(current));
  }
 };
 select.addEventListener('change',sync);sync();
 const status=document.getElementById('ecoPbrStatus');
 readManifest().then(doc=>{
  let found=0;
  for(const [key,{button,surface}] of items){
   const origin=materials[key].photoSource||key;
   const color=doc?.materials?.[origin]?.color;
   if(typeof color!=='string'||!new RegExp('^'+origin+'/color\\.(jpg|webp|png).test(color))continue;
   const photo=document.createElement('img');
   photo.src=assetRoot+'/'+color;
   if(materials[key].photoSource){photo.style.filter='saturate(.65)';surface.style.backgroundColor=materials[key].tint||materials[key].base;}
   photo.alt='';photo.loading='lazy';photo.decoding='async';
   photo.addEventListener('load',()=>{button.classList.add('hasPhoto')},{once:true});
   photo.addEventListener('error',()=>{photo.remove();button.classList.remove('hasPhoto')},{once:true});
   surface.append(photo);found++;
  }
  if(status){
   status.textContent=found>=9?'9 fotografías PBR CC0 y variantes de color listas':
    found?found+' opciones PBR disponibles; las demás usan respaldo ligero':
    'Fototexturas no publicadas: se muestran los acabados ligeros.';
  }
 }).catch(()=>{if(status)status.textContent='No se pudo comprobar el paquete PBR; funciona el modo ligero.'});
}).test(color))continue;
   const photo=document.createElement('img');
   photo.src=assetRoot+'/'+color;
   photo.alt='';photo.loading='lazy';photo.decoding='async';
   photo.addEventListener('load',()=>{button.classList.add('hasPhoto')},{once:true});
   photo.addEventListener('error',()=>{photo.remove();button.classList.remove('hasPhoto')},{once:true});
   surface.append(photo);found++;
  }
  if(status){
   status.textContent=found===9?'9 acabados fotográficos PBR CC0 listos':
    found?found+'/9 acabados PBR disponibles; los demás usan respaldo ligero':
    'Fototexturas no publicadas: se muestran los acabados ligeros.';
  }
 }).catch(()=>{if(status)status.textContent='No se pudo comprobar el paquete PBR; funciona el modo ligero.'});
}