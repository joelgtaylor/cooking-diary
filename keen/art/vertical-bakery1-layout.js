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
const cultures=[[16,50],[32,37],[61,22],[83,25],[100,37]];
const checkpoints=[[8,51],[40,33],[72,17],[91,33]];
const hazards=[[22,53],[51,53],[84,53],[88,53]]; // ground, not overhead.
const enemies=[[27,45,'walker'],[50,30,'walker'],[81,39,'walker']];
// Encounter bounds leave the doorway, checkpoint and first roof landing clear.
const encounters=[
 {x:19*T,y:54*T-25,type:'walker',left:17.5*T,right:21*T-25,hopT:0},
 {x:16*T,y:48*T-25,type:'hopper',left:14*T,right:18.5*T-25,hopT:50}
];
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
 // Ensure low shortcut and final oven surface are well supported.
 for(const [x,y] of hazards){
   // Hazard must be exposed and backed by solid geometry.
   if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Hidden or floating hazard at '+x+','+y);
   map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y])=>({x:x*T+12,y:y*T,got:false})),
  enemies:enemies.map(([x,y,type],i)=>({
   x:x*T,y:y*T,w:25,h:25,vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:30+i*9
  })).concat(encounters.map(({left,right,...e})=>({...e,w:25,h:25,vx:1.1,vy:0,alive:true,encounter:{left,right}}))),
  powerups:[[38,39,'kefir'],[70,17,'banneton'],[92,33,'rye']]
    .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery1=Object.freeze({
 rows,cols,T,sections,platforms,cultures,checkpoints,hazards,enemies,oven,workshop,encounters,
 apply,version:'courtyard-workshop-phase1'
});
})();