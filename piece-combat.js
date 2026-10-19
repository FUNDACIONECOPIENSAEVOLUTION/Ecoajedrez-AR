// Presentation-only capture combat: the chess.js move is already legal.
// A detached defender remains visible briefly for a mirrored duel, impact and
// shrink/disappear. Uses transform animation only: works for future GLB armies.
export function faceMovement(piece,dx,dz){
 if(!piece||Math.hypot(dx,dz)<.0001)return 0;
 const yaw=Math.atan2(dx,dz);
 piece.rotation.y=yaw;
 return yaw;
}
export function createChessCombat({THREE,world,disposePiece=()=>{}}){
 const stage=new THREE.Group();stage.name='ChessCaptureDuel';world.add(stage);
 let effect=null;
 function cancel(){
  if(!effect)return;
  stage.remove(effect.defender);
  disposePiece(effect.defender);
  effect=null;
 }
 function start({defender,attacker,from,to,start,duration}){
  cancel();
  if(!defender||!attacker)return false;
  // Defender is detached from pieces BEFORE renderPieces clears old board.
  stage.add(defender);defender.position.set(to.x,.07,to.z);
  const orientation=faceMovement(defender,from.x-to.x,from.z-to.z);
  effect={defender,attacker,start,duration:Math.max(400,duration||760),orientation,
   baseScale:defender.scale.clone(),from,to};
  return true;
 }
 function tick(time){
  if(!effect)return;
  const p=Math.min(1,Math.max(0,(time-effect.start)/effect.duration));
  const d=effect.defender;
  // Both face each other, turn their torsos, strike and recoil.
  d.rotation.y=effect.orientation+Math.sin(time*.045)*(.055+Math.max(0,p-.45)*.15);
  const strike=p>=.44&&p<=.8?Math.sin((p-.44)/.36*Math.PI):0;
  d.rotation.z=strike*.16;
  const rig=d.userData.anthro;
  if(rig?.armR)rig.armR.rotation.x=-strike*.9;
  if(rig?.armL)rig.armL.rotation.x=strike*.38;
  d.position.y=.07+strike*.095;
  const shrink=p<.70?1:Math.max(.001,1-(p-.70)/.30);
  d.scale.copy(effect.baseScale).multiplyScalar(shrink);
  // Lightweight flash meshes would be expensive in AR; use original emissive pieces.
  if(p>=1)cancel();
 }
 return {start,tick,cancel,active:()=>Boolean(effect)};
}
