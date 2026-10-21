/* Damage, hazards, projectiles and enemy updates, in original frame order. */
'use strict';
// Third-tick units give an exact 26/3-tick period: 50% faster than13ticks.
let playerFireCooldown=0;
function resetPlayerFire(){playerFireCooldown=0;clearBakerShot();}
function damage(){if(player.inv)return;if(player.shield){player.shield=false;player.inv=60;burst(player.x+14,player.y+14,'#9af3fa',12);floater(player.x+14,player.y-10,'SHIELD BLOCK','#9af3fa');AudioKit.effect('enemy');return}AudioKit.effect('hit');player.health--;player.inv=90;player.vy=-8;shake=12;burst(player.x+10,player.y+10,'#ff648e',12);if(player.health<=0){respawnCheckpoint()}}

function updateCombat(shoot,aimUp=false){
 if(spike(player.x,player.y,player.w,player.h))damage();
 updateProjectiles(shoot,aimUp);
 updateEnemies();
 updateEnemyShots();
 updateForeman();
 updateBloomrot();
 updateDevourer();
}
function updateProjectiles(shoot,aimUp=false){
 if(playerFireCooldown>0)playerFireCooldown-=3;
 if(shoot&&playerFireCooldown<=0&&player.ammo>0){
  shots.push(aimUp?{x:player.x+player.w/2-3,y:player.y-4,w:6,h:10,vx:0,vy:-10}:{x:player.x+11,y:player.y+19,w:10,h:6,vx:player.face*10});
  rememberBakerShot(aimUp);playerFireCooldown+=26;player.ammo--;AudioKit.effect('shoot');
 }else if(!shoot&&playerFireCooldown<0)playerFireCooldown=0;
 for(const s of shots){
  s.x+=s.vx;s.y+=s.vy||0;if(hit(s.x,s.y,s.w,s.h))s.dead=true;
  for(const e of enemies)if(e.alive&&collide(s,e)){e.alive=false;s.dead=true;player.score+=100;burst(e.x+12,e.y+12,'#ffad57');AudioKit.effect('enemy')}
  if(!s.dead)hitForemanShot(s);
  if(!s.dead)hitBloomrotShot(s);
  if(!s.dead)hitDevourerShot(s);
 }
 shots=shots.filter(s=>!s.dead&&s.x>0&&s.x<world&&s.y+s.h>0&&s.y<rows*T);
}
// Authored encounters use real support and explicit patrol bounds. The legacy
// hopper path assumed a 620px-tall world and cannot serve these lower rooftops.
function updateEncounterEnemy(e){
 const {left,right}=e.encounter;
 if(e.type==='hopper'){
  e.hopT--;
  const foot=e.y+e.h;
  const supported=e.vy>=0&&(hit(e.x,e.y+1.25,e.w,e.h)||oneWayTop(e.x,foot,foot+1.25,e.w)!==null);
  if(supported){e.vy=0;if(e.hopT<=0){e.vy=-7.5;e.hopT=50+Math.random()*40;}}
  else e.vy=Math.min(10,(e.vy||0)+.5);
  const next=e.y+e.vy,top=oneWayTop(e.x,foot,next+e.h,e.w);
  if(e.vy>=0&&top!==null){e.y=top-e.h;e.vy=0;}
  else if(!hit(e.x,next,e.w,e.h))e.y=next;
  else{if(e.vy>0)e.y=Math.floor((next+e.h)/T)*T-e.h;e.vy=0;}
  if(e.y>rows*T+T)e.alive=false;
 }
 const nx=e.x+e.vx;
 if(nx<left||nx>right||hit(nx,e.y,e.w,e.h))e.vx*=-1;
 else e.x=nx;
}
function updateEnemies(){
for(const e of enemies){if(!e.alive)continue;
if(e.type==='thrower')updateThrower(e);
else if(e.encounter)updateEncounterEnemy(e);
else if(e.type==='hopper'){e.hopT--;const onG=hit(e.x,e.y+e.h+1,e.w,2);if(onG){e.vy=0;const ax=e.x+Math.sign(e.vx||1)*20;if(hit(e.x+e.vx,e.y,e.w,e.h)||!hit(ax,e.y+e.h+8,4,4))e.vx*=-1;if(e.hopT<=0){e.vy=-7.5;e.hopT=50+Math.random()*40}}else e.vy=Math.min(10,(e.vy||0)+0.5);const ny2=e.y+e.vy;if(!hit(e.x,ny2,e.w,e.h))e.y=ny2;else{e.vy=0;e.y=Math.floor((e.y+e.h)/T)*T-e.h}if(e.y>620)e.alive=false;const n2=e.x+e.vx;if(!hit(n2,e.y,e.w,e.h))e.x=n2;else e.vx*=-1}
else if(e.type==='chaser'){const dx=(player.x+player.w/2)-(e.x+e.w/2);if(Math.abs(dx)<220)e.vx+=(Math.sign(dx)*1.8-e.vx)*0.06;else e.vx+=(Math.sign(e.vx||1)*1.1-e.vx)*0.06;const n3=e.x+e.vx;if(hit(n3,e.y,e.w,e.h)||!hit(n3+Math.sign(e.vx)*14,e.y+e.h+8,4,4))e.vx*=-1;else e.x=n3}
else{const n=e.x+e.vx;if(hit(n,e.y,e.w,e.h)||!hit(n+Math.sign(e.vx)*14,e.y+e.h+8,4,4))e.vx*=-1;else e.x=n}
if(collide(player,e)){if(pogoOn&&player.vy>1&&player.y+player.h<e.y+14){e.alive=false;player.vy=-11;player.score+=150;hitStop=4;shake=Math.max(shake,4);burst(e.x+12,e.y+12,'#ffad57',14);floater(e.x+12,e.y-8,'STOMP +150','#ffd75e');AudioKit.effect('enemy')}else damage()}}
}
