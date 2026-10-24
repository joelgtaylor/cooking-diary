/* A low-threat, physical passage guardian. Fixed collision, timed vulnerability. */
(function(root){
'use strict';
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function create({x,y}){return {x,y,w:96,h:96,hp:3,maxHp:3,phase:'shelter',timer:54,age:0,inv:0,alive:true,deathT:0,clang:0,jab:false,warning:false};}
function solid(e){return !!e&&(e.alive||e.deathT>0);}
function blocks(e,x,y,w,h){return solid(e)&&overlap(e,{x,y,w,h});}
function update(e,p){
 e.age++;e.inv=Math.max(0,e.inv-1);e.clang=Math.max(0,e.clang-1);e.jab=e.warning=false;
 if(!e.alive){if(e.deathT)e.deathT--;return;}
 // A dry or distant player never runs an unseen attack countdown.
 if(p.swimming===false||Math.hypot(p.x+p.w/2-e.x-48,p.y+p.h/2-e.y-48)>520){e.phase='shelter';e.timer=54;return;}
 if(--e.timer<=0){
  if(e.phase==='shelter'){e.phase='rattle';e.timer=28;}
  else if(e.phase==='rattle'){e.phase='open';e.timer=72;}
  else if(e.phase==='open'){e.phase='tuck';e.timer=18;}
  else{e.phase='shelter';e.timer=54;}
 }
 if(e.phase==='open'){e.warning=e.timer<=58&&e.timer>34;e.jab=e.timer<=34&&e.timer>22;}
}
function shot(e,s){
 if(!e||!e.alive||s.dead||!overlap(e,s))return false;
 s.dead=true;
 if(e.phase!=='open'){e.clang=12;return 'armor';}
 if(e.inv)return 'guard';e.hp--;e.inv=18;
 if(!e.hp){e.alive=false;e.phase='defeat';e.deathT=48;e.jab=e.warning=false;return 'defeat';}
 return 'hit';
}
function contact(e,p){
 if(!e.alive||!e.jab||p.inv)return false;
 // Short reach only. The solid body itself does not damage on contact.
 const left={x:e.x-60,y:e.y+32,w:60,h:48},right={x:e.x+96,y:e.y+32,w:60,h:48};
 if(!overlap(left,p)&&!overlap(right,p))return false;
 p.health--;p.inv=90;p.vx=(p.x+p.w/2<e.x+48?-1:1)*3;p.vy=0;return true;
}
const api={create,solid,blocks,update,shot,contact,overlap};root.CrustCrab=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
