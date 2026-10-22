/* Gameplay update orchestration and transient effects/pickups.
 * Frame order: player -> timers -> hazards/shots -> enemies -> effects -> pickups.
 * World completion/camera/drawing remain in the outer loop in index.html.
 */
'use strict';
function floater(x,y,txt,color){floaters.push({x,y,txt,color,life:70})}
function burst(x,y,color,n=10){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,life:25,color})}

function update(){
 if(state!=='play')return;
 tick++;
 updateAmmoCaches();
 rememberDevourerPogo();
 const movement=(typeof updateCavernLiftRide==='function'&&updateCavernLiftRide())?{shoot:false,aimUp:false}:updatePlayer();
 if(!movement)return;
 updateMycelium();
 if(typeof updateCavernExploration==='function')updateCavernExploration();
 if(player.inv)player.inv--;if(player.speedT>0)player.speedT--;if(comboT>0&&--comboT===0)combo=0;if(shake>0){shake*=0.85;if(shake<0.6)shake=0}
 updateCombat(movement.shoot,movement.aimUp);
 updateEffects();
 updatePickups();
}
function updateEffects(){
for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life--}particles=particles.filter(p=>p.life>0);for(const fl of floaters){fl.y-=0.8;fl.life--}floaters=floaters.filter(fl=>fl.life>0);
}
function updatePickups(){
for(const gem of gems)if(!gem.got&&Math.abs(player.x-gem.x)<25&&Math.abs(player.y-gem.y)<30){gem.got=true;collected++;combo=comboT>0?combo+1:1;comboT=240;const pts=250*combo;player.score+=pts;player.ammo+=5;burst(gem.x,gem.y,'#efff8b',18);floater(gem.x,gem.y-14,'+'+pts+(combo>1?' x'+combo+' COMBO':''),'#efff8b');AudioKit.effect('collect')}for(const u of powerups)if(!u.got&&Math.abs(player.x+14-u.x)<28&&Math.abs(player.y+19-u.y)<30){u.got=true;AudioKit.effect('collect');if(u.kind==='kefir'){player.kefirCharges=(player.kefirCharges||0)+1;burst(u.x,u.y,'#ffffff',14);floater(u.x,u.y-14,'KEFIR STORED · V TO DASH','#ffffff')}else if(u.kind==='ammo'){player.ammo+=25;u.refreshT=u.refreshTicks||300;burst(u.x,u.y,'#ffe5a8',6);floater(u.x,u.y-14,'+25 AMMO','#ffe5a8')}else if(u.kind==='cache'){player.ammo+=15;player.score+=500;burst(u.x,u.y,'#f0d9a0',10);floater(u.x,u.y-14,'+500 / +15 AMMO','#f0d9a0')}else if(u.kind==='rye'){player.health=Math.min(5,player.health+1);burst(u.x,u.y,'#c98d4b',14);floater(u.x,u.y-14,'+1 HEART','#ffb54e')}else{player.shield=true;burst(u.x,u.y,'#9af3fa',14);floater(u.x,u.y-14,'BANNETON SHIELD','#9af3fa')}}
}

function activateKefir(){
 if(state!=='play'||!player.kefirCharges||player.speedT>0)return false;
 player.kefirCharges--;player.speedT=480;
 burst(player.x+14,player.y+19,'#fff0c9',8);floater(player.x,player.y-18,'KEFIR DASH!','#fff0c9');AudioKit.effect('collect');syncKefirButton();return true;
}
function syncKefirButton(){
 const b=document.getElementById('kefirBtn');
 b.style.display=player.kefirCharges||player.speedT>0?'':'none';
 b.disabled=state!=='play'||player.speedT>0||!player.kefirCharges;
 b.textContent=player.speedT>0?'Dash '+Math.ceil(player.speedT/60)+'s':'Kefir '+(player.kefirCharges||0)+' (V)';
}

function updateAmmoCaches(){
 if(state!=='play')return;
 for(const u of powerups)if(u.kind==='ammo'&&u.got&&u.refreshT>0){
  if(--u.refreshT===0)u.got=false;
 }
}
