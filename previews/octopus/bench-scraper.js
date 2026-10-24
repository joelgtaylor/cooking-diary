/* Isolated broad shove: committed lane, one travelling wake, bounded physical push. */
(function(root){
'use strict';
const Core=root.CrustDeep||(typeof require==='function'?require('./master-of-deep.js'):null);
function create(){return {...Core.create(),attack:'scraper',lane:300,wave:null,swipes:0};}
function overlapsWave(w,p){
 const top=Math.max(w.y,p.y),bottom=Math.min(w.y+w.h,p.y+p.h);if(top>=bottom)return false;
 for(let y=top;y<=bottom;y+=2){const t=(y-w.y-w.h/2)/(w.h/2),front=w.x+36*t*t;if(p.x+p.w>front&&p.x<front+18)return true;}
 return false;
}
function contact(e,p){
 const w=e.wave;if(!e.alive||!w||w.hit||p.inv||!overlapsWave(w,p))return false;
 w.hit=true;p.health--;p.inv=90;p.waterPush={vx:-3.2,frames:20};e.hits++;return true;
}
function update(e,p,hit=()=>false){
 if(!e.alive){e.wave=null;p.waterPush=null;Core.update(e,p);return;}
 e.age++;e.inv=Math.max(0,e.inv-1);
 if(e.wave){const w=e.wave;for(let i=0;i<6;i++){w.x-=1;if(hit(w.x,w.y,w.w,w.h)){e.wave=null;break;}contact(e,p);}if(e.wave&&e.wave.x+e.wave.w<=32)e.wave=null;}
 if(e.phase==='prepare'&&e.timer===35)e.locked=true;
 if(e.phase==='shove'&&e.timer===20){e.wave={x:510,y:e.lane-72,w:64,h:144,hit:false};e.swipes++;}
 if(--e.timer>0)return;
 if(e.phase==='observe'){e.phase='prepare';e.timer=72;e.locked=false;}
 else if(e.phase==='prepare'){e.phase='shove';e.timer=28;e.attacks++;}
 else if(e.phase==='shove'){e.phase='recover';e.timer=112;}
 else {e.phase='observe';e.timer=45;}
}
function shot(e,s){const result=Core.shot(e,s);if(result==='defeat')e.wave=null;return result;}
function applyPush(p,hit){
 const push=p.waterPush;if(!push)return;
 const steps=Math.ceil(Math.abs(push.vx)),dx=push.vx/steps;
 for(let i=0;i<steps;i++){if(hit(p.x+dx,p.y,p.w,p.h)){p.waterPush=null;return;}p.x+=dx;}
 if(--push.frames<=0)p.waterPush=null;
}
const api={create,update,shot,contact,applyPush,overlapsWave};root.CrustScraper=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
