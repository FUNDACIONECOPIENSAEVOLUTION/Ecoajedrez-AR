// Animaciones externas para THREE.Object3D. No deforman brazos/piernas.
// Importar desde el controlador de juego; coordenadas en unidades del tablero.
export function animarMovimiento(obj, destino, duracion=650, tipo='peon') {
  return new Promise(resolve => {
    const inicio=obj.position.clone(), fin=destino.clone ? destino.clone() : { ...destino };
    const t0=performance.now();
    const altura= tipo==='caballo' ? 0.65 : 0.10;
    function tick(t){
      const u=Math.min(1,(t-t0)/duracion), s=u*u*(3-2*u);
      obj.position.set(inicio.x+(fin.x-inicio.x)*s, inicio.y+(fin.y-inicio.y)*s + Math.sin(Math.PI*u)*altura, inicio.z+(fin.z-inicio.z)*s);
      obj.rotation.z=Math.sin(u*Math.PI*4)*0.035*(1-u);
      if(u<1) requestAnimationFrame(tick); else {obj.rotation.z=0;resolve();}
    }
    requestAnimationFrame(tick);
  });
}
export function animarAtaque(obj, duracion=360){
  return new Promise(resolve=>{
    const z=obj.rotation.x, t0=performance.now();
    function tick(t){const u=Math.min(1,(t-t0)/duracion);obj.rotation.x=z+Math.sin(Math.PI*u)*0.20;
      if(u<1)requestAnimationFrame(tick);else{obj.rotation.x=z;resolve();}}
    requestAnimationFrame(tick);
  });
}
export function animarCaptura(obj,duracion=380){
  return new Promise(resolve=>{const y=obj.position.y,t0=performance.now();
    function tick(t){const u=Math.min(1,(t-t0)/duracion);obj.position.y=y-u*0.35;obj.scale.setScalar(Math.max(0.01,1-u));
      if(u<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
}
