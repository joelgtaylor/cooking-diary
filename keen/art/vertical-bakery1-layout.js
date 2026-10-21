/* CRUST_PHASE3_AUTHORED_WORLD_V1 — Bakery 1 vertical exploration pilot.
 * Layout and metadata only; player physics remains in the existing engine.
 * Routes: cellar entrance -> moonlit ascension -> towers -> descending oven.
 */
(function(){
'use strict';
const rows=56,cols=105,T=32;
// The courtyard replaces only the first five repeated stair ledges.
const climb=Array.from({length:18},(_,i)=>[4+4*i,52-2*i,6]).slice(5);
const descent=Array.from({length:7},(_,i)=>[75+4*i,20+3*i,6]);
const lower=[[2,54,103],[24,48,8],[38,42,8],[53,37,8],[68,32,9],[78,43,10],[89,47,10],[96,52,9]];
// Upper alternate bridge and lower shortcut. The branches rejoin the main climb.
const branches=[[24,40,8],[30,38,8],[36,36,8],[42,34,8],[47,32,8],
 [55,26,7],[60,24,8],[65,22,9],[82,29,7],[90,34,7]];
const courtyard=[[4,52,5],[7,50,4],[15,51,4],[22,44,4]];
const workshop={x:11,y:48,w:11,h:6};
const platforms=[...courtyard,...climb,...descent,...lower,...branches];
const cultures=[[16,50],[40,34],[61,22],[84,23],[99,35]];
const checkpoints=[[8,51],[34,37],[76,18],[88,53]];
const hazards=[[22,53],[51,53]]; // ground, not overhead.
const enemies=[[27,45,'walker'],[50,30,'walker'],[81,39,'walker']];
// Encounter bounds leave the doorway, checkpoint and first roof landing clear.
const encounters=[
 {x:19*T,y:54*T-25,type:'walker',left:17.5*T,right:21*T-25,hopT:0},
 {x:16*T,y:48*T-25,type:'hopper',left:14*T,right:18.5*T-25,hopT:50},
 {x:40*T,y:32*T-25,type:'hopper',left:38*T,right:42.5*T-25,hopT:65},
 {x:60*T,y:26*T-25,type:'walker',left:58.5*T,right:61.5*T-25,hopT:0},
 {x:64*T,y:23*T-25,type:'hopper',left:62.5*T,right:65*T-25,hopT:65},
 {x:71*T,y:19*T-25,type:'walker',left:70*T,right:72*T-25,hopT:0}
];
// Bridge bays are two tiles wide. Five one-tile extensions complete their
// modules without moving any landing height, enemy patrol or checkpoint.
const ascension={room:{x:35,y:32,w:10,h:6},platforms:[[24,40,8],[24,42,6],[25,45,8],[34,42,6],[31,38,5],[29,36,4],[33,34,3],[38,35,4],[45,38,4],[45,35,4],[48,32,5],[45,30,4]]};
const highTowers={platforms:[[54,33,8],[55,30,4],[65,29,6],[72,27,6],[73,23,5],[53,28,5],[56,26,10],[60,23,5],[66,23,4],[67,19,8],[76,19,2]]};
const ovenDescent={platforms:[[78,20,5],[82,24,5],[80,29,6],[88,28,5],[93,32,5],[98,36,6],[92,40,7],[87,44,8],[86,46,4],[82,49,5]]};
const forecourt={left:88,right:104,floor:54,foreman:{x:94,width:154,height:132}};
const sections=[
{name:'Bakery Entry',start:0,end:22,description:'safe ground and first ledges'},
{name:'Moonlit Ascension',start:23,end:52,description:'forking elevated rooftop routes'},
{name:'High Towers',start:53,end:77,description:'skyline summit and bridges'},
{name:'Oven Descent',start:78,end:104,description:'descending ledges and grand oven'}
];
const oven={x:102,y:52};
function apply({map}){
 if(!map||map.length!==rows||map[0].length!==cols)throw Error('Phase 3 expects 105x56 map');
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)map[y][x]=y>=54?'#':'.';
 // '=' denotes an open-top platform: pass through from below and land on top.
 // Keep the ground at row 54+ as '#', which remains fully solid.
 for(const [x,y,len] of platforms)for(let xx=x;xx<Math.min(cols,x+len);xx++)
   if(map[y][xx]!== '#')map[y][xx]='=';
 // Solid workshop roof, side walls with three-tile-high open doorways,
 // and a rooftop stair tower. All other geometry remains as authored.
 for(let x=11;x<=21;x++)map[48][x]='#';
 for(const x of [11,21])for(let y=49;y<=50;y++)map[y][x]='#';
 for(let x=19;x<=21;x++)for(let y=44;y<=47;y++)map[y][x]='#';
 // Ascension: low proofing-hall passage and an upper rooftop route.
 for(let y=28;y<=48;y++)for(let x=23;x<=52;x++)if(map[y][x]==='=')map[y][x]='.';
 for(const [x,y,len] of ascension.platforms)for(let xx=x;xx<x+len;xx++)map[y][xx]='=';
 for(let x=35;x<=44;x++){map[32][x]='#';map[38][x]='#';}
 for(const x of [35,44])for(let y=33;y<=34;y++)map[y][x]='#';
 // Retain the first landing of the existing High Towers climb.
 map[28][52]='=';
 // High Towers: culture bridge pair, safe landing, then a guarded watchtower.
 for(let y=16;y<=37;y++)for(let x=53;x<=77;x++)if(map[y][x]==='=')map[y][x]='.';
 for(const [x,y,len] of highTowers.platforms)for(let xx=x;xx<x+len;xx++)map[y][xx]='=';
 for(let x=70;x<=72;x++)for(let y=19;y<=23;y++)map[y][x]='#';
 // A solid parapet shields the checkpoint from the upper thrower.
 for(let y=16;y<=18;y++)map[y][75]='#';
 // Oven Descent: broad terraces spiral to the final yeast, then back to
 // the checkpoint at the left-hand entrance to the forecourt.
 for(let y=20;y<=53;y++)for(let x=78;x<=104;x++)if(map[y][x]==='=')map[y][x]='.';
 for(const [x,y,len] of ovenDescent.platforms)for(let xx=x;xx<x+len;xx++)map[y][xx]='=';
 // Ensure low shortcut and final oven surface are well supported.
 for(const [x,y] of hazards){
   // Hazard must be exposed and backed by solid geometry.
   if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Hidden or floating hazard at '+x+','+y);
   map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y])=>({x:x*T+12,y:y*T,got:false})),
  // The lower ascension walker stands ON its one-way shelf, not in it.
  // Explicit bounds use the authored span [25,45,7], as with newer encounters.
  enemies:enemies.map(([x,y,type],i)=>i===0?{x:x*T,y:y*T-25,w:25,h:25,vx:-1.1,alive:true,type,vy:0,hopT:30,encounter:{left:25*T,right:32*T-25}}:i===1?{x:42*T,y:38*T-25,w:25,h:25,vx:-1.1,vy:0,alive:true,type:'walker',hopT:0,encounter:{left:41.5*T,right:44*T-25}}:i===2?{x:85*T,y:24*T-25,w:25,h:25,vx:-1.1,vy:0,alive:true,type:'walker',hopT:0,encounter:{left:85*T,right:87*T-25}}:({
   x:x*T,y:y*T,w:25,h:25,vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:30+i*9
  })).concat(encounters.map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}}))).concat([{x:30*T,y:40*T-25,w:25,h:25,vx:0,vy:0,alive:true,type:'thrower',attackT:90,windup:0,face:-1},{x:73*T,y:19*T-25,w:25,h:25,vx:0,vy:0,alive:true,type:'thrower',attackT:90,windup:0,face:-1}]),
  powerups:[[38,39,'kefir'],[70,17,'banneton'],[92,33,'rye']]
    .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery1=Object.freeze({
 rows,cols,T,sections,platforms,cultures,checkpoints,hazards,enemies,oven,workshop,encounters,ascension,highTowers,ovenDescent,forecourt,
 apply,version:'oven-descent-forecourt-step1'
});
})();
