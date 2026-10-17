/* Crust Quest — authored Bakery 1 layout, pilot.
 * Draw/physics remain in the existing engine. Applies only to Bakery 1.
 * The exported metadata supports the preview's full-level overview.
 */
(function(){
'use strict';
const sections=[
 {name:'Welcome',start:0,end:23,theme:'safe introduction'},
 {name:'Rooftop Hop',start:24,end:47,theme:'single spikes and stepped platforms'},
 {name:'Chimney Route',start:48,end:78,theme:'lower path plus high reward route'},
 {name:'Oven Approach',start:79,end:104,theme:'final gap, recovery and payoff'}
];
// All intervals inclusive; no arbitrary modulo gaps or spikes.
const gaps=[[20,21],[29,30],[40,41],[55,56],[85,86],[93,94]];
const platforms=[
 // simple, intentional stairs; y denotes tile row of solid roof surface
 [10,13,5],[17,12,5],
 [24,13,5],[32,12,7],[43,13,7],
 [49,13,8],[59,12,7],[68,11,7],[76,12,5],
 [80,13,7],[89,12,6],[97,13,7]
];
const spikeTiles=[15,39,58,82]; // visible above open floor, never concealed under rooftops or placed beside gap landings
const cultures=[
 [9,14], // first jar is immediately visible on safe ground
 [35,11], // easy rooftop pickup from roof y=12
 [51,12], // chimney section start: y=13 roof
 [71,10], // optional-looking but reachable from the preceding steps
 [99,12] // final jar on the last roof y=13
];
const enemyTiles=[
 [25,'walker'],[46,'walker'],[62,'walker'],
 [75,'walker'],[90,'walker']
];
const boosts=[[48,'kefir'],[81,'rye']];
function apply(state){
 const {map,cols,rows,T}=state;
 if(!map||cols!==105||rows!==17||T!==32)throw Error('Bakery 1 expects the existing 105x17 tile world');
 // Remove only Bakery 1's original periodically placed platforms and hazards.
 for(let x=0;x<cols;x++)for(let y=0;y<rows;y++)map[y][x]='.';
 for(let x=0;x<cols;x++)for(let y=15;y<rows;y++)map[y][x]='#';
 for(const [a,b] of gaps)for(let x=a;x<=b;x++)map[15][x]=map[16][x]='.';
 for(const [x,y,width] of platforms)for(let col=x;col<x+width;col++)map[y][col]='#';
 for(const x of spikeTiles)map[14][x]='^';
 const gems=cultures.map(([x,y])=>({x:x*T+12,y:y*T,got:false}));
 const enemies=enemyTiles.map(([x,type],i)=>({
   x:x*T,y:14*T,w:25,h:25,
   vx:i%2?1.1:-1.1,alive:true,type,vy:0,hopT:40+i*13
 }));
 const powerups=boosts.map(([x,kind],i)=>({
   x:x*T+4,y:14*T-8,kind,got:false,ph:i*2.4
 }));
 return {gems,enemies,powerups};
}
window.CrustBakery1Layout=Object.freeze({
 apply,sections,gaps,platforms,spikeTiles,cultures,enemyTiles,boosts,
 version:'authored-pilot-v1'
});
})();
