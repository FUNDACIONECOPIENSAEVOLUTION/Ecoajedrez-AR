import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js';
import { parseMoveCommand } from './commands.js?v=0.4.0';
import { PeerMatch } from './pvp.js?v=0.4.0';
import { initializeAccountAuth, loginGoogle, logoutFirebase, authAvailable } from './auth.js?v=0.4.0';

const $ = (id) => document.getElementById(id);
const canvas = $('render'), stage = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.xr.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0a1724');
const camera = new THREE.PerspectiveCamera(49, 1, 0.01, 300);
camera.position.set(8.4, 10.6, 11.5);
const orbit = new OrbitControls(camera, canvas);
orbit.target.set(0, 0, 0); orbit.minDistance = 7; orbit.maxDistance = 25;
orbit.maxPolarAngle = 1.45; orbit.enableDamping = true;
scene.add(new THREE.HemisphereLight(0xcde7ff, 0x182a2d, 2.1));
const light = new THREE.DirectionalLight(0xffead6, 2.25);
light.position.set(3, 12, 7); light.castShadow = true; scene.add(light);
light.shadow.mapSize.set(1024, 1024); light.shadow.camera.left = -9;
light.shadow.camera.right = 9; light.shadow.camera.top = 9; light.shadow.camera.bottom = -9;
const game = new Chess();
const world = new THREE.Group(), tiles = new THREE.Group(), pieces = new THREE.Group();
const decorations = new THREE.Group(), markers = new THREE.Group();
world.add(tiles, decorations, pieces, markers); scene.add(world);
const rootBase = new THREE.Mesh(new THREE.BoxGeometry(8.45, .35, 8.45), new THREE.MeshStandardMaterial({color:0x213544, metalness:.5, roughness:.28}));
rootBase.position.y = -.23; rootBase.receiveShadow = true; tiles.add(rootBase);
const raycaster = new THREE.Raycaster(), point = new THREE.Vector2();
const goldMat = new THREE.MeshStandardMaterial({color:0xf9d890,metalness:.5,roughness:.28});
const darkMat = new THREE.MeshStandardMaterial({color:0x203d54,metalness:.45,roughness:.27});
const highlightMat = new THREE.MeshBasicMaterial({color:0x5affad,transparent:true,opacity:.56,depthWrite:false});
const FILES = 'abcdefgh';
let selected = null, squares = [], isAR = false, boardPlaced = true;
let hitSource = null, hitRequested = false, reticlePose = null, timer = null;
let theme = 'classic', lang = 'es', botDifficulty = 'easy', mode = 'bot';
let account = null, guestLocal = false, roomVersion = 0, boardScale = 0.065;
let commandRecognition = null, gameStarted = false;
let modelSet = 'staunton', moving = null;
const assets = new Map(), loader = new GLTFLoader();
const reticle = new THREE.Mesh(new THREE.RingGeometry(.125,.145,40), new THREE.MeshBasicMaterial({color:0x72ffba,side:THREE.DoubleSide}));
reticle.rotation.x = -Math.PI/2; reticle.visible = false; scene.add(reticle);
const letters = {
es:{mode:'Modo de juego',bot:'Contra computadora',local:'Dos jugadores locales',difficulty:'Dificultad de demostración',easy:'Principiante',medium:'Intermedio',advanced:'Avanzado (básico)',scenario:'Escenario 3D',classic:'Clásico de obsidiana',jungle:'Selva encantada',game:'Partida',new:'Nueva partida',undo:'Deshacer',keyboard:'Movimiento por teclado (e2e4)',move:'Mover',historyTitle:'Movimientos',about:'Cómo jugar',center:'Centrar cámara',rotate:'Girar vista',turn:'Turno:',white:'Blancas',black:'Negras',check:'¡Jaque!',mate:'Jaque mate',draw:'Tablas',ar:'Busca una superficie plana, luego toca para fijar el tablero.',wait:'La computadora está pensando…',invalid:'Movimiento no permitido',help:'Toca una figura y una casilla iluminada. Arrastra para girar. En Android compatible, pulsa AR, apunta a una mesa y toca para fijarlo.'},
en:{mode:'Game mode',bot:'Against computer',local:'Two local players',difficulty:'Demo difficulty',easy:'Beginner',medium:'Intermediate',advanced:'Advanced (basic)',scenario:'3D environment',classic:'Obsidian classic',jungle:'Enchanted jungle',game:'Game',new:'New game',undo:'Undo',keyboard:'Keyboard move (e2e4)',move:'Play move',historyTitle:'Move history',about:'How to play',center:'Reset camera',rotate:'Rotate view',turn:'Turn:',white:'White',black:'Black',check:'Check!',mate:'Checkmate',draw:'Draw',ar:'Point at a flat surface, then tap to place the board.',wait:'Computer thinking…',invalid:'Illegal move',help:'Tap a piece and a highlighted square. Drag to rotate. On compatible Android, press AR, find a table and tap to place the board.'},
zh:{mode:'游戏模式',bot:'与电脑对弈',local:'本地双人',difficulty:'演示难度',easy:'初学者',medium:'中级',advanced:'高级（基础版）',scenario:'3D 场景',classic:'经典黑曜石',jungle:'魔法丛林',game:'对局',new:'新游戏',undo:'悔棋',keyboard:'键盘走棋 (e2e4)',move:'走棋',historyTitle:'着法记录',about:'玩法',center:'重置视角',rotate:'旋转视角',turn:'轮到：',white:'白方',black:'黑方',check:'将军！',mate:'将死',draw:'和棋',ar:'寻找平面并轻触放置棋盘。',wait:'电脑思考中…',invalid:'无效着法',help:'轻触棋子，再轻触高亮格子。拖动可旋转棋盘。支持AR的安卓设备可点击AR并寻找平面。'}
};
function t(k){return letters[lang][k] || letters.es[k] || k;}
const interfaceText={
  es:{loginGoogle:'G · INICIAR CON GOOGLE',loginGuest:'⚡ CONTINUAR COMO INVITADO',menuBot:'♟ VS COMPUTADORA',menuLocal:'⚔ DOS JUGADORES',menuHost:'🌐 CREAR DUELO ONLINE',menuJoin:'♜ UNIRME A PARTIDA',joinBtn:'CONECTAR',menuSettings:'⚙ PERSONALIZAR',logout:'⇥ CERRAR SESIÓN',settingsTitle:'⚙ CONFIGURACIÓN DE BATALLA',back:'← VOLVER',startGame:'⚔ INICIAR PARTIDA',gameMenu:'☰ MENÚ',move:'♟ MOVER',enterAR:'◎ AR',placeAR:'📍 FIJAR TABLERO',exitAR:'✕ SALIR AR',arTouch:'👆 TOCAR',arAim:'⊕ APUNTAR',selectAR:'✓ SELECCIONAR CASILLA'},
  en:{loginGoogle:'G · CONTINUE WITH GOOGLE',loginGuest:'⚡ PLAY AS GUEST',menuBot:'♟ VS COMPUTER',menuLocal:'⚔ TWO LOCAL PLAYERS',menuHost:'🌐 CREATE ONLINE DUEL',menuJoin:'♜ JOIN A MATCH',joinBtn:'CONNECT',menuSettings:'⚙ CUSTOMIZE',logout:'⇥ SIGN OUT',settingsTitle:'⚙ BATTLE SETTINGS',back:'← BACK',startGame:'⚔ START MATCH',gameMenu:'☰ MENU',move:'♟ MOVE',enterAR:'◎ AR',placeAR:'📍 PLACE BOARD',exitAR:'✕ EXIT AR',arTouch:'👆 TOUCH',arAim:'⊕ AIM',selectAR:'✓ SELECT SQUARE'},
  zh:{loginGoogle:'G · 使用谷歌账号登录',loginGuest:'⚡ 游客进入',menuBot:'♟ 对战电脑',menuLocal:'⚔ 本地双人',menuHost:'🌐 创建在线对局',menuJoin:'♜ 加入对局',joinBtn:'连接',menuSettings:'⚙ 自定义',logout:'⇥ 退出登录',settingsTitle:'⚙ 对局设置',back:'← 返回',startGame:'⚔ 开始对局',gameMenu:'☰ 菜单',move:'♟ 走棋',enterAR:'◎ 增强现实',placeAR:'📍 放置棋盘',exitAR:'✕ 退出AR',arTouch:'👆 点击',arAim:'⊕ 瞄准',selectAR:'✓ 选择格子'}
};
function translate(){
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-ui]').forEach(el=>el.textContent=interfaceText[lang]?.[el.dataset.ui]||interfaceText.es[el.dataset.ui]||el.textContent);
  updateStatus();
}
function toast(msg){const el=$('gameToast');el.textContent=msg;el.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>el.style.display='none',4000);}
const geoCache = {
  cyl:(a,b,h,n=20)=>new THREE.CylinderGeometry(a,b,h,n),
  box:(x,y,z)=>new THREE.BoxGeometry(x,y,z),
  sphere:(r)=>new THREE.SphereGeometry(r,18,12)
};
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;return o;}
function positionOf(square){
  return {x:FILES.indexOf(square[0])-3.5, z:3.5-(Number(square[1])-1)};
}
function buildTiles(){
  const lightTile = new THREE.MeshStandardMaterial({color:0xc7dacd,metalness:.18,roughness:.54});
  const darkTile = new THREE.MeshStandardMaterial({color:0x305c61,metalness:.24,roughness:.5});
  for(let row=0;row<8;row++) for(let col=0;col<8;col++){
    const s=FILES[col]+String(8-row);
    const tile=mesh(new THREE.BoxGeometry(.99,.075,.99),(row+col)%2===0?lightTile:darkTile,col-3.5,.025,row-3.5);
    tile.receiveShadow=true;tile.userData.square=s;tiles.add(tile);squares.push(tile);
  }
}
function addPart(group,geometry,mat,x,y,z){const p=mesh(geometry,mat,x,y,z);group.add(p);return p;}
function pieceModel(p){
  const mat=p.color==='w'?goldMat:darkMat;
  const g=new THREE.Group(); g.userData.square=p.square;
  addPart(g,geoCache.cyl(.32,.36,.13),mat,0,.13,0);
  addPart(g,geoCache.cyl(.24,.31,.12),mat,0,.245,0);
  if(p.type==='p'){
    addPart(g,geoCache.cyl(.12,.19,.3),mat,0,.42,0);
    addPart(g,geoCache.sphere(.17),mat,0,.66,0);
  }else if(p.type==='r'){
    addPart(g,geoCache.cyl(.20,.23,.5),mat,0,.52,0);
    addPart(g,geoCache.cyl(.29,.26,.12,8),mat,0,.82,0);
    for(let i=0;i<4;i++){let a=i*Math.PI/2;addPart(g,geoCache.box(.13,.16,.13),mat,Math.cos(a)*.21,.93,Math.sin(a)*.21);}
  }else if(p.type==='n'){
    addPart(g,geoCache.box(.30,.48,.36),mat,0,.52,0).rotation.z=-.2;
    addPart(g,geoCache.box(.37,.30,.27),mat,.10,.83,0).rotation.z=-.2;
    addPart(g,geoCache.box(.23,.11,.31),mat,.23,.80,0);
    addPart(g,geoCache.box(.07,.13,.05),goldMat,-.07,.99,.15);
  }else if(p.type==='b'){
    addPart(g,geoCache.cyl(.12,.22,.43),mat,0,.51,0);
    addPart(g,new THREE.ConeGeometry(.25,.40,24),mat,0,.95,0);
    addPart(g,geoCache.sphere(.08),mat,0,1.17,0);
  }else if(p.type==='q'){
    addPart(g,geoCache.cyl(.12,.25,.59),mat,0,.58,0);
    addPart(g,geoCache.cyl(.26,.20,.16),mat,0,.96,0);
    for(let i=0;i<5;i++){let a=i*Math.PI*2/5;addPart(g,geoCache.sphere(.085),mat,Math.cos(a)*.21,1.10,Math.sin(a)*.21);}
    addPart(g,geoCache.sphere(.10),mat,0,1.15,0);
  }else if(p.type==='k'){
    addPart(g,geoCache.cyl(.13,.24,.65),mat,0,.61,0);
    addPart(g,geoCache.cyl(.25,.20,.13),mat,0,1,0);
    addPart(g,geoCache.box(.11,.39,.10),mat,0,1.27,0);
    addPart(g,geoCache.box(.31,.10,.10),mat,0,1.30,0);
  }
  if(modelSet==='fantasy'){
    const glow = new THREE.MeshStandardMaterial({color:p.color==='w'?0xa3fff0:0xc487ff,metalness:.36,roughness:.22,emissive:p.color==='w'?0x2a6556:0x41236f,emissiveIntensity:.68});
    const ring=addPart(g,new THREE.TorusGeometry(.27,.035,8,24),glow,0,.09,0);ring.rotation.x=Math.PI/2;
    if(p.type==='b'){addPart(g,new THREE.ConeGeometry(.25,.34,7),glow,0,1.20,0);}
    if(p.type==='k'||p.type==='q'){addPart(g,new THREE.OctahedronGeometry(.11),glow,0,p.type==='k'?1.57:1.35,0);}
    if(p.type==='n'){addPart(g,new THREE.BoxGeometry(.31,.045,.1),glow,.12,1.15,0).rotation.z=-.5;}
  }
  return g;
}
function clearGroup(group){
  while(group.children.length){const child=group.children[0];group.remove(child);child.traverse(node=>{if(node.isMesh && node.geometry && !node.userData.sharedGeo)node.geometry.dispose();if(node.isMesh && node.userData.sharedGeo && node.material)node.material.dispose();});}
}
function renderPieces(){
  clearGroup(pieces);clearGroup(markers);
  for(const row of game.board())for(const p of row)if(p){
    let g = null;
    if(modelSet==='staunton' && assets.has(p.type)){
      const template = assets.get(p.type);
      if(template){
        g=template.clone(true);
        const material=p.color==='w'?goldMat:darkMat;
        g.traverse(o=>{
          if(o.isMesh){
            o.userData.sharedGeo=true;
            o.material=material.clone();
            o.material.side=THREE.DoubleSide;
            o.castShadow=true;
          }
        });
      }
    }
    if(!g)g=pieceModel(p);
    g.userData.square=p.square;
    const loc=positionOf(p.square);
    g.position.set(loc.x,.07,loc.z);
    if(p.color==='b')g.rotation.y=Math.PI;
    pieces.add(g);
  }
  if(selected){
    for(const m of game.moves({square:selected,verbose:true})){
      const loc=positionOf(m.to);
      const circle=mesh(new THREE.CylinderGeometry(.37,.37,.015,24),highlightMat,loc.x,.10,loc.z);
      circle.userData.square=m.to;markers.add(circle);
    }
  }
}
function makeJungle(){
  clearGroup(decorations);
  if(theme!=='jungle')return;
  const stem=new THREE.MeshStandardMaterial({color:0x33785a,roughness:1});
  const bloom=new THREE.MeshStandardMaterial({color:0xe15372,emissive:0x4d1422,emissiveIntensity:.3});
  for(let i=0;i<90;i++){
    let a=i*2.39996, radius=4.35+(i%4)*.23;
    const x=Math.cos(a)*radius,z=Math.sin(a)*radius, h=.17+(i%5)*.09;
    const plant=new THREE.Group();plant.position.set(x,0,z);
    addPart(plant,new THREE.ConeGeometry(.07,h,5),i%3===0?bloom:stem,0,h/2,0);
    plant.userData.sway=a;decorations.add(plant);
  }
}
function setTheme(next){
  theme=next;
  const biomes={
    classic:['#cadbd0','#315d63','#1d3b4d','#0a1724'],wood:['#e8c792','#7c5136','#513122','#2b2119'],
    marble:['#f2f3ef','#5b6686','#7a8087','#191e35'],neon:['#78f4d8','#28325a','#11193b','#081027'],
    jungle:['#d9f4b5','#4d8b54','#453925','#102a1e'],volcano:['#f3bc89','#642738','#6b2530','#2d1020'],
    ice:['#edfaff','#63a6cb','#418db2','#0b2a43']
  };
  const palette=biomes[theme]||biomes.classic;
  squares.forEach((tile,i)=>{
    const even=(Math.floor(i/8)+i%8)%2===0;
    tile.material.color.set(even?palette[0]:palette[1]);
  });
  rootBase.material.color.set(palette[2]);
  scene.background=isAR?null:new THREE.Color(palette[3]);
  makeJungle();
}
function updateStatus(){
  let text='';
  if(game.isCheckmate()){text=t('mate')+' · '+t(game.turn()==='w'?'black':'white');}
  else if(game.isDraw()){text=t('draw');}
  else {text=t('turn')+' '+t(game.turn()==='w'?'white':'black')+(game.isCheck()?' · '+t('check'):'');}
  $('status').textContent=text;
  const history=game.history();
  $('history').textContent=history.length?history.map((v,i)=>(i%2===0?String(Math.floor(i/2)+1)+'. ':'')+v).join('  '):'—';
}
function canPlay(source='local'){
  if(game.isGameOver())return false;
  if(mode==='bot' && game.turn()!=='w' && source!=='computer')return false;
  if(mode==='online'){
    if(!match.connected())return false;
    if(source==='remote')return match.host && game.turn()==='b';
    return game.turn()===(match.host?'w':'b');
  }
  return true;
}
function broadcastState(){
  if(mode==='online'&&match.host)match.send({type:'STATE',fen:game.fen(),version:roomVersion,history:game.history().slice(-40)});
}
function playMove(from,to,promotion='q',source='local'){
  if(!canPlay(source))return false;
  if(mode==='online' && !match.host && source==='local'){
    return match.send({type:'MOVE',from,to,promotion,version:roomVersion});
  }
  try{
    const moved=game.move({from,to,promotion});
    if(!moved)return false;
  }catch(error){return false;}
  selected=null;moving=null;renderPieces();animateMove(from,to);updateStatus();
  if(mode==='online'){roomVersion++;broadcastState();}
  if(mode==='bot' && !game.isGameOver()){clearTimeout(timer);timer=setTimeout(playBot,500);}
  return true;
}
function applyNotation(value){
  const command=parseMoveCommand(value,lang);
  if(!command)return false;
  let move=null;
  try{const shadow=new Chess(game.fen());move=shadow.move(command);}catch(error){return false;}
  if(!move)return false;
  return playMove(move.from,move.to,move.promotion||'q');
}
function submitCommand(input){
  const text=input.value;
  if(!applyNotation(text))toast('Jugada inválida o no es tu turno: '+text);
  else input.value='';
}
function startSpeech(target){
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Speech){toast('Dictado no disponible en este navegador. Usa texto: e4, Cf3, e2e4.');return;}
  if(commandRecognition){commandRecognition.stop();commandRecognition=null;return;}
  const rec=new Speech();commandRecognition=rec;rec.lang=lang==='zh'?'zh-CN':lang==='en'?'en-US':'es-ES';rec.maxAlternatives=1;rec.interimResults=false;
  rec.onresult=event=>{
    const value=event.results?.[0]?.[0]?.transcript||'';
    target.value=value;
    submitCommand(target);
  };
  rec.onerror=error=>toast('No fue posible reconocer voz: '+(error.error||'micrófono'));
  rec.onend=()=>{commandRecognition=null;};
  try{rec.start();toast('Escuchando jugada…');}catch(error){commandRecognition=null;toast('No se pudo iniciar el micrófono.');}
}

function pickSquare(square){
  if(!square || game.isGameOver())return;
  if(!canPlay())return;
  const current=game.get(square);
  if(selected && playMove(selected,square))return;
  if(current && current.color===game.turn()){selected=square;renderPieces();}
  else {selected=null;renderPieces();}
}
function valueOf(type){return {p:1,n:3.2,b:3.3,r:5,q:9,k:0}[type]||0;}
function evaluate(){
  if(game.isCheckmate())return game.turn()==='b'?-9999:9999;
  let score=0;
  for(const row of game.board())for(const p of row)if(p){
    const loc=positionOf(p.square);
    const center=(3.5-Math.abs(loc.x))*.045+(3.5-Math.abs(loc.z))*.045;
    score+=(p.color==='b'?1:-1)*(valueOf(p.type)+center);
  }
  return score;
}
function chooseBot(){
  const all=game.moves({verbose:true});if(!all.length)return null;
  if(botDifficulty==='easy')return all[Math.floor(Math.random()*all.length)];
  let best=-Infinity, choices=[];
  for(const m of all){
    game.move({from:m.from,to:m.to,promotion:'q'});
    let v=evaluate();
    if(botDifficulty==='advanced'&&!game.isGameOver()){
      let replyWorst=Infinity;
      const answers=game.moves({verbose:true});
      for(const a of answers){
        game.move({from:a.from,to:a.to,promotion:'q'});
        replyWorst=Math.min(replyWorst,evaluate());
        game.undo();
      }
      v=replyWorst;
    }
    game.undo();
    v+=(Math.random()-.5)*.22;
    if(v>best+0.001){best=v;choices=[m];}
    else if(Math.abs(v-best)<.001)choices.push(m);
  }
  return choices[Math.floor(Math.random()*choices.length)];
}
function playBot(){
  if(mode!=='bot'||game.turn()!=='b'||game.isGameOver())return;
  const m=chooseBot();
  if(m)game.move({from:m.from,to:m.to,promotion:'q'});
  selected=null;renderPieces();if(m)animateMove(m.from,m.to);updateStatus();
}
function animateMove(from,to){
  const target=[...pieces.children].find(x=>x.userData.square===to);
  if(!target)return;
  const a=positionOf(from),b=positionOf(to);
  moving={piece:target,a,b,start:performance.now(),duration:370};
}
function reset(){
  clearTimeout(timer);game.reset();selected=null;moving=null;renderPieces();updateStatus();if(mode==='online' && match.host){roomVersion++;broadcastState();}
}
function squareFromHit(objects, origin, direction){
  raycaster.set(origin,direction);
  const hits=raycaster.intersectObjects(objects,true);
  for(const h of hits){
    let o=h.object;
    while(o && !o.userData.square)o=o.parent;
    if(o && o.userData.square)return o.userData.square;
  }
  return null;
}
function pick3DSquare(x,y){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  point.set(((x-rect.left)/rect.width)*2-1,-((y-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(point,camera);
  return squareFromHit([pieces,markers,tiles],raycaster.ray.origin,raycaster.ray.direction);
}
let down=null;
canvas.addEventListener('pointerdown',event=>{
  if(isAR)return;
  const square=pick3DSquare(event.clientX,event.clientY),piece=square?game.get(square):null;
  const draggingPiece=canPlay() && piece && piece.color===game.turn();
  down={x:event.clientX,y:event.clientY,square:draggingPiece?square:null};
  if(draggingPiece)orbit.enabled=false;
});
canvas.addEventListener('pointerup',event=>{
  if(isAR||!down)return;
  const downEvent=down;down=null;orbit.enabled=true;
  const destination=pick3DSquare(event.clientX,event.clientY);
  if(!destination)return;
  const moved=Math.hypot(event.clientX-downEvent.x,event.clientY-downEvent.y)>12;
  if(moved&&downEvent.square&&downEvent.square!==destination){
    if(selected!==downEvent.square)pickSquare(downEvent.square);
    pickSquare(destination);
  }else if(!moved)pickSquare(destination);
});
canvas.addEventListener('pointercancel',()=>{down=null;orbit.enabled=true;});
async function loadChessModels(){
  const label=$('modelsStatus');
  if(label)label.textContent='Cargando seis modelos glTF originales…';
  const types=['p','r','n','b','q','k'];
  const names=['pawn','rook','knight','bishop','queen','king'];
  await Promise.all(types.map(async(type,index)=>{
    try{
      const result=await loader.loadAsync('./assets/models/staunton/'+names[index]+'.gltf');
      assets.set(type,result.scene);
      if(modelSet==='staunton')renderPieces();
    }catch(error){
      console.warn('No se pudo cargar el modelo '+names[index],error);
      assets.set(type,null);
    }
  }));
  if(label)label.textContent=[...assets.values()].filter(Boolean).length+' / 6 modelos glTF cargados · respaldo 3D disponible';
}
$('reset').onclick=()=>{if(mode==='online'&&!match.host){toast('Solo el anfitrión reinicia el duelo.');return;}reset();};
$('undo').onclick=()=>{
  if(mode==='online'){toast('Deshacer no está disponible durante un duelo online.');return;}
  clearTimeout(timer);
  if(game.history().length){
    game.undo();
    if(mode==='bot' && game.turn()==='b' && game.history().length)game.undo();
    selected=null;moving=null;renderPieces();updateStatus();
  }
};
$('playMove').onclick=()=>submitCommand($('moveInput'));
$('moveInput').addEventListener('keydown',event=>{if(event.key==='Enter')submitCommand(event.currentTarget);});
$('arPlayMove').onclick=()=>submitCommand($('arCommand'));
$('arCommand').addEventListener('keydown',event=>{if(event.key==='Enter')submitCommand(event.currentTarget);});
$('voiceBtn').onclick=()=>startSpeech($('moveInput'));
$('arVoiceBtn').onclick=()=>startSpeech($('arCommand'));
$('mode').onchange=()=>{
  mode=$('mode').value;
  $('difficulty').disabled=mode!=='bot';
};
$('difficulty').onchange=()=>{botDifficulty=$('difficulty').value;};
$('theme').onchange=()=>setTheme($('theme').value);
$('pieceSet').onchange=()=>{modelSet=$('pieceSet').value;moving=null;renderPieces();};
$('boardSize').onchange=()=>{boardScale=Number($('boardSize').value)||0.065;};
$('whiteColor').onchange=()=>{goldMat.color.set($('whiteColor').value);renderPieces();};
$('blackColor').onchange=()=>{darkMat.color.set($('blackColor').value);renderPieces();};
$('lang').onchange=()=>{lang=$('lang').value;translate();document.documentElement.lang=lang;};
$('center').onclick=()=>{if(isAR){toast('En AR usa el control de escala.');return;}camera.position.set(8.4,10.6,11.5);orbit.target.set(0,0,0);orbit.update();};
$('rotate').onclick=()=>{if(isAR)return;camera.position.set(-camera.position.z,camera.position.y,camera.position.x);orbit.update();};
const match=new PeerMatch({
  onStatus(message){$('networkStatus').textContent=message;const el=$('roomNote');if(el)el.textContent=message;},
  onMove(move){
    if(mode!=='online'||!match.host)return;
    if(move.version!==roomVersion || !playMove(move.from,move.to,move.promotion,'remote'))broadcastState();
  },
  onState(message){
    if(mode!=='online'||match.host||message.version<roomVersion)return;
    try{
      const changed=game.fen()!==message.fen;
      game.load(message.fen);
      roomVersion=message.version;
      if(changed){selected=null;moving=null;renderPieces();}
      updateStatus();
    }catch(error){console.warn('Estado inválido del anfitrión',error);}
  },
  onReady(isHost){
    if(isHost){broadcastState();}else{match.send({type:'HELLO'});}
    gotoView('game');updateStatus();
  }
});
function setGameMode(next){
  if(next!=='online' && mode==='online')match.close();
  mode=next;$('mode').value=next;
  $('difficulty').disabled=next!=='bot';$('undo').disabled=next==='online';
  $('networkStatus').textContent=next==='online'?'DUELO ONLINE · BETA':next==='bot'?'VERSUS COMPUTADORA':'DOS JUGADORES LOCALES';
}
function gotoView(view){
  if(isAR && view!=='game'){arSession?.end();}
  document.body.dataset.view=view;
  if(view==='game'){
    gameStarted=true;resize();
    $('networkStatus').textContent=mode==='online'?('SALA '+match.room+(match.connected()?' · CONECTADA':' · ESPERANDO')):(mode==='bot'?'VERSUS COMPUTADORA':'DUELO LOCAL');
  }
}
function transitionTo(view){
  $('loadingPortal').classList.add('show');
  $('portalText').textContent=view==='game'?'INVOCANDO CAMPO DE BATALLA…':'PREPARANDO EL PORTAL…';
  setTimeout(()=>{gotoView(view);$('loadingPortal').classList.remove('show');},420);
}
function setAccount(next){
  account=next;guestLocal=false;
  if(next){
    $('accountState').textContent=(next.name||'JUGADOR')+' · '+(next.provider==='google'?'Google':'Invitado Firebase');
    if(document.body.dataset.view==='welcome')transitionTo('menu');
  }else if(!guestLocal && document.body.dataset.view==='menu')gotoView('welcome');
}
async function startAccountAuth(){
  const good=await initializeAccountAuth(setAccount,error=>{
    $('loginStatus').textContent='Google/Firebase: '+(error.code||error.message||'no disponible')+'. El invitado local funciona.';
  });
  if(!good)$('loginStatus').textContent='Google no disponible. Puedes entrar como invitado.';
  else if(!account)$('loginStatus').textContent='Selecciona Google o invitado para continuar.';
}
$('loginGoogleBtn').onclick=async()=>{
  $('loginStatus').textContent='Abriendo acceso con Google…';
  try{await loginGoogle();}catch(error){
    $('loginStatus').textContent=error.code==='auth/unauthorized-domain'?'Autoriza fundacionecopiensaevolution.github.io en Firebase Authentication → Authorized domains.':'Google: '+(error.code||error.message||'error')+'. Puedes entrar como invitado.';
  }
};
$('loginGuestBtn').onclick=()=>{
  guestLocal=true;account={uid:'local-guest',name:'INVITADO',provider:'local'};
  $('accountState').textContent='INVITADO · sesión local sin nube';transitionTo('menu');
};
$('logoutBtn').onclick=async()=>{
  match.close();setGameMode('bot');
  try{if(authAvailable())await logoutFirebase();}catch(error){}
  account=null;guestLocal=false;gotoView('welcome');
};
$('menuBot').onclick=()=>{setGameMode('bot');transitionTo('settings');};
$('menuLocal').onclick=()=>{setGameMode('local');transitionTo('settings');};
$('menuSettings').onclick=()=>transitionTo('settings');
$('menuJoin').onclick=()=>{
  $('joinPanel').classList.toggle('visible');
  if($('joinPanel').classList.contains('visible'))$('joinCode').focus();
};
$('menuHost').onclick=()=>{
  setGameMode('online');reset();roomVersion=0;
  try{
    const code=match.create();
    let panel=$('roomPanel');
    if(!panel){
      panel=document.createElement('div');panel.id='roomPanel';$('menuPanel').appendChild(panel);
    }
    panel.classList.add('visible');
    panel.replaceChildren();
    const codeLine=document.createElement('strong');codeLine.id='roomCode';codeLine.textContent=code;panel.appendChild(codeLine);
    const info=document.createElement('p');info.id='roomNote';info.textContent='Esperando al otro jugador…';panel.appendChild(info);
    const url=new URL(window.location.href);url.search='';url.searchParams.set('room',code);
    const link=document.createElement('input');link.readOnly=true;link.value=url.href;link.id='roomLink';panel.appendChild(link);
    const copy=document.createElement('button');copy.textContent='COPIAR INVITACIÓN';copy.onclick=()=>navigator.clipboard?.writeText(url.href).then(()=>toast('Invitación copiada')).catch(()=>toast(url.href));panel.appendChild(copy);
    if(window.QRCode){const qr=document.createElement('div');qr.id='roomQR';panel.appendChild(qr);new window.QRCode(qr,{text:url.href,width:140,height:140});}
    const enter=document.createElement('button');enter.textContent='VER TABLERO MIENTRAS ESPERO';enter.onclick=()=>transitionTo('game');panel.appendChild(enter);
  }catch(error){toast(error.message||'No se pudo crear sala');setGameMode('bot');}
};
$('joinBtn').onclick=()=>{
  setGameMode('online');reset();roomVersion=0;
  try{match.join($('joinCode').value);$('networkStatus').textContent='CONECTANDO…';}
  catch(error){toast(error.message);setGameMode('bot');}
};
$('joinCode').onkeydown=event=>{if(event.key==='Enter')$('joinBtn').click();};
$('backToMenu').onclick=()=>transitionTo('menu');
$('startConfigured').onclick=()=>{
  setGameMode($('mode').value);
  if(mode==='online'&&!match.connected()){toast('Para jugar online crea o entra a una sala desde el menú.');transitionTo('menu');return;}
  reset();transitionTo('game');
};
$('gameMenuBtn').onclick=()=>gotoView('menu');
const invite=new URL(location.href).searchParams.get('room');
if(invite){$('joinCode').value=invite.toUpperCase();$('joinPanel').classList.add('visible');}
startAccountAuth();

let arSession=null, arSpace=null, lastHit=null, arPointerStart=null;
let arPicking='touch', lastARPick=0, aimedSquare=null;
const pointers=new Set();
function arHint(message){$('arHint').textContent=message;}
function showAR(){
  document.body.classList.add('xr-active');
  $('placeArBtn').style.display='inline-block';
  $('arTouchBtn').style.display='inline-block';
  $('arAimBtn').style.display='inline-block';
  $('exitArBtn').style.display='inline-block';
  $('arScale').value='1';
  setARPicking('touch');
  arHint('Busca una mesa o suelo, después pulsa FIJAR TABLERO.');
}
function hideAR(){
  document.body.classList.remove('xr-active');
  $('arCrosshair').classList.add('hidden');
  $('arSelectBtn').style.display='none';
}
function setARPicking(mode){
  arPicking=mode==='aim'?'aim':'touch';
  $('arCrosshair').classList.toggle('hidden',arPicking!=='aim');
  $('arSelectBtn').style.display=arPicking==='aim'?'inline-block':'none';
  $('arTouchBtn').style.borderColor=arPicking==='touch'?'#aaffd1':'#3d7580';
  $('arAimBtn').style.borderColor=arPicking==='aim'?'#aaffd1':'#3d7580';
  aimedSquare=null;
  if(boardPlaced) arHint(arPicking==='aim'?'Apunta la cruz central a una casilla y pulsa SELECCIONAR.':'Toca la pieza y luego la casilla de destino.');
}
function placeARBoard(){
  if(!isAR || boardPlaced)return false;
  if(!lastHit){arHint('No hay superficie detectada. Mueve el celular lentamente.');return false;}
  const p=new THREE.Vector3(),q=new THREE.Quaternion(),scale=new THREE.Vector3();
  lastHit.decompose(p,q,scale);
  world.position.copy(p);world.position.y+=.018;world.quaternion.copy(q);
  world.scale.setScalar(boardScale*Number($('arScale').value));
  world.visible=true;boardPlaced=true;reticle.visible=false;hitRequested=true;
  $('placeArBtn').style.display='none';setARPicking('touch');
  arHint('Tablero fijado. Toca una pieza y su destino para jugar.');
  return true;
}
function setHologram(){
  if(!isAR)return;
  // Sin hit-test, no se promete anclaje a superficie: posición de referencia local.
  world.position.set(0,-.35,-1.4);world.quaternion.identity();
  world.scale.setScalar(boardScale*Number($('arScale').value));
  world.visible=true;boardPlaced=true;lastHit=null;reticle.visible=false;
  $('placeArBtn').style.display='none';
  arHint('Holograma AR sin detección de mesa. Se puede jugar, pero no está anclado a una superficie.');
}
async function startAR(){
  if(isAR || !renderer)return;
  if(!window.isSecureContext){toast('AR requiere HTTPS.');return;}
  if(!navigator.xr){toast('WebXR AR no disponible en este navegador. Sigue jugando en 3D.');return;}
  let session=null;
  try{
    // Mismo enfoque probado en 3 LINE-AR: hit-test opcional + DOM overlay.
    session=await navigator.xr.requestSession('immersive-ar',{
      optionalFeatures:['hit-test','dom-overlay','local-floor','bounded-floor'],
      domOverlay:{root:document.body}
    });
    arSession=session;isAR=true;boardPlaced=false;lastHit=null;hitSource=null;hitRequested=false;
    world.visible=false;scene.background=null;orbit.enabled=false;
    showAR();
    session.addEventListener('select',onARXRSelect);
    session.addEventListener('end',finishAR);
    let spaceType=null;
    for(const type of ['local','local-floor','viewer']){
      try{arSpace=await session.requestReferenceSpace(type);spaceType=type;break;}catch(error){}
    }
    if(!spaceType)throw Error('Ningún espacio AR disponible');
    renderer.xr.setReferenceSpaceType(spaceType);
    await renderer.xr.setSession(session);
    try{
      const viewer=await session.requestReferenceSpace('viewer');
      hitSource=await session.requestHitTestSource({space:viewer});
      arHint('Cámara activa. Encuentra una mesa, espera la retícula verde y pulsa FIJAR TABLERO.');
    }catch(error){console.warn('Hit-test no disponible; AR holográfica:',error);setHologram();}
  }catch(error){
    console.warn('Error al iniciar WebXR',error);
    toast('AR no disponible: '+(error.message||String(error)));
    if(session)try{await session.end();}catch(error2){finishAR();}
  }
}
function finishAR(){
  if(arSession)arSession.removeEventListener('select',onARXRSelect);
  if(hitSource){try{hitSource.cancel();}catch(error){}hitSource=null;}
  arSession=null;arSpace=null;lastHit=null;hitRequested=false;isAR=false;boardPlaced=true;
  pointers.clear();arPointerStart=null;
  world.position.set(0,0,0);world.quaternion.identity();world.scale.setScalar(1);
  world.visible=true;reticle.visible=false;orbit.enabled=true;
  hideAR();setTheme(theme);
  resize();
}
function xrPerspectiveCameras(){
  const c=renderer.xr.getCamera();
  return c?.cameras?.filter(x=>x.isPerspectiveCamera) || (c?.isPerspectiveCamera?[c]:[]);
}
function closestARSquare(clientX,clientY){
  if(!isAR||!boardPlaced||!world.visible)return null;
  const views=xrPerspectiveCameras();if(!views.length)return null;
  world.updateWorldMatrix(true,true);
  const w=window.innerWidth,h=window.innerHeight;
  let chosen=null,best=Infinity;
  const p=new THREE.Vector3(),screen=new THREE.Vector3();
  for(const square of FILES)for(let rank=1;rank<=8;rank++){
    const sq=square+rank,loc=positionOf(sq);
    for(const y of [.09,.54]){
      p.set(loc.x,y,loc.z);
      world.localToWorld(p);
      for(const view of views){
        screen.copy(p).project(view);
        if(screen.z< -1||screen.z>1)continue;
        const x=(screen.x+1)*w*.5,yy=(1-screen.y)*h*.5;
        const distance=Math.hypot(clientX-x,clientY-yy);
        if(distance<best){best=distance;chosen=sq;}
      }
    }
  }
  return best<=Math.max(28,Math.min(55,w*.11))?chosen:null;
}
function pickARAt(x,y){
  if(!isAR||!boardPlaced||Date.now()-lastARPick<340)return false;
  const square=closestARSquare(x,y);
  if(!square)return false;
  pickSquare(square);lastARPick=Date.now();
  return true;
}
function selectAimedSquare(){
  if(!isAR||!boardPlaced)return;
  if(!pickARAt(window.innerWidth/2,window.innerHeight/2))arHint('Centra la cruz sobre una casilla y pulsa SELECCIONAR.');
}
function isARControl(target){
  return Boolean(target?.closest?.('button,input,select,textarea,label,a,.arBar,.arBottom,#arHint'));
}
function onARPointerDown(event){
  if(!isAR||isARControl(event.target))return;
  pointers.add(event.pointerId);
  if(pointers.size===1){
    arPointerStart={id:event.pointerId,x:event.clientX,y:event.clientY,
      square:boardPlaced?closestARSquare(event.clientX,event.clientY):null};
  }else arPointerStart=null;
}
function onARPointerUp(event){
  if(!isAR)return;
  pointers.delete(event.pointerId);
  const p=arPointerStart;arPointerStart=null;
  if(!p||p.id!==event.pointerId||pointers.size||isARControl(event.target))return;
  if(!boardPlaced){placeARBoard();return;}
  if(arPicking!=='touch'||Date.now()-lastARPick<340)return;
  const distance=Math.hypot(event.clientX-p.x,event.clientY-p.y);
  const target=closestARSquare(event.clientX,event.clientY);
  if(distance>22 && p.square && target && p.square!==target){
    const from=game.get(p.square);
    if(from && from.color===game.turn() && canPlay()){
      if(selected!==p.square)pickSquare(p.square);
      pickSquare(target);
      lastARPick=Date.now();
      return;
    }
  }
  if(distance<=22)pickARAt(event.clientX,event.clientY);
}
function onARXRSelect(event){
  if(!isAR)return;
  if(!boardPlaced){placeARBoard();return;}
  if(arPicking==='aim'){selectAimedSquare();return;}
  if(Date.now()-lastARPick<340)return;
  try{
    const ref=renderer.xr.getReferenceSpace();
    const space=event.inputSource?.targetRaySpace;
    if(!ref||!space||!event.frame)return;
    const pose=event.frame.getPose(space,ref);
    if(!pose)return;
    const x=pose.transform;
    const origin=new THREE.Vector3(x.position.x,x.position.y,x.position.z);
    const dir=new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion(x.orientation.x,x.orientation.y,x.orientation.z,x.orientation.w));
    world.updateWorldMatrix(true,true);
    const sq=squareFromHit([pieces,markers,tiles],origin,dir);
    if(sq){pickSquare(sq);lastARPick=Date.now();}
  }catch(error){console.debug('XR select sin pose utilizable',error);}
}
function updateAR(frame){
  if(!frame||!arSession)return;
  if(hitSource&&!boardPlaced){
    const result=frame.getHitTestResults(hitSource);
    if(!result.length){reticle.visible=false;lastHit=null;return;}
    const pose=result[0].getPose(arSpace);
    if(!pose){reticle.visible=false;lastHit=null;return;}
    const mat=new THREE.Matrix4().fromArray(pose.transform.matrix);
    reticle.position.setFromMatrixPosition(mat);
    reticle.quaternion.setFromRotationMatrix(mat);
    reticle.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2));
    reticle.visible=true;lastHit=mat;
  }
  if(boardPlaced&&arPicking==='aim'){
    aimedSquare=closestARSquare(window.innerWidth/2,window.innerHeight/2);
    $('arSelectBtn').disabled=!aimedSquare;
    $('arHint').textContent=aimedSquare?'OBJETIVO: '+aimedSquare.toUpperCase()+' · pulsa SELECCIONAR':'Apunta la cruz a una casilla del tablero.';
  }
}
$('startArBtn').onclick=()=>{startAR();};
$('placeArBtn').onclick=placeARBoard;
$('exitArBtn').onclick=()=>{arSession?.end();};
$('arTouchBtn').onclick=()=>setARPicking('touch');
$('arAimBtn').onclick=()=>setARPicking('aim');
$('arSelectBtn').onclick=selectAimedSquare;
$('arScale').oninput=()=>{if(isAR&&boardPlaced)world.scale.setScalar(boardScale*Number($('arScale').value));};
document.addEventListener('pointerdown',onARPointerDown,true);
document.addEventListener('pointerup',onARPointerUp,true);
document.addEventListener('beforexrselect',event=>{
  if(isAR && isARControl(event.target))event.preventDefault();
});
if(!navigator.xr){$('startArBtn').title='Tu navegador no detecta WebXR; puedes jugar en 3D';}
else navigator.xr.isSessionSupported?.('immersive-ar').then(supported=>{
  if(!supported)$('startArBtn').title='Este navegador no dispone de modo immersive-ar';
}).catch(()=>{});

function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;
  if(!w||!h)return;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();
function render(timestamp,frame){
  if(isAR){updateAR(frame);}
  else orbit.update();
  if(moving){
    const progress=Math.min(1,(timestamp-moving.start)/moving.duration);
    const smooth=progress*progress*(3-2*progress);
    moving.piece.position.set(
      moving.a.x+(moving.b.x-moving.a.x)*smooth,
      .07 + Math.sin(progress*Math.PI)*.34,
      moving.a.z+(moving.b.z-moving.a.z)*smooth
    );
    if(progress>=1)moving=null;
  }
  if(theme==='jungle'&&!isAR)decorations.children.forEach((p,i)=>{p.rotation.z=Math.sin(timestamp*.0016+i*.8)*.12;});
  renderer.render(scene,camera);
}
buildTiles();setTheme(theme);renderPieces();updateStatus();translate();
renderer.setAnimationLoop(render);
loadChessModels();
