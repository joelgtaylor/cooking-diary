/* CRUST_PHASE5_CLOCKWORK_WORLD — Bakery 3 vertical clockwork ovens.
 * Keeps Phase 3 camera physics and checkpoint engine unchanged.
 */
(function(){
'use strict';
const rows=56,cols=105,T=32;
const rise=Array.from({length:17},(_,i)=>[4+4*i,52-2*i,7]);
const ridge=[[68,18,9],[74,20,8]];
const descent=Array.from({length:7},(_,i)=>[77+4*i,22+4*i,7]);
const branches=[[13,46,8],[20,43,9],[28,39,9],[35,36,10],
[42,33,8],[48,29,9],[55,26,9],[61,23,10],
[76,27,8],[81,32,8],[86,37,8],[91,43,9],
[22,50,7],[36,46,8],[52,40,7],[67,35,8],[80,45,8],[95,50,10]];
const platforms=[[0,54,105],...rise,...ridge,...descent,...branches];
const cultures=[[12,49],[34,37],[62,20],[83,27],[99,45]];
const checkpoints=[[9,51],[39,35],[71,18],[90,36]];
const hazards=[[50,53]];
const enemies=[];
const oven={x:96,y:53};
const altitudeTargets=[[4,54],[43,32],[70,18]];
// Step 1 replaces only the factory entrance, columns 4..25 / rows 43..53.
// The passage is safe; encounters occupy the roof and exit catwalks.
const entrance={room:{x:9,y:49,w:11,h:5},
 platforms:[[4,52,4],[6,50,3],[20,52,6],[20,49,6],[23,46,3],[21,43,5]],
 encounters:[
  {x:15*T,y:49*T-25,type:'hopper',left:13*T,right:17*T-25,hopT:65},
  {x:23*T,y:49*T-25,type:'walker',left:21*T,right:25*T-25,hopT:0}
 ]};
cultures[0]=[15,53];checkpoints[0]=[6,53];
const ascent={
 rooms:[{x:36,y:31,w:10,h:6,name:'COPPER SERVICE HALL'},
        {x:60,y:19,w:10,h:6,name:'PRESSURE GALLERY'}],
 platforms:[[28,39,6],[32,37,4],[39,35,4],[46,37,4],
  [48,34,5],[51,31,7],[55,28,6],[58,25,2],[70,25,3],[72,22,4],[72,19,2],[75,19,3],
  // Optional roof loop rejoins the main route before the summit checkpoint.
  [53,25,4],[55,22,4],[58,19,2],
  // Fall recovery ladders lead back to the service hall and central catwalk.
  [28,51,4],[31,48,4],[28,45,4],[32,42,4],
  [42,51,4],[45,48,4],[42,45,4],[45,42,4],[48,39,5],[49,37,4]],
 encounters:[
  {x:30*T,y:39*T-25,type:'walker',left:29*T,right:32*T-25,hopT:0},
  {x:50*T,y:34*T-25,type:'hopper',left:49*T,right:52*T-25,hopT:70},
  {x:64*T,y:19*T-25,type:'hopper',left:62*T,right:65*T-25,hopT:65}
 ],
 throwers:[[58,28],[68,19]],fork:[55,28]
};
cultures[1]=[40,34];cultures[2]=[64,24];
checkpoints[1]=[33,36];checkpoints[2]=[76,18];
const finale={
 platforms:[[79,22,5],[83,25,6],[89,28,6],[95,31,6],
  [81,32,12],[78,36,2],[76,40,2],[78,44,2],[76,48,2],[78,51,2]],
 encounters:[
  {x:86*T,y:25*T-25,type:'walker',left:85*T,right:88*T-25,hopT:0},
  {x:92*T,y:28*T-25,type:'hopper',left:91*T,right:94*T-25,hopT:70}
 ]
};
const devourer={entry:80,checkpoint:3,floor:54};
cultures[3]=[84,24];cultures[4]=[97,30];checkpoints[3]=[79,53];
const sections=[
{name:'Ashen Boilerworks',start:0,end:25,description:'low furnaces and introductory gearway'},
{name:'Copper Lift Shafts',start:26,end:52,description:'branching boiler towers and hot pipes'},
{name:'Clockwork Skybridge',start:53,end:77,description:'raised gears, chimneys and rotating machinery'},
{name:'Grand Oven Descent',start:78,end:104,description:'descending conveyor tiers towards final furnace'}
];
function apply({map}){
 if(!map||map.length!==rows||map[0].length!==cols)throw Error('Bakery 3 expects 105x56 map');
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)map[y][x]=y>=54?'#':'.';
 for(const [x,y,len] of platforms)for(let xx=x;xx<Math.min(cols,x+len);xx++)
   if(map[y][xx]!=='#')map[y][xx]='=';
 for(let y=43;y<54;y++)for(let x=4;x<=25;x++)map[y][x]='.';
 for(const [x,y,len] of entrance.platforms)for(let xx=x;xx<x+len;xx++)map[y][xx]='=';
 for(let x=9;x<=19;x++)map[49][x]='#';
 // Three-tile-high doorways share the uninterrupted ground-level floor.
 for(const x of [9,19])map[50][x]='#';
 for(let y=16;y<54;y++)for(let x=26;x<=77;x++)map[y][x]='.';
 for(const [x,y,len] of ascent.platforms)for(let xx=x;xx<x+len;xx++)map[y][xx]='=';
 for(const r of ascent.rooms){
  for(let x=r.x;x<r.x+r.w;x++){map[r.y][x]='#';map[r.y+r.h][x]='#';}
  for(const x of [r.x,r.x+r.w-1])for(let y=r.y+1;y<r.y+r.h-3;y++)map[y][x]='#';
 }
 // A short parapet keeps optional roof shots out of the summit refuge.
 for(let y=16;y<19;y++)map[y][74]='#';
 // The upper descent stays above the boss's full jump silhouette. A westward
 // return leads down outside the arena, past a quiet resupply checkpoint.
 for(let y=20;y<54;y++)for(let x=78;x<105;x++)map[y][x]='.';
 for(const [x,y,len] of finale.platforms)for(let xx=x;xx<x+len;xx++)map[y][xx]='=';
 // Exact approved arena: one pogo shelf, right wall, and low service shelter.
 for(let y=36;y<54;y++)map[y][104]='#';
 for(let x=85;x<89;x++)map[51][x]='=';
 for(let x=100;x<104;x++)map[50][x]='#';
 for(const [x,y] of hazards){
  if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Bad furnace hazard '+x+','+y);
  map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y],i)=>({x:x*T+12,y:y*T,got:false,ph:i*.7})),
  enemies:enemies.map(([x,y,type],i)=>({x:x*T,y:y*T,w:25,h:25,
   vx:-1.1,alive:true,type,vy:0,hopT:51}))
   .concat(entrance.encounters.map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}})))
   .concat(ascent.encounters.map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}})))
   .concat(finale.encounters.map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}})))
   .concat([[24,43],...ascent.throwers].map(([x,y])=>({x:x*T,y:y*T-25,w:25,h:25,vx:0,vy:0,alive:true,type:'thrower',attackT:90,windup:0,face:-1}))),
  powerups:[[12,53,'kefir'],[17,48,'cache'],[34,36,'kefir'],[61,18,'banneton'],[90,27,'rye'],[66,18,'cache'],[69,18,'cache'],[102,53,'kefir'],[100.5,53,'ammo']]
   .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery3=Object.freeze({rows,cols,T,sections,platforms,
 cultures,checkpoints,hazards,enemies,oven,altitudeTargets,
 entrance,ascent,finale,devourer,apply,version:'grand-oven-finale-step3'});
})();
