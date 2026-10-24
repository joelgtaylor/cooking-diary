/* Isolated aquatic enemy. Fixed 60 Hz; art never determines collision. */
(function(root){
'use strict';
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function create({x,y,left=320,right=1216,top=720,bottom=1152}){
 return {x,y,w:60,h:56,left,right,top,bottom,vx:0,vy:0,face:-1,phase:'stalk',timer:24,age:0,hp:4,maxHp:4,inv:0,alive:true,deathT:0,aim:Math.PI,locked:false,bubbles:[],pops:[],attack:0};
}
function clearLine(x,y,px,py,hit){const n=Math.ceil(Math.hypot(px-x,py-y)/8);for(let i=1;i<=n;i++)if(hit(x+(px-x)*i/n-2,y+(py-y)*i/n-2,4,4))return false;return true;}
function volley(e,offset){
 for(const spread of [-.34,0,.34]){
  if(e.bubbles.length>=12)break;
  const a=e.aim+spread+offset;
  e.bubbles.push({x:e.x+e.w/2+Math.cos(e.aim)*35-10,y:e.y+e.h/2+Math.sin(e.aim)*35-10,w:20,h:20,vx:Math.cos(a)*2.9,vy:Math.sin(a)*2.9,life:156,age:0});
 }
}
function update(e,p,hit=()=>false){
 e.age++;e.inv=Math.max(0,e.inv-1);e.pops=e.pops.filter(x=>--x.t>0);
 if(!e.alive){if(e.deathT>0){e.deathT--;e.y-=.55;}return;}
 const dx=p.x+p.w/2-e.x-e.w/2,dy=p.y+p.h/2-e.y-e.h/2,d=Math.hypot(dx,dy);
 const active=d<620&&p.swimming!==false&&clearLine(e.x+30,e.y+28,p.x+p.w/2,p.y+p.h/2,hit);
 if(active){
  e.face=(e.locked&&['inflate','burst'].includes(e.phase)?Math.cos(e.aim):dx)<0?-1:1;
  if(e.phase==='stalk'){
   const targetX=dx*(d>150?1:d<105?-1:0)/Math.max(1,d)*2.25;
   const targetY=clamp((dy+Math.sin(e.age*.018)*54)/Math.max(1,d)*2.05,-2.05,2.05);
   e.vx+=(targetX-e.vx)*.15;e.vy+=(targetY-e.vy)*.15;
   if(--e.timer<=0){e.phase='inflate';e.timer=48;e.locked=false;e.vx=e.vy=0;}
  }else if(e.phase==='inflate'){
   if(!e.locked)e.aim=Math.atan2(dy+clamp(p.vy||0,-3,3)*10,dx+clamp(p.vx||0,-4,4)*10);
   if(--e.timer===14)e.locked=true; // Final warning is a fixed direction: dodge, no homing.
   if(e.timer<=0){e.phase='burst';e.timer=28;e.attack++;volley(e,0);}
  }else if(e.phase==='burst'){
   if(--e.timer===14)volley(e,e.attack%2?.12:-.12);
   if(e.timer<=0){e.phase='recover';e.timer=38;}
  }else if(--e.timer<=0){e.phase='stalk';e.timer=32;}
 }else{
  // No unseen countdown or surprise volley through walls / from a dry room.
  e.phase='stalk';e.timer=24;e.locked=false;e.vx*=.8;e.vy*=.8;
 }
 if(e.phase==='stalk'){
  const nx=clamp(e.x+e.vx,e.left,e.right-e.w),ny=clamp(e.y+e.vy,e.top,e.bottom-e.h);
  if(!hit(nx,e.y,e.w,e.h))e.x=nx;else e.vx=0;
  if(!hit(e.x,ny,e.w,e.h))e.y=ny;else e.vy=0;
 }
 for(const b of e.bubbles){
  b.age++;b.life--;const n=Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy)));
  for(let i=0;i<n;i++){
   const nx=b.x+b.vx/n,ny=b.y+(b.vy-Math.min(.4,b.age*.003))/n;
   if(nx<e.left||nx+b.w>e.right||ny<e.top||ny+b.h>e.bottom||hit(nx,ny,b.w,b.h)){b.dead=true;break;}
   b.x=nx;b.y=ny;
  }
 }
 e.bubbles=e.bubbles.filter(b=>!b.dead&&b.life>0);
}
function shot(e,s){
 if(s.dead||!e.alive)return false;
 const bubble=e.bubbles.find(b=>!b.dead&&overlap(b,s));
 if(bubble){bubble.dead=true;s.dead=true;e.pops.push({x:bubble.x+10,y:bubble.y+10,t:14});return 'pop';}
 if(!overlap(e,s))return false;
 s.dead=true;if(e.inv)return 'guard';
 e.hp--;e.inv=18;
 if(e.hp<=0){e.alive=false;e.phase='defeat';e.deathT=48;e.bubbles=[];return 'defeat';}
 return 'hit';
}
function contact(e,p){
 if(!e.alive||p.inv)return false;
 const b=e.bubbles.find(b=>!b.dead&&overlap(b,p));
 if(!b&&!overlap(e,p))return false;
 if(b)b.dead=true;p.health--;p.inv=90;p.vx=(p.x+p.w/2<e.x+30?-1:1)*3.4;p.vy=-1;return true;
}
const api={create,update,shot,contact,overlap};root.CrustPuffer=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
