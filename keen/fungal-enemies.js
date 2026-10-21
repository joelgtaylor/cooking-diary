/* Opt-in fungal art and one isolated flyer encounter. No boss or audio changes. */
'use strict';
function fungalPilotEnabled(){return bakery===2&&!/(?:^|[?&])fungal=off(?:&|$)/.test(window.location&&window.location.search||'');}
const FUNGAL_CROPS=[
 [[34,41,357,313],[415,43,341,312],[777,43,347,311],[1179,46,341,308]],
 [[101,374,207,337],[453,511,265,200],[866,374,217,337],[1225,432,243,233]],
 [[65,726,291,257],[458,726,286,255],[832,726,291,255],[1225,726,278,255]]
];
let fungalArt=null,sporewingArt=null;
const fungalReleases=new WeakMap();
function fungalThrowerTiming(){return fungalPilotEnabled()?{ready:30,windup:24,recovery:84}:{ready:90,windup:36,recovery:150};}
function rememberFungalRelease(e){if(fungalPilotEnabled())fungalReleases.set(e,tick);}
function fungalPose(e){
 if(e.type==='walker')return Math.floor(tick/9)%4;
 if(e.type==='hopper'){
  if(contactSurface(e)!==null&&Math.abs(e.vy||0)<=1)return e.hopT>0&&e.hopT<=10?1:0;
  return e.vy < -2?2:3;
 }
 if(e.windup>0)return 1;
 const fired=fungalReleases.get(e),age=tick-fired;
 return fired!==undefined&&age>=0&&age<6?2:fired!==undefined&&age>=6&&age<24?3:0;
}
function drawFungalEnemy(e){
 if(!fungalPilotEnabled())return false;
 if(e.type==='flyer'){drawSporewing(e);return true;}
 const role={walker:0,hopper:1,thrower:2}[e.type];if(role===undefined)return false;
 if(!fungalArt){fungalArt=new Image();fungalArt.src='art/fungal-enemies.png';}
 if(!fungalArt.complete||fungalArt.naturalWidth!==1536||fungalArt.naturalHeight!==1024)return false;
 const pose=fungalPose(e),crop=FUNGAL_CROPS[role][pose];
 const scale=role===0?40/357:role===1?42/337:34/257;
 const w=crop[2]*scale,h=crop[3]*scale;
 if(contactSurface(e)!==null)drawContactShadow(e,22);
 g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));g.scale((e.type==='thrower'?e.face:e.vx)<0?-1:1,1);
 g.drawImage(fungalArt,...crop,-w/2,-h,w,h);g.restore();
 if(e.type==='thrower'&&e.windup>0)drawFungalWarning(e.x+e.w/2,e.y-22,(fungalThrowerTiming().windup-e.windup)/fungalThrowerTiming().windup);
 return true;
}
function drawFungalWarning(x,y,progress){
 g.save();g.fillStyle='#101826';g.strokeStyle='#fff0c4';g.lineWidth=2;
 g.beginPath();g.moveTo(x,y-12);g.lineTo(x+7,y);g.lineTo(x-7,y);g.closePath();g.fill();g.stroke();
 rect(x-1,y-8,2,4,'#fff0c4');rect(x-1,y-3,2,2,'#fff0c4');
 rect(x-15,y+4,30,3,'#101826');rect(x-15,y+4,Math.ceil(30*progress),2,'#fff0c4');g.restore();
}
function drawFungalShot(s){
 if(!fungalPilotEnabled())return false;
 rect(s.x-1,s.y-1,11,11,'#151b35');rect(s.x,s.y,9,9,'#b9e5ea');rect(s.x+2,s.y+1,4,3,'#fff4d9');rect(s.x+6,s.y+5,2,2,'#7184b8');return true;
}
function addSporewingPilot(){
 if(!fungalPilotEnabled())return;
 for(const e of enemies)if(e.type==='thrower')e.attackT=fungalThrowerTiming().ready;
 enemies.push({type:'flyer',x:3*T,y:50*T,w:25,h:25,vx:1.1,vy:0,alive:true,
  flight:{left:T,right:8*T,homeY:50*T,phase:'patrol',timer:0,cooldown:90,direction:1,targetY:0}});
}
function resetSporewingPilot(){
 for(const e of enemies)if(e.type==='flyer'&&e.alive){e.x=3*T;e.y=e.flight.homeY;e.vx=1.1;e.vy=0;Object.assign(e.flight,{phase:'patrol',timer:0,cooldown:90,direction:1,targetY:0});}
}
function sporewingCanDive(e){
 const f=e.flight,px=player.x+player.w/2,py=player.y+player.h/2;
 if(Math.abs(px-e.x-e.w/2)>28||py<e.y+40||py>e.y+200||e.x<camera+24||e.x+e.w>camera+W-24||e.y<cameraY+46||e.y+e.h>cameraY+H)return false;
 // Solid and one-way support both shelter a player underneath.
 for(let y=e.y+e.h;y<py;y+=4){if(hit(e.x,y,e.w,4)||oneWayTop(e.x,y,y+4,e.w)!==null)return false;}
 return true;
}
function updateSporewing(e){
 const f=e.flight;e.vy=0;
 if(f.phase==='patrol'){
  if(f.cooldown>0)f.cooldown--;
  const nx=e.x+f.direction*1.1;
  if(nx<f.left||nx>f.right||hit(nx,e.y,e.w,e.h))f.direction*=-1;
  else e.x=nx;
  e.vx=f.direction*1.1;
  if(f.cooldown===0&&sporewingCanDive(e)){f.phase='warn';f.timer=24;f.patrolX=e.x;e.vx=0;}
 }else if(f.phase==='warn'){
  e.vx=0;
  if(--f.timer<=0){
   // Aim once at release. A modest lead catches a steady walk; changing course
   // after launch still dodges. The dive never homes on the player.
   f.targetY=Math.min(player.y+player.h-e.h,f.homeY+190);
   const dy=Math.max(1,f.targetY-e.y),speed=7;
   let frames=dy/speed;
   for(let i=0;i<3;i++){
    f.targetX=Math.max(T,Math.min(world-e.w-T,player.x+player.w/2-e.w/2+Math.max(-80,Math.min(80,player.vx*frames))));
    frames=Math.hypot(f.targetX-e.x,dy)/speed;
   }
   f.steps=Math.max(1,Math.ceil(frames));f.diveVX=(f.targetX-e.x)/f.steps;f.diveVY=dy/f.steps;
   f.phase='dive';f.timer=f.steps;
  }
 }else if(f.phase==='dive'){
  const nx=e.x+f.diveVX,next=Math.min(e.y+f.diveVY,f.targetY);
  const support=oneWayTop(Math.min(e.x,nx),e.y+e.h,next+e.h,e.w+Math.abs(nx-e.x));
  if(hit(nx,next,e.w,e.h)||support!==null){f.phase='brake';f.timer=24;e.vx=0;}
  else{
   e.vx=f.diveVX;e.vy=f.diveVY;e.x=nx;e.y=next;
   if(--f.timer<=0){f.phase='brake';f.timer=24;}
  }
 }else if(f.phase==='brake'){
  e.vx=0;if(--f.timer<=0){f.phase='return';f.timer=150;}
 }else{
  const next=Math.max(f.homeY,e.y-2),homeX=f.patrolX??Math.max(f.left,Math.min(f.right,e.x));
  const nx=e.x+Math.max(-2.5,Math.min(2.5,homeX-e.x));
  if(!hit(nx,next,e.w,e.h)){e.vx=nx-e.x;e.vy=next-e.y;e.x=nx;e.y=next;}
  else if(!hit(e.x,next,e.w,e.h)){e.vy=next-e.y;e.y=next;}
  if(e.y<=f.homeY&&Math.abs(e.x-homeX)<.1){f.phase='patrol';f.cooldown=120;e.vy=0;}
  // Solid impact can never leave the flyer in a damaging stuck dive.
  else if(--f.timer<=0){f.phase='patrol';f.homeY=e.y;f.cooldown=120;}
 }
}
function sporewingPose(e){const p=e.flight.phase;return p==='warn'?4:p==='dive'?5:p==='brake'?6:p==='return'?7:Math.floor(tick/8)%4;}
function drawSporewing(e){
 if(!sporewingArt){sporewingArt=new Image();sporewingArt.src='art/sporewing.png';}
 const pose=sporewingPose(e),crop=SPOREWING_CROPS[pose];
 if(sporewingArt.complete&&sporewingArt.naturalWidth===1536&&sporewingArt.naturalHeight===1024){
  const scale=52/SPOREWING_CROPS[1][2],w=crop[2]*scale,h=crop[3]*scale;
  g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));
  g.scale(e.flight.direction<0?-1:1,1);g.drawImage(sporewingArt,...crop,-w/2,-h,w,h);g.restore();
 }else{
  // Wing-shaped fallback keeps the new role readable while its atlas loads.
  rect(e.x-10,e.y+4,45,7,'#bde8ea');rect(e.x,e.y,25,25,'#d8c5e8');rect(e.x+5,e.y+12,15,7,'#f9e7c6');
 }
 if(e.flight.phase==='warn'){
  drawFungalWarning(e.x+e.w/2,e.y-12,(24-e.flight.timer)/24);
  const x=e.x+e.w/2,y=e.y+e.h+5;g.save();g.strokeStyle='#fff0c4';g.lineWidth=2;g.beginPath();g.moveTo(x-6,y);g.lineTo(x,y+5);g.lineTo(x+6,y);g.stroke();g.restore();
 }
}
const SPOREWING_CROPS=[[46,122,266,300],[365,212,411,210],[782,239,363,202],[1153,208,363,214],[48,545,278,329],[410,611,163,282],[616,621,470,247],[1105,650,413,214]];
