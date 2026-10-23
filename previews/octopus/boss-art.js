/* Presentation only. Sprite root and razor anchors follow approved simulation. */
(function(root){
'use strict';
const armFrames=[
 {crop:[18,300,700,235],tip:[60,400],root:[673,399]},
 {crop:[750,295,670,195],tip:[794,400],root:[1379,400]},
 {crop:[1460,250,700,270],tip:[1527,302],root:[2123,414]}
];
function pose(e){
 let x=662,y=210,arm=0;
 if(e.phase==='prepare'){x=650;y=e.lane-60;arm=e.locked?1:0;}
 if(e.phase==='sweep'){x=e.tipX;y=e.lane;arm=1;}
 if(e.phase==='recover'){const t=1-e.timer/100;x=80+580*t;y=e.lane+(310-e.lane)*t;arm=t<.45?2:0;}
 if(!e.alive){x=660;y=420;arm=2;}
 return {tip:{x,y},root:{x:700,y:292},arm,body:!e.alive||e.phase==='recover'?2:e.phase==='prepare'||e.phase==='sweep'?1:0};
}
function drawArm(g,image,p){
 const f=armFrames[p.arm],sx=f.tip[0]-f.root[0],sy=f.tip[1]-f.root[1],length=Math.hypot(sx,sy),ux=sx/length,uy=sy/length;
 const dx=p.tip.x-p.root.x,dy=p.tip.y-p.root.y,distance=Math.max(1,Math.hypot(dx,dy)),vx=dx/distance,vy=dy/distance;
 // The grip/razor uses uniform scale even at maximum reach. Only the limb extends.
 const cosine=vx*ux+vy*uy,sine=vy*ux-vx*uy,scale=.22;
 const cut=p.arm*724+250,join=[cut,f.tip[1]+(p.arm===0?52:p.arm===2?96:18)];
 const jx=join[0]-f.tip[0],jy=join[1]-f.tip[1];
 const worldJoin={x:p.tip.x+scale*(cosine*jx-sine*jy),y:p.tip.y+scale*(sine*jx+cosine*jy)};
 const ax=join[0]-f.root[0],ay=join[1]-f.root[1],al=Math.hypot(ax,ay),su=ax/al,sv=ay/al;
 const bx=worldJoin.x-p.root.x,by=worldJoin.y-p.root.y,bl=Math.max(1,Math.hypot(bx,by)),du=bx/bl,dv=by/bl;
 const along=bl/al,across=.20;
 const a=along*du*su+across*dv*sv,b=along*dv*su-across*du*sv;
 const c=along*du*sv-across*dv*su,d=along*dv*sv+across*du*su;
 g.save();g.translate(p.root.x,p.root.y);g.transform(a,b,c,d,0,0);g.translate(-f.root[0],-f.root[1]);
 const tail=[cut-8,f.crop[1],f.crop[0]+f.crop[2]-cut+8,f.crop[3]];
 g.drawImage(image,...tail,...tail);g.restore();
 g.save();g.translate(p.tip.x,p.tip.y);g.transform(scale*cosine,scale*sine,-scale*sine,scale*cosine,0,0);g.translate(-f.tip[0],-f.tip[1]);
 const hand=[f.crop[0],f.crop[1],cut-f.crop[0]+8,f.crop[3]];
 g.drawImage(image,...hand,...hand);g.restore();
}
function draw(g,e,body,arm){
 const p=pose(e);g.save();g.imageSmoothingEnabled=false;
 if(!e.alive){const t=1-e.deathT/150;g.translate(0,t*45);g.globalAlpha=1-t*.45;}
 if(body.naturalWidth)g.drawImage(body,p.body*724,0,724,724,600,100,327,327);
 if(arm.naturalWidth)drawArm(g,arm,p);
 g.restore();
}
const api={pose,draw,drawArm,armFrames};root.CrustDeepArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
