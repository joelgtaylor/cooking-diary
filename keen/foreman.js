/* Step 2: one fixed-tick sweep cycle. Health, rewards and the full fight follow. */
'use strict';
let foremanState=null;
function resetForeman(){
 foremanState=bakery===1&&currentVerticalLayout().forecourt?
  {phase:'idle',timer:90,face:-1,sweepHit:false,cycles:0}:null;
}
function foremanGeometry(){
 const court=currentVerticalLayout().forecourt;
 if(bakery!==1||!court)return null;
 const {x,width,height}=court.foreman;
 return {court,cx:x*T+width*.62,base:court.floor*T,width,height};
}
function foremanSweepBox(){
 const geo=foremanGeometry();if(!geo||!foremanState)return null;
 return {x:geo.cx+(foremanState.face<0?-150:18),y:geo.base-30,w:132,h:30};
}
function updateForeman(){
 const f=foremanState,geo=foremanGeometry();if(!f||!geo||state!=='play')return;
 const pc=player.x+player.w/2;
 const near=Math.abs(pc-geo.cx)<260&&player.y+player.h>geo.base-256&&
  geo.cx>camera+24&&geo.cx<camera+W-24&&geo.base>cameraY&&geo.base-100<cameraY+H;
 if(!near){f.phase='idle';f.timer=90;f.sweepHit=false;return;}
 if(f.phase==='idle'){
  if(--f.timer<=0){f.phase='windup';f.timer=60;f.face=pc<geo.cx?-1:1;f.sweepHit=false;}
 }else if(f.phase==='windup'){
  if(--f.timer<=0){f.phase='sweep';f.timer=18;f.cycles++;}
 }else if(f.phase==='sweep'){
  if(!f.sweepHit&&collide(player,foremanSweepBox())){f.sweepHit=true;damage();}
  if(--f.timer<=0){f.phase='recovery';f.timer=120;}
 }else if(f.phase==='recovery'&&--f.timer<=0){
  f.phase='windup';f.timer=60;f.face=pc<geo.cx?-1:1;f.sweepHit=false;
 }
}
function drawForeman(){
 const geo=foremanGeometry(),art=assets.foremanConcept;
 if(!geo||!art||!art.complete||art.naturalWidth!==1331)return;
 const {cx,base,width,height}=geo,f=foremanState;
 if(cx+width<camera||cx-width>camera+W||base<cameraY||base-height>cameraY+H)return;
 const attacking=f?.phase==='sweep',sweep=assets.foremanSweep;
 g.save();
 g.fillStyle='rgba(12,14,27,.36)';g.beginPath();g.ellipse(cx,base,54,5,0,0,Math.PI*2);g.fill();
 g.save();g.translate(Math.round(cx),base);g.scale(f?.face>0?-1:1,1);g.imageSmoothingEnabled=false;
 if(attacking&&sweep?.complete&&sweep.naturalWidth===1536){
  // Shared head/foot scale and foot-centre anchor avoid a pose-size jump.
  g.drawImage(sweep,33,125,1483,787,-149,-114,215,114);
 }else{
  const h=f?.phase==='windup'?height-2:height;
  g.drawImage(art,16,18,1314,1131,-width*.62,-h,width,h);
 }
 g.restore();
 if(f&&f.phase!=='idle'){
  g.textAlign='center';g.font='bold 11px monospace';
  const label=f.phase==='windup'?'PEEL SWEEP · JUMP':attacking?'SWEEP':'RECOVERY';
  const ink=f.phase==='recovery'?'#bde6ed':'#ffe1a0';
  rect(cx-77,base-159,154,20,'#111b2c');g.fillStyle=ink;g.fillText(label,Math.round(cx),base-145);
  const duration=f.phase==='windup'?60:attacking?18:120;
  rect(cx-74,base-136,148,3,'#25384b');rect(cx-74,base-136,Math.ceil(148*f.timer/duration),3,ink);
  if(f.phase==='windup'){
   const box=foremanSweepBox();
   for(let x=box.x;x<box.x+box.w;x+=12)rect(x,base-2,8,2,'#ffe1a0');
  }
 }
 g.restore();
}
// Keep the earlier render-only test entry point; it has no simulation effects.
function drawForemanPreview(){drawForeman();}
