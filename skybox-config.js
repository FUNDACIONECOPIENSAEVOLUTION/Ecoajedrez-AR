// ECOAJEDREZ skybox realms - pure source of truth; no rendering/game logic.
export const SKYBOX_BASE='./app/imagenes/skybox/';
export const SKYBOX_FACES=Object.freeze(['px','nx','py','ny','pz','nz']);
export const SKYBOX_REALMS=Object.freeze([
  {
    "id": "galactico_cosmico",
    "label": "Galáctico / Cósmico",
    "board": "cosmos"
  },
  {
    "id": "magico_ancestral",
    "label": "Mágico / Fantasía ancestral",
    "board": "cristales"
  },
  {
    "id": "medieval_leyenda",
    "label": "Medieval / Leyenda",
    "board": "dorado"
  },
  {
    "id": "celta_bosque",
    "label": "Celta / Bosque encantado",
    "board": "celta"
  },
  {
    "id": "volcanico_inframundo",
    "label": "Volcánico / Inframundo",
    "board": "lava"
  },
  {
    "id": "glacial_hielo",
    "label": "Glacial / Reino de hielo",
    "board": "hielo"
  },
  {
    "id": "steampunk_mecanico",
    "label": "Steampunk / Mecánico",
    "board": "steampunk"
  },
  {
    "id": "atlante_submarino",
    "label": "Atlante / Submarino",
    "board": "atlantis"
  },
  {
    "id": "egipcio_alquimia",
    "label": "Egipcio / Alquimia mística",
    "board": "egipto"
  },
  {
    "id": "cyberpunk_sintetico",
    "label": "Cyberpunk / Sintético",
    "board": "cyber"
  },
  {
    "id": "espejo_vacio",
    "label": "Espejo / Vacío",
    "board": "amatista"
  },
  {
    "id": "nigromante_gotico",
    "label": "Nigromante / Gótico",
    "board": "gotico"
  },
  {
    "id": "alquimista_eter",
    "label": "Alquimista / Éter",
    "board": "alquimia"
  }
]);
export function findSkyboxRealm(id){return SKYBOX_REALMS.find(r=>r.id===id)||null;}
export function skyboxFaceUrls(id){
 if(!findSkyboxRealm(id))return [];
 return SKYBOX_FACES.map(face=>SKYBOX_BASE+id+'/'+face+'.webp');
}
export function realmForBoard(boardId){return SKYBOX_REALMS.find(r=>r.board===boardId)||null;}
