/* Grand Devourer: approved battle shared by the authored finale and trial. */
'use strict';
let devourerState=null;
const DEVOURER_SHELTER_LEFT=100*32;
function devourerLandingX(x){return Math.max(83*T+56,Math.min(DEVOURER_SHELTER_LEFT-56,x));}
const DEVOURER_SLAM_TICKS=24;
function devourerArena(){return bakery===3&&(window.__crustDevourerPreview||currentVerticalLayout().devourer);}
function devourerOvenReady(){return !devourerArena()||(devourerState?.health===0&&devourerState.timer===0&&devourerState.finishOven?.landed);}
function releaseDevourerOven(f){
 if(f.finishOven)return;
 // Both landing bays are clear of the pogo shelf and service-shelter roof.
 const targetX=(f.x<=90*T?98:82.5)*T;
 f.finishOven={fromX:f.x,fromFoot:f.foot-45,x:f.x,foot:f.foot-45,targetX,age:0,landed:false};
 burst(f.x,f.foot-90,'#fff0c9',12);AudioKit.effect('shoot');
}
function updateReleasedOven(f){
 const o=f.finishOven;if(!o||o.landed)return;
 const t=Math.min(1,++o.age/48);
 o.x=o.fromX+(o.targetX-o.fromX)*t;o.foot=o.fromFoot+(54*T-o.fromFoot)*t-Math.sin(t*Math.PI)*100;
 if(t===1){o.landed=true;burst(o.x,54*T-5,'#e5c692',12);AudioKit.effect('collect');floater(o.x,54*T-190,'OVEN RECOVERED!','#fff0b5');}
}
function drawReleasedOven(f){
 const o=f.finishOven;if(!o)return;
 g.save();
 if(!o.landed){const angle=Math.sin(o.age/48*Math.PI)*.3*Math.sign(o.targetX-o.fromX);g.translate(o.x,o.foot-57.5);g.rotate(angle);g.translate(-o.x,-o.foot+57.5);}
 drawGrandOven({x:o.x,foot:o.foot,ready:!!(collected===5&&devourerOvenReady())});g.restore();
 if(o.landed&&!ovenGoalIndicatorReady())worldBadge(collected===5&&devourerOvenReady()?'REAL OVEN — FINISH HERE':'REAL OVEN',o.x,54*T-138,'#ffe5b0');
}
function resupplyDevourerCheckpoint(){
 player.health=Math.max(3,player.health);player.ammo=Math.max(65,player.ammo);player.kefirCharges=Math.max(1,player.kefirCharges||0);
}
function devourerGate(closed){for(let y=36;y<54;y++)map[y][80]=closed?'#':'.';}
function resetDevourer(){
 devourerState=devourerArena()?{x:96*T,foot:54*T,phase:'disguise',timer:0,health:12,maxHealth:12,inv:0,face:-1,projectiles:[],puddles:[],cycle:0,impact:false}:null;
 if(devourerState){
  if(!assets.devourerForms)loadArt('devourerForms','art/devourer-forms.png');
  if(!assets.devourerDefeated)loadArt('devourerDefeated','art/devourer-defeated.png');
  devourerGate(false);
  if(window.__crustDevourerPreview||checkpointState.current===currentVerticalLayout().devourer?.checkpoint)resupplyDevourerCheckpoint();
  for(const u of powerups)if(u.kind==='ammo'){u.got=false;u.refreshT=0;}
 }
}
function startDevourerPreview(){
 window.__crustDevourerPreview=true;
 if(!assets.devourerForms)loadArt('devourerForms','art/devourer-forms.png');
 if(!assets.devourerDefeated)loadArt('devourerDefeated','art/devourer-defeated.png');
 init(3);
 for(let y=36;y<54;y++)for(let x=77;x<105;x++)map[y][x]='.';
 for(let y=36;y<54;y++)map[y][104]='#';
 for(const [x,y,n] of [[85,51,4]])for(let i=0;i<n;i++)map[y][x+i]='=';
 // A96px-high service alcove: solid roof blocks boules and the tall boss.
 for(let x=100;x<104;x++)map[50][x]='#';
 enemies=[];enemyShots=[];gems=[];powerups=[{x:102*T+4,y:53*T,kind:'kefir',got:false,ph:0},{x:100*T+20,y:53*T,kind:'ammo',got:false,ph:1,refreshT:0,refreshTicks:300}];
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
 if(!f.health){f.phase='defeated';f.timer=120;f.defeatAge=0;f.defeatImpact=false;f.defeatVy=0;f.projectiles=[];f.puddles=[];devourerGate(false);if(!checkpointState.devourerRewarded){checkpointState.devourerRewarded=true;player.score+=2000;}AudioKit.effect('win');floater(f.x,f.foot-190,'DEVOURER DEFEATED!','#fff0b5');}
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
function fireDevourerKefir(f,index){
 const angle=-.65+index/6;
 f.projectiles.push({kind:'kefir',x:f.x+f.face*62-5,y:f.foot-118,w:10,h:12,vx:f.face*Math.cos(angle)*4.4,vy:Math.sin(angle)*4.4,life:115});AudioKit.effect('shoot');
}
function updateDevourerProjectiles(f){
 for(const s of f.projectiles){
  s.x+=s.vx;s.vy+=s.kind==='kefir'?.13:.2;s.y+=s.vy;s.life--;
  if(s.y+s.h>=54*T){
   if(s.kind==='kefir'){
    s.dead=true;
    if(s.x+24<DEVOURER_SHELTER_LEFT){f.puddles.push({x:s.x-7,y:54*T-5,w:24,h:5,life:60});if(f.puddles.length>2)f.puddles.shift();}
   }else if(s.bounces===0){s.y=54*T-s.h;s.vy=-3.8;s.bounces=1;}else s.dead=true;
  }
  if(s.life<=0||hit(s.x,s.y,s.w,s.h))s.dead=true;
  if(!s.dead&&collide(s,player)){s.dead=true;damage();if(devourerState!==f)return false;}
 }
 f.projectiles=f.projectiles.filter(s=>!s.dead);
 for(const p of f.puddles){p.life--;if(collide(p,player)){damage();if(devourerState!==f)return false;}}
 f.puddles=f.puddles.filter(p=>p.life>0);return true;
}
function devourerCap(f){return {x:f.x+(f.face>0?6:-6)-10,y:f.foot-211,w:20,h:8};}
function devourerCapActive(f){return f.health>0&&f.phase!=='disguise'&&!(f.phase==='slam'&&f.cycle===0&&f.slamDuration-f.timer<8);}
function rememberDevourerPogo(){if(devourerState)devourerState.playerFootBefore=player.y+player.h;}
function checkDevourerPogo(f,oldFoot){
 if(!pogoOn||player.vy<=1||!devourerCapActive(f))return;
 const cap=devourerCap(f),before=f.playerFootBefore??player.y+player.h-player.vy,foot=player.y+player.h;
 const crossed=y=>before<=y-(f.foot-oldFoot)+2&&foot>=y;
 if(player.x+player.w>cap.x&&player.x<cap.x+cap.w&&crossed(cap.y)){
  player.y=cap.y-player.h;player.vy=-12.3;hurtDevourer();AudioKit.effect('pogo');
 }else if(player.x+player.w>f.x-58&&player.x<f.x+58&&crossed(f.foot-199)){
  player.y=f.foot-199-player.h;player.vy=-9;f.clang=12;AudioKit.effect('climb');burst(player.x+14,player.y+player.h,'#ffe7b0',3);
 }
}
function updateDevourer(){
 const f=devourerState;if(!f||!devourerArena()||state!=='play')return;
 const oldFoot=f.foot;
 if(f.inv)f.inv--;if(f.clang)f.clang--;
 if(f.health<=0){
  if(f.foot<54*T){f.defeatVy=Math.min(10,(f.defeatVy||0)+.65);f.foot=Math.min(54*T,f.foot+f.defeatVy);}
  if(f.foot===54*T){
   if(!f.defeatImpact){f.defeatImpact=true;shake=Math.max(shake,8);burst(f.x,f.foot-14,'#e0b677',18);AudioKit.effect('enemy');}
   f.defeatAge=(f.defeatAge||0)+1;if(f.timer)f.timer--;
   if(f.defeatAge===12||f.defeatAge===24){burst(f.x-55,f.foot-100,'#e9e4d8',8);burst(f.x+55,f.foot-90,'#e9e4d8',8);}
   if(f.defeatAge>=30)releaseDevourerOven(f);
   updateReleasedOven(f);
  }
  return;
 }
 if(f.phase==='disguise'){
  if(Math.abs(player.x+player.w/2-f.x)<205&&Math.abs(player.y+player.h-54*T)<64){devourerGate(true);startDevourerSlam(f);}return;
 }
 if(!updateDevourerProjectiles(f))return;
 if(f.phase==='slam'){
  const age=f.slamDuration-f.timer+1,t=age/f.slamDuration;
  const height=age<=f.riseTicks?380*Math.sin(age/f.riseTicks*Math.PI/2):380*Math.cos((age-f.riseTicks)/f.fallTicks*Math.PI/2);
  f.x=f.fromX+(f.targetX-f.fromX)*t;f.foot=54*T-height;
  if(--f.timer<=0){f.x=f.targetX;f.foot=54*T;f.impact=true;shake=Math.max(shake,9);burst(f.x,f.foot-5,'#e8bc83',18);AudioKit.effect('hit');
   if(collide(player,devourerBody(f))){damage();if(devourerState!==f)return;}
   f.phase='landing';f.timer=30;
  }
 }else if(f.phase==='landing'){
  if(--f.timer<=0){f.phase=f.cycle%2?'kefir':'boules';f.timer=50;if(f.phase==='kefir')f.face=player.x+player.w/2<f.x?-1:1;}
 }else if(f.phase==='boules'){
  if((50-f.timer)%10===0)fireDevourerBoule(f,(50-f.timer)/10);
  if(--f.timer<=0){f.phase='recovery';f.timer=108;}
 }else if(f.phase==='kefir'){
  if((50-f.timer)%7===0&&50-f.timer<=42)fireDevourerKefir(f,(50-f.timer)/7);
  if(--f.timer<=0){f.phase='recovery';f.timer=108;}
 }else if(f.phase==='recovery'){
  if(f.timer===85){
   // Venting extinguishes the last loaves so the shooting opening is usable.
   for(const s of f.projectiles)burst(s.x,s.y,'#cbb99c',3);f.projectiles=[];f.puddles=[];
   burst(f.x-65,f.foot-130,'#e9dcc8',6);burst(f.x+65,f.foot-130,'#e9dcc8',6);
  }
  if(--f.timer<=0){f.phase='rest';f.timer=60;f.cycle++;}
 }else if(f.phase==='rest'){
  if(--f.timer<=0)queueDevourerSlam(f);
 }else if(f.phase==='windup'&&--f.timer<=0)startDevourerSlam(f);
 checkDevourerPogo(f,oldFoot);
}
function drawDevourer(){
 const f=devourerState;if(!f||!devourerArena())return;
 const disguised=f.phase==='disguise',open=devourerOpen(f),art=assets.devourerForms;
 g.save();g.fillStyle='rgba(9,12,25,.55)';g.beginPath();g.ellipse(f.phase==='slam'?f.targetX:f.phase==='windup'?f.queuedTargetX:f.x,54*T,disguised?60:70,7,0,0,Math.PI*2);g.fill();
 if(f.phase==='slam'||f.phase==='windup'){const target=f.phase==='slam'?f.targetX:f.queuedTargetX;g.strokeStyle='#ffe3a1';g.lineWidth=2;g.strokeRect(target-56,54*T-8,112,5);}
 g.translate(Math.round(f.x),Math.round(f.foot));g.imageSmoothingEnabled=false;
 let h=disguised?190:260,w=disguised?180:330;
 if(f.phase==='slam'&&f.cycle===0&&f.slamDuration-f.timer<8){const age=f.slamDuration-f.timer;h=190+age*70/8;w=180+age*150/8;}
 if(f.phase==='defeated'){h=260-82*Math.min(1,(f.defeatAge||0)/24);w=330+10*Math.min(1,(f.defeatAge||0)/24);if(f.defeatImpact&&f.defeatAge<12)g.translate(f.defeatAge%4<2?-2:2,0);}
 if(!disguised&&f.face>0)g.scale(-1,1);
 const fallen=assets.devourerDefeated;
 if(f.health===0&&f.defeatAge>=24&&fallen?.complete&&fallen.naturalWidth===1536){
  g.drawImage(fallen,70,170,1438,754,-w/2,-h,w,h);
 }else if(art?.complete&&art.naturalWidth===2007){
  g.drawImage(art,...(disguised?[160,160,560,590]:[950,0,965,755]),-w/2,-h,w,h);
 }else{rect(-56,-h,112,h,'#66554b');rect(-30,-95,60,50,'#e8a24d');}
 if(devourerCapActive(f)){rect(-18,-214,24,4,'#182636');rect(-16,-213,20,2,'#faf3d4');}
 if(open){
  // The revealed furnace opening overlays the closed-door key pose.
  rect(-56,-148,93,96,'#27202b');rect(-52,-144,85,88,'#863d2c');rect(-46,-139,73,78,'#e68138');rect(-40,-134,61,68,'#ffd37e');
  for(let i=0;i<6;i++)rect(-37+i*10,-130+(tick+i)%4,4,58,'#fff0c0');
  rect(38,-150,14,100,'#403342');rect(42,-145,4,88,'#d5a65b');
 }
 g.restore();
 for(const s of f.projectiles){
  if(s.kind==='kefir'){rect(s.x+2,s.y,6,12,'#223b47');rect(s.x,s.y+3,10,7,'#223b47');rect(s.x+2,s.y+3,6,7,'#9bd0c4');rect(s.x+4,s.y+1,2,7,'#f5f2d8');continue;}
  rect(s.x-2,s.y+2,22,14,'#482631');rect(s.x+2,s.y-3,14,23,'#f69c42');rect(s.x+3,s.y+1,12,16,'#ffe0a0');
  rect(s.x+5,s.y+5,9,2,'#85522e');rect(s.x+5,s.y+10,9,2,'#85522e');
  rect(s.x-Math.sign(s.vx)*8,s.y+5,5,4,'#ffcf67');
 }
 for(const p of f.puddles){g.save();g.globalAlpha=Math.min(1,p.life/15);rect(p.x,p.y,p.w,p.h,'#28414b');rect(p.x+2,p.y,p.w-4,3,'#b5ded0');rect(p.x+5,p.y-2,3,2,'#f2f0d6');g.restore();}
 g.textAlign='center';
 if(f.phase==='slam'&&f.foot-260<cameraY+50)worldBadge('OVEN ABOVE',f.x,cameraY+74,'#ffe5b0');
 if(!disguised){
  const hx=camera+W/2-165,hy=cameraY+H-43;
  rect(hx,hy,330,38,'#151a2b');g.font='bold 15px monospace';g.fillStyle='#ffe4b2';g.fillText(f.health?'THE GRAND DEVOURER · '+f.health+'/12':'DEVOURER DEFEATED',hx+165,hy+15);
  for(let i=0;i<12;i++)rect(hx+12+i*26,hy+25,20,5,i<f.health?'#f8d898':'#46404a');
  if(f.phase==='landing'&&f.cycle%2)worldBadge('KEFIR VALVE CHARGING',f.x,f.foot-278,'#e8f2de');
  else if(f.phase==='kefir')worldBadge('CONTAMINATED KEFIR',f.x,f.foot-278,'#e8f2de');
  else if(f.phase==='recovery'&&f.timer>84)worldBadge('PRESSURE DROPPING',f.x,f.foot-278,'#ffe5b0');
  else if(open)worldBadge('DOOR OPEN — JUMP + SHOOT',f.x,f.foot-278,'#ffe5b0');
  else if(f.phase==='rest')worldBadge('COOLING',f.x,f.foot-278,'#ffe5b0');
  else if(f.phase==='windup')worldBadge('PISTONS CHARGING',f.x,f.foot-278,'#ffe5b0');
 }else worldBadge('GRAND OVEN',f.x,54*T-206,'#ffe5b0');
 worldBadge('SERVICE SHELTER',102*T,50*T-18,'#d5e9e5');
 if(window.__crustDevourerPreview){rect(79*T+10,54*T-65,3,65,'#c1a16c');rect(79*T+13,54*T-64,26,18,'#70514d');worldBadge('RETRY CHECKPOINT',79*T+14,54*T-86,'#ffe5b0');}
 drawReleasedOven(f);
 g.textAlign='left';
}
