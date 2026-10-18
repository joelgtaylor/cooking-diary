/* Baker animation selection and sprite rendering, called in world coordinates.
 * Reads physics state without changing movement; retains the existing animation clock.
 */
'use strict';
function drawPlayer(){
if(!player.inv||tick%8<4){
// CRUST_PHASE4: animation state selection follows physics without changing it.
// CRUST_REIMAGINED: state-driven 44-frame character animations
const speed=Math.abs(player.vx);
let row=0,n=6,rate=10;
if(player.hang){row=5;n=6;rate=3;}
else if(pogoOn){row=6;n=6;rate=4;}
else if(!player.ground){row=player.vy<0?3:4;n=row===3?5:4;rate=4;}
else if(player.climb>0){row=7;n=4;rate=2;}
else if(speed>0.45){row=1;n=10;rate=Math.max(2,7-speed);}
const frame=Math.floor(tick/rate)%n;
const bob=row===1?Math.abs(Math.sin(tick*.35))*1.4:row===0?Math.sin(tick*.06)*.7:0;
g.save();g.translate(player.x+player.w/2,player.y+player.h+2-bob);
g.scale(player.face,1);
// CRUST_AI_STABILIZED_V3: clean atlas and per-state animation clocks.
const ai=assets.bakerAI;
if(ai&&ai.complete&&ai.naturalWidth){
 // Stable action mapping: old physics states -> AI atlas rows.
 // 0 idle, 1 run, 2 jump, 3 fall, 4 land, 5 hang, 6 pogo, 7 hurt
 const aiRowByState=[0,1,4,2,3,5,6,4];
 const aiRow=aiRowByState[row] ?? 0;
 const aiFrameCount=[5,4,4,4,4,4,3,2][aiRow];
 // Reset the animation clock whenever the state changes.
 // Tick-based rather than wall-clock based, so pausing doesn't skip frames.
 const anim=window.__crustAnimState||(window.__crustAnimState={row:-1,start:tick});
 if(anim.row!==aiRow){anim.row=aiRow;anim.start=tick;}
 const elapsed=Math.max(0,tick-anim.start);
 let aiFrame=0;
 if(aiRow===1){
   // Run sequence loops smoothly at a speed appropriate to movement.
   const cycle=[0,1,2,3,2,1];
   aiFrame=cycle[Math.floor(elapsed/Math.max(3,Math.round(8-speed*.5)))%cycle.length];
 }else if(aiRow===0){
   aiFrame=Math.floor(elapsed/14)%aiFrameCount;
 }else if(aiRow===2){
   // Jump plays forward once; avoid looping back midair.
   aiFrame=Math.min(aiFrameCount-1,Math.floor(elapsed/5));
 }else if(aiRow===3){
   aiFrame=Math.min(aiFrameCount-1,Math.floor(elapsed/7));
 }else if(aiRow===4){
   aiFrame=Math.min(aiFrameCount-1,Math.floor(elapsed/4));
 }else if(aiRow===5){
   aiFrame=Math.floor(elapsed/10)%aiFrameCount;
 }else if(aiRow===6){
   aiFrame=Math.floor(elapsed/7)%aiFrameCount;
 }
 g.imageSmoothingEnabled=false;
 g.drawImage(ai,aiFrame*96,aiRow*112,96,112,-42,-96,84,96);
}else{
const big=assets.bakerReimagined;
if(big&&big.complete&&big.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(big,frame*96,row*112,96,112,-42,-96,84,96);}
else if(assets.bakerPhase4&&assets.bakerPhase4.complete&&assets.bakerPhase4.naturalWidth){g.drawImage(assets.bakerPhase4,0,0,64,80,-29,-67,58,70);}
else rect(-13,-38,26,38,'#fff0cd');
}
g.restore();}
}
