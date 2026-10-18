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
const checkpoints=[[9,51],[39,35],[71,18],[90,38]];
const hazards=[[24,53],[50,53],[80,53],[93,53]];
const enemies=[[26,46,'walker'],[53,30,'walker'],[81,33,'walker']];
const oven={x:102,y:52};
const altitudeTargets=[[4,54],[43,32],[70,18]];
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
 for(const [x,y] of hazards){
  if(map[y+1][x]!=='#'||map[y][x]==='#')throw Error('Bad furnace hazard '+x+','+y);
  map[y][x]='^';
 }
 return {
  gems:cultures.map(([x,y],i)=>({x:x*T+12,y:y*T,got:false,ph:i*.7})),
  enemies:enemies.map(([x,y,type],i)=>({x:x*T,y:y*T,w:25,h:25,
   vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:35+i*8})),
  powerups:[[30,41,'kefir'],[67,20,'banneton'],[94,43,'rye']]
   .map(([x,y,kind],i)=>({x:x*T+4,y:y*T,kind,got:false,ph:i*1.5}))
 };
}
window.CrustVerticalBakery3=Object.freeze({rows,cols,T,sections,platforms,
 cultures,checkpoints,hazards,enemies,oven,altitudeTargets,
 apply,version:'clockwork-bakery-v1'});
})();