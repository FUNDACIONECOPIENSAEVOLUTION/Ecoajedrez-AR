// PeerJS unranked duel for Ecoajedrez. Host validates ALL guest moves through chess.js.
// This is a cost-free beta using the public PeerJS signal server; no SLA / NAT guarantee.
const PREFIX='ecoajedrez-v04-';
const LETTERS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normalizeRoomCode=value=>String(value||'').trim().toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,6);
export class PeerMatch {
 constructor({onStatus,onMove,onState,onReady}={}){
  this.peer=null;this.conn=null;this.room='';this.host=false;
  this.onStatus=onStatus||(()=>{});this.onMove=onMove||(()=>{});
  this.onState=onState||(()=>{});this.onReady=onReady||(()=>{});
 }
 available(){return typeof window.Peer==='function';}
 create(){
  this.close();if(!this.available())throw Error('PeerJS no está disponible en esta conexión.');
  let code='';const nums=new Uint8Array(6);crypto.getRandomValues(nums);
  for(const n of nums)code+=LETTERS[n%LETTERS.length];
  this.room=code;this.host=true;this.onStatus('Creando sala '+code+'…');
  const p=new window.Peer(PREFIX+code,{debug:0});
  this.peer=p;
  p.on('open',()=>this.onStatus('Sala '+code+' abierta; comparte el código.'));
  p.on('connection',conn=>{
   if(p!==this.peer){conn.close();return;}
   if(this.conn?.open){conn.close();return;}
   this.connect(conn);
  });
  p.on('error',error=>this.onStatus('Error de sala: '+(error.type||error.message)));
  p.on('disconnected',()=>this.onStatus('Se perdió la señalización; espera o crea otra sala.'));
  return code;
 }
 join(input){
  const code=normalizeRoomCode(input);
  if(code.length!==6)throw Error('Código de sala no válido.');
  this.close();if(!this.available())throw Error('PeerJS no está disponible.');
  this.room=code;this.host=false;this.onStatus('Buscando sala '+code+'…');
  const p=new window.Peer(undefined,{debug:0});
  this.peer=p;
  p.on('open',()=>{
   if(this.peer!==p)return;
   const c=p.connect(PREFIX+code,{reliable:true,serialization:'json'});
   this.connect(c);
  });
  p.on('error',e=>this.onStatus('Conexión fallida: '+(e.type||e.message)));
  return code;
 }
 connect(c){
  this.conn=c;
  c.on('open',()=>{this.onStatus('Rival conectado · '+this.room);this.onReady(this.host);});
  c.on('data',data=>{
   if(!data || typeof data!=='object')return;
   if(data.type==='MOVE' && this.host && /^[a-h][1-8]$/.test(data.from||'') && /^[a-h][1-8]$/.test(data.to||'')){
    this.onMove({from:data.from,to:data.to,promotion:/^[qrbn]$/.test(data.promotion)?data.promotion:'q',version:Number(data.version)});
   } else if(data.type==='STATE' && !this.host && typeof data.fen==='string' && data.fen.length<120 && Number.isSafeInteger(data.version)){
    this.onState(data);
   }else if(data.type==='HELLO' && this.host){this.onReady(true);}
  });
  c.on('close',()=>{if(this.conn===c){this.onStatus('Rival desconectado: la partida permanece pausada.');this.conn=null;}});
  c.on('error',error=>this.onStatus('Error de red: '+error.message));
 }
 send(data){
  if(!this.conn?.open)return false;
  try{this.conn.send(data);return true;}catch(error){this.onStatus('No se pudo enviar jugada.');return false;}
 }
 close(){
  if(this.conn){try{this.conn.close();}catch(e){}this.conn=null;}
  if(this.peer){try{this.peer.destroy();}catch(e){}this.peer=null;}
  this.room='';this.host=false;
 }
 connected(){return Boolean(this.conn?.open);}
}
