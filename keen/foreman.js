/* Step 3: fixed-tick sweep/toss fight with recovery openings and clean retries. */
'use strict';
const FOREMAN_DEFEAT_TICKS=96;
let foremanState=null;
function foremanPolishEnabled(){return !/(?:^|[?&])foreman=off(?:&|$)/.test(window.location&&window.location.search||'');}
function foremanRecoveryTicks(){return foremanPolishEnabled()?150:120;}
function moveForeman(f,geo,pc){
 f.walkStep=0;
 if(!['idle','recovery'].includes(f.phase)||f.hurtFlash>0)return;
 const delta=pc-geo.cx,direction=f.walkDir||-1;
 // Do not press the player against the body. Recovery begins by walking away.
 if(Math.abs(delta)<100&&Math.sign(delta)===direction)return;
 let next=(f.walkOffset||0)+direction*.45;
 if(next < -64 || next > 64){f.walkDir=-direction;next=(f.walkOffset||0)-direction*.45;}
 next=Math.max(-64,Math.min(64,next));
 f.walkStep=next-(f.walkOffset||0);f.walkOffset=next;
 if(f.walkStep)f.face=Math.sign(f.walkStep);
}

function resetForeman(){
 foremanState=bakery===1&&currentVerticalLayout().forecourt?
  {phase:'idle',timer:90,face:-1,sweepHit:false,cycles:0,attack:'sweep',health:6,maxHealth:6,inv:0,hurtFlash:0,guardCue:0,projectiles:[],engaged:false,defeatImpact:false,...(foremanPolishEnabled()?{walkOffset:0,walkStep:0,walkDir:-1,deflectCue:0,deflectPush:0,deflectSide:0}:{})}:null;
}
function foremanGeometry(){
 const court=currentVerticalLayout().forecourt;
 if(bakery!==1||!court)return null;
 const {x,width,height}=court.foreman;
 return {court,cx:x*T+width*.62+(foremanPolishEnabled()?(foremanState?.walkOffset||0):0),base:court.floor*T,width,height};
}
function foremanSweepBox(){
 const geo=foremanGeometry();if(!geo||!foremanState)return null;
 return {x:geo.cx+(foremanState.face<0?-150:18),y:geo.base-30,w:132,h:30};
}
function foremanBodyBox(){
 const geo=foremanGeometry();return geo?{x:geo.cx-37,y:geo.base-104,w:74,h:104}:null;
}
function foremanOvenReady(){
 return collected===5&&(!currentVerticalLayout().forecourt||foremanState?.health===0);
}
function hurtForeman(){
 const f=foremanState,geo=foremanGeometry();
 if(!f||!geo||f.health<=0||f.phase!=='recovery'||f.inv>0)return false;
 f.health--;f.inv=36;f.hurtFlash=12;
 shake=Math.max(shake,4);hitStop=Math.max(hitStop,3);
 burst(geo.cx,geo.base-64,'#ffe2a0',8);AudioKit.effect('enemy');
 if(f.health===0){
  f.phase='defeated';f.timer=FOREMAN_DEFEAT_TICKS;f.projectiles=[];f.inv=0;f.defeatImpact=false;
  const reward=!checkpointState.foremanRewarded;
  if(reward){player.score+=1000;checkpointState.foremanRewarded=true;}
  burst(geo.cx,geo.base-45,'#f4e8cf',6);
  floater(geo.cx,geo.base-125,'FOREMAN DEFEATED!'+(reward?' +1000':''),'#ffe2a0');AudioKit.effect('win');
 }
 return true;
}
function hitForemanShot(s){
 const f=foremanState;if(!f||f.health<=0||!collide(s,foremanBodyBox()))return;
 s.dead=true;
 if(!hurtForeman()&&f.inv===0&&f.guardCue===0){
  f.guardCue=60;const geo=foremanGeometry();floater(geo.cx,geo.base-110,'WAIT FOR THE OPENING','#e4d5b6');
 }
}
function updateForemanProjectiles(f,geo){
 for(const s of f.projectiles){
  s.x+=s.vx;s.vy=Math.min(7,s.vy+.08);s.y+=s.vy;s.life--;
  if(s.y+s.h>=geo.base){
   if(s.bounces===0){s.y=geo.base-s.h;s.vy=-2.4;s.bounces=1;}
   else s.dead=true;
  }
  if(s.life<=0||s.x<geo.court.left*T+T||s.x+s.w>geo.court.right*T||hit(s.x,s.y,s.w,s.h))s.dead=true;
  if(!s.dead&&collide(s,player)){s.dead=true;damage();if(foremanState!==f)return false;}
 }
 f.projectiles=f.projectiles.filter(s=>!s.dead);return true;
}
function updateForeman(){
 const f=foremanState;let geo=foremanGeometry();if(!f||!geo||state!=='play')return;
 if(foremanPolishEnabled()){
  if(f.deflectCue>0)f.deflectCue--;
  // Sustain the shove briefly: normal air steering otherwise cancels it before
  // the player clears the crown. Vertical movement and collision stay normal.
  if(f.deflectPush>0){player.vx=f.deflectSide*14;f.deflectPush--;}
 }
 if(f.inv>0)f.inv--;if(f.hurtFlash>0)f.hurtFlash--;if(f.guardCue>0)f.guardCue--;
 if(f.health<=0){
  f.projectiles=[];
  if(!f.defeatImpact&&foremanDefeatAge(f)>=14){
   f.defeatImpact=true;
   if(!foremanReducedMotion()){
    shake=Math.max(shake,7);burst(geo.cx,geo.base-20,'#f4e8cf',24);burst(geo.cx,geo.base-8,'#c58b50',8);
   }
   AudioKit.effect('enemy');
  }
  if(f.timer>0)f.timer--;return;
 }
 const pc=player.x+player.w/2;
 const near=Math.abs(pc-geo.cx)<260&&player.y+player.h>geo.base-(f.engaged?448:256)&&
  geo.cx>camera+24&&geo.cx<camera+W-24&&geo.base>cameraY&&geo.base-100<cameraY+H;
 if(!near){f.phase='idle';f.timer=90;f.sweepHit=false;f.projectiles=[];f.engaged=false;if(foremanPolishEnabled())f.walkStep=0;return;}
 f.engaged=true;
 if(foremanPolishEnabled()){moveForeman(f,geo,pc);geo=foremanGeometry();}
 if(!updateForemanProjectiles(f,geo))return;
 const body=foremanBodyBox();
 if(pogoOn&&player.vy>1&&player.y+player.h<body.y+22&&collide(player,body)){
  if(foremanPolishEnabled()&&(f.phase!=='recovery'||f.inv>0)){
   const side=Math.abs(pc-geo.cx)>6?Math.sign(pc-geo.cx):f.face;
   player.vx=side*14;player.vy=-6;player.ground=false;f.deflectCue=18;f.deflectPush=12;f.deflectSide=side;
   if(f.guardCue===0){f.guardCue=60;floater(geo.cx,geo.base-120,'HEAD GUARDED · USE THE OPENING','#ffe3a1');}
  }else{player.vy=-11;hurtForeman();if(f.health<=0)return;}
 }
 if(f.phase==='idle'){
  if(--f.timer<=0){f.phase='windup';f.timer=60;f.face=pc<geo.cx?-1:1;f.sweepHit=false;}
 }else if(f.phase==='windup'){
  if(--f.timer<=0){f.phase=f.attack==='sweep'?'sweep':'toss';f.timer=f.attack==='sweep'?18:24;f.cycles++;}
 }else if(f.phase==='sweep'){
  if(!f.sweepHit&&collide(player,foremanSweepBox())){f.sweepHit=true;damage();if(foremanState!==f)return;}
  if(--f.timer<=0){f.phase='recovery';f.timer=foremanRecoveryTicks();if(foremanPolishEnabled())f.walkDir=-f.face;}
 }else if(f.phase==='toss'){
  if(f.timer===24){
   f.projectiles.push({x:geo.cx+f.face*48-9,y:geo.base-42,w:18,h:16,vx:f.face*2.6,vy:-1.3,bounces:0,life:180});
   AudioKit.effect('shoot');
  }
  if(--f.timer<=0){f.phase='recovery';f.timer=foremanRecoveryTicks();if(foremanPolishEnabled())f.walkDir=-f.face;}
 }else if(f.phase==='recovery'&&--f.timer<=0){
  f.attack=f.attack==='sweep'?'toss':'sweep';f.phase='windup';f.timer=60;f.face=pc<geo.cx?-1:1;f.sweepHit=false;
 }
}
function drawForemanDough(x,y){
 rect(x+2,y,14,16,'#71412c');rect(x,y+3,18,10,'#bc7c3e');rect(x+2,y+1,13,6,'#f2cd88');rect(x+4,y+1,8,2,'#fff0bd');
 for(let i=0;i<3;i++)rect(x+4+i*4,y+7,2,3,'#88502d');
}
function foremanReducedMotion(){
 return typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function foremanDefeatAge(f){return Math.max(0,Math.min(FOREMAN_DEFEAT_TICKS,FOREMAN_DEFEAT_TICKS-f.timer));}
function drawForemanDefeat(geo,f,art){
 const {cx,base,width,height}=geo,age=foremanDefeatAge(f),reduced=foremanReducedMotion();
 const fallen=assets.foremanDefeated;
 if(age<14&&!reduced){
  // A brief stagger keeps the feet on the floor, with no body transparency.
  const sway=Math.round(Math.sin(age*1.8)*3);
  g.save();g.translate(Math.round(cx+sway),base);g.scale(f.face>0?-1:1,1);g.imageSmoothingEnabled=false;
  g.drawImage(art,16,18,1314,1131,-width*.62,-height,width,height);g.restore();return;
 }
 const t=Math.max(0,age-14),bounce=reduced?0:-12*Math.cos(t*.35)*Math.exp(-t/12);
 const h=84+bounce,w=171*(1-bounce/168),anchor=117*(w/171);
 g.fillStyle='rgba(12,14,27,.36)';g.beginPath();g.ellipse(cx-3,base,66,5,0,0,Math.PI*2);g.fill();
 // The flour cloud dissipates around a solid seated pose, never a fading boss.
 if(!reduced&&t<38){
  g.save();g.globalAlpha=.36*(1-t/38);g.fillStyle='#f7ead1';
  for(let i=0;i<9;i++){
   const angle=i*Math.PI/4,spread=16+t*1.7;
   const px=Math.round(cx+Math.cos(angle)*spread),py=Math.round(base-15-Math.abs(Math.sin(angle))*spread*.7);
   g.fillRect(px-8,py-5,16,10);g.fillRect(px-5,py-8,10,16);
  }
  g.restore();
 }
 g.save();g.translate(Math.round(cx),base);g.scale(f.face>0?-1:1,1);g.imageSmoothingEnabled=false;
 if(fallen?.complete&&fallen.naturalWidth===1536)g.drawImage(fallen,13,192,1512,744,-anchor,-h,w,h);
 else g.drawImage(art,16,18,1314,1131,-width*.62,-84,width,84);
 g.restore();
 if(age>=28){
  const phase=reduced?0:Math.min(age,96)*.13;
  for(let i=0;i<3;i++){
   const angle=phase+i*Math.PI*2/3,x=Math.round(cx-12+Math.cos(angle)*26),y=Math.round(base-94+Math.sin(angle)*6);
   rect(x-3,y,7,1,'#ffe1a0');rect(x,y-3,1,7,'#ffe1a0');rect(x,y,2,2,'#fff3d1');
  }
 }
}
function drawForeman(){
 const geo=foremanGeometry(),art=assets.foremanConcept;
 if(!geo||!art||!art.complete||art.naturalWidth!==1331)return;
 const {cx,base,width,height}=geo,f=foremanState;
 if(cx+width<camera||cx-width>camera+W||base<cameraY||base-height>cameraY+H)return;
 const attacking=f?.phase==='sweep',defeated=f?.health===0,sweep=assets.foremanSweep;
 g.save();
 if(defeated){drawForemanDefeat(geo,f,art);}else{
  g.fillStyle='rgba(12,14,27,.36)';g.beginPath();g.ellipse(cx,base,54,5,0,0,Math.PI*2);g.fill();
  g.save();g.translate(Math.round(cx),base);g.scale(f?.face>0?-1:1,1);g.imageSmoothingEnabled=false;
  if(attacking&&sweep?.complete&&sweep.naturalWidth===1536){g.drawImage(sweep,33,125,1483,787,-149,-114,215,114);}
  else if(foremanPolishEnabled()&&foremanCrownGuard(geo,f)&&drawForemanWalk(geo,f,true)){/* Physical brace matches the closed head guard. */}
  else if(foremanPolishEnabled()&&['idle','recovery'].includes(f.phase)&&f.walkStep&&drawForemanWalk(geo,f)){/* Feet use the same floor anchor. */}
  else{
   const h=f?.phase==='windup'?height-2:height;
   g.drawImage(art,16,18,1314,1131,-width*.62,-h,width,h);
  }
  g.restore();
 }
 if(f){
  if(foremanPolishEnabled()&&!defeated)drawForemanHeadState(geo,f);
  g.textAlign='center';g.font='bold 10px monospace';
  rect(cx-86,base-190,172,25,'#111b2c');g.fillStyle='#f6dec0';g.fillText(defeated?'FOREMAN DEFEATED':'OVERPROOFED FOREMAN '+f.health+'/'+f.maxHealth,Math.round(cx),base-178);
  for(let i=0;i<6;i++)rect(cx-72+i*25,base-173,20,5,i<f.health?'#e9bb73':'#384352');
  if(defeated){g.fillStyle='#ffe1a0';g.fillText(collected===5?'THE GRAND OVEN IS READY':'FIND ALL FIVE CULTURES TO BAKE',Math.round(cx),base-145);}
  else if(f.phase!=='idle'){
   const label=f.phase==='windup'?(f.attack==='sweep'?'PEEL SWEEP · JUMP':'DOUGH TOSS · WATCH'):attacking?'SWEEP':f.phase==='toss'?'DOUGH TOSS':f.inv>0?'HIT · BRIEF GUARD':'OPENING · SHOOT / POGO';
   const ink=f.phase==='recovery'?'#bde6ed':'#ffe1a0';
   rect(cx-86,base-159,172,20,'#111b2c');g.fillStyle=ink;g.fillText(label,Math.round(cx),base-145,166);
   const duration=f.phase==='windup'?60:attacking?18:f.phase==='toss'?24:foremanRecoveryTicks();
   rect(cx-82,base-136,164,3,'#25384b');rect(cx-82,base-136,Math.ceil(164*f.timer/duration),3,ink);
   if(f.phase==='windup'&&f.attack==='sweep'){
    const box=foremanSweepBox();for(let x=box.x;x<box.x+box.w;x+=12)rect(x,base-2,8,2,'#ffe1a0');
   }
   if(f.phase==='windup'&&f.attack==='toss')drawForemanDough(Math.round(cx-f.face*45-9),base-55);
  }
  if(f.phase==='recovery'||f.hurtFlash>0){
   const body=foremanBodyBox();g.fillStyle=f.hurtFlash>0||f.inv>0?'#fff0ca':'#bde6ed';
   for(const side of [-1,1])for(const y of [body.y,base-8]){
    const x=side<0?body.x-3:body.x+body.w-3;g.fillRect(x,y,7,2);g.fillRect(x+(side<0?0:5),y,2,7);
   }
  }
  for(const shot of f.projectiles)drawForemanDough(Math.round(shot.x),Math.round(shot.y));
 }
 g.restore();
}
// Keep the earlier render-only test entry point; it has no simulation effects.
function drawForemanPreview(){drawForeman();}

let foremanWalkArt=null;
const FOREMAN_WALK_SPRITES=[[44,95,528,535],[566,94,531,538],[1115,94,543,537],[1654,99,488,530]];
function foremanCrownGuard(geo,f){
 return (f.phase!=='recovery'||f.inv>0)&&(f.deflectCue>0||
  (Math.abs(player.x+player.w/2-geo.cx)<70&&player.y+player.h<geo.base-70));
}
function drawForemanWalk(geo,f,guard=false){
 if(!foremanWalkArt){foremanWalkArt=new Image();foremanWalkArt.src='art/foreman-walk.png';}
 if(!foremanWalkArt.complete||foremanWalkArt.naturalWidth!==2172||foremanWalkArt.naturalHeight!==724)return false;
 const frame=guard?3:[0,1,2,1][Math.floor(tick/12)%4],crop=FOREMAN_WALK_SPRITES[frame];if(!crop)return false;
 g.drawImage(foremanWalkArt,...crop,-geo.width*.62,-geo.height,geo.width,geo.height);return true;
}
function drawForemanHeadState(geo,f){
 const x=Math.round(geo.cx-6),y=geo.base-geo.height+5,open=f.phase==='recovery'&&f.inv===0;
 g.save();g.lineWidth=2;g.strokeStyle='#fff0cb';g.fillStyle='#142033';
 if(open){
  // Separated shield halves: an opening survives monochrome/reduced motion.
  g.beginPath();g.moveTo(x-4,y);g.lineTo(x-10,y+2);g.lineTo(x-10,y+8);g.lineTo(x-5,y+13);g.stroke();
  g.beginPath();g.moveTo(x+4,y);g.lineTo(x+10,y+2);g.lineTo(x+10,y+8);g.lineTo(x+5,y+13);g.stroke();
 }else{
  g.beginPath();g.moveTo(x,y);g.lineTo(x+8,y+3);g.lineTo(x+7,y+10);g.lineTo(x,y+15);g.lineTo(x-7,y+10);g.lineTo(x-8,y+3);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff0cb';g.fillRect(x-4,y+5,8,2);
 }
 if(f.deflectCue>0){g.beginPath();g.moveTo(x-15,y+8);g.lineTo(x-23,y+4);g.moveTo(x+15,y+8);g.lineTo(x+23,y+4);g.stroke();}
 g.restore();
}
