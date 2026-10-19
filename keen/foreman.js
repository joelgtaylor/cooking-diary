/* Step 3: fixed-tick sweep/toss fight with recovery openings and clean retries. */
'use strict';
let foremanState=null;
function resetForeman(){
 foremanState=bakery===1&&currentVerticalLayout().forecourt?
  {phase:'idle',timer:90,face:-1,sweepHit:false,cycles:0,attack:'sweep',health:6,maxHealth:6,inv:0,hurtFlash:0,guardCue:0,projectiles:[],engaged:false}:null;
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
  f.phase='defeated';f.timer=60;f.projectiles=[];f.inv=0;
  const reward=!checkpointState.foremanRewarded;
  if(reward){player.score+=1000;checkpointState.foremanRewarded=true;}
  burst(geo.cx,geo.base-45,'#f4e8cf',24);
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
 const f=foremanState,geo=foremanGeometry();if(!f||!geo||state!=='play')return;
 if(f.inv>0)f.inv--;if(f.hurtFlash>0)f.hurtFlash--;if(f.guardCue>0)f.guardCue--;
 if(f.health<=0){f.projectiles=[];if(f.timer>0)f.timer--;return;}
 const pc=player.x+player.w/2;
 const near=Math.abs(pc-geo.cx)<260&&player.y+player.h>geo.base-(f.engaged?448:256)&&
  geo.cx>camera+24&&geo.cx<camera+W-24&&geo.base>cameraY&&geo.base-100<cameraY+H;
 if(!near){f.phase='idle';f.timer=90;f.sweepHit=false;f.projectiles=[];f.engaged=false;return;}
 f.engaged=true;
 if(!updateForemanProjectiles(f,geo))return;
 const body=foremanBodyBox();
 if(pogoOn&&player.vy>1&&player.y+player.h<body.y+22&&collide(player,body)){
  player.vy=-11;hurtForeman();if(f.health<=0)return;
 }
 if(f.phase==='idle'){
  if(--f.timer<=0){f.phase='windup';f.timer=60;f.face=pc<geo.cx?-1:1;f.sweepHit=false;}
 }else if(f.phase==='windup'){
  if(--f.timer<=0){f.phase=f.attack==='sweep'?'sweep':'toss';f.timer=f.attack==='sweep'?18:24;f.cycles++;}
 }else if(f.phase==='sweep'){
  if(!f.sweepHit&&collide(player,foremanSweepBox())){f.sweepHit=true;damage();if(foremanState!==f)return;}
  if(--f.timer<=0){f.phase='recovery';f.timer=120;}
 }else if(f.phase==='toss'){
  if(f.timer===24){
   f.projectiles.push({x:geo.cx+f.face*48-9,y:geo.base-42,w:18,h:16,vx:f.face*2.6,vy:-1.3,bounces:0,life:180});
   AudioKit.effect('shoot');
  }
  if(--f.timer<=0){f.phase='recovery';f.timer=120;}
 }else if(f.phase==='recovery'&&--f.timer<=0){
  f.attack=f.attack==='sweep'?'toss':'sweep';f.phase='windup';f.timer=60;f.face=pc<geo.cx?-1:1;f.sweepHit=false;
 }
}
function drawForemanDough(x,y){
 rect(x+2,y,14,16,'#71412c');rect(x,y+3,18,10,'#bc7c3e');rect(x+2,y+1,13,6,'#f2cd88');rect(x+4,y+1,8,2,'#fff0bd');
 for(let i=0;i<3;i++)rect(x+4+i*4,y+7,2,3,'#88502d');
}
function drawForeman(){
 const geo=foremanGeometry(),art=assets.foremanConcept;
 if(!geo||!art||!art.complete||art.naturalWidth!==1331)return;
 const {cx,base,width,height}=geo,f=foremanState;
 if(cx+width<camera||cx-width>camera+W||base<cameraY||base-height>cameraY+H)return;
 const attacking=f?.phase==='sweep',defeated=f?.health===0,sweep=assets.foremanSweep;
 g.save();
 if(!defeated||f.timer>0){
  g.fillStyle='rgba(12,14,27,.36)';g.beginPath();g.ellipse(cx,base,54,5,0,0,Math.PI*2);g.fill();
  g.save();g.translate(Math.round(cx),base);g.scale(f?.face>0?-1:1,1);g.imageSmoothingEnabled=false;
  if(attacking&&sweep?.complete&&sweep.naturalWidth===1536){g.drawImage(sweep,33,125,1483,787,-149,-114,215,114);}
  else{
   const h=defeated?height*Math.max(.15,f.timer/60):f?.phase==='windup'?height-2:height;
   g.drawImage(art,16,18,1314,1131,-width*.62,-h,width,h);
  }
  g.restore();
 }
 if(f){
  g.textAlign='center';g.font='bold 10px monospace';
  rect(cx-86,base-190,172,25,'#111b2c');g.fillStyle='#f6dec0';g.fillText(defeated?'FOREMAN DEFEATED':'OVERPROOFED FOREMAN '+f.health+'/'+f.maxHealth,Math.round(cx),base-178);
  for(let i=0;i<6;i++)rect(cx-72+i*25,base-173,20,5,i<f.health?'#e9bb73':'#384352');
  if(defeated){g.fillStyle='#ffe1a0';g.fillText(collected===5?'THE GRAND OVEN IS READY':'FIND ALL FIVE CULTURES TO BAKE',Math.round(cx),base-145);}
  else if(f.phase!=='idle'){
   const label=f.phase==='windup'?(f.attack==='sweep'?'PEEL SWEEP · JUMP':'DOUGH TOSS · WATCH'):attacking?'SWEEP':f.phase==='toss'?'DOUGH TOSS':f.inv>0?'HIT · BRIEF GUARD':'OPENING · SHOOT / POGO';
   const ink=f.phase==='recovery'?'#bde6ed':'#ffe1a0';
   rect(cx-86,base-159,172,20,'#111b2c');g.fillStyle=ink;g.fillText(label,Math.round(cx),base-145,166);
   const duration=f.phase==='windup'?60:attacking?18:f.phase==='toss'?24:120;
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
