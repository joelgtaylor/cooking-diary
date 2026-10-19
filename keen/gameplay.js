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
 const movement=updatePlayer();
 if(!movement)return;
 updateMycelium();
 if(player.inv)player.inv--;if(player.speedT>0)player.speedT--;if(comboT>0&&--comboT===0)combo=0;if(shake>0){shake*=0.85;if(shake<0.6)shake=0}
 updateCombat(movement.shoot);
 updateEffects();
 updatePickups();
}
function updateEffects(){
for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life--}particles=particles.filter(p=>p.life>0);for(const fl of floaters){fl.y-=0.8;fl.life--}floaters=floaters.filter(fl=>fl.life>0);
}
function updatePickups(){
for(const gem of gems)if(!gem.got&&Math.abs(player.x-gem.x)<25&&Math.abs(player.y-gem.y)<30){gem.got=true;collected++;combo=comboT>0?combo+1:1;comboT=240;const pts=250*combo;player.score+=pts;player.ammo+=5;burst(gem.x,gem.y,'#efff8b',18);floater(gem.x,gem.y-14,'+'+pts+(combo>1?' x'+combo+' COMBO':''),'#efff8b');AudioKit.effect('collect')}for(const u of powerups)if(!u.got&&Math.abs(player.x+14-u.x)<28&&Math.abs(player.y+19-u.y)<30){u.got=true;AudioKit.effect('collect');if(u.kind==='kefir'){player.speedT=480;burst(u.x,u.y,'#ffffff',14);floater(u.x,u.y-14,'KEFIR DASH!','#ffffff')}else if(u.kind==='cache'){player.ammo+=15;player.score+=500;burst(u.x,u.y,'#f0d9a0',10);floater(u.x,u.y-14,'+500 / +15 AMMO','#f0d9a0')}else if(u.kind==='rye'){player.health=Math.min(5,player.health+1);burst(u.x,u.y,'#c98d4b',14);floater(u.x,u.y-14,'+1 HEART','#ffb54e')}else{player.shield=true;burst(u.x,u.y,'#9af3fa',14);floater(u.x,u.y-14,'BANNETON SHIELD','#9af3fa')}}
}
