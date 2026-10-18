// Local-only visual review of the latest chess.js verbose move.
// Never modifies Chess, never emits PeerJS packets or synchronises across devices.
export function lastMoveInfo(history){
  if(!Array.isArray(history)||!history.length)return null;
  const m=history[history.length-1];
  if(!m || !/^[a-h][1-8]$/.test(m.from||'') || !/^[a-h][1-8]$/.test(m.to||''))return null;
  if(!/^[pnbrqk]$/.test(m.piece||''))return null;
  return {from:m.from,to:m.to,piece:m.piece,color:m.color==='b'?'b':'w',san:String(m.san||'').slice(0,20)};
}
export function makeLastMoveOverlay({THREE,world,positionOf,onText}){
  const group=new THREE.Group();group.name='LocalOnlyLastMoveGhost';world.add(group);
  let timer=null;
  function clear(){
    clearTimeout(timer);timer=null;
    for(const child of [...group.children]){
      group.remove(child);
      child.traverse(o=>{
        if(o.isMesh){o.geometry?.dispose();if(o.material)o.material.dispose();}
        if(o.isLine){o.geometry?.dispose();if(o.material)o.material.dispose();}
      });
    }
    onText?.('');
  }
  function addMesh(geo,mat,x,y,z){
    const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);
    mesh.raycast=()=>{}; // no interactive square selection impact
    group.add(mesh);return mesh;
  }
  function show(history){
    clear();
    const move=lastMoveInfo(history);
    if(!move){onText?.('No hay jugadas anteriores para consultar.');return false;}
    const a=positionOf(move.from),b=positionOf(move.to);
    const origin=new THREE.MeshBasicMaterial({color:0x7afbe6,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide});
    const dest=new THREE.MeshBasicMaterial({color:0xffd47c,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide});
    const ghost=new THREE.MeshBasicMaterial({color:0xbaffed,wireframe:true,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
    const ringGeo=new THREE.RingGeometry(.35,.46,36);
    for(const [pos,mat] of [[a,origin],[b,dest]]){
      const ring=addMesh(ringGeo.clone(),mat.clone(),pos.x,.13,pos.z);
      ring.rotation.x=-Math.PI/2;
    }
    origin.dispose();dest.dispose();
    // Ghost of the moving piece on its previous square, not a real chess piece.
    // Shapes are distinct by type; light mesh, maximum three small objects.
    const base=addMesh(new THREE.CylinderGeometry(.23,.30,.11,12),ghost.clone(),a.x,.24,a.z);
    base.userData.localHint=true;
    const height={p:.34,n:.61,b:.72,r:.58,q:.88,k:.99}[move.piece];
    const upper=move.piece==='n'
      ?new THREE.BoxGeometry(.32,.38,.25)
      :move.piece==='p'
      ?new THREE.SphereGeometry(.19,12,8)
      :new THREE.ConeGeometry(move.piece==='r'?.25:.21,height,12);
    addMesh(upper,ghost.clone(),a.x,.34+height*.5,a.z);
    if(move.piece==='k'||move.piece==='q'){
      addMesh(new THREE.OctahedronGeometry(.11),ghost.clone(),a.x,.48+height,a.z);
    }
    ghost.dispose();
    const lineGeo=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(a.x,.15,a.z),new THREE.Vector3(b.x,.15,b.z)]);
    const beam=new THREE.Line(lineGeo,new THREE.LineDashedMaterial({color:0xffe1a0,transparent:true,opacity:.7,dashSize:.18,gapSize:.13}));
    beam.computeLineDistances();group.add(beam);
    const symbols={p:'♟',r:'♜',n:'♞',b:'♝',q:'♛',k:'♚'};
    onText?.('✦ Última jugada: '+symbols[move.piece]+' '+move.from.toUpperCase()+' → '+move.to.toUpperCase()+' · '+move.san+' · Solo visible para ti');
    timer=setTimeout(clear,4500);
    return true;
  }
  return {show,clear};
}
