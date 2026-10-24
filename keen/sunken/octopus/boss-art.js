/* Generated inbetweens at one uniform scale. No longitudinal limb scaling. */
(function(root){
'use strict';
const scale=1.15;
const armFrames=[
 {crop:[400,88,310,183],tip:[437,127],root:[670,230]},
 {crop:[962,64,440,215],tip:[1004,111],root:[1350,232]},
 {crop:[190,322,493,210],tip:[230,358],root:[635,476]},
 {crop:[830,340,572,190],tip:[867,375],root:[1358,481]},
 {crop:[38,578,668,200],tip:[75,613],root:[660,717]},
 {crop:[728,607,674,170],tip:[762,638],root:[1355,718]},
 {crop:[213,821,480,202],tip:[250,852],root:[648,968]},
 {crop:[1040,846,362,180],tip:[1078,882],root:[1350,968]}
];
function pose(e){
 let x=560,y=210;
 if(e.phase==='prepare'){x=550;y=e.lane-60;}
 if(e.phase==='sweep'){x=e.tipX;y=e.lane;}
 if(e.phase==='recover'){const t=1-e.timer/100;x=80+480*t;y=e.lane+(210-e.lane)*t;}
 if(!e.alive){x=570;y=390;}
 const joint={x:752,y:292},distance=Math.hypot(x-joint.x,y-joint.y);
 const candidates=e.phase==='recover'?[5,4,3,6,2,7,0]:e.phase==='observe'||!e.alive?[0,7,1]:[0,1,2,3,4,5];
 let arm=candidates[0],best=Infinity;
 for(const i of candidates){const f=armFrames[i],reach=Math.hypot(f.root[0]-f.tip[0],f.root[1]-f.tip[1])*scale;
  // Extra length folds behind the torso; a shorter pose must not leave a gap.
  const score=Math.abs(reach-distance)+(reach<distance?180:0);
  if(score<best){best=score;arm=i;}
 }
 return {tip:{x,y},root:joint,arm,body:!e.alive||e.phase==='recover'?2:e.phase==='prepare'||e.phase==='sweep'?1:0};
}
function drawArm(g,image,p){
 const f=armFrames[p.arm];
 const angle=Math.atan2(p.root.y-p.tip.y,p.root.x-p.tip.x)-Math.atan2(f.root[1]-f.tip[1],f.root[0]-f.tip[0]);
 g.save();
 // Bury the solid muscle root under the torso instead of drawing a cut end over it.
 // The shoulder is at x≈700; this clip ends deep inside the opaque body.
 g.beginPath();g.rect(0,62,742,450);g.clip();
 g.translate(p.tip.x,p.tip.y);g.rotate(angle);
 g.drawImage(image,...f.crop,(f.crop[0]-f.tip[0])*scale,(f.crop[1]-f.tip[1])*scale,f.crop[2]*scale,f.crop[3]*scale);
 g.restore();
}
function drawDefeat(g,e,body,arm,defeat){
 const p=root.CrustDeep.defeatPose(e),s=327/512;
 const crops=[[0,0,512,540],[512,0,512,540],[1024,0,512,540],[0,552,512,472],[512,552,512,472],[1024,552,512,472]];
 const crop=crops[p.frame],baseline=p.frame<3?530:432;
 const settle=1-Math.pow(1-p.settle,2),baseY=420+90*settle;
 if(defeat?.naturalWidth)g.drawImage(defeat,...crop,600,baseY-baseline*s,crop[2]*s,crop[3]*s);
 // Both tools are cosmetic and settle on the actual arena floor. No fading corpse.
 const origin=e.dropOrigin||{x:560,y:210},t=p.drop;
 function dropped(image,source,x0,y0,x1,y1,w,h,spin){
  if(!image.naturalWidth)return;
  const x=x0+(x1-x0)*t,y=y0+(y1-y0)*t*t;
  g.save();g.translate(x,y);g.rotate(spin*t);g.drawImage(image,...source,-w/2,-h/2,w,h);g.restore();
 }
 dropped(arm,[410,104,90,45],origin.x,origin.y,Math.max(75,origin.x-50),486,58,29,Math.PI*.85);
 dropped(body,[580,430,135,140],866,316,860,476,61,63,Math.PI*.45);
}
function draw(g,e,body,arm,defeat){
 g.save();g.imageSmoothingEnabled=false;
 if(!e.alive){drawDefeat(g,e,body,arm,defeat);g.restore();return;}
 const p=pose(e);
 if(arm.naturalWidth)drawArm(g,arm,p);
 if(body.naturalWidth)g.drawImage(body,p.body*724,0,724,724,600,100,327,327);
 g.restore();
}
function drawScraper(g,e,image){
 if(!image.naturalWidth)return;
 const frame=e.phase==='recover'?3:e.phase==='shove'?(e.timer>20?1:2):0;
 const frames=[{crop:[0,0,768,520],anchor:460,base:515},{crop:[768,0,768,520],anchor:1176,base:515},
  {crop:[0,520,820,504],anchor:520,base:1000},{crop:[880,520,656,504],anchor:1210,base:1000}];
 const f=frames[frame],s=.60;g.save();g.imageSmoothingEnabled=false;
 g.drawImage(image,...f.crop,750-(f.anchor-f.crop[0])*s,420-(f.base-f.crop[1])*s,f.crop[2]*s,f.crop[3]*s);g.restore();
}
function drawWake(g,e,image){
 if(!e.wave||!image.naturalWidth)return;
 const frame=Math.floor(e.age/7)%4,w=e.wave;
 g.save();g.imageSmoothingEnabled=false;g.globalAlpha=.9;
 g.drawImage(image,frame*image.naturalWidth/4+50,20,370,750,w.x-4,w.y,71,144);g.restore();
}
function drawInkBody(g,e,image){
 if(!image.naturalWidth)return;
 const frame=e.phase==='ink-spit'?2:e.phase==='ink-rest'?3:e.timer>36?0:1;
 const frames=[{crop:[0,0,630,635],anchor:370,base:630},{crop:[630,0,631,635],anchor:970,base:630},
  {crop:[0,635,655,612],anchor:350,base:1235},{crop:[655,635,606,612],anchor:970,base:1235}];
 const f=frames[frame],s=327/630;g.save();g.imageSmoothingEnabled=false;
 g.drawImage(image,...f.crop,760-(f.anchor-f.crop[0])*s,420-(f.base-f.crop[1])*s,f.crop[2]*s,f.crop[3]*s);g.restore();
}
const api={pose,draw,drawArm,drawDefeat,drawScraper,drawWake,drawInkBody,armFrames,scale};root.CrustDeepArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
