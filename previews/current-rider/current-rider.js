/* Current Rider: committed, swept dash; no homing or animation-driven collision. */
(function(root){
'use strict';
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function create({x,y,left=320,right=1216,top=724,bottom=1152}){
 return {x,y,w:64,h:32,left,right,top,bottom,vx:0,vy:0,face:-1,phase:'stalk',timer:24,aim:Math.PI,locked:false,hp:3,maxHp:3,inv:0,alive:true,deathT:0,age:0,dashes:0,wallStun:false,wake:[]};
}
function clearLine(e,p,hit){const dx=p.x+p.w/2-e.x-32,dy=p.y+p.h/2-e.y-16,n=Math.ceil(Math.hypot(dx,dy)/8);for(let i=1;i<=n;i++)if(hit(e.x+32+dx*i/n-2,e.y+16+dy*i/n-2,4,4))return false;return true;}
function contact(e,p){
 if(!e.alive||p.inv||!overlap(e,p))return false;
 p.health--;p.inv=90;p.vx=(p.x+p.w/2<e.x+32?-1:1)*3.8;p.vy=e.phase==='dash'?Math.sin(e.aim)*2:-1;return true;
}
function recover(e,wall=false){e.phase='recover';e.timer=wall?66:46;e.wallStun=wall;e.vx=e.vy=0;}
function move(e,dx,dy,p,hit){
 const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));
 for(let i=0;i<n;i++){
  const nx=e.x+dx/n,ny=e.y+dy/n;
  if(nx<e.left||nx+e.w>e.right||ny<e.top||ny+e.h>e.bottom||hit(nx,ny,e.w,e.h))return false;
  e.x=nx;e.y=ny;contact(e,p);
 }
 return true;
}
function update(e,p,hit=()=>false){
 e.age++;e.inv=Math.max(0,e.inv-1);e.wake=e.wake.filter(t=>--t.life>0);
 if(!e.alive){if(e.deathT){e.deathT--;e.y-=.55;}return;}
 if(e.phase==='dash'){
  if(e.age%3===0)e.wake.push({x:e.x+32,y:e.y+16,life:21});
  if(!move(e,Math.cos(e.aim)*9.2,Math.sin(e.aim)*9.2,p,hit)){recover(e,true);return;}
  if(--e.timer<=0)recover(e);return;
 }
 if(e.phase==='recover'){
  if(--e.timer<=0){e.phase='stalk';e.timer=30;e.locked=false;e.wallStun=false;}return;
 }
 const dx=p.x+p.w/2-e.x-32,dy=p.y+p.h/2-e.y-16,d=Math.hypot(dx,dy);
 if(d>620||p.swimming===false||!clearLine(e,p,hit)){e.phase='stalk';e.timer=24;e.locked=false;return;}
 if(e.phase==='stalk'){
  e.face=dx<0?-1:1;
  const vx=dx/Math.max(1,d)*1.9,vy=clamp((dy+Math.sin(e.age*.025)*75)/Math.max(1,d)*1.6,-1.6,1.6);
  move(e,vx,vy,p,hit);
  if(--e.timer<=0){e.phase='coil';e.timer=44;e.locked=false;e.wallStun=false;}
 }else if(e.phase==='coil'){
  if(!e.locked){e.aim=Math.atan2(dy+clamp(p.vy||0,-3,3)*8,dx+clamp(p.vx||0,-4,4)*8);e.face=Math.cos(e.aim)<0?-1:1;}
  if(--e.timer===20)e.locked=true;
  if(e.timer<=0){e.phase='dash';e.timer=34;e.dashes++;}
 }
 contact(e,p);
}
function shot(e,s){
 if(!e.alive||s.dead||!overlap(e,s))return false;
 s.dead=true;if(e.inv)return 'guard';e.inv=18;e.hp--;
 if(e.hp<=0){e.alive=false;e.phase='defeat';e.deathT=48;e.wake=[];return 'defeat';}
 return 'hit';
}
const api={create,update,shot,contact,overlap};root.CrustRider=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
