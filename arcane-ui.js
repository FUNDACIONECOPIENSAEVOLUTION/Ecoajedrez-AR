// ECOAJEDREZ AR · Arcane UI layer. Uses the same Three.js instance as main.js.
// No browser global THREE, no credential access, no external fonts or extra animation loops.
export function createArcaneUI({THREE,world}){
  const $=id=>document.getElementById(id);
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
  const orb=document.createElement('div');orb.id='turnOrb';orb.className='turn-orb';
  const dot=document.createElement('span');dot.className='orb-dot';
  const orbLabel=document.createElement('span');orbLabel.textContent='CAMPO DE BATALLA';
  orb.append(dot,orbLabel);
  $('networkStatus')?.after(orb);
  const flash=document.createElement('div');flash.id='portalFlash';flash.setAttribute('aria-hidden','true');document.body.appendChild(flash);
  let flashTimer=null,previousView=document.body.dataset.view;
  const viewObserver=new MutationObserver(()=>{
    const next=document.body.dataset.view;
    if(next===previousView)return;
    previousView=next;
    if(next==='game' || next==='menu' || next==='settings')closeRadial();
    if(document.body.classList.contains('xr-active')||reduceMotion)return;
    flash.classList.add('active');
    clearTimeout(flashTimer);
    flashTimer=setTimeout(()=>flash.classList.remove('active'),440);
  });
  viewObserver.observe(document.body,{attributes:true,attributeFilter:['data-view']});
  const trigger=document.createElement('button');trigger.type='button';trigger.id='radialTrigger';
  trigger.textContent='✦';trigger.title='Abrir acciones';trigger.setAttribute('aria-label','Abrir acciones');
  trigger.setAttribute('aria-expanded','false');
  const radial=document.createElement('div');radial.id='radialMenu';
  const actions=[
    {symbol:'↻',label:'Nueva partida',id:'reset'},
    {symbol:'↶',label:'Deshacer',id:'undo'},
    {symbol:'🎙',label:'Dictar jugada',id:'voiceBtn'},
    {symbol:'◎',label:'Realidad aumentada',id:'startArBtn'},
    {symbol:'⌖',label:'Centrar cámara',id:'center'},
    {symbol:'☰',label:'Menú principal',id:'gameMenuBtn'}
  ];
  actions.forEach((action,i)=>{
    const button=document.createElement('button');
    button.type='button';button.textContent=action.symbol;button.title=action.label;
    button.setAttribute('aria-label',action.label);
    button.style.setProperty('--a',(180+i*36)+'deg');
    button.addEventListener('click',()=>{
      closeRadial();
      const original=$(action.id);
      if(original && !original.disabled)original.click();
    });
    radial.appendChild(button);
  });
  document.body.append(radial,trigger);
  function closeRadial(){radial.classList.remove('open');trigger.classList.remove('open');trigger.setAttribute('aria-expanded','false');}
  trigger.addEventListener('click',()=>{
    const open=!radial.classList.contains('open');
    radial.classList.toggle('open',open);trigger.classList.toggle('open',open);
    trigger.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('pointerdown',event=>{
    if(!radial.contains(event.target)&&event.target!==trigger)closeRadial();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeRadial();});
  const fx=new THREE.Group();fx.name='EcoArcaneEffects';world.add(fx);
  const ringMaterial=new THREE.MeshBasicMaterial({color:0x8bf6cd,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.32,.43,48),ringMaterial);
  ring.rotation.x=-Math.PI/2;ring.visible=false;ring.position.y=.11;fx.add(ring);
  const inner=new THREE.Mesh(new THREE.TorusGeometry(.21,.017,5,32),ringMaterial.clone());
  inner.rotation.x=Math.PI/2;inner.visible=false;inner.position.y=.14;fx.add(inner);
  const particleCount=reduceMotion?0:26;
  const particleGeo=new THREE.BufferGeometry();
  const positions=new Float32Array(Math.max(1,particleCount)*3);
  particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particleMaterial=new THREE.PointsMaterial({color:0xffdf9c,size:.053,transparent:true,depthWrite:false,opacity:0,blending:THREE.AdditiveBlending});
  const dust=new THREE.Points(particleGeo,particleMaterial);dust.visible=false;fx.add(dust);
  let ringTarget=0,dustLifetime=0,lastTick=0;
  const velocities=Array.from({length:particleCount},()=>({x:(Math.random()-.5)*.9,y:Math.random()*1.25+.2,z:(Math.random()-.5)*.9}));
  function selected(square){
    if(!square){ringTarget=0;return;}
    const files='abcdefgh',file=files.indexOf(square[0]),rank=Number(square[1]);
    if(file<0||rank<1||rank>8)return;
    const x=file-3.5,z=3.5-(rank-1);
    ring.position.set(x,.14,z);inner.position.set(x,.145,z);
    ring.visible=true;inner.visible=true;ringTarget=.82;
  }
  function move(to,capture=false){
    ringTarget=0;
    if(!particleCount||!to)return;
    const files='abcdefgh',file=files.indexOf(to[0]),rank=Number(to[1]);
    if(file<0||rank<1||rank>8)return;
    const points=particleGeo.attributes.position.array;
    for(let i=0;i<particleCount;i++){points[i*3]=file-3.5;points[i*3+1]=.20;points[i*3+2]=3.5-(rank-1);}
    particleGeo.attributes.position.needsUpdate=true;
    particleMaterial.color.setHex(capture?0xff8c96:0xffd78a);
    dustLifetime=.8;dust.visible=true;
  }
  function tick(time){
    const dt=lastTick?Math.max(0,Math.min(.05,(time-lastTick)/1000)):0;
    lastTick=time;
    if(!reduceMotion){
      ring.rotation.z+=dt*1.25;inner.rotation.z-=dt*.85;
      const opacity=ringMaterial.opacity+(ringTarget-ringMaterial.opacity)*.13;
      ringMaterial.opacity=opacity;inner.material.opacity=opacity*.6;
      if(ringTarget===0 && opacity<.02){ring.visible=false;inner.visible=false;}
    }else{
      ringMaterial.opacity=ringTarget;inner.material.opacity=ringTarget*.5;
      ring.visible=ringTarget>0;inner.visible=ringTarget>0;
    }
    if(dustLifetime>0){
      dustLifetime-=dt;
      const arr=particleGeo.attributes.position.array;
      for(let i=0;i<particleCount;i++){
        arr[i*3]+=velocities[i].x*dt;
        arr[i*3+1]+=(velocities[i].y-1.6*(.8-dustLifetime))*dt;
        arr[i*3+2]+=velocities[i].z*dt;
      }
      particleGeo.attributes.position.needsUpdate=true;
      particleMaterial.opacity=Math.max(0,dustLifetime/.8);
      if(dustLifetime<=0)dust.visible=false;
    }
  }
  function state({turn,check,mate,mode,connected}){
    orb.className='turn-orb';
    if(mate){orb.classList.add('mate');orbLabel.textContent='✦ JAQUE MATE';}
    else if(check){orb.classList.add('check');orbLabel.textContent='⚠ ¡JAQUE!';}
    else if(turn==='b'){orb.classList.add('opponent');orbLabel.textContent=mode==='bot'?'♜ TURNO DEL GUARDIÁN':'♜ TURNO NEGRAS';}
    else orbLabel.textContent='♔ TURNO BLANCAS';
    if(mode==='online'&&!connected)orbLabel.textContent='✧ ESPERANDO RIVAL';
  }
  return {selected,move,tick,state,closeRadial};
}
