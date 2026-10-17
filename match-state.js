// Reliable, engine-agnostic chess snapshot helpers. Every move is checked by chess.js.
export const MAX_MOVES=2048;
export function makeSnapshot(game,version=0){
  return {type:'STATE',fen:game.fen(),history:game.history(),version};
}
export function verifyAndRestore(game,snapshot){
  if(!snapshot||typeof snapshot.fen!=='string'||snapshot.fen.length>120)return false;
  if(!Array.isArray(snapshot.history)||snapshot.history.length>MAX_MOVES)return false;
  if(snapshot.history.some(m=>typeof m!=='string'||m.length>24))return false;
  try{
    const candidate=new game.constructor();
    for(const san of snapshot.history)candidate.move(san);
    if(candidate.fen()!==snapshot.fen)return false;
    // Only mutate the live board once all moves AND their final position match.
    game.reset();
    for(const san of snapshot.history)game.move(san);
    return true;
  }catch(error){return false;}
}
export function saveLocalMatch(storage,key,game,mode,preferences){
  if(!storage||!key||!['bot','local'].includes(mode))return false;
  try{
    storage.setItem(key,JSON.stringify({
      schema:1,updated:Date.now(),mode,snapshot:makeSnapshot(game),preferences
    }));
    return true;
  }catch(error){return false;}
}
export function readLocalMatch(storage,key,game,maxDays=90){
  try{
    const raw=storage?.getItem(key);
    if(!raw||raw.length>180000)return null;
    const data=JSON.parse(raw);
    const age=Date.now()-data.updated;
    if(data.schema!==1||!['bot','local'].includes(data.mode)||
      typeof data.updated!=='number'||age<0||age>maxDays*86400000)return null;
    if(!verifyAndRestore(game,data.snapshot))return null;
    return {mode:data.mode,preferences:data.preferences||{}};
  }catch(error){return null;}
}
