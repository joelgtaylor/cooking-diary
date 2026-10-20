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
const checkpoints=[[9,51],[34,35],[71,18],[89,38]];
const hazards=[[24,53],[48,53],[78,53],[91,53]];
const enemies=[[81,30,'walker',2]];
const foothills={
 platforms:[[5,52,5],[10,49,6],[17,51,5],[21,48,5],[24,45,5],[27,42,5],[23,40,5],[27,38,6]],
 balcony:{x:10,y:49,w:6},door:{x:12,top:49,opening:52,bottom:54},
 encounters:[
  {x:18.5*T,y:54*T-25,type:'walker',left:16*T,right:21*T-25,hopT:0},
  {x:26*T,y:45*T-25,type:'hopper',left:25.2*T,right:28*T-25,hopT:60}
 ]
};
// Mycelium grotto: tile-aligned switches, fixed bloom and root doorway.
const relay={bounds:[32,26,56,36],switches:[[36,33,3],[41,32,3],[46,33,3]],
 sequences:[[2,0,1],[0,2,1]],bloom:[51,31,4],gate:[55,28,7],keeper:[29.4,38]};
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
 // A low passage, culture balcony and switchback climb replace the uniform
 // opening staircase. The keeper shelf and relay remain separate and peaceful.
 for(let y=38;y<54;y++)for(let x=4;x<32;x++)map[y][x]='.';
 for(const [x,y,len] of foothills.platforms)for(let i=0;i<len;i++)map[y][x+i]='=';
 for(let y=52;y<54;y++)for(let x=5;x<10;x++)map[y][x]='#';
 for(let x=10;x<16;x++)map[49][x]='#';
 for(let y=49;y<52;y++)map[y][12]='#';
 // Keep the approved compact chamber local to Sporelit Stairways.
 for(let y=20;y<39;y++)for(let x=33;x<56;x++)map[y][x]='.';
 for(let x=32;x<56;x++){map[26][x]='#';map[35][x]='=';}
 for(let y=26;y<33;y++)map[y][32]='#';
 for(let y=26;y<35;y++)map[y][55]='#';
 for(let x=56;x<64;x++)map[28][x]='=';
 for(let x=56;x<60;x++)map[31][x]='=';
 for(const [x,y,len] of relay.switches)for(let i=0;i<len;i++)map[y][x+i]='M';
 for(const [x,y] of hazards){
  if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Unsafe spore at '+x+','+y);
  map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y],i)=>({x:x*T+12,y:y*T,got:false,ph:i*.7})),
  enemies:enemies.map(([x,y,type,i])=>({x:x*T,y:y*T,w:25,h:25,
   vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:35+i*8}))
   .concat(foothills.encounters.map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}}))),
  powerups:[[30,40,'kefir'],[68,20,'banneton'],[94,42,'rye']]
   .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery2=Object.freeze({rows,cols,T,sections,platforms,
 cultures,checkpoints,hazards,enemies,oven,altitudeTargets,relay,foothills,
 apply,version:'vertical-fungal-foothills-v3'});
})();