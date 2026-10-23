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
function draw(g,e,body,arm){
 const p=pose(e);g.save();g.imageSmoothingEnabled=false;
 if(!e.alive){const t=1-e.deathT/150;g.translate(0,t*45);g.globalAlpha=1-t*.45;}
 if(arm.naturalWidth)drawArm(g,arm,p);
 if(body.naturalWidth)g.drawImage(body,p.body*724,0,724,724,600,100,327,327);
 g.restore();
}
const api={pose,draw,drawArm,armFrames,scale};root.CrustDeepArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
