/* First aquatic archetype; preview-only, independent of terrestrial enemies. */
(function(root){
'use strict';
function create({x,y,left,right,speed=1.05}){
 return {x,y,w:48,h:40,homeY:y,left,right,speed,face:1,phase:'swim',turnT:0,age:0,alive:true,deathT:0};
}
function update(e,hit){
 if(!e.alive){if(e.deathT>0){e.deathT--;e.y-=.45;}return;}
 e.age++;e.y=e.homeY+Math.sin(e.age*.045)*3;
 if(e.phase==='turn'){
  if(--e.turnT<=0){e.face*=-1;e.phase='swim';}
  return;
 }
 const nx=e.x+e.speed*e.face;
 if(nx<e.left||nx+e.w>e.right||hit(nx,e.y,e.w,e.h)){
  e.phase='turn';e.turnT=24;return;
 }
 e.x=nx;
}
function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function shot(e,s){
 if(!e.alive||s.dead||!overlaps(e,s))return false;
 e.alive=false;e.phase='defeat';e.deathT=36;s.dead=true;return true;
}
function contact(e,a){
 if(!e.alive||a.inv||!overlaps(e,a))return false;
 a.health--;a.inv=90;a.vx=(a.x+a.w/2<e.x+e.w/2?-1:1)*3.4;a.vy=-1;
 return true;
}
const api={create,update,shot,contact,overlaps};root.CrustReef=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
