// AR portal as a small semi-transparent 3D decoration around the chessboard.
// Does not replace camera passthrough or claim any area is safe to walk through.
export function createARChessPortal({THREE,world}){
 const root=new THREE.Group();root.name='ARMagicPortal';root.visible=false;
 world.add(root);
 const azure=new THREE.MeshBasicMaterial({color:0x5fffe0,transparent:true,opacity:.72,depthWrite:false,side:THREE.DoubleSide});
 const gold=new THREE.MeshBasicMaterial({color:0xffdb90,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide});
 const geometry=new THREE.TorusGeometry(2.15,.065,8,72,Math.PI);
 const arch=new THREE.Mesh(geometry,azure);
 // Vertical glowing arch just beyond the far edge of the board (z=-4.8).
 arch.position.set(0,2.08,-5.05);
 root.add(arch);
 for(const x of [-2.15,2.15]){
  const column=new THREE.Mesh(new THREE.CylinderGeometry(.075,.11,2.18,10),gold);
  column.position.set(x,1,-5.05);root.add(column);
 }
 const circle=new THREE.Mesh(new THREE.RingGeometry(4.7,4.78,72),azure.clone());
 circle.rotation.x=-Math.PI/2;circle.position.y=-.038;root.add(circle);
 root.traverse(item=>{if(item.isMesh)item.raycast=()=>{};});
 return {setVisible(active){root.visible=Boolean(active);},get group(){return root}};
}
