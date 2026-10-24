/* Isolated lame attack. Simulation ticks; sprite frames never determine collision. */
(function(root){
'use strict';
const DEFEAT_DURATION=240;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function create(){return {phase:'observe',timer:90,age:0,hp:8,maxHp:8,inv:0,alive:true,deathT:0,lane:280,locked:false,tipX:690,previousX:690,attacks:0,hits:0};}
function vulnerable(e){return e.alive&&e.phase==='recover';}
function mantle(){return {x:704,y:226,w:106,h:106};}
function tool(e){return {x:Math.min(e.previousX,e.tipX)-18,y:e.lane-18,w:Math.abs(e.previousX-e.tipX)+36,h:36};}
function contact(e,p){
 if(!e.alive||e.phase!=='sweep'||p.inv||!overlap(tool(e),p))return false;
 p.health--;p.inv=90;p.vx=-3;p.vy=p.y+p.h/2<e.lane?-2:2;e.hits++;return true;
}
function update(e,p){
 e.age++;e.inv=Math.max(0,e.inv-1);
 if(!e.alive){e.deathT=Math.max(0,e.deathT-1);return;}
 if(e.phase==='prepare'){
  if(!e.locked)e.lane=clamp(p.y+p.h/2,126,458);
  if(e.timer===30)e.locked=true;
 }else if(e.phase==='sweep'){
  e.previousX=e.tipX;e.tipX=690-(690-80)*(23-e.timer)/22;contact(e,p);
 }
 if(--e.timer>0)return;
 if(e.phase==='observe'){e.phase='prepare';e.timer=60;e.locked=false;}
 else if(e.phase==='prepare'){e.phase='sweep';e.timer=22;e.tipX=e.previousX=690;e.attacks++;}
 else if(e.phase==='sweep'){e.phase='recover';e.timer=100;}
 else {e.phase='observe';e.timer=36;}
}
function shot(e,s){
 if(!e.alive||s.dead||!overlap(mantle(),s))return false;
 s.dead=true;if(!vulnerable(e)||e.inv)return 'guard';
 e.inv=24;e.hp--;if(e.hp<=0){e.alive=false;e.phase='defeat';e.deathT=DEFEAT_DURATION;return 'defeat';}return 'hit';
}
function defeatPose(e){
 const elapsed=clamp(DEFEAT_DURATION-e.deathT,0,DEFEAT_DURATION);
 const frame=elapsed<28?0:elapsed<60?1:elapsed<100?2:elapsed<142?3:elapsed<194?4:5;
 const messages=['“MY PERFECT SCORING!”','TOOLS AWAY · NO MORE CUTTING','AN APRON COMPLICATION…','“THIS IS MOST UNDIGNIFIED.”','THE MASTER TAKES A BOW','A VERY OFFENDED BAKER'];
 return {elapsed,frame,message:messages[frame],settle:Math.min(1,elapsed/142),drop:Math.min(1,elapsed/88)};
}
const api={create,update,shot,contact,vulnerable,mantle,tool,defeatPose,DEFEAT_DURATION};root.CrustDeep=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
