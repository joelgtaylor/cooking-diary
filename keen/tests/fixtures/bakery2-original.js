/* Crust Quest Phase 4 — vertical Bakery 2: Fungal Proofing Caverns.
 * Independent level data: nothing here mutates Bakery 1 or shipped levels.
 * Main route rises through mushroom terraces, crosses the spore canopy,
 * descends the luminous basin, and finishes at the ancient proofing oven.
 */
(function(){
'use strict';
const rows=56,cols=105,T=32;
const rise=Array.from({length:17},(_,i)=>[4+i*4,52-i*2,7]);
const crest=[[67,18,9],[72,19,8],[77,21,8]];
const descent=Array.from({length:7},(_,i)=>[78+i*4,22+i*4,7]);
const branches=[[13,46,10],[20,42,9],[27,38,10],[35,34,9],
 [43,30,9],[51,26,9],[58,22,10],[65,24,10],
 [79,30,10],[83,35,9],[89,39,9],[93,45,9],
 [21,50,8],[39,44,8],[55,38,8],[68,33,7],[80,43,7],[95,50,9]];
const platforms=[[0,54,105],...rise,...crest,...descent,...branches];
const cultures=[[11,48],[35,34],[62,17],[83,27],[98,46]];
const checkpoints=[[9,51],[37,35],[71,18],[89,38]];
const hazards=[[24,53],[48,53],[78,53],[91,53]];
const enemies=[[27,45,'walker'],[50,28,'walker'],[81,30,'walker']];
const oven={x:102,y:52};
const altitudeTargets=[[4,54],[45,32],[71,18]];
const sections=[
 {name:'Mycelium Foothills',start:0,end:23,description:'gentle footholds and the first starter culture'},
 {name:'Sporelit Stairways',start:24,end:51,description:'branching terraces above the glowing grotto'},
 {name:'Fungal Canopy',start:52,end:77,description:'mushroom crown, ancient roots and airy bridges'},
 {name:'Luminous Descent',start:78,end:104,description:'downward mushroom caps toward the proofing oven'}
];
function apply({map}){
 if(!map||map.length!==rows||map[0].length!==cols)throw Error('Bakery 2 expects 105x56 map');
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)map[y][x]=y>=54?'#':'.';
 for(const [x,y,len] of platforms)for(let xx=x;xx<Math.min(cols,x+len);xx++)
   if(map[y][xx]!=='#')map[y][xx]='=';
 for(const [x,y] of hazards){
  if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Unsafe spore at '+x+','+y);
  map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y],i)=>({x:x*T+12,y:y*T,got:false,ph:i*.7})),
  enemies:enemies.map(([x,y,type],i)=>({x:x*T,y:y*T,w:25,h:25,
   vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:35+i*8})),
  powerups:[[30,40,'kefir'],[68,20,'banneton'],[94,42,'rye']]
   .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery2=Object.freeze({rows,cols,T,sections,platforms,
 cultures,checkpoints,hazards,enemies,oven,altitudeTargets,
 apply,version:'vertical-fungal-bakery-v1'});
})();