/* Crust Quest Phase 4 — vertical Bakery 2: Fungal Proofing Caverns.
 * Independent level data: nothing here mutates Bakery 1 or shipped levels.
 * Main route visits the Sporekeeper relay, plunges into the cavern and
 * follows lower terraces to the oven. The upper canopy is a bonus gauntlet.
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
const cultures=[[11,48],[35,34],[63,38],[72,42],[82,49]];
const checkpoints=[[9,51],[34,35],[77,46],[82,53]];
const hazards=[[24,53],[48,53]];
const enemies=[];
const foothills={
 platforms:[[5,52,5],[10,49,6],[17,51,5],[21,48,5],[24,45,5],[27,42,5],[23,40,5],[27,38,6]],
 balcony:{x:10,y:49,w:6},door:{x:12,top:49,opening:52,bottom:54},
 encounters:[
  {x:18.5*T,y:54*T-25,type:'walker',left:16*T,right:21*T-25,hopT:0},
  {x:26*T,y:45*T-25,type:'hopper',left:25.2*T,right:28*T-25,hopT:60}
 ]
};
// Main route drops 23 tiles from the fork. Upper canopy is optional.
const plunge={
 main:[[56,31,8],[66,35,6],[60,39,6],[64,43,4],[69,43,6],[76,47,6],[80,50,4],[87,50,4],[97,49,4]],
 recovery:[[58,51,4],[58,47,4],[58,43,4]],
 bonus:[[58,28,4],[61,25,5],[65,22,5],[70,19,5],[76,22,5],[79,26,5],[74,30,5],[69,31,5]],
 encounters:[
  {x:67*T,y:22*T-25,type:'hopper',left:65.5*T,right:69.5*T-25,hopT:55},
  {x:77.5*T,y:22*T-25,type:'hopper',left:76.5*T,right:80.5*T-25,hopT:70},
  {x:81*T,y:26*T-25,type:'walker',left:79.5*T,right:83.5*T-25,hopT:0},
  {x:70*T,y:31*T-25,type:'hopper',left:69.5*T,right:73.5*T-25,hopT:65}
 ],
 throwers:[[72,19],[76,30]],supplies:[[72,18],[78,29]],fork:[61,31]
};
// Mycelium grotto: tile-aligned switches, fixed bloom and root doorway.
const relay={bounds:[32,26,56,36],switches:[[36,33,3],[41,32,3],[46,33,3]],
 sequences:[[2,0,1],[0,2,1]],bloom:[51,31,4],gate:[55,28,7],keeper:[29.4,38]};
const oven={x:102,y:52};
const bloomrot={left:85*T+12,right:103*T-12,floor:54*T,entry:84,exit:103};
const altitudeTargets=[[4,54],[45,32],[77,47]];
const sections=[
 {name:'Mycelium Foothills',start:0,end:23,description:'gentle footholds and the first starter culture'},
 {name:'Sporelit Stairways',start:24,end:55,description:'branching terraces above the glowing grotto'},
 {name:'The Deep Plunge',start:56,end:79,description:'descending shelves, starter cultures and recovery ledges; dangerous upper canopy is optional'},
 {name:'Cavern Floor',start:80,end:104,description:'lower terraces toward the ancient proofing oven'}
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
 // Replace the old mandatory canopy with a signed fork and lower route.
 for(let y=16;y<54;y++)for(let x=56;x<105;x++)map[y][x]='.';
 for(const [x,y,len] of [...plunge.main,...plunge.recovery,...plunge.bonus])for(let i=0;i<len;i++)map[y][x+i]='=';
 // Tall sealing doors prevent bypassing the fight from either shelf.
 for(let y=42;y<54;y++)map[y][103]='#';
 for(const [x,y] of hazards){
  if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Unsafe spore at '+x+','+y);
  map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y],i)=>({x:x*T+12,y:y*T,got:false,ph:i*.7})),
  enemies:enemies.map(([x,y,type,i])=>({x:x*T,y:y*T,w:25,h:25,
   vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:35+i*8}))
   .concat([...foothills.encounters,...plunge.encounters].map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}})))
   .concat(plunge.throwers.map(([x,y])=>({x:x*T,y:y*T-25,w:25,h:25,vx:0,vy:0,alive:true,type:'thrower',attackT:90,windup:0,face:-1}))),
  powerups:[[30,40,'kefir'],[63,24,'banneton'],[94,47,'rye'],...plunge.supplies.map(([x,y])=>[x,y,'cache'])]
   .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery2=Object.freeze({rows,cols,T,sections,platforms,
 cultures,checkpoints,hazards,enemies,oven,altitudeTargets,relay,foothills,plunge,
 bloomrot,apply,version:'vertical-fungal-bloomrot-v5'});
})();