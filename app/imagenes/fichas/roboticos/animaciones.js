// Movimiento procedural provisional: NO articula extremidades ni reemplaza un rig de Blender.
// Trabaja con Object3D de three.js y posiciones en coordenadas del tablero.
export function moverRobot(obj, destino, {duracion=650, pieza='p'}={}) {
  return new Promise(resolve=>{
    const origen=obj.position.clone(), final=destino.clone(), t0=performance.now();
    const salto=pieza==='n'?0.7:0.07, giro=obj.rotation.z;
    const paso=t=>{const u=Math.min(1,(t-t0)/duracion), s=u*u*(3-2*u);
      obj.position.lerpVectors(origen,final,s);
      obj.position.y+=Math.sin(Math.PI*u)*salto;
      obj.rotation.z=giro+Math.sin(u*Math.PI*4)*0.03*(1-u);
      if(u<1) requestAnimationFrame(paso); else {obj.position.copy(final);obj.rotation.z=giro;resolve();}
    };requestAnimationFrame(paso);
  });
}
export function atacarRobot(obj, duracion=340){
 return new Promise(resolve=>{const inicial=obj.rotation.x,t0=performance.now();
 const paso=t=>{const u=Math.min(1,(t-t0)/duracion);obj.rotation.x=inicial+Math.sin(Math.PI*u)*0.25;
 if(u<1)requestAnimationFrame(paso);else{obj.rotation.x=inicial;resolve();}};requestAnimationFrame(paso);});
}
export function capturarRobot(obj,duracion=340){
 return new Promise(resolve=>{const scale=obj.scale.clone(),inicio=obj.position.y,t0=performance.now();
 const paso=t=>{const u=Math.min(1,(t-t0)/duracion);obj.scale.copy(scale).multiplyScalar(Math.max(0.01,1-u));obj.position.y=inicio-u*0.2;
 if(u<1)requestAnimationFrame(paso);else resolve();};requestAnimationFrame(paso);});
}
