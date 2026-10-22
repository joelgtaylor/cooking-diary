/* Generated discovery-district art. Rendering only, with native-art fallbacks.
 * Every source crop keeps its aspect ratio; architecture is clipped or repeated.
 * No pixel readback, runtime recoloring or per-frame asset generation. */
'use strict';
let cavernDistrictArt=null;
const CAVERN_DISTRICT_CROPS=Object.freeze({
 cellar:[30,76,353,298],hollow:[419,8,349,385],car:[781,220,413,143],
 winch:[1261,85,256,265],hatch:[29,540,364,118],open:[456,510,295,148],
 shelf:[821,481,343,194],window:[1277,426,180,258],
 pin:[28,846,407,88],compass:[503,719,224,270],token:[882,775,206,202],rail:[1305,701,88,313],
 hollowTop:[419,8,349,185],hollowBase:[419,304,349,89],
 barkLeft:[447,193,45,110],barkRight:[700,193,45,110],barkBack:[545,215,90,90]
});
function cavernDistrictArtReady(){
 if(!cavernDiscoveryLayout()||window.__crustWorldArtEnabled===false||/(?:^|[?&])districtArt=off(?:&|$)/.test(window.location?.search||''))return false;
 if(!cavernDistrictArt){cavernDistrictArt=new Image();cavernDistrictArt.src='../previews/exploration/cavern-discovery-atlas.webp';}
 return cavernDistrictArt.complete&&cavernDistrictArt.naturalWidth===1536&&cavernDistrictArt.naturalHeight===1024;
}
function cavernDistrictSprite(name,x,y,width){
 const c=CAVERN_DISTRICT_CROPS[name],height=width*c[3]/c[2];
 if(!cavernVisible(x,y,width,height))return;
 g.imageSmoothingEnabled=false;
 g.drawImage(cavernDistrictArt,...c,Math.round(x),Math.round(y),width,height);
}
function drawCavernCellarArt(d){
 if(!cavernDistrictArtReady())return false;
 const [x,y,x1,y1]=d.cellar.bounds,width=(x1-x)*T,bay=width/3,height=bay*298/353;
 g.save();g.beginPath();g.rect(x*T,y*T,width,(y1-y)*T);g.clip();
 // Three repeated arch bays, not one stretched wall across the whole cellar.
 for(let row=y*T;row<y1*T;row+=height)for(let col=0;col<3;col++)cavernDistrictSprite('cellar',x*T+col*bay,row,bay);
 for(const [sx,sy]of [[7.5,59.6],[20,59.6],[7.5,67.7],[20,67.7]]){
  const w=2.8*T,h=w*194/343;cavernDistrictSprite('shelf',sx*T-w/2,sy*T-h,w);
 }
 g.restore();return true;
}
function drawCavernHollowArt(){
 if(!cavernDistrictArtReady())return false;
 const x=69*T,y=44*T,width=7*T,bottom=54*T;
 const topHeight=width*185/349,baseHeight=width*89/349;
 g.save();g.beginPath();g.rect(x,y,width,bottom-y);g.clip();
 rect(x,y,width,bottom-y,'#191724');
 const bay=width/3;for(let yy=y;yy<bottom;yy+=bay)for(let col=0;col<3;col++)cavernDistrictSprite('barkBack',x+col*bay,yy,bay);
 cavernDistrictSprite('hollowTop',x,y,width);
 // Vertical bark joints extend the stalk without stretching the source image.
 for(let yy=y+topHeight;yy<bottom-baseHeight;yy+=55*110/45){
  cavernDistrictSprite('barkLeft',x,yy,55);cavernDistrictSprite('barkRight',x+width-55,yy,55);
 }
 cavernDistrictSprite('hollowBase',x,bottom-baseHeight,width);
 for(const wy of [48.1,51.2])cavernDistrictSprite('window',74*T,wy*T,1.1*T);
 g.restore();return true;
}
function drawCavernRelicArt(r,x,y){
 if(!cavernDistrictArtReady())return false;
 const w=r.kind==='pin'?36:27,c=CAVERN_DISTRICT_CROPS[r.kind];
 cavernDistrictSprite(r.kind,x-w/2,y-w*c[3]/c[2]/2,w);return true;
}
function drawCavernLiftCarArt(x,y){
 if(!cavernDistrictArtReady())return false;
 // The opaque top plank starts at the real support height.
 cavernDistrictSprite('car',x-27,y,54);return true;
}
function drawCavernLiftRailArt(x,top,bottom){
 if(!cavernDistrictArtReady())return false;
 const width=8,step=width*313/88;
 const start=Math.max(0,Math.floor((cameraY-top)/step));
 g.save();g.beginPath();g.rect(x-36,top,72,bottom-top);g.clip();
 for(let i=start,y=top+i*step;y<Math.min(bottom,cameraY+H);y+=step){
  cavernDistrictSprite('rail',x-34,y,width);cavernDistrictSprite('rail',x+26,y,width);
 }
 g.restore();return true;
}
function drawCavernWinchArt(x,y,repaired){
 if(!cavernDistrictArtReady())return false;
 const w=44,h=w*265/256;cavernDistrictSprite('winch',x-w/2,y-h,w);
 // State is encoded by shape as well as colour.
 rect(x+12,y-8,10,8,'#1c2830');
 if(repaired){rect(x+14,y-4,3,2,'#bcf4d6');rect(x+17,y-6,2,4,'#bcf4d6');}
 else{rect(x+14,y-6,2,2,'#ffe0a1');rect(x+18,y-6,2,2,'#ffe0a1');rect(x+16,y-4,2,2,'#ffe0a1');}
 return true;
}
function drawCavernHatchArt(mx,my,mw,opened){
 if(!cavernDistrictArtReady())return false;
 const x=mx*T,y=my*T,w=mw*T;
 if(!opened)cavernDistrictSprite('hatch',x,y,w);
 else{
  // Draw just the jambs: a full top bar would imply a closed collision surface.
  g.save();g.beginPath();g.rect(x,y,8,T*2);g.rect(x+w-8,y,8,T*2);g.clip();
  cavernDistrictSprite('open',x,y,w);g.restore();
 }
 return true;
}
