export function parseMoveCommand(value, locale='es') {
 const s=String(value||'').trim();
 if(!s)return null;
 let low=s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const numbers={uno:'1',dos:'2',tres:'3',cuatro:'4',cinco:'5',seis:'6',siete:'7',ocho:'8'};
 const letter={a:'a',be:'b',ce:'c',de:'d',e:'e',efe:'f',ge:'g',hache:'h',b:'b',c:'c',d:'d',f:'f',g:'g',h:'h'};
 low=low.replace(/\b(a|be|ce|de|e|efe|ge|hache|b|c|d|f|g|h)\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho)\b/g,(_,l,n)=>letter[l]+numbers[n]);
 if(/^(enroque corto|enroque|o-o|0-0)$/i.test(low))return 'O-O';
 if(/^(enroque largo|o-o-o|0-0-0)$/i.test(low))return 'O-O-O';
 const verbal=low.match(/^(peon|caballo|alfil|torre|dama|reina|rey|pawn|knight|bishop|rook|queen|king)\s+(?:de\s+|desde\s+)?([a-h][1-8])\s+(?:a\s+|hacia\s+|to\s+)?([a-h][1-8])$/);
 if(verbal)return {from:verbal[2],to:verbal[3],promotion:'q'};
 const joined=low.replace(/^(juega|mueve|mover|play|move)\s+/,'').replace(/\s+(?:a|hacia|hasta|to)\s+/g,'').replace(/\s+/g,'');
 if(/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(joined))return {from:joined.slice(0,2),to:joined.slice(2,4),promotion:joined[4]||'q'};
 const pieces={peon:'',pawn:'',caballo:'N',alfil:'B',torre:'R',dama:'Q',reina:'Q',rey:'K',knight:'N',bishop:'B',rook:'R',queen:'Q',king:'K'};
 const named=low.match(/^(caballo|alfil|torre|dama|reina|rey|knight|bishop|rook|queen|king)\s+(?:a|hacia|to|en)\s+([a-h][1-8])$/);
 if(named)return pieces[named[1]]+named[2];
 if(locale==='es' && /^[CATDR]/.test(s))return ({C:'N',A:'B',T:'R',D:'Q',R:'K'})[s[0]]+s.slice(1);
 return s;
}
