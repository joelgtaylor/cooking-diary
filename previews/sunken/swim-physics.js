/* Preview-only water controller. No production page loads this module. */
(function(root){
'use strict';
const DRY=Object.freeze({w:29,h:38}),WET=Object.freeze({w:58,h:26});
const tuning=Object.freeze({speed:3.8,accel:.27,brake:.34,rise:-.18,breach:-7});
function inside(a,r,margin=0){
 const x=a.x+a.w/2,y=a.y+a.h/2;
 return x>=r.x&&x<r.x+r.w&&y>=r.y+margin&&y<r.y+r.h;
}
function region(a,regions,wet=a.swimming){return regions.find(r=>inside(a,r,wet?-8:4))||null;}
function resize(a,size,hit){
 const cx=a.x+a.w/2,cy=a.y+a.h/2;
 // Only a small lateral adjustment is allowed; never teleport across a wall.
 for(const dx of [0,-2,2,-4,4]){
  const x=cx-size.w/2+dx,y=cy-size.h/2;
  if(!hit(x,y,size.w,size.h)){a.x=x;a.y=y;a.w=size.w;a.h=size.h;return true;}
 }
 return false;
}
function sync(a,regions,hit){
 const r=region(a,regions),was=!!a.swimming;
 if(!!r===was)return null;
 if(!resize(a,r?WET:DRY,hit))return 'blocked';
 a.swimming=!!r;a.hang=null;a.climb=0;a.buffer=0;a.coyote=0;a.ground=false;
 if(r){a.vx=Math.max(-5,Math.min(5,a.vx));a.vy=Math.max(-4,Math.min(4,a.vy));}
 else if(a.vy<0)a.vy=Math.min(a.vy,tuning.breach);
 return r?'enter':'exit';
}
function axis(a,delta,key,hit){
 if(!delta)return;
 const n=Math.ceil(Math.abs(delta)),part=delta/n;
 for(let i=0;i<n;i++){
  const x=a.x+(key==='x'?part:0),y=a.y+(key==='y'?part:0);
  if(hit(x,y,a.w,a.h)){
   const velocity=key==='x'?'vx':'vy';
   // A current pushing into a wall must not erase opposing propulsion;
   // otherwise the swimmer can never build enough speed to escape it.
   if(a[velocity]*delta>0)a[velocity]=0;
   return;
  }
  a[key]+=part;
 }
}
function step(a,input,env){
 let x=Number(!!input.right)-Number(!!input.left),y=Number(!!input.down)-Number(!!input.up);
 const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}
 const speed=tuning.speed*(a.speedT>0?1.5:1),rate=n?tuning.accel:tuning.brake;
 let tx=x*speed,ty=y*speed;
 if(env.mode==='buoyant'){
  // Reference preset retains gravity and repeated upward strokes.
  a.strokeCooldown=Math.max(0,(a.strokeCooldown||0)-1);
  if(input.up&&!a.strokeCooldown){a.vy=-4.3;a.strokeCooldown=18;}
  ty=Math.min(2.1,a.vy+.11)+(input.down?.6:0);
 }else if(!y)ty=tuning.rise;
 a.vx+=(tx-a.vx)*rate;a.vy+=(ty-a.vy)*rate;
 if(x)a.face=Math.sign(x);
 let fx=0,fy=0;
 for(const r of env.currents||[])if(inside(a,r)){fx+=r.vx||0;fy+=r.vy||0;}
 fx=Math.max(-1.7,Math.min(1.7,fx));fy=Math.max(-2.2,Math.min(2.2,fy));
 a.flowX=fx;a.flowY=fy;a.ground=false;
 axis(a,a.vx+fx,'x',env.hit);axis(a,a.vy+fy,'y',env.hit);
 return {shoot:!!input.shoot,aimUp:!!input.jump};
}
function pad(x,y,r){
 const nx=(x-(r.left+r.width/2))/(r.width/2),ny=(y-(r.top+r.height/2))/(r.height/2);
 if(Math.abs(nx)>1.25||Math.abs(ny)>1.25)return {};
 const dead=.28;
 return {left:nx<-dead,right:nx>dead,up:ny<-dead,down:ny>dead};
}
function muzzle(a,aimUp){
 const cx=a.x+a.w/2,cy=a.y+a.h/2;
 return aimUp?{x:cx+a.face*18,y:a.y-12}:{x:cx+a.face*(a.w/2+13),y:cy-1};
}
function shot(a,aimUp,hit){
 const tip=muzzle(a,aimUp),w=aimUp?6:10,h=aimUp?10:6;
 const cx=a.x+a.w/2,cy=a.y+a.h/2,n=Math.ceil(Math.hypot(tip.x-cx,tip.y-cy));
 for(let i=0;i<=n;i++){
  const t=n?i/n:0;if(hit(cx+(tip.x-cx)*t-w/2,cy+(tip.y-cy)*t-h/2,w,h))return null;
 }
 return {x:tip.x-w/2,y:tip.y-h/2,w,h,vx:aimUp?0:a.face*10,vy:aimUp?-10:0,life:100};
}
const api={DRY,WET,tuning,inside,region,resize,sync,axis,step,pad,muzzle,shot};
root.CrustSwim=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
