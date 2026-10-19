// PeerJS unranked duel for Ecoajedrez. Host validates ALL guest moves through chess.js.
// This is a cost-free beta using the public PeerJS signal server; no SLA / NAT guarantee.
const PREFIX='ecoajedrez-v06-room-';
// Six-symbol codes use a 32-character alphabet (~30 bits), suitable for casual unranked invitations.
// NOT authenticated/private server rooms. Never use for official ratings or prizes.
const ROOM_SIZE=6;
const MAX_MESSAGE_BYTES=64000;
const LETTERS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normalizeRoomCode=value=>String(value||'').trim().toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,ROOM_SIZE);
export class PeerMatch {
 constructor({onStatus,onMove,onState,onReady,onAppearance}={}){
  this.peer=null;this.conn=null;this.room='';this.host=false;
  this.onStatus=onStatus||(()=>{});this.onMove=onMove||(()=>{});
  this.onState=onState||(()=>{});this.onReady=onReady||(()=>{});
  this.onAppearance=onAppearance||(()=>{});
 }
 available(){return typeof window.Peer==='function';}
 create(){
  this.close();if(!this.available())throw Error('PeerJS no está disponible en esta conexión.');
  let code='';const nums=new Uint8Array(ROOM_SIZE);crypto.getRandomValues(nums);
  for(const n of nums)code+=LETTERS[n%LETTERS.length];
  this.room=code;this.host=true;this.onStatus('✦ Abriendo portal de duelo '+code+'…');
  const p=new window.Peer(PREFIX+code,{debug:0});
  this.peer=p;
  p.on('open',()=>this.onStatus('✦ Portal '+code+' abierto. Comparte el código o el QR.'));
  p.on('connection',conn=>{
   if(p!==this.peer){conn.close();return;}
   if(this.conn?.open){conn.close();return;}
   this.connect(conn);
  });
  p.on('error',error=>this.onStatus(
     error.type==='unavailable-id'?'✧ Código ocupado. Genera un nuevo portal.':'✧ No se pudo abrir el portal. Prueba de nuevo.'
   ));
  p.on('disconnected',()=>{
   // PeerJS signaling can disconnect even while a WebRTC data channel still works.
   if(p!==this.peer)return;
   if(this.conn?.open)this.onStatus('⚔ Duelo activo. Reconectando el portal de invitación…');
   else this.onStatus('✧ Portal temporalmente sin señal. Intentando restaurarlo…');
   try{if(!p.destroyed && p.disconnected)p.reconnect();}catch(error){}
  });
  return code;
 }
 join(input){
  const code=normalizeRoomCode(input);
  if(code.length!==ROOM_SIZE)throw Error('El código debe tener 6 caracteres.');
  this.close();if(!this.available())throw Error('PeerJS no está disponible.');
  this.room=code;this.host=false;this.onStatus('✦ Cruzando el portal '+code+'…');
  const p=new window.Peer(undefined,{debug:0});
  this.peer=p;
  p.on('open',()=>{
   if(this.peer!==p)return;
   const c=p.connect(PREFIX+code,{reliable:true,serialization:'json'});
   this.connect(c);
  });
  p.on('error',e=>this.onStatus('✧ No encontramos el portal. Confirma el código o crea uno nuevo.'));
  return code;
 }
 connect(c){
  this.conn=c;
  c.on('open',()=>{this.onStatus('⚔ Rival conectado. ¡Que comience el duelo!');this.onReady(this.host);});
  let lastMessageAt=0,burst=0;
 c.on('data',data=>{
   if(!data || typeof data!=='object' || Array.isArray(data))return;
   let encoded;
   try{encoded=JSON.stringify(data);}catch(error){return;}
   if(!encoded || encoded.length>MAX_MESSAGE_BYTES)return;
   const now=Date.now();
   burst=(now-lastMessageAt<1000)?burst+1:1;lastMessageAt=now;
   if(burst>12)return;

   if(data.type==='MOVE' && this.host && /^[a-h][1-8]$/.test(data.from||'') && /^[a-h][1-8]$/.test(data.to||'')){
    this.onMove({from:data.from,to:data.to,promotion:/^[qrbn]$/.test(data.promotion)?data.promotion:'q',version:Number.isSafeInteger(data.version)&&data.version>=0&&data.version<=5000?data.version:-1});
   } else if(data.type==='STATE' && !this.host && typeof data.fen==='string' && data.fen.length<120 && Array.isArray(data.history) && data.history.length<=2048 && Number.isSafeInteger(data.version) && data.version>=0 && data.version<=5000){
    this.onState(data);
   }else if(data.type==='APPEARANCE'&&
     typeof data.material==='string'&&data.material.length<=32&&
     /^[a-z]+$/.test(data.material)&&
     typeof data.glow==='string'&&data.glow.length<=20&&
     /^[a-z]+$/.test(data.glow)){
    // Cosméticos no influyen en chess.js, historial ni sincronización de jugadas.
    this.onAppearance({material:data.material,glow:data.glow});
   }else if(data.type==='HELLO' && this.host){this.onReady(true);}
  });
  c.on('close',()=>{if(this.conn===c){this.onStatus('✧ El rival abandonó el portal. La partida quedó pausada.');this.conn=null;}});
  c.on('error',error=>this.onStatus('✧ La conexión del duelo está inestable.'));
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
