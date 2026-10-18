// ECOAJEDREZ 0.14.2: visual-only results. Never mutate chess.js or PeerJS.
const COPY={
 es:{win:['✦ ¡GANASTE! ✦','¡Eres el ganador de la arena mágica! Has vencido a tu rival.'],
 loss:['☾ FIN DE LA BATALLA','Esta vez ganó tu rival. ¡La arena te espera para otra partida!'],
 draw:['✧ EMPATE MÁGICO ✧','La batalla terminó en tablas. ¡Una gran partida!'],
 white:['✦ ¡GANAN LAS BLANCAS! ✦','Las blancas conquistaron la arena mágica.'],
 black:['✦ ¡GANAN LAS NEGRAS! ✦','Las negras conquistaron la arena mágica.'],
 buttons:['♟ NUEVA PARTIDA','☰ VOLVER AL MENÚ','✧ VER TABLERO']},
 en:{win:['✦ YOU WON! ✦','You conquered the magical chess arena!'],
 loss:['☾ BATTLE OVER','Your opponent won this round. Try another battle!'],
 draw:['✧ MAGICAL DRAW ✧','This match ended in a draw. Well played!'],
 white:['✦ WHITE WINS! ✦','White conquered the magical chess arena.'],
 black:['✦ BLACK WINS! ✦','Black conquered the magical chess arena.'],
 buttons:['♟ NEW GAME','☰ MAIN MENU','✧ VIEW BOARD']},
 zh:{win:['✦ 你赢了！✦','恭喜你赢得魔法棋盘的胜利！'],
 loss:['☾ 对局结束','对手赢得了这局。再来一场吧！'],
 draw:['✧ 魔法平局 ✧','本局以和棋结束，精彩的对决！'],
 white:['✦ 白方获胜！✦','白方赢得了魔法竞技场！'],
 black:['✦ 黑方获胜！✦','黑方赢得了魔法竞技场！'],
 buttons:['♟ 新的一局','☰ 主菜单','✧ 查看棋盘']}
};
export function getVictoryMessage({checkmate=false,draw=false,turn='w',mode='bot',isHost=true,lang='es'}={}){
 if(!checkmate&&!draw)return null;
 const tr=COPY[lang]||COPY.es;
 let winner=null,kind='draw',which='draw';
 if(checkmate){
  winner=turn==='w'?'b':'w'; // chess.js: side to move has been mated.
  if(mode==='local'){kind='win';which=winner==='w'?'white':'black';}
  else{
   const mine=mode==='online'?(isHost?'w':'b'):'w';
   kind=winner===mine?'win':'loss';which=kind;
  }
 }
 return {kind,winner,title:tr[which][0],text:tr[which][1],
  newLabel:tr.buttons[0],menuLabel:tr.buttons[1],closeLabel:tr.buttons[2],
  emblem:kind==='draw'?'♔':kind==='loss'?'♟':'♛'};
}
export function createVictoryFX({onNewGame=()=>{},onBackToMenu=()=>{}}={}){
 const get=id=>document.getElementById(id);
 const root=get('victoryOverlay'),title=get('victoryTitle'),text=get('victoryText');
 const emblem=get('victoryEmblem'),newButton=get('victoryNewGame');
 const menuButton=get('victoryMenu'),closeButton=get('victoryClose'),sparkles=get('victorySparkles');
 if(![root,title,text,emblem,newButton,menuButton,closeButton,sparkles].every(Boolean))
  throw Error('Falta la interfaz de celebración mágica');
 let lastResult=null,priorFocus=null;
 for(let i=0;i<24;i++){
  const star=document.createElement('span');
  star.className='ecoVictorySpark';
  star.style.setProperty('--angle',String(i*137.508)+'deg');
  star.style.setProperty('--distance',String(70+(i%6)*25)+'px');
  star.style.setProperty('--delay',String((i%7)*-.19)+'s');
  sparkles.appendChild(star);
 }
 function hide(){
  if(root.hidden)return;
  root.hidden=true;
  if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});
  priorFocus=null;
 }
 function reset(){lastResult=null;hide();}
 function sync({game,mode='bot',isHost=true,lang='es',visible=false}={}){
  const result=getVictoryMessage({
   checkmate:game.isCheckmate(),draw:game.isDraw(),turn:game.turn(),mode,isHost,lang
  });
  if(!result){reset();return;}
  if(!visible){hide();return;}
  const key=game.fen()+'|'+mode+'|'+String(isHost);
  if(key===lastResult)return;
  lastResult=key;
  root.dataset.result=result.kind;
  title.textContent=result.title;text.textContent=result.text;emblem.textContent=result.emblem;
  newButton.textContent=result.newLabel;menuButton.textContent=result.menuLabel;
  closeButton.textContent=result.closeLabel;
  newButton.hidden=mode==='online'&&!isHost;
  priorFocus=document.activeElement;root.hidden=false;closeButton.focus({preventScroll:true});
 }
 newButton.addEventListener('click',()=>{hide();onNewGame();});
 menuButton.addEventListener('click',()=>{hide();onBackToMenu();});
 closeButton.addEventListener('click',hide);
 root.addEventListener('click',event=>{if(event.target===root)hide();});
 root.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();hide();}});
 return {sync,reset,hide};
}
