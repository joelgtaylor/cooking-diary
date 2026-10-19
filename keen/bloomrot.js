/* Bloomrot: fixed-tick battle and presentation, shared by the level and isolated trial. */
'use strict';
let bloomrotState=null;
function bloomrotArena(){return bakery===2?window.__crustBloomrotArena||currentVerticalLayout().bloomrot||null:null;}
function bloomrotGate(x,closed){for(let y=42;y<54;y++)map[y][x]=closed?'#':'.';}
function loadBloomrotArt(){
 // Full literal URLs also let the offline preview embed every image.
 for(const [name,uri] of [['bloomrotPoses','art/bloomrot-poses.png'],['bloomrotActions','art/bloomrot-actions.png'],['bloomrotChamber','art/bloomrot-chamber.png']])if(!assets[name])loadArt(name,uri);
}
function bloomrotOvenReady(){return !bloomrotArena()||(bloomrotState?.health===0&&bloomrotState.timer===0);}
function resetBloomrot(){
 const a=bloomrotArena();
 bloomrotState=a?{x:98*T,y:54*T-60,w:52,h:60,vy:0,phase:'idle',timer:75,face:-1,health:10,maxHealth:10,inv:0,dodgeCooldown:0,dashHit:false,engaged:false,dodged:false,attack:'dash',chainsLeft:0,projectiles:[],sporeGap:10,aimX:0,aimY:0,chainSecond:false}:null;
 if(a){loadBloomrotArt();bloomrotGate(a.entry,false);bloomrotGate(a.exit,true);if(checkpointState.current===(window.__crustBloomrotArena?4:3))player.ammo=Math.max(45,player.ammo);}
}
function startBloomrotPreview(){
 loadBloomrotArt();
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
  f.phase='defeated';f.timer=96;f.defeatFoot=f.y+f.h;f.defeatImpact=false;f.vy=0;f.projectiles=[];bloomrotGate(bloomrotArena().entry,false);bloomrotGate(bloomrotArena().exit,false);
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
function beginBloomrotAttack(f){
 f.face=player.x+player.w/2<f.x+f.w/2?-1:1;f.dashHit=false;f.chainSecond=false;
 if(f.attack==='volley'){
  f.phase='sporeWindup';f.timer=48;f.sporeGap=f.health<=5?7:10;
  f.aimX=player.x+player.w/2;f.aimY=player.y+player.h/2;
 }else{f.phase='windup';f.timer=42;f.chainsLeft=f.health<=5?1:0;}
}
function fireBloomrotSpore(f){
 const x=f.x+f.w/2+f.face*34,y=f.y+14,dx=f.aimX-x,dy=f.aimY-y,len=Math.max(1,Math.hypot(dx,dy));
 f.projectiles.push({x:x-5,y:y-5,w:10,h:10,vx:dx/len*4.2,vy:dy/len*4.2,life:145});AudioKit.effect('shoot');
}
function updateBloomrotSpores(f){
 for(const s of f.projectiles){
  s.x+=s.vx;s.y+=s.vy;s.life--;
  if(s.life<=0||hit(s.x,s.y,s.w,s.h))s.dead=true;
  if(!s.dead&&collide(s,player)){s.dead=true;damage();if(bloomrotState!==f)return false;}
 }
 f.projectiles=f.projectiles.filter(s=>!s.dead);return true;
}
function updateBloomrot(){
 const f=bloomrotState,a=bloomrotArena();if(!f||!a||state!=='play')return;
 if(f.inv>0)f.inv--;if(f.dodgeCooldown>0)f.dodgeCooldown--;
 if(f.health<=0){
  if(f.timer>0)f.timer--;
  if(!f.defeatImpact&&f.timer<=66){f.defeatImpact=true;shake=Math.max(shake,4);burst(f.x+f.w/2,a.floor-10,'#dfd5aa',18);AudioKit.effect('enemy');}
  return;
 }
 if(!f.engaged){
  if(player.x<86*T||player.y+player.h<a.floor-220)return;
  f.engaged=true;f.timer=75;bloomrotGate(a.entry,true);
 }
 if(!updateBloomrotSpores(f))return;
 if(f.phase==='dodge'){
  f.vy+=.46;f.y+=f.vy;
  if(f.y+f.h>=a.floor){f.y=a.floor-f.h;f.vy=0;f.phase='recovery';f.timer=48;}
 }else if(f.phase==='idle'){
  const incoming=f.dodgeCooldown===0&&!f.dodged?bloomrotIncomingShot(f):null;
  if(incoming){f.phase='dodge';f.dodged=true;f.vy=-9.5;f.dodgeCooldown=110;AudioKit.effect('climb');}
  else if(--f.timer<=0)beginBloomrotAttack(f);
 }else if(f.phase==='windup'){
  if(--f.timer<=0){f.phase='dash';f.timer=44;AudioKit.effect('shoot');}
 }else if(f.phase==='dash'){
  f.x=Math.max(a.left,Math.min(a.right-f.w,f.x+f.face*8.2));
  if(--f.timer<=0||f.x===a.left||f.x===a.right-f.w){
   burst(f.x+f.w/2,a.floor-6,'#a9bfad',8);
   if(f.chainsLeft>0){f.chainsLeft--;f.chainSecond=true;f.phase='windup';f.timer=42;f.face=player.x+player.w/2<f.x+f.w/2?-1:1;f.dashHit=false;}
   else{f.phase='recovery';f.timer=75;f.dodged=false;f.attack='volley';}
  }
 }else if(f.phase==='sporeWindup'){
  if(--f.timer<=0){f.phase='volley';f.timer=f.sporeGap*4;}
 }else if(f.phase==='volley'){
  if((f.sporeGap*4-f.timer)%f.sporeGap===0)fireBloomrotSpore(f);
  if(--f.timer<=0){f.phase='recovery';f.timer=75;f.attack='dash';f.dodged=false;}
 }else if(f.phase==='recovery'&&--f.timer<=0){f.phase='idle';f.timer=65;}
 const stomp=pogoOn&&player.vy>1&&player.y+player.h<f.y+20&&collide(player,f);
 if(stomp){player.vy=-11;hurtBloomrot();if(f.health<=0)return;}
 if(!stomp&&f.phase==='dash'&&!f.dashHit&&collide(player,f)){f.dashHit=true;damage();if(bloomrotState!==f)return;}
}
function drawBloomrot(){
 const f=bloomrotState,a=bloomrotArena();if(!f||!a||camera+W<80*T)return;
 const art=assets.bloomrotPoses,ready=art?.complete&&art.naturalWidth===1254&&art.naturalHeight===1254;
 const cx=f.x+f.w/2,age=96-f.timer,dead=f.health<=0;
 const foot=dead?(f.defeatFoot??f.y+f.h)+(a.floor-(f.defeatFoot??f.y+f.h))*Math.min(1,age/30):f.y+f.h,low=f.phase==='windup'||f.phase==='dash';
 g.save();g.fillStyle='rgba(10,18,30,.45)';g.beginPath();g.ellipse(cx,a.floor,43,6,0,0,Math.PI*2);g.fill();
 if(f.phase==='dash'){rect(cx-f.face*65,foot-26,24,3,'#c0ded0');rect(cx-f.face*82,foot-15,17,2,'#a8c8c1');}
 g.translate(Math.round(cx),Math.round(foot));g.scale(f.face>0?-1:1,1);g.imageSmoothingEnabled=false;
 if(ready){
  const actions=assets.bloomrotActions,actionsReady=actions?.complete&&actions.naturalWidth===2172;
  let crop=low?[646,150,600,450]:[55,50,590,544],w=low?106:102,h=low?72:94,image=art;
  if(actionsReady&&dead&&age>=30){image=actions;crop=[1409,379,735,311];w=122;h=52;}
  else if(actionsReady&&f.phase==='dodge'){image=actions;crop=[75,93,590,540];w=94;h=86;}
  else if(actionsReady&&(f.phase==='sporeWindup'||f.phase==='volley')){image=actions;crop=[746,150,625,540];w=108;h=94;}
  if(dead&&age<30){h=Math.round(94-42*Math.max(0,(age-12)/18));w=102+Math.round(20*Math.max(0,(age-12)/18));g.translate(age<12?(age%4<2?-2:2):0,0);}
  g.drawImage(image,...crop,-w/2,-h,w,h);
 }else{rect(-26,-60,52,60,'#557e72');rect(-19,-51,7,5,'#ffde78');rect(9,-51,7,5,'#ffde78');}
 g.restore();
 for(const s of f.projectiles){
  rect(s.x,s.y-2,10,14,'#243341');rect(s.x-2,s.y,14,10,'#243341');
  rect(s.x+1,s.y,8,10,'#b9d7b9');rect(s.x,s.y+1,10,8,'#b9d7b9');
  rect(s.x+3,s.y+2,4,6,'#fff0b2');rect(s.x+2,s.y+3,6,4,'#fff0b2');rect(s.x+4,s.y+3,2,2,'#fffce2');
  for(const [dx,dy] of [[-4,3],[12,6],[3,-4],[7,12]])rect(s.x+dx,s.y+dy,2,2,'#e8e9cb');
 }
 const mid=(a.left+a.right)/2;
 rect(mid-170,a.floor-285,340,39,'#101f2e');g.textAlign='center';g.font='bold 15px monospace';g.fillStyle='#f1dfb5';g.fillText(f.health===0?'BLOOMROT DEFEATED':(f.health<=5?'THE BLOOMROT · ENRAGED ':'THE BLOOMROT · ')+f.health+'/'+f.maxHealth,mid,a.floor-268);
 for(let i=0;i<f.maxHealth;i++)rect(mid-153+i*31,a.floor-258,25,6,i<f.health?'#cce7bf':'#35464b');
 if(f.phase==='windup'){
  const x=f.face<0?f.x-42:f.x+f.w+8;rect(x,a.floor-12,34,3,'#ffe4ac');
  rect(x+(f.face<0?0:29),a.floor-17,5,13,'#ffe4ac');
  g.font='bold 13px monospace';g.fillStyle='#ffe4ac';g.fillText(f.chainSecond?'ANOTHER DASH!':'CHARGING DASH!',cx,f.y-42);
 }else if(f.phase==='sporeWindup'||f.phase==='volley'){
  g.font='bold 13px monospace';g.fillStyle='#ffe4ac';g.fillText(f.phase==='sporeWindup'?'SPORES — KEEP MOVING!':'SPORE VOLLEY',cx,f.y-42);
  for(let i=0;i<3;i++)rect(cx-15+i*12,f.y-12,5,5,'#fff0b2');
 }else if(f.phase==='recovery'){g.font='12px monospace';g.fillStyle='#dce9c7';g.fillText('OPENING',cx,f.y-42);}
 // Retry flag stays outside the sealing gate and uses no normal-play buttons.
 if(window.__crustBloomrotArena){rect(82*T+11,a.floor-65,3,65,'#c8d1ba');rect(82*T+14,a.floor-64,25,18,'#567c80');rect(82*T+17,a.floor-61,19,3,'#e9dca8');
 worldBadge('RETRY CHECKPOINT',82*T+15,a.floor-89,'#b9d8ba');}g.textAlign='left';
}

// Back wall stays behind collision terrain; generated plate contains no platforms.
function drawBloomrotChamber(){
 const a=bloomrotArena(),art=assets.bloomrotChamber;if(!a||camera+W<80*T)return;
 if(art?.complete&&art.naturalWidth){g.imageSmoothingEnabled=false;// Blend the portal's left edge into the existing cavern parallax.
  const width=25*T;
  for(let i=0;i<6;i++){g.save();g.globalAlpha=(i+.5)/6;g.drawImage(art,art.naturalWidth*i*16/width,0,art.naturalWidth*16/width,art.naturalHeight,80*T+i*16,a.floor-512,16,512);g.restore();}
  g.drawImage(art,art.naturalWidth*96/width,0,art.naturalWidth*(width-96)/width,art.naturalHeight,80*T+96,a.floor-512,width-96,512);}
}
