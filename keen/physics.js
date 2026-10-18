/* Player movement and ledge/pogo physics. Constants and operation order retained.
 * updatePlayer returns undefined during ledge handling: the rest of that frame
 * must be skipped, exactly as in the original update loop.
 */
'use strict';
function togglePogo(){
 pogoOn=!pogoOn;
 document.getElementById('pogoBtn').textContent=pogoOn?'🥣 Mixer ON':'🥣 Mixer OFF';
 if(pogoOn&&player.ground){player.vy=-12.3;player.ground=false;}
}
function updatePlayer(){
if(player.hang){
 const h=player.hang;player.x=h.x;player.y=h.y;player.vx=0;player.vy=0;player.ground=false;
 h.timer++;
 if(h.timer>11){player.climb=10;player.x=h.destX;player.y=h.top-player.h;player.hang=null;player.vy=0;player.ground=true;AudioKit.effect('climb');}
 return;
}
if(player.climb>0)player.climb--;
let left=keys.left||keys.ArrowLeft||keys.a,right=keys.right||keys.ArrowRight||keys.d,jump=keys.jump||keys[' ']||keys.ArrowUp||keys.w,shoot=keys.shoot||keys.x||keys.k;let pogoKey=!!(keys.c||keys.C);if(pogoKey&&!prevPogo)togglePogo();prevPogo=pogoKey;let spd=player.speedT>0?5.4:3.6;let target=(right?spd:0)-(left?spd:0);player.vx+=(target-player.vx)*(player.ground?.24:.13);if(Math.abs(player.vx)<.035)player.vx=0;if(player.vx)player.face=Math.sign(player.vx);if(player.ground)player.coyote=7;else player.coyote=Math.max(0,(player.coyote||0)-1);if(jump&&!prevJump)player.buffer=9;else player.buffer=Math.max(0,(player.buffer||0)-1);if(player.buffer&&player.coyote){player.vy=pogoOn?-12.8:-10.7;player.ground=false;player.coyote=0;player.buffer=0;AudioKit.effect(pogoOn?'pogo':'jump')}if(jump&&player.vy<0)player.vy-=.16;else if(!jump&&player.vy< -3)player.vy+=.30;prevJump=!!jump;player.vy=Math.min(10.8,player.vy+.49);let nx=player.x+player.vx;
if(!hit(nx,player.y,player.w,player.h))player.x=nx;
else if(player.vy>=-1&&!pogoOn&&Math.abs(player.vx)>.4){
 // Catch the upper lip of a wall if the head/raised hand just reaches it.
 const direction=Math.sign(player.vx), edge=direction>0?Math.floor((nx+player.w-1)/T)*T:Math.floor(nx/T)*T+T;
 const tx=direction>0?Math.floor((nx+player.w-1)/T):Math.floor(nx/T);
 const ty=Math.floor((player.y+player.h*.55)/T);
 for(let yy=ty;yy<=Math.min(rows-1,ty+2);yy++){
   const top=yy*T;
   if(tile(tx,yy)==='#'&&tile(tx,yy-1)==='.'&&player.y+player.h>top+2&&player.y+5<top+12){
     const destX=direction>0?edge+3:edge-player.w-3;
     if(!hit(destX,top-player.h,player.w,player.h)){
       player.hang={x:direction>0?edge-player.w+5:edge-5,y:top-9,timer:0,top,destX};
       player.face=direction;player.vx=0;player.vy=0;break;
     }
   }
 }
}if(!player.hang&&player.vy>=0&&!pogoOn){
 for(const direction of [-1,1]){
  const side=direction>0?player.x+player.w+5:player.x-5;
  const tx=Math.floor(side/T);
  const top=Math.floor((player.y+player.h*.55)/T)*T;
  const ty=Math.floor(top/T);
  if(tile(tx,ty)==='#'&&tile(tx,ty-1)==='.'&&player.y+player.h>=top+1&&player.y+5<top+10){
   const edge=direction>0?tx*T:(tx+1)*T;
   const destX=direction>0?edge+3:edge-player.w-3;
   if(!hit(destX,top-player.h,player.w,player.h)){
    player.hang={x:direction>0?edge-player.w+5:edge-5,y:top-9,timer:0,top,destX};
    player.face=direction;player.vx=0;player.vy=0;break;
   }
  }
 }
}
if(player.hang)return;
// CRUST_GROUND_CONTACT_V1: the collision rectangles use (bottom-1).
// A tiny gravity step therefore alternated supported idle frames with fall
// frames. Probe just below the feet and stay grounded while supported.
const wasG=player.ground,fallV=player.vy;
const foot=player.y+player.h;
const supportProbe=1.25;
const floorTop=Math.floor((foot+supportProbe)/T)*T;
const nearFloor=floorTop>=foot-0.05&&floorTop-foot<=supportProbe;
const supported=window.__crustGroundFix!==false&&player.vy>=0&&
  nearFloor&&(hit(player.x,player.y+supportProbe,player.w,player.h)||oneWayTop(player.x,foot,foot+supportProbe,player.w)!==null);
if(supported){
 player.y=floorTop-player.h;
 player.ground=true;
 player.vy=0;
}else{
 let ny=player.y+player.vy;
 const ledgeTop=player.vy>=0?oneWayTop(player.x,foot,foot+player.vy,player.w):null;
 if(ledgeTop!==null&&!hit(player.x,ledgeTop-player.h,player.w,player.h)){
  player.y=ledgeTop-player.h;player.ground=true;player.vy=0;
 }else if(!hit(player.x,ny,player.w,player.h)){
  player.y=ny;player.ground=false;
 }else{
  if(player.vy>0)player.y=Math.floor((player.y+player.h+player.vy)/T)*T-player.h;
  else if(player.vy<0)player.y=Math.floor((player.y+player.vy)/T+1)*T;
  player.ground=player.vy>0;player.vy=0;
 }
}if(!wasG&&player.ground&&fallV>6)burst(player.x+14,player.y+player.h,'#e8dcc8',8);if(pogoOn&&player.ground){player.vy=-12.3;player.ground=false;player.coyote=0;burst(player.x+15,player.y+player.h,'#9af3fa',3);AudioKit.effect('pogo')}return {shoot};
}
