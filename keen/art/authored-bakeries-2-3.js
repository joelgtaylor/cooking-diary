/* Crust Quest authored Bakery 2 & 3 — environmental route redesign.
 * No physics, collision, image, enemy logic or recipe code is modified.
 * All coordinates in 32px tile space, separate from rendering.
 */
(function(){
'use strict';
const layouts={
  2:{
    title:'Fungal Proofing Caves',
    sections:[
      {name:'Sporelight Walk',start:0,end:22,theme:'first safe climb and a clear jar'},
      {name:'Mushroom Terraces',start:23,end:45,theme:'raised terraces and hopper practice'},
      {name:'Pogo Canopy',start:46,end:76,theme:'stair-step ascent with optional pogo exploration'},
      {name:'Proofing Gate',start:77,end:104,theme:'gentle return to ground and oven finish'}
    ],
    gaps:[[16,17],[35,36],[55,56],[77,78],[87,88]],
    platforms:[
      [6,13,7],[18,12,6],[26,11,7],[37,12,8],
      [47,11,7],[57,10,7],[66,11,8],[54,8,4],[63,8,4],[79,12,7],[90,11,7],[98,13,6]
    ],
    spikes:[24,45,65,74],
    cultures:[[9,12],[29,10],[50,10],[70,10],[100,12]],
    enemies:[[22,'walker'],[39,'hopper'],[61,'walker'],[81,'hopper'],[96,'walker']],
    boosts:[[46,'banneton'],[84,'kefir']]
  },
  3:{
    title:'Clockwork Oven',
    sections:[
      {name:'Boiler Entrance',start:0,end:23,theme:'safe warmup and first warning'},
      {name:'Gearworks Climb',start:24,end:47,theme:'precision rooftop steps and two threats'},
      {name:'Pressure Chambers',start:48,end:77,theme:'spaced industrial gauntlet'},
      {name:'The Final Bake',start:78,end:104,theme:'telegraphed furnace run, safe finish'}
    ],
    gaps:[[22,23],[35,36],[46,47],[66,67],[86,87],[96,97]],
    platforms:[
      [7,13,6],[17,12,6],[27,11,6],[38,12,7],
      [49,11,6],[59,12,7],[69,10,6],[73,8,4],[79,11,7],[90,12,6],[98,13,6]
    ],
    spikes:[14,56,76],
    cultures:[[10,12],[29,10],[52,10],[72,9],[100,12]],
    enemies:[[18,'walker'],[32,'hopper'],[53,'chaser'],[73,'hopper'],[92,'chaser']],
    boosts:[[40,'rye'],[63,'kefir'],[82,'banneton']]
  }
};
function apply(stage,state){
 const design=layouts[stage];
 if(!design)throw Error('No authored design for Bakery '+stage);
 const {map,cols,rows,T}=state;
 if(!map||cols!==105||rows!==17||T!==32)throw Error('Authored bakery requires the current 105x17 tile world');
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)map[y][x]=y>=15?'#':'.';
 for(const [start,end] of design.gaps)for(let x=start;x<=end;x++){
   map[15][x]='.';map[16][x]='.';
 }
 for(const [x,y,length] of design.platforms)for(let col=x;col<x+length;col++)map[y][col]='#';
 for(const x of design.spikes)map[14][x]='^';
 return {
  gems:design.cultures.map(([x,y])=>({x:x*T+12,y:y*T,got:false})),
  enemies:design.enemies.map(([x,type],i)=>({
    x:x*T,y:14*T,w:25,h:25,vx:i%2?1.1:-1.1,
    alive:true,type,vy:0,hopT:40+i*13
  })),
  powerups:design.boosts.map(([x,kind],i)=>({
    x:x*T+4,y:14*T-8,kind,got:false,ph:i*2.4
  }))
 };
}
window.CrustAuthoredBakeries=Object.freeze({
  apply,layouts,version:'bakery2-3-pilot-v1'
});
})();