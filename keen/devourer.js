/* Isolated Grand Devourer trial. Normal authored worlds remain unchanged. */
'use strict';
let devourerState=null;
const DEVOURER_SHELTER_LEFT=100*32;
function devourerLandingX(x){return Math.max(83*T+56,Math.min(DEVOURER_SHELTER_LEFT-56,x));}
const DEVOURER_SLAM_TICKS=24;
function devourerArena(){return bakery===3&&window.__crustDevourerPreview;}
function devourerGate(closed){for(let y=36;y<54;y++)map[y][80]=closed?'#':'.';}
function resetDevourer(){
 devourerState=devourerArena()?{x:96*T,foot:54*T,phase:'disguise',timer:0,health:12,maxHealth:12,inv:0,face:-1,projectiles:[],cycle:0,impact:false}:null;
 if(devourerState){devourerGate(false);player.ammo=Math.max(65,player.ammo);player.kefirCharges=Math.max(1,player.kefirCharges||0);}
}
function startDevourerPreview(){
 window.__crustDevourerPreview=true;
 if(!assets.devourerForms)loadArt('devourerForms','art/devourer-forms.png');
 init(3);
 for(let y=36;y<54;y++)for(let x=77;x<105;x++)map[y][x]='.';
 for(let y=36;y<54;y++)map[y][104]='#';
 for(const [x,y,n] of [[85,51,4]])for(let i=0;i<n;i++)map[y][x+i]='=';
 // A96px-high service alcove: solid roof blocks boules and the tall boss.
 for(let x=100;x<104;x++)map[50][x]='#';
 enemies=[];enemyShots=[];gems=[];powerups=[{x:102*T+4,y:53*T,kind:'kefir',got:false,ph:0}];
 checkpointState.spawns.push({x:79*T,y:54*T-player.h});checkpointState.current=4;
 player.x=83*T;player.y=54*T-player.h;player.ground=true;player.ammo=65;
 camera=2400;cameraY=rows*T-H;keys={};resetDevourer();
}
function leaveDevourerPreview(){window.__crustDevourerPreview=false;init(3);}
function devourerBody(f){return {x:f.x-56,y:f.foot-148,w:112,h:148};}
function devourerMouth(f){return {x:f.x-56,y:f.foot-148,w:93,h:96};}
function devourerOpen(f){return f.phase==='slam'||(f.phase==='recovery'&&f.timer<=84&&f.timer>24);}
function queueDevourerSlam(f){
 f.phase='windup';f.timer=48;
 const wanted=devourerLandingX(player.x+player.w/2);
 // A heavy machine can reposition, but cannot chase across the whole room.
 f.queuedTargetX=Math.max(f.x-160,Math.min(f.x+160,wanted));
}
function startDevourerSlam(f){
 const repeat=f.cycle>0;
 f.phase='slam';f.riseTicks=repeat?36:24;f.fallTicks=Math.round((repeat?18:12)*2/.7);f.slamDuration=f.riseTicks+f.fallTicks;f.timer=f.slamDuration;f.fromX=f.x;
 f.targetX=repeat?f.queuedTargetX:devourerLandingX(player.x+player.w/2);
 f.face=f.targetX<f.x?-1:1;f.impact=false;AudioKit.effect('climb');
}
function hurtDevourer(){
 const f=devourerState;if(!f||f.health<=0||f.inv)return false;
 f.health--;f.inv=18;AudioKit.effect('enemy');burst(f.x,f.foot-85,'#ffe5aa',5);
 if(!f.health){f.phase='defeated';f.timer=96;f.defeatVy=0;f.projectiles=[];devourerGate(false);if(!checkpointState.devourerRewarded){checkpointState.devourerRewarded=true;player.score+=2000;}AudioKit.effect('win');floater(f.x,f.foot-190,'DEVOURER DEFEATED!','#fff0b5');}
 return true;
}
function hitDevourerShot(s){
 const f=devourerState;if(!f||f.phase==='disguise'||f.health<=0||!collide(s,devourerBody(f)))return;
 const mouth=devourerMouth(f);
 if(devourerOpen(f)&&((s.vy<0&&s.x+s.w>mouth.x&&s.x<mouth.x+mouth.w)||(s.vx!==0&&s.y+s.h>mouth.y&&s.y<mouth.y+mouth.h))){
  if(collide(s,mouth)){s.dead=true;hurtDevourer();}return;
 }
 s.dead=true;
 if(!f.clang){f.clang=12;AudioKit.effect('climb');burst(s.x,s.y,'#ffe7b0',3);}
}
function fireDevourerBoule(f,index){
 f.face=player.x+player.w/2<f.x?-1:1;
 f.projectiles.push({x:f.x+f.face*62-9,y:f.foot-118,w:18,h:18,vx:f.face*(3.4+index*.32),vy:-4.8-(index%3)*.65,bounces:0,life:170});AudioKit.effect('shoot');
}
function updateDevourerBoules(f){
 for(const s of f.projectiles){
  s.x+=s.vx;s.vy+=.2;s.y+=s.vy;s.life--;
  if(s.y+s.h>=54*T){if(s.bounces===0){s.y=54*T-s.h;s.vy=-3.8;s.bounces=1;}else s.dead=true;}
  if(s.life<=0||hit(s.x,s.y,s.w,s.h))s.dead=true;
  if(!s.dead&&collide(s,player)){s.dead=true;damage();if(devourerState!==f)return false;}
 }
 f.projectiles=f.projectiles.filter(s=>!s.dead);return true;
}
function updateDevourer(){
 const f=devourerState;if(!f||!devourerArena()||state!=='play')return;
 if(f.inv)f.inv--;if(f.clang)f.clang--;
 if(f.health<=0){if(f.timer)f.timer--;if(f.foot<54*T){f.defeatVy=Math.min(10,(f.defeatVy||0)+.65);f.foot=Math.min(54*T,f.foot+f.defeatVy);}return;}
 if(f.phase==='disguise'){
  if(Math.abs(player.x+player.w/2-f.x)<205){devourerGate(true);startDevourerSlam(f);}return;
 }
 if(!updateDevourerBoules(f))return;
 if(f.phase==='slam'){
  const age=f.slamDuration-f.timer+1,t=age/f.slamDuration;
  const height=age<=f.riseTicks?380*Math.sin(age/f.riseTicks*Math.PI/2):380*Math.cos((age-f.riseTicks)/f.fallTicks*Math.PI/2);
  f.x=f.fromX+(f.targetX-f.fromX)*t;f.foot=54*T-height;
  if(--f.timer<=0){f.x=f.targetX;f.foot=54*T;f.impact=true;shake=Math.max(shake,9);burst(f.x,f.foot-5,'#e8bc83',18);AudioKit.effect('hit');
   if(collide(player,devourerBody(f))){damage();if(devourerState!==f)return;}
   f.phase='landing';f.timer=30;
  }
 }else if(f.phase==='landing'){
  if(--f.timer<=0){f.phase='boules';f.timer=50;}
 }else if(f.phase==='boules'){
  if((50-f.timer)%10===0)fireDevourerBoule(f,(50-f.timer)/10);
  if(--f.timer<=0){f.phase='recovery';f.timer=108;}
 }else if(f.phase==='recovery'){
  if(f.timer===85){
   // Venting extinguishes the last loaves so the shooting opening is usable.
   for(const s of f.projectiles)burst(s.x,s.y,'#cbb99c',3);f.projectiles=[];
   burst(f.x-65,f.foot-130,'#e9dcc8',6);burst(f.x+65,f.foot-130,'#e9dcc8',6);
  }
  if(--f.timer<=0){f.phase='rest';f.timer=60;f.cycle++;}
 }else if(f.phase==='rest'){
  if(--f.timer<=0)queueDevourerSlam(f);
 }else if(f.phase==='windup'&&--f.timer<=0)startDevourerSlam(f);
}
function drawDevourer(){
 const f=devourerState;if(!f||!devourerArena())return;
 const disguised=f.phase==='disguise',open=devourerOpen(f),art=assets.devourerForms;
 g.save();g.fillStyle='rgba(9,12,25,.55)';g.beginPath();g.ellipse(f.phase==='slam'?f.targetX:f.phase==='windup'?f.queuedTargetX:f.x,54*T,disguised?60:70,7,0,0,Math.PI*2);g.fill();
 if(f.phase==='slam'||f.phase==='windup'){const target=f.phase==='slam'?f.targetX:f.queuedTargetX;g.strokeStyle='#ffe3a1';g.lineWidth=2;g.strokeRect(target-56,54*T-8,112,5);}
 g.translate(Math.round(f.x),Math.round(f.foot));g.imageSmoothingEnabled=false;
 let h=disguised?190:260,w=disguised?180:330;
 if(f.phase==='slam'&&f.cycle===0&&f.slamDuration-f.timer<8){const age=f.slamDuration-f.timer;h=190+age*70/8;w=180+age*150/8;}
 if(f.phase==='defeated'){h=260-100*Math.min(1,(96-f.timer)/30);}
 if(art?.complete&&art.naturalWidth===2007){
  if(!disguised&&f.face>0)g.scale(-1,1);
  g.drawImage(art,...(disguised?[160,160,560,590]:[950,0,965,755]),-w/2,-h,w,h);
 }else{rect(-56,-h,112,h,'#66554b');rect(-30,-95,60,50,'#e8a24d');}
 if(open){
  // The revealed furnace opening overlays the closed-door key pose.
  rect(-56,-148,93,96,'#27202b');rect(-52,-144,85,88,'#863d2c');rect(-46,-139,73,78,'#e68138');rect(-40,-134,61,68,'#ffd37e');
  for(let i=0;i<6;i++)rect(-37+i*10,-130+(tick+i)%4,4,58,'#fff0c0');
  rect(38,-150,14,100,'#403342');rect(42,-145,4,88,'#d5a65b');
 }
 g.restore();
 for(const s of f.projectiles){
  rect(s.x-2,s.y+2,22,14,'#482631');rect(s.x+2,s.y-3,14,23,'#f69c42');rect(s.x+3,s.y+1,12,16,'#ffe0a0');
  rect(s.x+5,s.y+5,9,2,'#85522e');rect(s.x+5,s.y+10,9,2,'#85522e');
  rect(s.x-Math.sign(s.vx)*8,s.y+5,5,4,'#ffcf67');
 }
 g.textAlign='center';
 if(f.phase==='slam'&&f.foot-260<cameraY+50)worldBadge('OVEN ABOVE',f.x,cameraY+74,'#ffe5b0');
 if(!disguised){
  const hx=camera+W/2-165,hy=cameraY+H-43;
  rect(hx,hy,330,38,'#151a2b');g.font='bold 15px monospace';g.fillStyle='#ffe4b2';g.fillText(f.health?'THE GRAND DEVOURER · '+f.health+'/12':'DEVOURER DEFEATED',hx+165,hy+15);
  for(let i=0;i<12;i++)rect(hx+12+i*26,hy+25,20,5,i<f.health?'#f8d898':'#46404a');
  if(f.phase==='recovery'&&f.timer>84)worldBadge('PRESSURE DROPPING',f.x,f.foot-278,'#ffe5b0');
  else if(open)worldBadge('DOOR OPEN — JUMP + SHOOT',f.x,f.foot-278,'#ffe5b0');
  else if(f.phase==='rest')worldBadge('COOLING',f.x,f.foot-278,'#ffe5b0');
  else if(f.phase==='windup')worldBadge('PISTONS CHARGING',f.x,f.foot-278,'#ffe5b0');
 }else worldBadge('GRAND OVEN',f.x,54*T-206,'#ffe5b0');
 worldBadge('SERVICE SHELTER',102*T,50*T-18,'#d5e9e5');
 rect(79*T+10,54*T-65,3,65,'#c1a16c');rect(79*T+13,54*T-64,26,18,'#70514d');worldBadge('RETRY CHECKPOINT',79*T+14,54*T-86,'#ffe5b0');g.textAlign='left';
}
