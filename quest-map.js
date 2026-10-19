// ECOAJEDREZ: first playable quest path using original chess.js board, no parallel engine.
// Galáctico / Cósmico pilot only. An optional free-play alternative always remains.
export const GALACTIC_QUESTS=Object.freeze([
 {id:1,title:'Primer paso',subtitle:'Abre el camino con tu peón.',fen:'start',from:'e2',to:'e4',hint:'Mueve el peón blanco de E2 a E4.',icon:'♙'},
 {id:2,title:'Caballo explorador',subtitle:'Desbloquea la primera curva.',fen:'start',from:'g1',to:'f3',hint:'Salta con el caballo de G1 a F3.',icon:'♘'},
 {id:3,title:'Ruta del alfil',subtitle:'Cruza el corredor de luz.',fen:'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',from:'f1',to:'c4',hint:'Lleva el alfil de F1 a C4.',icon:'♗'},
 {id:4,title:'Cristal capturado',subtitle:'Captura para abrir el portal.',fen:'4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1',from:'e4',to:'d5',hint:'El peón blanco de E4 puede capturar al negro de D5.',icon:'✦'},
 {id:5,title:'Defender al rey',subtitle:'Escapa de un jaque.',fen:'4r2k/8/8/8/8/8/8/4K3 w - - 0 1',from:'e1',to:'d1',hint:'Tu rey en E1 está en jaque. Refúgialo en D1.',icon:'♔'},
 {id:6,title:'Mate celestial',subtitle:'Un jaque mate en una jugada.',fen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',from:'g6',to:'g7',hint:'La dama blanca de G6 puede dar mate en G7.',icon:'♕'},
 {id:7,title:'Ascenso estelar',subtitle:'Corona tu peón.',fen:'4k3/6P1/8/8/8/8/8/4K3 w - - 0 1',from:'g7',to:'g8',promotion:'q',hint:'Mueve G7 a G8 para convertirlo en dama.',icon:'★'},
 {id:8,title:'Guardián galáctico',subtitle:'Batalla final contra la computadora.',fen:'start',goal:'checkmate',hint:'Derrota al BOT con las piezas blancas en una partida completa.',icon:'♚'}
]);
export const questKey='ecoajedrez-quests-galactico-v1';
export function readQuestProgress(storage){
 try{const data=JSON.parse(storage?.getItem(questKey)||'{}');return Number.isInteger(data.completed)?Math.max(0,Math.min(8,data.completed)):0;}catch(error){return 0;}
}
export function questAvailable(id,completed){return Number.isInteger(id)&&id>=1&&id<=Math.min(8,completed+1);}
export function successfulQuestMove(quest,move,game){
 if(!quest||!move)return false;
 if(quest.goal==='checkmate')return Boolean(game?.isCheckmate?.()&&game?.turn?.()==='b');
 return move.from===quest.from&&move.to===quest.to&&
  (!quest.promotion||move.promotion===quest.promotion)&&
  (quest.id!==6||Boolean(game?.isCheckmate?.()));
}
export function createQuestMap({storage,onLaunch,onReturn}){
 const $=id=>document.getElementById(id);
 const layer=$('questMap'),nodes=$('questNodes'),state=$('questMessage');
 let completed=readQuestProgress(storage),current=null;
 function render(){
  nodes.replaceChildren();
  for(const quest of GALACTIC_QUESTS){
   const available=questAvailable(quest.id,completed);
   const done=completed>=quest.id;
   const btn=document.createElement('button');
   btn.type='button';btn.className='questNode';
   btn.disabled=!available;
   btn.dataset.questId=String(quest.id);
   btn.innerHTML='<span class="questNumber">'+(done?'✓':quest.id)+'</span>'+
    '<span class="questIcon" aria-hidden="true">'+quest.icon+'</span>'+
    '<strong>'+quest.title+'</strong><small>'+quest.subtitle+'</small>'+
    '<span class="questState">'+(done?'SUPERADA':available?'JUGAR':'BLOQUEADA')+'</span>';
   btn.addEventListener('click',()=>{if(available){hide();current=quest;onLaunch(quest);}});
   nodes.append(btn);
  }
  state.textContent='Misiones superadas: '+completed+' de 8. La partida libre 3D / 360° / AR sigue disponible.';
 }
 function open(){render();layer.hidden=false;}
 function hide(){layer.hidden=true;}
 function complete(quest){
  if(!quest||!current||quest.id!==current.id)return false;
  if(quest.id===completed+1){completed=quest.id;try{storage?.setItem(questKey,JSON.stringify({completed}));}catch(error){}}
  render();return true;
 }
 $('questOpen').addEventListener('click',open);
 $('questClose').addEventListener('click',hide);
 $('questExitGame').addEventListener('click',()=>{onReturn();current=null;open();});
 return {open,hide,complete,render,current:()=>current,clear:()=>{current=null;},completed:()=>completed};
}
