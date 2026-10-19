// Approved OPTIONAL 3D chess piece artwork, after review by project owner.
// Engine uses the original six glTF models until all 12 GLBs are published.
export const COMMUNITY_PIECES=Object.freeze(['pawn','rook','knight','bishop','queen','king']);
export const COMMUNITY_COLORS=Object.freeze(['w','b']);
export const COMMUNITY_FILES=Object.freeze(COMMUNITY_COLORS.flatMap(color=>
 COMMUNITY_PIECES.map(piece=>color+'-'+piece+'.glb')));
export const communityPiecePath=(color,piece)=>
 './assets/models/community/'+color+'-'+piece+'.glb';
export const communityPieceKey=(color,type)=>color+':'+type;
export const communityPieceHeight=Object.freeze({p:.82,r:1.12,n:1.14,b:1.24,q:1.4,k:1.55});
