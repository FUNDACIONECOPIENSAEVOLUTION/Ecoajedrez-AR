import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js';
import { parseMoveCommand } from './commands.js?v=0.4.0';
import { PeerMatch } from './pvp.js?v=0.4.0';
import { setupQrJoin } from './qr-scanner.js?v=0.12.0';
import { initializeAccountAuth, loginGoogle, logoutFirebase, authAvailable } from './auth.js?v=0.4.0';
import { makeSnapshot, verifyAndRestore, saveLocalMatch, readLocalMatch } from './match-state.js?v=0.4.1';
import { createArcaneUI } from './arcane-ui.js?v=0.6.0';
import { createMagicWorld } from './magic-world.js?v=0.14.3';
import { realmTheme,publishedRealmURL } from './realm-pairing.js?v=0.16.2';
import { createBoardSurface } from './board-skins.js?v=0.14.3';
import { makeLastMoveOverlay } from './last-move-ghost.js?v=0.13.0';
import { createVictoryFX } from './victory-fx.js?v=0.14.2';
import { createImmersiveChess } from './immersive-chess.js?v=0.14.7';
import {createARChessPortal} from './ar-portal.js?v=0.14.8';
import {createARImmersionRoom,arRoomSize} from './immersive-room.js?v=0.15.0';
import {checkSkybox,linkedRealm,validExperience,gameRealmName} from './experience-modes.js?v=0.16.1';
import {createQuestMap,successfulQuestMove} from './quest-map.js?v=0.15.2';
import {COMMUNITY_FILES,communityPiecePath,communityPieceKey,communityPieceHeight} from './community-models.js?v=0.15.2';
import {ANTHRO_GLB,ANTHRO_MANIFEST,collectAnthroSources,createAnthroVisual,tickAnthroVisuals} from './anthropomorphic-pieces.js?v=0.15.3';
import {PIECE_MATERIALS,PIECE_GLOWS,validPieceMaterial,validPieceGlow,pieceGlowHex,applyPieceAppearance} from './piece-materials.js?v=0.15.7';
import {createChessCombat,faceMovement} from './piece-combat.js?v=0.15.4';
import {createPiecePreview} from './piece-preview.js?v=0.15.5';
import {loadPhotoPBR,readPBRManifest,PBR_ROOT} from './piece-pbr.js?v=0.15.6';
import {normalizeArmyLook,chooseContrastingArmy,armiesAreDistinct,isValidWireLook} from './army-appearance.js?v=0.15.7';
import {setupMaterialGallery} from './piece-gallery.js?v=0.15.6';

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
let arcaneUI=null,magicEnv=null,ghostHint=null,boardSurface=null,victoryFX=null,realmImmersion=null,arPortal=null,arRoom=null;
const rootBase = new THREE.Mesh(new THREE.BoxGeometry(8.45, .35, 8.45), new THREE.MeshStandardMaterial({color:0x213544, metalness:.5, roughness:.28}));
rootBase.position.y = -.23; rootBase.receiveShadow = true; tiles.add(rootBase);
const raycaster = new THREE.Raycaster(), point = new THREE.Vector2();
const goldMat = new THREE.MeshStandardMaterial({color:0xf9d890,metalness:.5,roughness:.28});
const darkMat = new THREE.MeshStandardMaterial({color:0x203d54,metalness:.45,roughness:.27});
const highlightMat = new THREE.MeshBasicMaterial({color:0x5affad,transparent:true,opacity:.56,depthWrite:false});
const lastMoveMat = new THREE.MeshBasicMaterial({color:0xffd07a,transparent:true,opacity:.23,depthWrite:false});
const selectedMat = new THREE.MeshBasicMaterial({color:0x3bfafa,transparent:true,opacity:.40,depthWrite:false});
const FILES = 'abcdefgh';
let selected = null, squares = [], isAR = false, boardPlaced = true;
let hitSource = null, hitRequested = false, reticlePose = null, timer = null;
let theme = 'classic', lang = 'es', botDifficulty = 'easy', mode = 'bot';
let account = null, guestLocal = false, roomVersion = 0, boardScale = 0.065;
let commandRecognition = null, gameStarted = false;
let modelSet = 'anthro', moving = null;
let pieceMaterial='arcane',pieceGlow='team',piecePreview=null,combatFX=null;
let rivalMaterial='obsidian',rivalGlow='violet',rivalMode='auto',remoteLook=null;
let connectedMatch=null; // Se asigna después de inicializar PeerMatch.
function myLook(){return normalizeArmyLook({material:pieceMaterial,glow:pieceGlow});}
function otherLook(){return normalizeArmyLook({material:rivalMaterial,glow:rivalGlow});}
function armyLooks(){
 const mine=myLook();
 if(mode==='online'&&connectedMatch?.connected()){
  const w=connectedMatch.host?mine:(remoteLook||otherLook());
  const b=connectedMatch.host?(remoteLook||otherLook()):mine;
  return {w,b:armiesAreDistinct(w,b)?b:chooseContrastingArmy(w,b)};
 }
 return {w:mine,b:otherLook()};
}
function mineColor(){return mode==='online'&&connectedMatch?.connected()&&!connectedMatch.host?'b':'w';}
function updateArmyStatus(){
 const online=mode==='online'&&connectedMatch?.connected();
 $('playerArmyLabel').textContent=online&&!connectedMatch.host?'TU EJÉRCITO · NEGRAS':'TU EJÉRCITO · BLANCAS';
 $('rivalArmyLabel').textContent=online?'RIVAL EN LÍNEA · ELECCIÓN PROPIA':
  mode==='bot'?'EJÉRCITO DE LA MÁQUINA':'EJÉRCITO DEL SEGUNDO JUGADOR';
 for(const id of ['rivalAppearanceMode','rerollRival'])$(id).disabled=online;
 for(const id of ['rivalMaterial','rivalGlow'])$(id).disabled=online||rivalMode==='auto';
 const looks=armyLooks(),side=mineColor(),mine=looks[side],enemy=looks[side==='w'?'b':'w'];
 $('pieceContrastStatus').textContent=(online?'Duelo online: cada jugador elige sus acabados. ':
  rivalMode==='auto'?'Rival diferente generado automáticamente. ':'Dos ejércitos contrastantes. ')+
  PIECE_MATERIALS[mine.material].label+' / '+PIECE_GLOWS[mine.glow].label+
  ' frente a '+PIECE_MATERIALS[enemy.material].label+' / '+PIECE_GLOWS[enemy.glow].label;
}
function saveArmyChoice(){
 try{
  localStorage.setItem('eco-piece-material',pieceMaterial);
  localStorage.setItem('eco-piece-glow',pieceGlow);
  localStorage.setItem('eco-piece-rival',JSON.stringify({material:rivalMaterial,glow:rivalGlow,mode:rivalMode}));
 }catch(error){}
}
function preloadArmyTextures(){
 const looks=armyLooks();
 for(const material of new Set([looks.w.material,looks.b.material])){
  const source=PIECE_MATERIALS[material]?.photoSource||material;
  if(source==='arcane')continue;
  loadPhotoPBR(THREE,source).then(data=>{
   if(data){renderPieces();piecePreview?.rebuild();}
  }).catch(()=>{});
 }
}
function refreshArmy({reroll=false,transmit=false}={}){
 const chosen=chooseContrastingArmy(myLook(),otherLook(),{
  random:reroll||(rivalMode==='auto'&&!armiesAreDistinct(myLook(),otherLook()))
 });
 rivalMaterial=chosen.material;rivalGlow=chosen.glow;
 $('rivalMaterial').value=rivalMaterial;$('rivalGlow').value=rivalGlow;
 updateArmyStatus();saveArmyChoice();renderPieces();piecePreview?.rebuild();
 preloadArmyTextures();
 if(transmit&&mode==='online'&&connectedMatch?.connected())
  connectedMatch.send({type:'APPEARANCE',...myLook()});
}
let questUI=null,missionActive=null,missionSolved=false,missionPrior=null;
const assets = new Map(), loader = new GLTFLoader();
const communityAssets=new Map();let communityLoading=null;
const robotAssets=new Map();let robotLoading=null;const ROBOT_ROOT='./app/imagenes/fichas/roboticos/';
const robotGlowGeometry=new THREE.TorusGeometry(.32,.018,8,32);const ROBOT_NAMES={p:'peon',r:'torre',n:'caballo',b:'alfil',q:'reina',k:'rey'};
let anthroSources=null,anthroLoading=null,lastAnthroTick=0;
async function loadAnthroModel(){
 if(anthroSources||anthroLoading)return anthroLoading||anthroSources;
 anthroLoading=(async()=>{
  try{
   const response=await fetch(ANTHRO_MANIFEST,{cache:'no-store'});
   if(!response.ok)return null;
   const state=await response.json();
   if(!state?.ready||state.pieces!==32||state.walkClips!==32)return null;
   const loaded=await loader.loadAsync(ANTHRO_GLB);
   const templates=collectAnthroSources(loaded);
   if(templates.size!==12)throw Error('GLB incompleto: faltan tipos o clips Walk');
   anthroSources=templates;
   if(modelSet==='anthro'){moving=null;renderPieces();piecePreview?.rebuild();toast('✦ Ejército antropomorfo GLB animado listo.');}
   return templates;
  }catch(error){
   console.warn('GLB antropomorfo no disponible; se conservarán las figuras ligeras del juego.',error);
   return null;
  }
 })();
 try{return await anthroLoading;}finally{anthroLoading=null;}
}

const reticle = new THREE.Mesh(new THREE.RingGeometry(.125,.145,40), new THREE.MeshBasicMaterial({color:0x72ffba,side:THREE.DoubleSide}));
reticle.rotation.x = -Math.PI/2; reticle.visible = false; scene.add(reticle);
const letters = {
es:{mode:'Modo de juego',bot:'Contra computadora',local:'Dos jugadores locales',difficulty:'Dificultad de demostración',easy:'Principiante',medium:'Intermedio',advanced:'Avanzado (básico)',scenario:'Escenario 3D',classic:'Clásico de obsidiana',jungle:'Selva encantada',game:'Partida',new:'Nueva partida',undo:'Deshacer',keyboard:'Movimiento por teclado (e2e4)',move:'Mover',historyTitle:'Movimientos',about:'Cómo jugar',center:'Centrar cámara',rotate:'Girar vista',turn:'Turno:',white:'Blancas',black:'Negras',check:'¡Jaque!',mate:'Jaque mate',draw:'Tablas',ar:'Busca una superficie plana, luego toca para fijar el tablero.',wait:'La computadora está pensando…',invalid:'Movimiento no permitido',help:'Toca una figura y una casilla iluminada. Arrastra para girar. En Android compatible, pulsa AR, apunta a una mesa y toca para fijarlo.'},
en:{mode:'Game mode',bot:'Against computer',local:'Two local players',difficulty:'Demo difficulty',easy:'Beginner',medium:'Intermediate',advanced:'Advanced (basic)',scenario:'3D environment',classic:'Obsidian classic',jungle:'Enchanted jungle',game:'Game',new:'New game',undo:'Undo',keyboard:'Keyboard move (e2e4)',move:'Play move',historyTitle:'Move history',about:'How to play',center:'Reset camera',rotate:'Rotate view',turn:'Turn:',white:'White',black:'Black',check:'Check!',mate:'Checkmate',draw:'Draw',ar:'Point at a flat surface, then tap to place the board.',wait:'Computer thinking…',invalid:'Illegal move',help:'Tap a piece and a highlighted square. Drag to rotate. On compatible Android, press AR, find a table and tap to place the board.'},
zh:{mode:'游戏模式',bot:'与电脑对弈',local:'本地双人',difficulty:'演示难度',easy:'初学者',medium:'中级',advanced:'高级（基础版）',scenario:'3D 场景',classic:'经典黑曜石',jungle:'魔法丛林',game:'对局',new:'新游戏',undo:'悔棋',keyboard:'键盘走棋 (e2e4)',move:'走棋',historyTitle:'着法记录',about:'玩法',center:'重置视角',rotate:'旋转视角',turn:'轮到：',white:'白方',black:'黑方',check:'将军！',mate:'将死',draw:'和棋',ar:'寻找平面并轻触放置棋盘。',wait:'电脑思考中…',invalid:'无效着法',help:'轻触棋子，再轻触高亮格子。拖动可旋转棋盘。支持AR的安卓设备可点击AR并寻找平面。'}
};
function t(k){return letters[lang][k] || letters.es[k] || k;}
const interfaceText={
  es:{downloadPgn:'⬇ GUARDAR PARTIDA PGN',diagnostics:'◈ DIAGNÓSTICO',loginGoogle:'G · INICIAR CON GOOGLE',loginGuest:'⚡ CONTINUAR COMO INVITADO',menuBot:'♟ VS COMPUTADORA',menuLocal:'⚔ DOS JUGADORES',menuHost:'🌐 CREAR DUELO ONLINE',menuJoin:'♜ UNIRME A PARTIDA',joinBtn:'CONECTAR',menuSettings:'⚙ PERSONALIZAR',logout:'⇥ CERRAR SESIÓN',settingsTitle:'⚙ CONFIGURACIÓN DE BATALLA',back:'← VOLVER',startGame:'⚔ INICIAR PARTIDA',gameMenu:'☰ MENÚ',move:'♟ MOVER',enterAR:'◎ AR',placeAR:'📍 FIJAR TABLERO',exitAR:'✕ SALIR AR',arTouch:'👆 TOCAR',arAim:'⊕ APUNTAR',selectAR:'✓ SELECCIONAR CASILLA'},
  en:{downloadPgn:'⬇ SAVE GAME PGN',diagnostics:'◈ DIAGNOSTICS',loginGoogle:'G · CONTINUE WITH GOOGLE',loginGuest:'⚡ PLAY AS GUEST',menuBot:'♟ VS COMPUTER',menuLocal:'⚔ TWO LOCAL PLAYERS',menuHost:'🌐 CREATE ONLINE DUEL',menuJoin:'♜ JOIN A MATCH',joinBtn:'CONNECT',menuSettings:'⚙ CUSTOMIZE',logout:'⇥ SIGN OUT',settingsTitle:'⚙ BATTLE SETTINGS',back:'← BACK',startGame:'⚔ START MATCH',gameMenu:'☰ MENU',move:'♟ MOVE',enterAR:'◎ AR',placeAR:'📍 PLACE BOARD',exitAR:'✕ EXIT AR',arTouch:'👆 TOUCH',arAim:'⊕ AIM',selectAR:'✓ SELECT SQUARE'},
  zh:{downloadPgn:'⬇ 导出棋谱 PGN',diagnostics:'◈ 设备诊断',loginGoogle:'G · 使用谷歌账号登录',loginGuest:'⚡ 游客进入',menuBot:'♟ 对战电脑',menuLocal:'⚔ 本地双人',menuHost:'🌐 创建在线对局',menuJoin:'♜ 加入对局',joinBtn:'连接',menuSettings:'⚙ 自定义',logout:'⇥ 退出登录',settingsTitle:'⚙ 对局设置',back:'← 返回',startGame:'⚔ 开始对局',gameMenu:'☰ 菜单',move:'♟ 走棋',enterAR:'◎ 增强现实',placeAR:'📍 放置棋盘',exitAR:'✕ 退出AR',arTouch:'👆 点击',arAim:'⊕ 瞄准',selectAR:'✓ 选择格子'}
};
function translate(){
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-ui]').forEach(el=>el.textContent=interfaceText[lang]?.[el.dataset.ui]||interfaceText.es[el.dataset.ui]||el.textContent);
  updateStatus();
}
function toast(msg){
 if(isAR){arHint('✦ '+msg);return;}
 const el=$('gameToast');
 el.textContent=msg;el.style.display='block';
 clearTimeout(toast.t);
 const important=/error|no disponible|inválid|fall|conexión|denegad|permiso|advertencia/i.test(msg);
 toast.t=setTimeout(()=>{el.style.display='none';},important?2700:1500);
}
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
    tile.receiveShadow=true;tile.userData.square=s;tile.userData.boardMaterial=tile.material;tiles.add(tile);squares.push(tile);
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
function createPieceVisual(p){
    let g = null;
    if((modelSet==='staunton'||modelSet==='royal') && assets.has(p.type)){
      const template = assets.get(p.type);
      if(template){
        g=template.clone(true);
        const material=p.color==='w'?goldMat:darkMat;
        g.traverse(o=>{
          if(o.isMesh){
            o.userData.sharedGeo=true;
            o.material=material.clone();
            o.material.side=THREE.DoubleSide;
            o.userData.ownedMaterial=true;
            o.castShadow=true;
          }
        });
      }
    }
    if(modelSet==='robotic'&&robotAssets.has(p.type)){
      g=robotAssets.get(p.type).clone(true);g.userData.robotic=true;
      g.traverse(o=>{
        if(!o.isMesh)return;
        o.userData.sharedGeo=true;
        o.material=Array.isArray(o.material)?o.material.map(v=>v.clone()):o.material.clone();
        const materials=Array.isArray(o.material)?o.material:[o.material];
        const names=(o.name+' '+materials.map(v=>v?.name||'').join(' ')).toLowerCase();
        const isGlow=/eye|ojo|led|glow|light|emissive|visor|energy|energia|luz/.test(names)||
          materials.some(mat=>mat?.emissiveIntensity>1);
        o.userData.ecoMaterialRole=isGlow?'glow':'body';
        o.userData.ownedMaterial=true;o.castShadow=true;
      });
    }
    if(modelSet==='anthro'){
      g=createAnthroVisual(THREE,p,anthroSources);
    }
    if(modelSet==='community'){
      const source=communityAssets.get(communityPieceKey(p.color,p.type));
      if(source){
        g=source.clone(true);
        g.traverse(obj=>{
          if(!obj.isMesh)return;
          obj.userData.sharedGeo=true;
          obj.userData.ownedMaterial=true;
          obj.material=Array.isArray(obj.material)?
            obj.material.map(mat=>mat.clone()):obj.material.clone();
          obj.castShadow=true;
        });
      }
    }
    if(!g){
      g=pieceModel(p);
      // Las formas ligeras reutilizan oro/obsidiana globales; clonar SOLO
      // materiales evita que el PBR de una ficha cambie todas las demás.
      g.traverse(obj=>{
        if(!obj.isMesh||!obj.material)return;
        obj.material=Array.isArray(obj.material)?
          obj.material.map(m=>m.clone()):obj.material.clone();
        obj.userData.ownedMaterial=true;
      });
    }
    if(modelSet==='royal'){
      // Original fantasy ornaments over our own six local glTF meshes.
      const aura=new THREE.MeshStandardMaterial({
        color:p.color==='w'?0x9bfff0:0xb7a8ff,metalness:.45,roughness:.23,
        emissive:p.color==='w'?0x1b7666:0x3c315d,emissiveIntensity:.9
      });
      // All decorative meshes own their materials; dispose them when positions change.
      const addGem=(geometry,x,y,z)=>{
        const item=addPart(g,geometry,aura.clone(),x,y,z);
        item.userData.ownedMaterial=true;return item;
      };
      const halo=addGem(new THREE.TorusGeometry(.33,.032,7,32),0,.095,0);
      halo.rotation.x=-Math.PI/2;
      const gemHeight=p.type==='k'?1.55:p.type==='q'?1.35:p.type==='r'?1.14:p.type==='n'?1.23:p.type==='b'?1.33:.94;
      addGem(new THREE.OctahedronGeometry(p.type==='p'?.095:.13),0,gemHeight,0);
      if(p.type==='r'||p.type==='k'){
        const crown=addGem(new THREE.TorusGeometry(.22,.044,6,6),0,gemHeight-.15,0);
        crown.rotation.x=-Math.PI/2;
      }
      if(p.type==='n')addGem(new THREE.ConeGeometry(.095,.26,5),.10,1.00,0).rotation.z=-.4;
      aura.dispose();
    }
 // Apply the SAME player-selected PBR finish/glow to native and imported pieces.
 const selectedLook=armyLooks()[p.color];
 applyPieceAppearance(THREE,g,{material:selectedLook.material,glow:selectedLook.glow,color:p.color});
 if(g.userData.robotic||modelSet==='anthro'){
   const bodyTint=new THREE.Color(p.color==='w'?($('whiteColor')?.value||'#efffff'):($('blackColor')?.value||'#203d54'));
   const glowColor=new THREE.Color(pieceGlowHex(selectedLook.glow,p.color));
   g.traverse(o=>{
     if(!o.isMesh||!o.material||o.userData.ecoMaterialRole==='glow')return;
     for(const mat of (Array.isArray(o.material)?o.material:[o.material])){
       if(mat.color?.lerp)mat.color.lerp(bodyTint,selectedLook.material==='arcane'?.42:.23);
       if(g.userData.robotic){
         if(selectedLook.material==='arcane'){
           if('metalness' in mat)mat.metalness=Math.max(.68,mat.metalness||0);
           if('roughness' in mat)mat.roughness=Math.min(.30,mat.roughness??.5);
         }
         if(mat.emissive?.copy){mat.emissive.copy(glowColor);mat.emissiveIntensity=.14;}
       }
       mat.needsUpdate=true;
     }
   });
   if(g.userData.robotic){
     // Lightweight emissive floor accent, visible even if the GLB stores eyes
     // and blue circuitry in one single baked texture/mesh.
     const material=new THREE.MeshBasicMaterial({color:glowColor,transparent:true,opacity:.70,depthWrite:false});
     const ring=new THREE.Mesh(robotGlowGeometry,material);
     ring.rotation.x=Math.PI/2;ring.position.y=.035;
     ring.userData.sharedGeo=true;ring.userData.ownedMaterial=true;
     g.add(ring);
   }
   // GLB/procedural robots face +Z in their source. White moves -Z; black moves +Z.
   g.rotation.y=p.color==='w'?Math.PI:0;
 }else if(p.color==='b')g.rotation.y=Math.PI;
 return g;
}
function disposePieceGroup(child){
 child.traverse(node=>{
  if(node.isMesh&&node.geometry&&!node.userData.sharedGeo)node.geometry.dispose();
  if((node.isMesh||node.isSprite)&&node.userData.ownedMaterial&&node.material){
   const mats=Array.isArray(node.material)?node.material:[node.material];
   for(const mat of mats)mat?.dispose?.();
  }
 });
}
function clearGroup(group){
 while(group.children.length){
  const child=group.children[0];group.remove(child);disposePieceGroup(child);
 }
}
function renderPieces(){
 combatFX?.cancel();
 clearGroup(pieces);clearGroup(markers);
 for(const row of game.board())for(const p of row)if(p){
  const g=createPieceVisual(p);
  g.userData.square=p.square;
  g.userData.pieceType=p.type;
  const loc=positionOf(p.square);
  g.position.set(loc.x,.07,loc.z);
  pieces.add(g);
 }
  // Local-only previous-move hint is shown on request, never transmitted online.
  if(selected){
    const source=positionOf(selected);
    const outline=mesh(new THREE.CylinderGeometry(.46,.46,.015,24),selectedMat,source.x,.105,source.z);
    outline.userData.square=selected;markers.add(outline);
    for(const m of game.moves({square:selected,verbose:true})){
      const loc=positionOf(m.to);
      const circle=mesh(new THREE.CylinderGeometry(.32,.32,.018,24),highlightMat,loc.x,.113,loc.z);
      circle.userData.square=m.to;markers.add(circle);
    }
  }
}
function makeJungle(){
  clearGroup(decorations);
  if(theme!=='jungle')return;
  const stem=new THREE.MeshStandardMaterial({color:0x33785a,roughness:1});
  const bloom=new THREE.MeshStandardMaterial({color:0xe15372,emissive:0x4d1422,emissiveIntensity:.3});
  // Keep fewer procedural plants on low-end phones; 3D scenery is cosmetic.
  const plantCount=['low'].includes($('quality').value) ||
   ($('quality').value==='auto'&&matchMedia('(max-width:760px)').matches) ? 20 : 58;
  for(let i=0;i<plantCount;i++){
    let a=i*2.39996, radius=4.35+(i%4)*.23;
    const x=Math.cos(a)*radius,z=Math.sin(a)*radius, h=.17+(i%5)*.09;
    const plant=new THREE.Group();plant.position.set(x,0,z);
    addPart(plant,new THREE.ConeGeometry(.07,h,5),i%3===0?bloom:stem,0,h/2,0);
    plant.userData.sway=a;decorations.add(plant);
  }
}
function setTheme(next){
  const paired=realmTheme(window.ecoBoardCatalogue?.getSelected());
  theme=paired||next;
  if($('theme'))$('theme').value=theme;
  const biomes={
    classic:['#cadbd0','#315d63','#1d3b4d','#0a1724'],wood:['#e8c792','#7c5136','#513122','#2b2119'],
    marble:['#f2f3ef','#5b6686','#7a8087','#191e35'],neon:['#78f4d8','#28325a','#11193b','#081027'],
    jungle:['#d9f4b5','#4d8b54','#453925','#102a1e'],volcano:['#f3bc89','#642738','#6b2530','#2d1020'],
    ice:['#edfaff','#63a6cb','#418db2','#0b2a43']
  };
  const palette=biomes[theme]||biomes.classic;
  squares.forEach((tile,i)=>{
    const even=(Math.floor(i/8)+i%8)%2===0;
    tile.userData.boardMaterial.color.set(even?palette[0]:palette[1]);
  });
  rootBase.material.color.set(palette[2]);
  scene.background=null;
  const illuminated=['neon','jungle','volcano','ice'].includes(theme);
  for(const tile of squares){
    const material=tile.userData.boardMaterial;
    material.emissive.set(illuminated?palette[2]:0x050e17);
    material.emissiveIntensity=illuminated?.16:.015;
    material.roughness=theme==='marble'?.25:.45;
  }
  makeJungle();
  magicEnv?.rebuild(theme);
  magicEnv?.setAR(isAR);
}
let realmRequest=0;
function syncSelectedRealm(id){
 const linked=realmTheme(id),sequence=++realmRequest;
 magicEnv?.setRealmImage(null); // Clear previous kingdom during selection.
 for(const el of [$('theme'),$('toolsTheme')])if(el){
  el.disabled=Boolean(linked);
  el.title=linked?'El entorno se selecciona junto al tablero':'Escenario libre del tablero clásico';
 }
 if(!linked)return;
 setTheme(linked);
 publishedRealmURL(id).then(url=>{
  if(sequence===realmRequest)magicEnv?.setRealmImage(url);
 }).catch(()=>{if(sequence===realmRequest)magicEnv?.setRealmImage(null);});
}
function updateStatus(){
  let text='';
  if(game.isCheckmate()){text=t('mate')+' · '+t(game.turn()==='w'?'black':'white');}
  else if(game.isDraw()){text=t('draw');}
  else {text=t('turn')+' '+t(game.turn()==='w'?'white':'black')+(game.isCheck()?' · '+t('check'):'');}
  $('status').textContent=text;
  const history=game.history();
  $('history').textContent=history.length?history.map((v,i)=>(i%2===0?String(Math.floor(i/2)+1)+'. ':'')+v).join('  '):'—';
  realmImmersion?.refreshStatus?.();
  arcaneUI?.state({turn:game.turn(),check:game.isCheck(),mate:game.isCheckmate(),mode,connected:mode!=='online'||match.connected()});
  syncVictory();
}
function syncVictory(){
  victoryFX?.sync({game,mode,lang,isHost:mode!=='online'||match.host,visible:document.body.dataset.view==='game'});
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
  if(mode==='online'&&match.host)match.send(makeSnapshot(game,roomVersion));
}
function storageKey(){
  const uid=String(account?.uid||'local-guest').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,96);
  return 'ecoajedrez:local:0.4.1:'+uid;
}
function persistCurrentGame(){
  if(!gameStarted||mode==='online'||missionActive)return;
  const preferences={theme,modelSet,lang,botDifficulty,boardScale,
    pieceMaterial,pieceGlow,rivalMaterial,rivalGlow,rivalMode,
    boardSkin:$('boardSkin').value,
    whiteColor:$('whiteColor').value,blackColor:$('blackColor').value};
  const success=saveLocalMatch(window.localStorage,storageKey(),game,mode,preferences);
  $('saveStatus').textContent=success?'💾 Partida local guardada en este dispositivo.':'El navegador impide el guardado local.';
}
function restoreLastGame(){
  if(gameStarted)return;
  const saved=readLocalMatch(window.localStorage,storageKey(),game);
  if(!saved)return;
  mode=saved.mode;
  $('mode').value=mode;
  const pref=saved.preferences||{};
  for(const key of ['theme','modelSet','lang','botDifficulty']){
    const control={theme:'theme',modelSet:'pieceSet',lang:'lang',botDifficulty:'difficulty'}[key];
    if(pref[key] && [...$(control).options].some(o=>o.value===pref[key]))$(control).value=pref[key];
  }
  if(Number.isFinite(pref.boardScale)&&pref.boardScale>=.04&&pref.boardScale<=.10){
    boardScale=pref.boardScale; $('boardSize').value=String(boardScale);
  }
  for(const [input,key,mat] of [['whiteColor','whiteColor',goldMat],['blackColor','blackColor',darkMat]]){
    if(pref[key]&&[...$(input).options].some(o=>o.value===pref[key])){
      $(input).value=pref[key];mat.color.set(pref[key]);
    }
  }
  if(pref.boardSkin && [...$('boardSkin').options].some(o=>o.value===pref.boardSkin)){
    window.ecoBoardCatalogue?.selectBoard(pref.boardSkin);
  }
  pieceMaterial=validPieceMaterial(pref.pieceMaterial||pieceMaterial);
  pieceGlow=validPieceGlow(pref.pieceGlow||pieceGlow);
  rivalMaterial=validPieceMaterial(pref.rivalMaterial||rivalMaterial);
  rivalGlow=validPieceGlow(pref.rivalGlow||rivalGlow);
  rivalMode=pref.rivalMode==='manual'?'manual':'auto';
  for(const [id,value] of [['pieceMaterial',pieceMaterial],['pieceGlow',pieceGlow],
   ['rivalMaterial',rivalMaterial],['rivalGlow',rivalGlow],
   ['rivalAppearanceMode',rivalMode]])$(id).value=value;
  updateArmyStatus();preloadArmyTextures();
  theme=$('theme').value;modelSet=$('pieceSet').value;lang=$('lang').value;botDifficulty=$('difficulty').value;
  setTheme(theme);translate();renderPieces();updateStatus();
  gameStarted=true; $('resumeGame').style.display='block';
  $('saveStatus').textContent='💾 Partida local recuperada con '+game.history().length+' movimientos.';
  if(mode==='bot'&&game.turn()==='b'&&!game.isGameOver())timer=setTimeout(playBot,600);
}
function detachCapturedPiece(moved){
 if(!moved?.captured)return null;
 const square=(moved.flags||'').includes('e')?
  moved.to[0]+moved.from[1]:moved.to;
 const defender=pieces.children.find(p=>p.userData.square===square);
 if(!defender)return null;
 pieces.remove(defender);return defender;
}
function playMove(from,to,promotion='q',source='local'){
  if(missionActive){
    if(missionSolved)return false;
    if(missionActive.goal!=='checkmate'&&(from!==missionActive.from||to!==missionActive.to||
       (missionActive.promotion&&missionActive.promotion!==promotion))){
      toast('Objetivo de misión: '+missionActive.hint);
      return false;
    }
  }
  if(!canPlay(source))return false;
  if(mode==='online' && !match.host && source==='local'){
    return match.send({type:'MOVE',from,to,promotion,version:roomVersion});
  }
  let captured=false,victim=null;
  try{
    const moved=game.move({from,to,promotion});
    if(!moved)return false;
    captured=Boolean(moved.captured);
    victim=detachCapturedPiece(moved);
  }catch(error){return false;}
  ghostHint?.clear();
  selected=null;arcaneUI?.selected(null);moving=null;renderPieces();animateMove(from,to,captured,victim);
  arcaneUI?.move(to,captured);updateStatus();
  if(missionActive && successfulQuestMove(missionActive,{from,to,promotion},game)){
    missionSolved=true;questUI?.complete(missionActive);
    $('questHint').textContent='✓ MISIÓN SUPERADA · '+missionActive.title+' · Pulsa CAMINO para continuar.';
    toast('✓ ¡Misión completada! Pulsa CAMINO DE MISIONES para avanzar.');
  }
  if(mode==='online'){roomVersion++;broadcastState();}
  persistCurrentGame();
  if(mode==='bot' && !game.isGameOver()){clearTimeout(timer);timer=setTimeout(playBot,modelSet==='anthro'?950:500);}
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

function dismissGameplayHint(){
 const hint=$('commandHint');
 if(hint){hint.classList.add('dismissed');}
}
function pickSquare(square){
  if(!square || game.isGameOver())return;
  dismissGameplayHint();
  if(!canPlay())return;
  const current=game.get(square);
  if(selected && playMove(selected,square))return;
  if(current && current.color===game.turn()){selected=square;renderPieces();}
  else {selected=null;renderPieces();}
  arcaneUI?.selected(selected);
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
  if(mode!=='bot'||game.turn()!=='b'||game.isGameOver()||(missionActive&&missionSolved))return;
  const m=chooseBot();
  let victim=null;
  if(m){
    const moved=game.move({from:m.from,to:m.to,promotion:'q'});
    victim=detachCapturedPiece(moved);
  }
  ghostHint?.clear();selected=null;arcaneUI?.selected(null);renderPieces();
  if(m){animateMove(m.from,m.to,Boolean(m.captured),victim);arcaneUI?.move(m.to,Boolean(m.captured));}
  updateStatus();persistCurrentGame();
}
function animateMove(from,to,captured=false,victim=null){
  const target=[...pieces.children].find(x=>x.userData.square===to);
  if(!target){if(victim)disposePieceGroup(victim);return;}
  const a=positionOf(from),b=positionOf(to);
  target.position.set(a.x,.07,a.z);
  if(modelSet==='anthro')faceMovement(target,b.x-a.x,b.z-a.z);
  moving={piece:target,a,b,start:performance.now(),duration:modelSet==='robotic'?(captured?1050:790):modelSet==='anthro'?(captured?1040:760):captured?710:370,captured};
  if(victim)combatFX?.start({defender:victim,attacker:target,from:a,to:b,
   start:moving.start,duration:moving.duration});
}
function reset(){
  if(mode==='bot'&&rivalMode==='auto')refreshArmy({reroll:true});
  if(missionActive){
    clearTimeout(timer);missionSolved=false;
    if(missionActive.fen==='start')game.reset();else game.load(missionActive.fen);
    selected=null;arcaneUI?.selected(null);moving=null;renderPieces();updateStatus();
    $('questHint').textContent='✦ '+missionActive.title+' · '+missionActive.hint;
    return;
  }
  victoryFX?.reset();
  ghostHint?.clear();clearTimeout(timer);game.reset();selected=null;arcaneUI?.selected(null);moving=null;renderPieces();updateStatus();
  if(mode==='online' && match.host){roomVersion++;broadcastState();}
  else if(mode!=='online')persistCurrentGame();
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
  // Priorizar casillas y evitar que el volumen de un robot intercepte la selección.
  const tile=squareFromHit([tiles],raycaster.ray.origin,raycaster.ray.direction);
  if(tile)return tile;
  // En perspectiva rasante, permitir tocar el cuerpo de la pieza.
  return squareFromHit([pieces],raycaster.ray.origin,raycaster.ray.direction);
}
let down=null;
canvas.addEventListener('pointerdown',event=>{
  if(isAR)return;
  const square=pick3DSquare(event.clientX,event.clientY),piece=square?game.get(square):null;
  const draggingPiece=canPlay() && piece && piece.color===game.turn();
  down={x:event.clientX,y:event.clientY,square:draggingPiece?square:null};
  if(draggingPiece || (square && selected))orbit.enabled=false;
});
canvas.addEventListener('pointerup',event=>{
  if(isAR||!down)return;
  if(realmImmersion?.isPanGesture()){down=null;orbit.enabled=false;return;}
  const downEvent=down;down=null;orbit.enabled=!realmImmersion?.active();
  const destination=pick3DSquare(event.clientX,event.clientY);
  if(!destination)return;
  const moved=Math.hypot(event.clientX-downEvent.x,event.clientY-downEvent.y)>(event.pointerType==='touch'?19:12);
  if(moved&&downEvent.square&&downEvent.square!==destination){
    if(selected!==downEvent.square)pickSquare(downEvent.square);
    pickSquare(destination);
  }else if(!moved)pickSquare(destination);
});
canvas.addEventListener('pointercancel',()=>{down=null;orbit.enabled=!realmImmersion?.active();});
// Original locally hosted models: exactly six types, reused by 32 pieces.
const chessModelTypes=['p','r','n','b','q','k'];
async function loadRoboticPieces(){
 if(robotLoading)return robotLoading;
 robotLoading=(async()=>{
  let ready=0;
  await Promise.all(chessModelTypes.map(async type=>{
   if(robotAssets.has(type)){ready++;return;}
   try{
    const gltf=await loader.loadAsync(ROBOT_ROOT+'modelos/'+ROBOT_NAMES[type]+'.glb');
    const source=gltf.scene,box=new THREE.Box3().setFromObject(source),size=new THREE.Vector3();box.getSize(size);
    if(!Number.isFinite(size.y)||size.y<.001)throw Error('Geometría inválida');
    source.scale.multiplyScalar(Math.min(1.45/size.y,.86/Math.max(size.x,size.z,.001)));
    const fitted=new THREE.Box3().setFromObject(source),center=new THREE.Vector3();fitted.getCenter(center);
    source.position.set(-center.x,-fitted.min.y,-center.z);
    const wrapper=new THREE.Group();wrapper.add(source);robotAssets.set(type,wrapper);ready++;
   }catch(error){console.warn('No se pudo cargar robot '+type,error);}
  }));
  const option=$('roboticPieceOption');
  if(option){
   // Partial upload/load failures stay visible rather than hiding the whole army:
   // individual missing GLBs render a safe built-in chess piece temporarily.
   option.disabled=false;
   option.textContent=ready===6?'Guardianes robóticos · 6 modelos 3D':'Robóticos · '+ready+'/6 GLB disponibles';
  }
  if(modelSet==='robotic'){renderPieces();piecePreview?.rebuild();}
  refreshPieceCatalog();
  return ready;
 })();
 try{return await robotLoading;}finally{robotLoading=null;}
}
async function checkCommunityModels(){
 const option=$('communityPieceOption');
 if(!option)return;
 try{
  const response=await fetch('./assets/models/community/manifest.json',{cache:'no-store'});
  if(!response.ok)return;
  const manifest=await response.json();
  if(manifest?.ready===true&&manifest?.files?.length===12){
   option.disabled=false;option.textContent='Staunton CC0 · modelos HD ligeros';
  }
 }catch(error){} // Optional model pack: never block original chess pieces.
}
async function loadCommunityPieces(){
 if(communityLoading)return communityLoading;
 communityLoading=(async()=>{
  const option=$('communityPieceOption');
  if(option?.disabled){toast('Piezas CC0 aún no disponibles. Se conservan las originales.');return 0;}
  let ready=0;
  await Promise.all(['w','b'].flatMap(color=>chessModelTypes.map(async(type,i)=>{
   const key=communityPieceKey(color,type);
   if(communityAssets.has(key)){ready++;return;}
   try{
    const result=await loader.loadAsync(communityPiecePath(color,chessModelNames[i]));
    if(!result?.scene)throw Error('Sin escena GLB');
    const source=result.scene;
    const bounds=new THREE.Box3().setFromObject(source),size=new THREE.Vector3();
    bounds.getSize(size);
    if(!Number.isFinite(size.y)||size.y<.01)throw Error('Escala del GLB inválida');
    const scale=communityPieceHeight[type]/size.y;
    source.scale.multiplyScalar(scale);
    const fitted=new THREE.Box3().setFromObject(source);
    const center=new THREE.Vector3();fitted.getCenter(center);
    const g=new THREE.Group();
    source.position.x-=center.x;source.position.z-=center.z;source.position.y-=fitted.min.y;
    g.add(source);communityAssets.set(key,g);ready++;
   }catch(error){console.warn('Modelo CC0 descartado, se conserva pieza original:',key,error);}
  })));
  if(modelSet==='community'){renderPieces();piecePreview?.rebuild();}
  toast(ready===12?'✓ Piezas Staunton CC0 cargadas.':('✓ '+ready+'/12 modelos CC0 · respaldo original activo.'));
  return ready;
 })();
 try{return await communityLoading;}finally{communityLoading=null;}
}
const chessModelNames=['pawn','rook','knight','bishop','queen','king'];
let modelsLoading=null;
function updateModelReadiness(message,completed=0){
 const label=$('modelsStatus'),bar=$('modelDownloadProgress');
 if(label)label.textContent=message;
 if(bar)bar.value=completed;
}
async function updateCacheReadiness(){
 const cache=window.ecoPublicAssets;
 const label=$('modelCacheState');
 if(!label)return;
 if(!cache){
  label.textContent='Caché no disponible. Se cargarán los modelos desde la web.';
  return;
 }
 const result=await cache.cacheReport();
 const inMemory=[...assets.values()].filter(Boolean).length;
 if(result.stored===6){
  label.textContent='✓ 6 de 6 archivos almacenados en este navegador. '+
   (result.persistent?'Almacenamiento persistente concedido.':'Se reutilizarán mientras el navegador conserve los datos.');
 }else if(result.available){
  label.textContent='En caché: '+result.stored+' / 6 archivos · Modelos activos: '+inMemory+' / 6. Puedes completar la descarga ahora.';
 }else label.textContent='El navegador no permitió guardar los archivos. El juego puede seguir conectado a internet.';
}
async function loadChessModels({retry=false}={}){
 if(modelsLoading)return modelsLoading;
 modelsLoading=(async()=>{
  const cached=window.ecoPublicAssets;
  let loaded=chessModelTypes.filter(type=>assets.get(type)).length;
  updateModelReadiness('Preparando las piezas 3D…',loaded);
  await Promise.all(chessModelTypes.map(async(type,index)=>{
   if(assets.get(type) && !retry)return;
   const path='./assets/models/staunton/'+chessModelNames[index]+'.gltf';
   try{
    let result;
    if(cached){
     // First use and background preload share the same request/promise.
     // Parse the original glTF directly from CacheStorage, with no duplicate GET.
     const response=await cached.getResource(path);
     result=await loader.parseAsync(await response.text(),'./assets/models/staunton/');
    }else result=await loader.loadAsync(path);
    if(!result?.scene)throw Error('Escena glTF no encontrada');
    assets.set(type,result.scene);
    loaded++;
    updateModelReadiness('Piezas reales cargadas: '+loaded+' / 6…',loaded);
    if(modelSet==='staunton'||modelSet==='royal'){renderPieces();piecePreview?.rebuild();}
   }catch(error){
    console.warn('Falla al interpretar modelo 3D '+chessModelNames[index],error);
    assets.set(type,null);
    updateModelReadiness('Piezas reales cargadas: '+loaded+' / 6 · reintento disponible',loaded);
   }
  }));
  const ready=chessModelTypes.filter(type=>Boolean(assets.get(type))).length;
  updateModelReadiness(ready===6?'✓ 6 / 6 modelos 3D originales listos para jugar.':
   '⚠ '+ready+' / 6 modelos activos. Las piezas geométricas quedan disponibles.',ready);
  await updateCacheReadiness();
  refreshPieceCatalog();
  return ready;
 })();
 try{return await modelsLoading;}
 finally{modelsLoading=null;}
}
$('downloadModels').onclick=async()=>{
 const button=$('downloadModels');
 if(button.disabled)return;
 button.disabled=true;
 button.textContent='⌛ COMPROBANDO LOS SEIS MODELOS…';
 try{
  const cache=window.ecoPublicAssets;
  // Browser may grant stronger eviction protection after this explicit user gesture.
  const keep=cache?.requestPersistentStorage?.();
  if(cache)await cache.preparePublicAssets({modelsOnly:true,force:true});
  await loadChessModels({retry:false});
  if(keep)await keep;
  await updateCacheReadiness();
 }catch(error){
  updateModelReadiness('No fue posible preparar todas las piezas. Puedes volver a intentar.');
 }finally{
  button.disabled=false;
  button.textContent='⬇ PREPARAR / COMPROBAR PIEZAS 3D';
 }
};
window.addEventListener('eco:assets-ready',event=>{
 if(event.detail?.modelsOnly || event.detail?.stored!==undefined)updateCacheReadiness().catch(()=>{});
});
$('pieceSet').addEventListener('change',()=>{
 if(['staunton','royal'].includes($('pieceSet').value) &&
  chessModelTypes.some(type=>!assets.get(type)))loadChessModels();
checkCommunityModels();
});
$('reset').onclick=()=>{if(mode==='online'&&!match.host){toast('Solo el anfitrión reinicia el duelo.');return;}reset();};
$('undo').onclick=()=>{
  if(mode==='online'){toast('Deshacer no está disponible durante un duelo online.');return;}
  clearTimeout(timer);
  if(game.history().length){
    ghostHint?.clear();game.undo();
    if(mode==='bot' && game.turn()==='b' && game.history().length)game.undo();
    selected=null;moving=null;renderPieces();updateStatus();persistCurrentGame();
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
  refreshArmy({reroll:mode==='bot'&&rivalMode==='auto'});
};
$('difficulty').onchange=()=>{botDifficulty=$('difficulty').value;};
$('theme').onchange=()=>setTheme($('theme').value);
// Customisation does not affect legal moves or chessboard coordinates.
function bindPieceAppearance(){
 try{
  pieceMaterial=validPieceMaterial(localStorage.getItem('eco-piece-material')||'arcane');
  pieceGlow=validPieceGlow(localStorage.getItem('eco-piece-glow')||'team');
  const data=JSON.parse(localStorage.getItem('eco-piece-rival')||'{}');
  rivalMaterial=validPieceMaterial(data.material||'obsidian');
  rivalGlow=validPieceGlow(data.glow||'violet');
  rivalMode=data.mode==='manual'?'manual':'auto';
 }catch(error){}
 for(const [id,values,chosen] of [
  ['pieceMaterial',PIECE_MATERIALS,pieceMaterial],
  ['pieceGlow',PIECE_GLOWS,pieceGlow],
  ['rivalMaterial',PIECE_MATERIALS,rivalMaterial],
  ['rivalGlow',PIECE_GLOWS,rivalGlow]
 ]){
  const control=$(id);control.replaceChildren();
  for(const [key,data] of Object.entries(values)){
   const opt=document.createElement('option');opt.value=key;opt.textContent=data.label;control.add(opt);
  }
  control.value=chosen;
 }
 $('rivalAppearanceMode').value=rivalMode;
 setupMaterialGallery({root:$('pieceMaterialGallery'),select:$('pieceMaterial'),
  materials:PIECE_MATERIALS,readManifest:readPBRManifest,assetRoot:PBR_ROOT});
 $('pieceMaterial').onchange=()=>{
  pieceMaterial=validPieceMaterial($('pieceMaterial').value);
  refreshArmy({reroll:rivalMode==='auto',transmit:true});
 };
 $('pieceGlow').onchange=()=>{
  pieceGlow=validPieceGlow($('pieceGlow').value);
  refreshArmy({reroll:rivalMode==='auto',transmit:true});
 };
 const opponentChanged=()=>{
  rivalMaterial=validPieceMaterial($('rivalMaterial').value);
  rivalGlow=validPieceGlow($('rivalGlow').value);
  refreshArmy();
 };
 $('rivalMaterial').onchange=opponentChanged;
 $('rivalGlow').onchange=opponentChanged;
 $('rivalAppearanceMode').onchange=()=>{
  rivalMode=$('rivalAppearanceMode').value==='manual'?'manual':'auto';
  refreshArmy({reroll:rivalMode==='auto'});
 };
 $('rerollRival').onclick=()=>refreshArmy({reroll:true});
 $('piecePreviewType').onchange=event=>{piecePreview?.rebuild(event.target.value);refreshPieceCatalog();};
 refreshArmy({reroll:rivalMode==='auto'});
}
bindPieceAppearance();
$('pieceSet').onchange=()=>{
 modelSet=$('pieceSet').value;moving=null;renderPieces();piecePreview?.rebuild();
 refreshPieceCatalog();
 if(modelSet==='community')loadCommunityPieces();
 if(modelSet==='anthro')loadAnthroModel();
 if(modelSet==='robotic')loadRoboticPieces();
 preloadArmyTextures();
};
$('boardSize').onchange=()=>{boardScale=Number($('boardSize').value)||0.065;};
$('whiteColor').onchange=()=>{goldMat.color.set($('whiteColor').value);renderPieces();piecePreview?.rebuild();};
$('blackColor').onchange=()=>{darkMat.color.set($('blackColor').value);renderPieces();piecePreview?.rebuild();};
$('lang').onchange=()=>{lang=$('lang').value;translate();document.documentElement.lang=lang;};
$('center').onclick=()=>{if(isAR){toast('En AR usa el control de escala.');return;}camera.position.set(8.4,10.6,11.5);orbit.target.set(0,0,0);orbit.update();};
$('rotate').onclick=()=>{if(isAR)return;camera.position.set(-camera.position.z,camera.position.y,camera.position.x);orbit.update();};
const match=new PeerMatch({
  onStatus(message){$('networkStatus').textContent=message;const el=$('roomNote');if(el)el.textContent=message;},
  onAppearance(data){
    if(mode!=='online'||!isValidWireLook(data))return;
    remoteLook=normalizeArmyLook(data);
    // El anfitrión conserva el primer color; el invitado se adapta si colisionan.
    if(!match.host){
      const approved=chooseContrastingArmy(remoteLook,myLook());
      if(approved.material!==pieceMaterial||approved.glow!==pieceGlow){
        pieceMaterial=approved.material;pieceGlow=approved.glow;
        $('pieceMaterial').value=pieceMaterial;$('pieceGlow').value=pieceGlow;
        saveArmyChoice();
        match.send({type:'APPEARANCE',...myLook()});
        toast('Se ajustó tu color para evitar confusión con el rival.');
      }
    }
    updateArmyStatus();renderPieces();piecePreview?.rebuild();preloadArmyTextures();
  },
  onMove(move){
    if(mode!=='online'||!match.host)return;
    if(move.version!==roomVersion || !playMove(move.from,move.to,move.promotion,'remote'))broadcastState();
  },
  onState(message){
    if(mode!=='online'||match.host||message.version<roomVersion)return;
    const changed=game.fen()!==message.fen;
    if(!verifyAndRestore(game,message)){
      console.warn('El anfitrión envió un estado de ajedrez inconsistente. Se descartó.');
      toast('No se pudo validar la posición recibida del rival.');
      return;
    }
    roomVersion=message.version;
    if(changed){ghostHint?.clear();selected=null;arcaneUI?.selected(null);moving=null;renderPieces();}
    updateStatus();
  },
  onReady(isHost){
    if(isHost){broadcastState();}else{match.send({type:'HELLO'});}
    match.send({type:'APPEARANCE',...myLook()});
    updateArmyStatus();renderPieces();preloadArmyTextures();
    gotoView('game');updateStatus();
  }
});
connectedMatch=match;
victoryFX=createVictoryFX({
  onNewGame:()=>{
    if(mode==='online'&&!match.host){toast('Solo el anfitrión puede reiniciar el duelo.');return;}
    reset();
  },
  onBackToMenu:()=>gotoView('menu')
});
function setGameMode(next){
  if(next!=='online' && mode==='online')match.close();
  if(next==='online'&&mode!=='online')remoteLook=null;
  mode=next;$('mode').value=next;
  updateArmyStatus();
  $('difficulty').disabled=next!=='bot';$('undo').disabled=next==='online';
  $('networkStatus').textContent=next==='online'?'DUELO ONLINE · BETA':next==='bot'?'VERSUS COMPUTADORA':'DOS JUGADORES LOCALES';
}
function gotoView(view){
  if(view!=='game')realmImmersion?.exit();
  if(view!=='game'&&missionActive)leaveQuest(false);
  if(isAR && view!=='game'){voluntaryArExit=true;arInterrupted=false;arSession?.end().catch(()=>finishAR());}
  document.body.dataset.view=view;
  if(view==='menu')$('resumeGame').style.display=gameStarted?'block':'none';
  if(view==='game'){
    gameStarted=true;resize();
    $('networkStatus').textContent=mode==='online'?('SALA '+match.room+(match.connected()?' · CONECTADA':' · ESPERANDO')):(mode==='bot'?'VERSUS COMPUTADORA':'DUELO LOCAL');
  }
  syncVictory();
}
function transitionTo(view){
  $('loadingPortal').classList.add('show');
  $('portalText').textContent=view==='game'?'INVOCANDO CAMPO DE BATALLA…':'PREPARANDO EL PORTAL…';
  setTimeout(()=>{gotoView(view);$('loadingPortal').classList.remove('show');},420);
}
function setAccount(next){
  if(!next){
    // Un invitado local puede entrar aunque Firebase tarde en responder.
    if(guestLocal)return;
    account=null;
    if(document.body.dataset.view==='menu')gotoView('welcome');
    return;
  }
  account=next;guestLocal=false;
  $('accountState').textContent=(next.name||'JUGADOR')+' · '+(next.provider==='google'?'Google':'Invitado Firebase');
  restoreLastGame();
  if(document.body.dataset.view==='welcome')transitionTo('menu');
}
async function startAccountAuth(){
  $('loginGoogleBtn').disabled=true;
  const good=await initializeAccountAuth(setAccount,error=>{
    $('loginStatus').textContent='Google/Firebase: '+(error.code||error.message||'no disponible')+'. El invitado local funciona.';
  });
  $('loginGoogleBtn').disabled=!authAvailable();
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
  $('accountState').textContent='INVITADO · sesión local sin nube';restoreLastGame();transitionTo('menu');
  // When phone's native camera opens our own room QR URL, join after guest entry.
  // No external QR links are followed; room is prevalidated below.
  const code=new URL(location.href).searchParams.get('room');
  if(code&&/^[A-HJ-NP-Z2-9]{6}$/.test(code.toUpperCase()))
   setTimeout(()=>{if(document.body.dataset.view==='menu'){$('joinCode').value=code.toUpperCase();$('joinBtn').click();}},520);
};
$('logoutBtn').onclick=async()=>{
  match.close();
  clearTimeout(timer);
  gameStarted=false;game.reset();selected=null;moving=null;renderPieces();updateStatus();
  setGameMode('bot');
  account=null;guestLocal=false;
  try{if(authAvailable())await logoutFirebase();}catch(error){}
  gotoView('welcome');
};
$('menuBot').onclick=()=>{setGameMode('bot');transitionTo('settings');};
$('menuLocal').onclick=()=>{setGameMode('local');transitionTo('settings');};
$('menuSettings').onclick=()=>transitionTo('settings');
$('resumeGame').onclick=()=>transitionTo('game');
let diagnosticReport='';
async function runDiagnostics(){
  const lines=['ECOAJEDREZ AR · diagnóstico local · '+(document.querySelector('[data-app-version]')?.textContent||'v0.7.0-beta.1'),'Fecha: '+new Date().toISOString()];
  const check=(name,good,note='')=>lines.push((good?'✓ ':'! ')+name+(note?' — '+note:''));
  check('HTTPS o localhost',window.isSecureContext,'AR requiere contexto seguro');
  let webgl=false;
  try{const canvas=document.createElement('canvas');webgl=Boolean(canvas.getContext('webgl2'));}catch(error){}
  check('WebGL2 para tablero 3D',webgl);
  check('Intermediario Google protegido disponible',authAvailable(),'Requiere servidor Cloudflare; invitado funciona sin ello');
  check('PeerJS cargado',typeof window.Peer==='function','No garantiza conexión entre redes');
  check('Generador QR',typeof window.QRCode==='function');
  check('Micrófono Web Speech',Boolean(window.SpeechRecognition||window.webkitSpeechRecognition),'Puede pedir permiso');
  check('Conexión declarada por navegador',navigator.onLine!==false,'No garantiza conectividad externa');
  check('Modelos glTF', [...assets.values()].filter(Boolean).length===6,
    [...assets.values()].filter(Boolean).length+' / 6 cargados');
  if(navigator.xr?.isSessionSupported){
    try{
      const supported=await navigator.xr.isSessionSupported('immersive-ar');
      check('WebXR immersive-ar',supported,'Comprueba compatibilidad, no la cámara en funcionamiento');
    }catch(error){check('WebXR immersive-ar',false,'No se pudo consultar: '+String(error.message||error));}
  }else check('WebXR immersive-ar',false,'Navegador sin WebXR');
  lines.push('Modo de partida: '+mode+(mode==='online'?' · enlace '+(match.connected()?'conectado':'sin conectar'):''), 
    'Sistema/navegador: '+navigator.userAgent,
    'Nota: este informe contiene información del equipo; compártelo solo voluntariamente.');
  diagnosticReport=lines.join('\n');
  $('diagnosticOutput').textContent=diagnosticReport;
}
$('diagnoseBtn').onclick=()=>{
  $('diagnosticPanel').classList.add('visible');
  $('diagnosticOutput').textContent='Comprobando compatibilidad…';
  runDiagnostics();
};
$('closeDiagnostic').onclick=()=>$('diagnosticPanel').classList.remove('visible');
$('copyDiagnostic').onclick=async()=>{
  try{await navigator.clipboard.writeText(diagnosticReport);toast('Diagnóstico copiado.');}
  catch(error){toast('No se pudo copiar automáticamente. Selecciona el texto del informe.');}
};
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')$('diagnosticPanel').classList.remove('visible');
});

$('downloadPgn').onclick=()=>{
  const pgn=game.pgn();
  if(!pgn){toast('Aún no hay jugadas para exportar.');return;}
  const blob=new Blob([pgn+'\n'],{type:'application/x-chess-pgn;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='ecoajedrez-'+new Date().toISOString().slice(0,10)+'.pgn';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
let qrReader=null;
$('menuJoin').onclick=()=>{
  const panel=$('joinPanel');
  panel.classList.toggle('visible');
  if(panel.classList.contains('visible'))$('joinCode').focus();
  else qrReader?.stop();
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
    // The QR embeds the room URL, but the lengthy URL is intentionally not shown on screen.
    const actions=document.createElement('div');actions.className='room-actions';panel.appendChild(actions);
    const copy=document.createElement('button');copy.textContent='⧉ COPIAR CÓDIGO';
    copy.onclick=async()=>{try{await navigator.clipboard.writeText(code);toast('✦ Código de duelo copiado.');}
      catch(error){toast('Selecciona el código de seis caracteres que aparece arriba.');}};
    actions.appendChild(copy);
    const infoQR=document.createElement('div');infoQR.className='version';infoQR.textContent='ESCANEA EL SELLO DEL PORTAL PARA UNIRTE';panel.appendChild(infoQR);
    if(window.QRCode){const qr=document.createElement('div');qr.id='roomQR';panel.appendChild(qr);new window.QRCode(qr,{text:url.href,width:156,height:156});}
    else{const note=document.createElement('p');note.textContent='✧ El QR no está disponible. Comparte los seis caracteres.';panel.appendChild(note);}
    const enter=document.createElement('button');enter.textContent='♟ VER ARENA MIENTRAS ESPERO';enter.onclick=()=>transitionTo('game');panel.appendChild(enter);
  }catch(error){toast(error.message||'No se pudo crear sala');setGameMode('bot');}
};
$('joinBtn').onclick=()=>{
  const code=$('joinCode').value.trim().toUpperCase();
  if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code)){
   $('qrScannerStatus').textContent='El código debe tener seis símbolos válidos. Comprueba la invitación.';
   $('joinFeedback').textContent='Introduce seis caracteres válidos o escanea el QR de la otra persona.';
   $('joinCode').focus();
   return;
  }
  qrReader?.stop();
  setGameMode('online');reset();roomVersion=0;
  try{match.join(code);$('networkStatus').textContent='CONECTANDO…';}
  catch(error){toast(error.message);setGameMode('bot');}
};
$('joinCode').onkeydown=event=>{if(event.key==='Enter')$('joinBtn').click();};
qrReader=setupQrJoin({
 onRoom(code){
  $('joinPanel').classList.add('visible');
  $('joinCode').value=code;
  $('joinBtn').click(); // Same validated PeerJS workflow as typing the six symbols.
 },
 onStatus(message){
  $('qrScannerStatus').textContent=message;
  $('joinFeedback').textContent=message;
 },
 hideJoinPanel:() => !$('joinPanel').classList.contains('visible')
});
$('backToMenu').onclick=()=>transitionTo('menu');
// The opponent (bot/local/online) is distinct from the experience (3D/360/AR).
const experienceRadios=[...document.querySelectorAll('input[name="experienceMode"]')];
let chosenExperience='normal',experienceCheck=0;
try{chosenExperience=validExperience(localStorage.getItem('ecoajedrez-view-mode')||'normal');}catch(error){}
function chooseExperience(next){
  chosenExperience=validExperience(next);
  for(const radio of experienceRadios)radio.checked=radio.value===chosenExperience;
  try{localStorage.setItem('ecoajedrez-view-mode',chosenExperience);}catch(error){}
  const labels={normal:'⚔ JUGAR EN 3D CLÁSICO',skybox:'✦ JUGAR EN REINO 360°',ar:'◎ JUGAR EN AR CON PORTAL'};
  $('startConfigured').textContent=labels[chosenExperience];
  refreshExperienceStatus();
}
async function refreshExperienceStatus(){
  const status=$('experienceStatus'),board=window.ecoBoardCatalogue?.getSelected()||'classic';
  const selected=chosenExperience,seq=++experienceCheck;
  status.dataset.warning='false';
  if(selected==='normal'){status.textContent='3D clásico: '+gameRealmName(board)+' con tablero jugable y paisaje panorámico.';return;}
  if(selected==='ar'){
    status.textContent='AR con portal: usarás la cámara real. Apunta a una mesa o suelo para fijar el tablero. No camines mirando únicamente la pantalla.';
    return;
  }
  status.textContent='Comprobando las seis imágenes del reino '+gameRealmName(board)+'…';
  const result=await checkSkybox(board);
  if(seq!==experienceCheck)return;
  status.dataset.warning=String(!result.ready);
  status.textContent=result.ready?'✓ Skybox 360° listo: '+result.realm.label+'. El tablero aparecerá delante de ti.':
   (result.reason||'Este reino necesita sus seis caras Skybox para jugar en 360°');
}
experienceRadios.forEach(radio=>radio.addEventListener('change',event=>chooseExperience(event.target.value)));
document.addEventListener('eco:board-skin-select',refreshExperienceStatus);
chooseExperience(chosenExperience);
let startingConfigured=false;
$('startConfigured').onclick=async()=>{
  if(startingConfigured)return;
  const experience=chosenExperience;
  setGameMode($('mode').value);
  if(mode==='online'&&!match.connected()){toast('Conecta primero el duelo online desde el menú.');gotoView('menu');return;}
  // Do not leave configuration for an incomplete 360° world.
  if(experience==='skybox'){
    startingConfigured=true;$('startConfigured').disabled=true;
    const check=await checkSkybox(window.ecoBoardCatalogue?.getSelected()||'classic');
    startingConfigured=false;$('startConfigured').disabled=false;
    if(!check.ready){
      $('experienceStatus').dataset.warning='true';
      $('experienceStatus').textContent=check.reason||'Skybox incompleto.';
      toast('Faltan imágenes del reino. Elige 3D clásico o sube las seis caras.');
      return;
    }
  }
  reset();
  // AR requestSession MUST run from the same user click (transient activation).
  gotoView('game');
  if(experience==='skybox')realmImmersion?.enter();
  else if(experience==='ar')startAR();
};
// Accessible game actions preserve active board state and do not send PeerJS packets.
const toolsPanel=$('gameTools'),menuButton=$('gameMenuBtn');
function closeGameTools(){toolsPanel.hidden=true;menuButton.setAttribute('aria-expanded','false');}
function openGameTools(){
  realmImmersion?.showUI(true);
 toolsPanel.hidden=false;menuButton.setAttribute('aria-expanded','true');
 $('toolsTheme').value=theme;
 $('toolsTheme').disabled=Boolean(realmTheme(window.ecoBoardCatalogue?.getSelected()));
 $('toolsHistoryList').hidden=true;
 $('toolsClose').focus({preventScroll:true});
}
menuButton.onclick=openGameTools;
$('toolsClose').onclick=closeGameTools;
$('toolsContinue').onclick=closeGameTools;
function showLastMove(){
 ghostHint?.show(game.history({verbose:true}));
 closeGameTools();
}
$('lastMoveBtn').onclick=showLastMove;
$('toolsLastMove').onclick=showLastMove;
$('quickArBtn').onclick=()=>startAR();
$('toolsAR').onclick=()=>{closeGameTools();startAR();};
function launchRealmChess(){
 closeGameTools();
 if(isAR){toast('Sal de AR para entrar al reino virtual 360°.');return;}
 chooseExperience('skybox');
 realmImmersion?.enter();
}
$('realmEnterBtn').onclick=launchRealmChess;
$('realmQuickBtn').onclick=launchRealmChess;
$('toolsTheme').onchange=event=>{
 const next=event.target.value;
 if(![...$('theme').options].some(o=>o.value===next))return;
 $('theme').value=next;
 $('theme').dispatchEvent(new Event('change',{bubbles:true}));
 toast('✦ Nuevo escenario: '+$('theme').selectedOptions[0].textContent);
};
$('toolsHistory').onclick=()=>{
 const moves=game.history(),out=$('toolsHistoryList');
 out.hidden=!out.hidden;
 out.textContent=!out.hidden?(moves.length?moves.map((san,i)=>(i%2===0?(Math.floor(i/2)+1)+'. ':'')+san).join('  '):'Aún no hay movimientos.'):'';
};
$('toolsSave').onclick=()=>{$('downloadPgn').click();closeGameTools();};
$('toolsLegal').onclick=()=>{closeGameTools();window.ecoLegal?.openInfo();};
$('toolsExit').onclick=()=>{closeGameTools();gotoView('menu');};
toolsPanel.addEventListener('click',event=>{if(event.target===toolsPanel)closeGameTools();});
toolsPanel.addEventListener('keydown',event=>{if(event.key==='Escape'){closeGameTools();menuButton.focus();}});
$('quality').addEventListener('change',event=>{
 magicEnv?.setProfile(event.target.value,theme);
 try{localStorage.setItem('ecoajedrez-graphics-profile',event.target.value);}catch(e){}
});
const invite=new URL(location.href).searchParams.get('room');
if(invite){
 const sanitized=String(invite).trim().toUpperCase();
 if(/^[A-HJ-NP-Z2-9]{6}$/.test(sanitized)){
  $('joinCode').value=sanitized;
  $('joinPanel').classList.add('visible');
 }
}
startAccountAuth();

let arSession=null, arSpace=null, lastHit=null, lastHitResult=null, spatialAnchor=null, arPointerStart=null;
let arInterrupted=false, voluntaryArExit=false;
function offerARRecovery(){
  if(document.hidden||isAR||!arInterrupted)return;
  $('arRecoveryPanel').classList.add('visible');
}
$('arRecover2d').onclick=()=>{
  $('arRecoveryPanel').classList.remove('visible');
  arInterrupted=false;
  gotoView('game');resize();
};
$('arRecoverAR').onclick=()=>{
  $('arRecoveryPanel').classList.remove('visible');
  arInterrupted=false;
  startAR(); // Real user gesture is required again; automatic camera launch is forbidden.
};
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&isAR&&arSession){
    arInterrupted=true;voluntaryArExit=false;
    // WebXR camera textures may become invalid when Android locks the screen.
    try{Promise.resolve(arSession.end()).catch(()=>finishAR());}
    catch(error){finishAR();}
  }else if(!document.hidden){
    requestAnimationFrame(()=>{resize();offerARRecovery();});
  }
});
window.addEventListener('pageshow',()=>{requestAnimationFrame(()=>{resize();offerARRecovery();});});
window.addEventListener('orientationchange',()=>setTimeout(resize,150));
let arPicking='touch', lastARPick=0, aimedSquare=null;
const pointers=new Set();
function arHint(message){$('arHint').textContent=message;}
function showAR(){
  arRoom?.clear();
  $('arRoomStatus').textContent='Apunta a una mesa o suelo y fija el tablero. No camines guiándote por las paredes digitales.';
  $('arRoomToggle').textContent='👁 Ocultar paredes';
  $('arRoomToggle').setAttribute('aria-pressed','true');
  document.body.classList.add('xr-active');
  arPortal?.setVisible(false);
  $('placeArBtn').style.display='inline-block';
  $('arTouchBtn').style.display='inline-block';
  $('arAimBtn').style.display='inline-block';
  $('exitArBtn').style.display='inline-block';
  $('arScale').value='1';
  setARPicking('touch');
  arHint('Busca una mesa o suelo, después pulsa FIJAR TABLERO.');
}
function hideAR(){
  arRoom?.clear();
  arPortal?.setVisible(false);
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
  world.position.copy(p);world.position.y+=.018;
  // Tables are horizontal: WebXR hit poses can contain a rotation that
  // otherwise flips the XZ chess board vertically on some Android devices.
  world.quaternion.identity();
  world.scale.setScalar(boardScale*Number($('arScale').value));
  world.visible=true;boardPlaced=true;reticle.visible=false;hitRequested=true;
  // Real XR anchors provide a steadier position when supported.
  // If anchor creation is unavailable, the existing local-space hit pose still works.
  if(lastHitResult && typeof lastHitResult.createAnchor==='function'){
    const thisSession=arSession;
    lastHitResult.createAnchor().then(anchor=>{
      if(isAR&&boardPlaced&&arSession===thisSession){spatialAnchor=anchor;}
      else anchor.delete?.();
    }).catch(()=>{}); // Anchors are optional on AR-capable browsers.
  }
  arPortal?.setVisible(true); // Decoration tied to tracked board only.
  // Six aligned kingdom photos enclose a 3D chamber. Camera passthrough remains visible.
  arRoom?.place(window.ecoBoardCatalogue?.getSelected()||'classic',world.position.clone());
  $('arRoomStatus').textContent='Cargando seis paredes del reino… puedes seguir jugando al ajedrez.';
  $('placeArBtn').style.display='none';setARPicking('touch');
  arHint('Tablero fijado con portal decorativo. Toca una pieza y su destino para jugar. Mantén visible tu entorno real.');
  return true;
}
function setHologram(){
  if(!isAR)return;
  // Sin hit-test, no se promete anclaje a superficie: posición de referencia local.
  world.position.set(0,-.35,-1.4);world.quaternion.identity();
  world.scale.setScalar(boardScale*Number($('arScale').value));
  world.visible=true;boardPlaced=true;lastHit=null;lastHitResult=null;reticle.visible=false;
  arPortal?.setVisible(false); // Unanchored holograms must not pretend to map safe physical space.
  arRoom?.clear();
  $('arRoomStatus').textContent='Sin superficie detectada: el holograma no está anclado. Cuarto inmersivo desactivado.';
  $('placeArBtn').style.display='none';
  arHint('Holograma AR sin detección de mesa. Se puede jugar, pero no está anclado a una superficie.');
}
async function startAR(){
  realmImmersion?.exit();
  if(isAR || !renderer)return;
  if(!window.isSecureContext){toast('AR requiere HTTPS.');return;}
  if(!navigator.xr){toast('WebXR AR no disponible en este navegador. Sigue jugando en 3D.');return;}
  let session=null;
  try{
    // Mismo enfoque probado en 3 LINE-AR: hit-test opcional + DOM overlay.
    session=await navigator.xr.requestSession('immersive-ar',{
      optionalFeatures:['hit-test','dom-overlay','local-floor','bounded-floor','anchors'],
      domOverlay:{root:document.body}
    });
    arInterrupted=false;voluntaryArExit=false;
    $('arRecoveryPanel').classList.remove('visible');
    arSession=session;isAR=true;boardPlaced=false;lastHit=null;lastHitResult=null;spatialAnchor=null;hitSource=null;hitRequested=false;
    world.visible=false;scene.background=null;orbit.enabled=false;magicEnv?.setAR(true);
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
    if(session){try{await session.end();}catch(error2){finishAR();}}
    else if(isAR)finishAR();
  }
}
function finishAR(){
  const wasActive=isAR;
  if(wasActive&&!voluntaryArExit)arInterrupted=true;
  if(arSession)arSession.removeEventListener('select',onARXRSelect);
  if(hitSource){try{hitSource.cancel();}catch(error){}hitSource=null;}
  if(spatialAnchor){try{spatialAnchor.delete?.();}catch(error){}spatialAnchor=null;}
  arSession=null;arSpace=null;lastHit=null;lastHitResult=null;hitRequested=false;isAR=false;boardPlaced=true;
  pointers.clear();arPointerStart=null;
  world.position.set(0,0,0);world.quaternion.identity();world.scale.setScalar(1);
  world.visible=true;reticle.visible=false;orbit.enabled=true;
  arRoom?.clear();
  hideAR();setTheme(theme);magicEnv?.setAR(false);
  resize();
  offerARRecovery();
  voluntaryArExit=false;
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
    const sq=boardPlaced?closestARSquare(event.clientX,event.clientY):null;
    const piece=sq?game.get(sq):null;
    arPointerStart={id:event.pointerId,x:event.clientX,y:event.clientY,square:sq};
    if(arPicking==='touch'&&piece&&piece.color===game.turn()&&canPlay()){
      // Start the visual "grab" immediately when finger presses the screen.
      // This is touchscreen drag, NOT real 3D hand tracking or depth occlusion.
      pickSquare(sq);
      arHint('✦ Pieza levantada: arrastra sobre la pantalla hacia la casilla de destino.');
    }
  }else arPointerStart=null;
}
function onARPointerMove(event){
  if(!isAR||!boardPlaced||arPicking!=='touch')return;
  const p=arPointerStart;
  if(!p||p.id!==event.pointerId||!p.square||selected!==p.square)return;
  if(Math.hypot(event.clientX-p.x,event.clientY-p.y)<16)return;
  const target=closestARSquare(event.clientX,event.clientY);
  if(target && target!==p.square)arHint('✦ SOLTAR EN '+target.toUpperCase()+' · confirma con el dedo');
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
  if(spatialAnchor&&arSpace&&boardPlaced){
    try{
      const tracked=frame.getPose(spatialAnchor.anchorSpace,arSpace);
      if(tracked){
        const p=tracked.transform.position;
        world.position.set(p.x,p.y+.018,p.z);
        arRoom?.moveTo(world.position);
      }
    }catch(error){} // Some WebXR implementations do not expose the anchor pose.
  }
  if(hitSource&&!boardPlaced){
    const result=frame.getHitTestResults(hitSource);
    if(!result.length){reticle.visible=false;lastHit=null;lastHitResult=null;return;}
    const pose=result[0].getPose(arSpace);
    if(!pose){reticle.visible=false;lastHit=null;lastHitResult=null;return;}
    const mat=new THREE.Matrix4().fromArray(pose.transform.matrix);
    reticle.position.setFromMatrixPosition(mat);
    reticle.quaternion.setFromRotationMatrix(mat);
    reticle.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2));
    reticle.visible=true;lastHit=mat;lastHitResult=result[0];
  }
  if(boardPlaced&&arPicking==='aim'){
    aimedSquare=closestARSquare(window.innerWidth/2,window.innerHeight/2);
    $('arSelectBtn').disabled=!aimedSquare;
    $('arHint').textContent=aimedSquare?'OBJETIVO: '+aimedSquare.toUpperCase()+' · pulsa SELECCIONAR':'Apunta la cruz a una casilla del tablero.';
  }
}
$('startArBtn').onclick=()=>{startAR();};
$('placeArBtn').onclick=placeARBoard;
$('exitArBtn').onclick=()=>{voluntaryArExit=true;arInterrupted=false;arSession?.end().catch(()=>finishAR());};
$('arFixBtn').onclick=()=>{
  if(!isAR){offerARRecovery();return;}
  arInterrupted=true;voluntaryArExit=false;
  try{Promise.resolve(arSession?.end()).catch(()=>finishAR());}
  catch(error){finishAR();}
};

$('arTouchBtn').onclick=()=>setARPicking('touch');
$('arAimBtn').onclick=()=>setARPicking('aim');
$('arSelectBtn').onclick=selectAimedSquare;
$('arScale').oninput=()=>{
 if(isAR&&boardPlaced)world.scale.setScalar(boardScale*Number($('arScale').value));
};
$('arRoomSize').onchange=event=>{
 const size=arRoom?.setSize(event.target.value)||arRoomSize(event.target.value);
 if(arRoom?.ready())$('arRoomStatus').textContent='Cuarto '+size.label+' · '+size.width+' m; no señala los límites físicos seguros.';
};
$('arRoomOpacity').oninput=event=>arRoom?.setOpacity(event.target.value);
$('arRoomToggle').onclick=()=>{
 if(!arRoom?.ready()){$('arRoomStatus').textContent='Primero fija el tablero y espera que carguen las seis paredes.';return;}
 const next=arRoom.setVisible(!arRoom.visible());
 $('arRoomToggle').textContent=next?'👁 Ocultar paredes':'👁 Mostrar paredes';
 $('arRoomToggle').setAttribute('aria-pressed',String(next));
 $('arRoomStatus').textContent=next?'Paredes visuales activadas: mantén el entorno físico a la vista.':'Paredes ocultas: la cámara real sigue visible y la partida continúa.';
};
$('arBoardPreset').onchange=event=>{
 const amount={normal:1,grande:2.8,colosal:5.6}[event.target.value]||1;
 $('arScale').value=String(amount);
 if(isAR&&boardPlaced)world.scale.setScalar(boardScale*amount);
 const width=(8*boardScale*amount).toFixed(2);
 $('arRoomStatus').textContent='Tablero y piezas a escala '+width+' m de ancho. Comprueba que tu espacio real está libre.';
};
document.addEventListener('pointerdown',onARPointerDown,true);
document.addEventListener('pointermove',onARPointerMove,true);
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
  else if(!realmImmersion?.active())orbit.update(); // OrbitControls must not overwrite free 360° look.
  if(moving){
    const progress=Math.min(1,(timestamp-moving.start)/moving.duration);
    const smooth=progress*progress*(3-2*progress);
    moving.piece.position.set(
      moving.a.x+(moving.b.x-moving.a.x)*smooth,
      .07 + Math.sin(progress*Math.PI)*.34,
      moving.a.z+(moving.b.z-moving.a.z)*smooth
    );
    if(modelSet==='robotic'&&moving.piece.userData.robotic){
      const type=moving.piece.userData.pieceType;
      const arc=Math.sin(progress*Math.PI);
      const stride=Math.sin(progress*Math.PI*(type==='n'?2:6));
      // Los GLB originales son mallas rígidas: animación de marcha/salto sin deformar la geometría.
      moving.piece.position.y=.07+arc*(type==='n'?.69:type==='r'?.035:.10);
      moving.piece.rotation.z=stride*arc*(type==='r'?.018:.047);
      moving.piece.rotation.x=Math.sin(progress*Math.PI*2)*arc*(type==='n'?.12:.035);
    }
    if(progress>=1){moving.piece.rotation.z=0;moving.piece.rotation.x=0;moving=null;}
  }
  if(modelSet==='anthro'){
    const t=timestamp||performance.now();
    tickAnthroVisuals(pieces,moving,t,lastAnthroTick?Math.max(0,(t-lastAnthroTick)/1000):0);
    lastAnthroTick=t;
  }
  combatFX?.tick(timestamp||performance.now());
  piecePreview?.tick(timestamp||performance.now());
  if(theme==='jungle'&&!isAR)decorations.children.forEach((p,i)=>{p.rotation.z=Math.sin(timestamp*.0016+i*.8)*.12;});
  arcaneUI?.tick(timestamp||performance.now());
  magicEnv?.tick(timestamp||performance.now());
  renderer.render(scene,camera);
}
combatFX=createChessCombat({THREE,world,disposePiece:disposePieceGroup});
piecePreview=createPiecePreview({
 THREE,canvas:$('piecePreviewCanvas'),
 createVisual:p=>createPieceVisual(p),
 isShowing:()=>document.body.dataset.view==='settings'
});
piecePreview.rebuild($('piecePreviewType').value);

const cataloguePieceTypes=[
 ['p','Peón','♟'],['r','Torre','♜'],['n','Caballo','♞'],
 ['b','Alfil','♝'],['q','Reina','♛'],['k','Rey','♚']
];
function refreshPieceCatalog(){
 const grid=$('pieceCatalogGrid'),status=$('pieceCatalogStatus');
 if(!grid||!status)return;
 const robot=modelSet==='robotic';
 const selected=$('piecePreviewType')?.value||'q';
 grid.replaceChildren();
 for(const [type,label,glyph] of cataloguePieceTypes){
  const card=document.createElement('button');
  card.type='button';card.className='pieceCatalogCard';
  card.setAttribute('aria-label','Previsualizar '+label);
  card.setAttribute('aria-pressed',String(type===selected));
  if(robot){
   const img=document.createElement('img');
   img.loading='lazy';img.alt='Modelo robótico de '+label;
   img.src=ROBOT_ROOT+'imagenes/'+ROBOT_NAMES[type]+'.jpg';
   img.onerror=()=>{
    img.remove();
    const icon=document.createElement('span');
    icon.className='pieceCatalogGlyph';icon.textContent=glyph;
    card.prepend(icon);
   };
   card.append(img);
  }else{
   const icon=document.createElement('span');
   icon.className='pieceCatalogGlyph';icon.textContent=glyph;
   card.append(icon);
  }
  const caption=document.createElement('span');caption.textContent=label;
  card.append(caption);
  card.onclick=()=>{
   $('piecePreviewType').value=type;
   piecePreview?.rebuild(type);
   refreshPieceCatalog();
  };
  grid.append(card);
 }
 const num=chessModelTypes.filter(type=>robotAssets.has(type)).length;
 const staunton=chessModelTypes.filter(type=>assets.has(type)&&assets.get(type)).length;
 const messages={
  anthro:'Guardianes animados: seis tipos disponibles con anatomía geométrica y movimiento por código.',
  staunton:'Clásicas talladas: '+staunton+' / 6 modelos GLTF descargados; respaldo geométrico si falta alguno.',
  royal:'Corte imperial: '+staunton+' / 6 GLTF base y adornos originales del juego.',
  fantasy:'Runas encantadas: seis figuras generadas por el motor 3D.',
  classic:'Estrategas esenciales: seis figuras generadas por el motor 3D.',
  robotic:'Guardianes robóticos: '+num+' / 6 modelos GLB cargados; seis retratos disponibles. El resto usa respaldo temporal.',
  community:'Colección externa CC0: los doce GLB son opcionales y deben estar completos.'
 };
 status.textContent=messages[modelSet]||'Colección preparada para jugar.';
}
refreshPieceCatalog();

// One small manifest probe enables the set. Download heavy GLBs only when selected.
async function checkRoboticPack(){
 const option=$('roboticPieceOption');
 if(!option)return;
 try{
   const response=await fetch(ROBOT_ROOT+'manifest.json',{cache:'no-store'});
   if(!response.ok)throw Error('manifest HTTP '+response.status);
   const manifest=await response.json();
   if(manifest.ready!==true||!Array.isArray(manifest.models)||manifest.models.length!==6)
     throw Error('incomplete robotic pack');
   option.disabled=false;
   option.textContent='Guardianes robóticos · 6 GLB + 6 retratos';
   refreshPieceCatalog();
   if(modelSet==='robotic')await loadRoboticPieces();
 }catch(error){
   option.disabled=true;option.textContent='Guardianes robóticos · sin publicación completa';
   if(modelSet==='robotic'){$('pieceSet').value='anthro';modelSet='anthro';renderPieces();piecePreview?.rebuild();}
   refreshPieceCatalog();
 }
}
checkRoboticPack().catch(error=>console.warn('Pack robótico',error));
setTimeout(dismissGameplayHint,3400);
arcaneUI=createArcaneUI({THREE,world});
try{const saved=localStorage.getItem('ecoajedrez-graphics-profile');if(['auto','low','medium','high'].includes(saved))$('quality').value=saved;}catch(e){}
magicEnv=createMagicWorld({THREE,world,scene,renderer,stage});
arPortal=createARChessPortal({THREE,world});
arRoom=createARImmersionRoom({
 THREE,scene,
 onInfo:message=>{$('arRoomStatus').textContent=message;}
});
arRoom.setSize($('arRoomSize').value);
arRoom.setOpacity($('arRoomOpacity').value);
realmImmersion=createImmersiveChess({
 THREE,scene,camera,orbit,canvas,decorations,
 getBoardId:()=>window.ecoBoardCatalogue?.getSelected()||'classic',
 onInfo:message=>toast(message),
 getInteractivePiece:(x,y)=>{
  // Los toques dentro de cualquier casilla son para jugar; no para girar el paisaje.
  return Boolean(pick3DSquare(x,y));
 }
});
ghostHint=makeLastMoveOverlay({THREE,world,positionOf,onText:text=>{$('lastMoveMessage').textContent=text;}});
magicEnv.setProfile($('quality').value,theme);
buildTiles();
// Only mask TOP faces; invisible-but-raycastable top material has no color/depth
// writes, preventing triangle artifacts while keeping chess selection untouched.
const boardTopMask=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false});
function syncBoardTexture(active,width=8.45,depth=8.45){
 for(const tile of squares){
   const material=tile.userData.boardMaterial;
   tile.material=active?[material,material,boardTopMask,material,material,material]:material;
 }
 rootBase.scale.x=active?width/8.45:1;
 rootBase.scale.z=active?depth/8.45:1;
}
boardSurface=createBoardSurface({THREE,world,renderer,onStatus:message=>{
  const target=$('boardSurfaceStatus');
  if(target)target.textContent=message;
},onSurfaceChange:({active,width,depth})=>syncBoardTexture(active,width,depth)});
function startQuest(quest){
 if(mode==='online'&&match.connected()){toast('Sal de la partida online antes de una misión.');return;}
 if(missionActive)leaveQuest(false);
 clearTimeout(timer);
 missionPrior={fen:game.fen(),pgn:game.pgn(),mode,started:gameStarted,
  board:window.ecoBoardCatalogue?.getSelected()||'classic'};
 missionActive=quest;missionSolved=false;
 try{if(quest.fen==='start')game.reset();else game.load(quest.fen);}catch(error){
  missionActive=null;missionPrior=null;toast('No fue posible preparar esta misión.');return;
 }
 setGameMode(quest.goal==='checkmate'?'bot':'local');
 window.ecoBoardCatalogue?.selectBoard('cosmos');
 document.body.classList.add('quest-playing');
 $('questHint').hidden=false;$('questHint').textContent='✦ '+quest.title+' · '+quest.hint;
 selected=null;arcaneUI?.selected(null);moving=null;renderPieces();updateStatus();
 gotoView('game');
 toast('✦ '+quest.hint);
}
function leaveQuest(showMenu=true){
 if(!missionActive)return;
 clearTimeout(timer);
 const restore=missionPrior;
 missionActive=null;missionSolved=false;missionPrior=null;
 document.body.classList.remove('quest-playing');$('questHint').hidden=true;
 if(restore){
  try{if(restore.pgn)game.loadPgn(restore.pgn);else game.load(restore.fen);}
  catch(error){game.load(restore.fen);}
  setGameMode(restore.mode);gameStarted=restore.started;
  window.ecoBoardCatalogue?.selectBoard(restore.board);
 }
 selected=null;arcaneUI?.selected(null);moving=null;renderPieces();updateStatus();
 if(showMenu)gotoView('menu');
 if(mode==='bot'&&game.turn()==='b'&&!game.isGameOver())timer=setTimeout(playBot,600);
}
const catalogue=window.ecoBoardCatalogue;
let questStorage=null;
try{questStorage=window.localStorage;}catch(error){}
questUI=createQuestMap({storage:questStorage,onLaunch:startQuest,onReturn:()=>leaveQuest(true)});
if(catalogue){
  boardSurface.select(catalogue.getSelected()).catch(()=>{});
}
document.addEventListener('eco:board-skin-select',event=>{
  const code=event.detail?.id;
  realmImmersion?.exit();
  boardSurface?.select(code).catch(()=>{});
  syncSelectedRealm(code);
  if(typeof persistCurrentGame==='function')persistCurrentGame();
});
setTheme(theme);
syncSelectedRealm(catalogue?.getSelected()||'classic');
renderPieces();updateStatus();translate();
if($('pieceSet').value==='anthro')loadAnthroModel();
renderer.setAnimationLoop(render);
preloadArmyTextures();
loadChessModels();
