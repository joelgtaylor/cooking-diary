/* First playable prototype. Enabled only by the separate preview arena config.
 * Normal bakery layouts have no Bloomrot or arena gates yet. */
'use strict';
let bloomrotState=null;
function bloomrotArena(){return bakery===2?window.__crustBloomrotArena||null:null;}
function bloomrotGate(x,closed){for(let y=42;y<54;y++)map[y][x]=closed?'#':'.';}
function resetBloomrot(){
 const a=bloomrotArena();
 bloomrotState=a?{x:98*T,y:54*T-60,w:52,h:60,vy:0,phase:'idle',timer:75,face:-1,health:10,maxHealth:10,inv:0,dodgeCooldown:0,dashHit:false,engaged:false,dodged:false}:null;
 if(a){bloomrotGate(a.entry,false);bloomrotGate(a.exit,true);if(checkpointState.current===4)player.ammo=Math.max(45,player.ammo);}
}
function startBloomrotPreview(){
 if(!assets.bloomrotPoses)loadArt('bloomrotPoses','art/bloomrot-poses.png');
 window.__crustBloomrotArena={left:85*T+12,right:103*T-12,floor:54*T,entry:84,exit:103};
 init(2);
 for(let y=42;y<54;y++)for(let x=80;x<105;x++)map[y][x]='.';
 for(const [x,y,len] of [[87,50,4],[97,49,4]])for(let i=0;i<len;i++)map[y][x+i]='=';
 enemies=[];enemyShots=[];powerups=[];gems=[];
 checkpointState.spawns.push({x:82*T,y:54*T-player.h});checkpointState.current=4;
 player.x=87*T;player.y=54*T-player.h;player.ground=true;player.ammo=45;
 camera=2400;cameraY=rows*T-H;keys={};resetBloomrot();
}
function leaveBloomrotPreview(){window.__crustBloomrotArena=null;init(2);}
function hurtBloomrot(){
 const f=bloomrotState;if(!f||f.health<=0||f.inv>0)return false;
 f.health--;f.inv=24;AudioKit.effect('enemy');burst(f.x+f.w/2,f.y+25,'#d8e4b7',6);
 if(f.health===0){
  f.phase='defeated';f.timer=80;f.vy=0;bloomrotGate(bloomrotArena().entry,false);bloomrotGate(bloomrotArena().exit,false);
  if(!checkpointState.bloomrotRewarded){player.score+=1000;checkpointState.bloomrotRewarded=true;}
  floater(f.x,f.y-30,'BLOOMROT DEFEATED!','#efe3b3');AudioKit.effect('win');
 }
 return true;
}
function hitBloomrotShot(s){
 const f=bloomrotState;if(!f||!f.engaged||f.health<=0||!collide(s,f))return;
 s.dead=true;hurtBloomrot();
}
function bloomrotIncomingShot(f){
 return shots.find(s=>!s.dead&&Math.abs((s.y+s.h/2)-(f.y+f.h/2))<f.h/2+5&&
  (s.vx>0&&s.x+s.w<=f.x&&f.x-s.x-s.w<115||s.vx<0&&s.x>=f.x+f.w&&s.x-f.x-f.w<115));
}
function updateBloomrot(){
 const f=bloomrotState,a=bloomrotArena();if(!f||!a||state!=='play')return;
 if(f.inv>0)f.inv--;if(f.dodgeCooldown>0)f.dodgeCooldown--;
 if(f.health<=0){if(f.timer>0)f.timer--;return;}
 if(!f.engaged){
  if(player.x<86*T||player.y+player.h<a.floor-220)return;
  f.engaged=true;f.timer=75;bloomrotGate(a.entry,true);
 }
 if(f.phase==='dodge'){
  f.vy+=.46;f.y+=f.vy;
  if(f.y+f.h>=a.floor){f.y=a.floor-f.h;f.vy=0;f.phase='recovery';f.timer=48;}
 }else if(f.phase==='idle'){
  const incoming=f.dodgeCooldown===0&&!f.dodged?bloomrotIncomingShot(f):null;
  if(incoming){f.phase='dodge';f.dodged=true;f.vy=-9.5;f.dodgeCooldown=110;AudioKit.effect('climb');}
  else if(--f.timer<=0){f.phase='windup';f.timer=42;f.face=player.x+player.w/2<f.x+f.w/2?-1:1;f.dashHit=false;}
 }else if(f.phase==='windup'){
  if(--f.timer<=0){f.phase='dash';f.timer=44;AudioKit.effect('shoot');}
 }else if(f.phase==='dash'){
  f.x=Math.max(a.left,Math.min(a.right-f.w,f.x+f.face*8.2));
  if(--f.timer<=0||f.x===a.left||f.x===a.right-f.w){f.phase='recovery';f.timer=75;f.dodged=false;burst(f.x+f.w/2,a.floor-6,'#a9bfad',8);}
 }else if(f.phase==='recovery'&&--f.timer<=0){f.phase='idle';f.timer=65;}
 const stomp=pogoOn&&player.vy>1&&player.y+player.h<f.y+20&&collide(player,f);
 if(stomp){player.vy=-11;hurtBloomrot();if(f.health<=0)return;}
 if(!stomp&&f.phase==='dash'&&!f.dashHit&&collide(player,f)){f.dashHit=true;damage();if(bloomrotState!==f)return;}
}
function drawBloomrot(){
 const f=bloomrotState,a=bloomrotArena();if(!f||!a)return;
 const art=assets.bloomrotPoses,ready=art?.complete&&art.naturalWidth===1254&&art.naturalHeight===1254;
 const cx=f.x+f.w/2,foot=f.y+f.h,low=f.phase==='windup'||f.phase==='dash';
 g.save();g.fillStyle='rgba(10,18,30,.45)';g.beginPath();g.ellipse(cx,a.floor,43,6,0,0,Math.PI*2);g.fill();
 if(f.phase==='dash'){rect(cx-f.face*65,foot-26,24,3,'#c0ded0');rect(cx-f.face*82,foot-15,17,2,'#a8c8c1');}
 g.translate(Math.round(cx),Math.round(foot));g.scale(f.face>0?-1:1,1);g.imageSmoothingEnabled=false;
 if(ready){
  // Separate top-row poses have clear gutters. The standing key pose follows
  // the actual dodge arc; dedicated jump/defeat animation follows this trial.
  const crop=low?[646,150,600,450]:[55,50,590,544],h=f.health<=0?48:low?72:94,w=low?106:102;
  g.drawImage(art,...crop,-w/2,-h,w,h);
 }else{rect(-26,-60,52,60,'#557e72');rect(-19,-51,7,5,'#ffde78');rect(9,-51,7,5,'#ffde78');}
 g.restore();
 const mid=(a.left+a.right)/2;
 rect(mid-170,a.floor-285,340,39,'#101f2e');g.textAlign='center';g.font='bold 15px monospace';g.fillStyle='#f1dfb5';g.fillText(f.health===0?'BLOOMROT DEFEATED':'THE BLOOMROT · '+f.health+'/'+f.maxHealth,mid,a.floor-268);
 for(let i=0;i<f.maxHealth;i++)rect(mid-153+i*31,a.floor-258,25,6,i<f.health?'#cce7bf':'#35464b');
 if(f.phase==='windup'){
  const x=f.face<0?f.x-42:f.x+f.w+8;rect(x,a.floor-12,34,3,'#ffe4ac');
  rect(x+(f.face<0?0:29),a.floor-17,5,13,'#ffe4ac');
  g.font='bold 13px monospace';g.fillStyle='#ffe4ac';g.fillText('CHARGING DASH!',cx,f.y-42);
 }else if(f.phase==='recovery'){g.font='12px monospace';g.fillStyle='#dce9c7';g.fillText('OPENING',cx,f.y-42);}
 // Retry flag stays outside the sealing gate and uses no normal-play buttons.
 rect(82*T+11,a.floor-65,3,65,'#c8d1ba');rect(82*T+14,a.floor-64,25,18,'#567c80');rect(82*T+17,a.floor-61,19,3,'#e9dca8');
 worldBadge('RETRY CHECKPOINT',82*T+15,a.floor-89,'#b9d8ba');g.textAlign='left';
}
