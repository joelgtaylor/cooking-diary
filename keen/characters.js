/* Baker animation selection and sprite rendering, called in world coordinates.
 * Reads physics state without changing movement; retains the existing animation clock.
 */
'use strict';
// Rendering-only state follows actor identity, so restart cannot reuse an old clock.
const actorAnimations=new WeakMap();
function actorAnimation(actor,row){
 let anim=actorAnimations.get(actor);
 if(!anim||anim.row!==row||tick<anim.lastTick){
  anim={row,start:tick,lastTick:tick};actorAnimations.set(actor,anim);
 }
 anim.lastTick=tick;
 return Math.max(0,tick-anim.start);
}
function contactSurface(actor){
 const foot=actor.y+actor.h,ty=Math.round(foot/T);
 if(Math.abs(foot-ty*T)>1.5)return null;
 const x0=Math.floor(actor.x/T),x1=Math.floor((actor.x+actor.w-1)/T);
 for(let tx=x0;tx<=x1;tx++)if(tile(tx,ty)==='#'||tile(tx,ty)==='=')return ty*T;
 return null;
}
function drawContactShadow(actor,width){
 const surface=contactSurface(actor);if(surface===null)return;
 const cx=Math.round(actor.x+actor.w/2),left=cx-Math.floor(width/2);
 // Clip each short pixel shadow to actual support, including platform ends.
 g.save();g.fillStyle='rgba(15,15,30,.28)';
 for(let tx=Math.floor(left/T);tx<=Math.floor((left+width-1)/T);tx++){
  const b=tile(tx,surface/T);if(b!=='#'&&b!=='=')continue;
  const x=Math.max(left,tx*T),right=Math.min(left+width,(tx+1)*T);
  g.fillRect(x,surface,right-x,2);
  const innerLeft=Math.max(x,left+3),innerRight=Math.min(right,left+width-3);
  if(innerRight>innerLeft)g.fillRect(innerLeft,surface+2,innerRight-innerLeft,1);
 }
 g.restore();
}
function gremlinAnimation(e){
 const row=(e.type==='hopper'&&Math.abs(e.vy||0)>1||e.type==='thrower'&&e.windup>0)?2:Math.abs(e.vx)>0.15?1:0;
 const duration=row===2?7:row===1?9:18;
 return {row,frame:Math.floor(actorAnimation(e,row)/duration)%4};
}
function drawPlayer(){
if(player.ground&&!player.hang&&!pogoOn)drawContactShadow(player,25);
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
const ai=assets.bakerAI;
const aiReady=ai&&ai.complete&&ai.naturalWidth;
// Stable production frames have their grounded foot baseline at source y=100.
// Retain the fallback's previous origin and the existing hanging hand placement.
const bob=aiReady?0:row===1?Math.abs(Math.sin(tick*.35))*1.4:row===0?Math.sin(tick*.06)*.7:0;
const anchorX=aiReady?Math.round(player.x+player.w/2):player.x+player.w/2;
const anchorY=aiReady&&!player.hang?Math.round(player.y+player.h):player.y+player.h+2-bob;
g.save();g.translate(anchorX,anchorY);
g.scale(player.face,1);
// CRUST_AI_STABILIZED_V3: clean atlas and per-state animation clocks.
if(aiReady){
 // Stable action mapping: old physics states -> AI atlas rows.
 // 0 idle, 1 run, 2 jump, 3 fall, 4 land, 5 hang, 6 pogo, 7 hurt
 const aiRowByState=[0,1,4,2,3,5,6,4];
 const aiRow=aiRowByState[row] ?? 0;
 const aiFrameCount=[5,4,4,4,4,4,3,2][aiRow];
 // Reset the animation clock whenever the state changes.
 // Tick-based rather than wall-clock based, so pausing doesn't skip frames.
 const elapsed=actorAnimation(player,aiRow);
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
 const drawTop=player.hang?-96:-Math.round((aiRow===6?103:100)*96/112);
 g.drawImage(ai,aiFrame*96,aiRow*112,96,112,-42,drawTop,84,96);
}else{
const big=assets.bakerReimagined;
if(big&&big.complete&&big.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(big,frame*96,row*112,96,112,-42,-96,84,96);}
else if(assets.bakerPhase4&&assets.bakerPhase4.complete&&assets.bakerPhase4.naturalWidth){g.drawImage(assets.bakerPhase4,0,0,64,80,-29,-67,58,70);}
else rect(-13,-38,26,38,'#fff0cd');
}
g.restore();}
}

// Approved opening-only art pilot. AI, collision bodies and rewards stay in combat.js.
let openingEnemyArt=null;
const OPENING_ENEMY_SPRITES=[[{"crop":[42,167,340,284],"w":42,"h":35},{"crop":[421,168,334,274],"w":41,"h":34},{"crop":[791,172,336,272],"w":42,"h":34},{"crop":[1164,170,332,274],"w":41,"h":34}],[{"crop":[91,648,265,301],"w":35,"h":40},{"crop":[470,628,269,277],"w":36,"h":37},{"crop":[799,560,287,300],"w":38,"h":40},{"crop":[1184,625,285,315],"w":38,"h":42}]];
function openingEnemyPilotEnabled(){
 return bakery===1&&/(?:^|[?&])enemies=pilot(?:&|$)/.test(window.location&&window.location.search||'');
}
function openingEnemyPose(e){
 if(e.type==='walker')return Math.floor(actorAnimation(e,1)/9)%4;
 if(contactSurface(e)!==null&&Math.abs(e.vy||0)<=1)return 0;
 return e.vy < -1?1:Math.abs(e.vy||0)<=1?2:3;
}
function drawOpeningEnemy(e){
 if(!openingEnemyPilotEnabled()||(e!==enemies[3]&&e!==enemies[4]))return false;
 if(!openingEnemyArt){openingEnemyArt=new Image();openingEnemyArt.src='art/moonlit-opening-enemies.png';}
 if(!openingEnemyArt.complete||openingEnemyArt.naturalWidth!==1536||openingEnemyArt.naturalHeight!==1024)return false;
 const role=e.type==='hopper'?1:0,sprite=OPENING_ENEMY_SPRITES[role][openingEnemyPose(e)];
 if(!sprite)return false;
 const {crop,w,h}=sprite;
 if(contactSurface(e)!==null&&Math.abs(e.vy||0)<=1)drawContactShadow(e,22);
 g.save();g.imageSmoothingEnabled=false;
 g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));g.scale(e.vx<0?-1:1,1);
 g.drawImage(openingEnemyArt,...crop,-w/2,-h,w,h);g.restore();return true;
}
