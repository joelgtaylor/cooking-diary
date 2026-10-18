/* Crust Quest — Phase 2 vertical parallax prototype.
 * Rendering only. All speeds are relative to camera world coordinates.
 * Keeps the approved 960x540 Bakery 1 artwork as the distant painting.
 */
(function(){
'use strict';
const profiles={
 subtle:{distant:.05,middle:.18,near:.35},
 balanced:{distant:.10,middle:.32,near:.62},
 dramatic:{distant:.18,middle:.48,near:.83}
};
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function render(g,opt){
 const W=opt.width,H=opt.height,cx=opt.cameraX,cy=opt.cameraY;
 const maxY=Math.max(1,opt.worldHeight-H);
 const profile=profiles[opt.profile]||profiles.balanced;
 const enabled=opt.enabled!==false;
 const speeds=enabled?profile:{distant:0,middle:0,near:0};
 const t=clamp(cy/maxY,0,1); // 0: upper rooftops, 1: cellar floor
 const stage=opt.stage||1;
 const pal=stage===2?
   {sky:'#172941',far:'#24465d',mid:'#36656c',near:'#45605c',window:'#e4af8d'}:
   stage===3?
   {sky:'#27203b',far:'#49415a',mid:'#655061',near:'#79545a',window:'#ffc17f'}:
   {sky:'#182647',far:'#283b61',mid:'#38486d',near:'#4c4561',window:'#ffd9a1'};
 const background=opt.background;
 g.save();
 g.imageSmoothingEnabled=false;
 // Distant illustrated sky drifts only a small amount, allowing us to use
 // the existing 960x540 artwork rather than stretching it to world height.
 g.fillStyle=pal.sky;g.fillRect(0,0,W,H);
 if(background&&background.complete&&background.naturalWidth>0){
   const pad=76;
   const sx=-pad/2-(cx*speeds.distant*.032)%38;
   const sy=-pad/2-(cy*speeds.distant*.030)%30;
   g.drawImage(background,Math.round(sx),Math.round(sy),W+pad,H+pad);
 }
 if(!enabled){g.restore();return;}
 // Distant silhouettes are independent of the illustrated backdrop, and
 // are anchored to virtual world positions at two distinct depth ratios.
 function skyline(depth,color,base,spacing,width,height,seed,windowColor){
   const scrollX=cx*depth, scrollY=cy*depth;
   const offset=Math.floor(scrollX/spacing);
   g.fillStyle=color;
   for(let n=offset-3;n<offset+Math.ceil(W/spacing)+4;n++){
     const variation=((n*127+seed*43)%11+11)%11;
     const x=Math.round(n*spacing-scrollX);
     const y=Math.round(base+variation*11-scrollY*.48);
     const w=width+((variation*7)%30);
     const h=height+variation*10;
     g.fillRect(x,y,w,h);
     // Slanted roofs and masonry shoulders give silhouette variety.
     g.fillRect(x+6,y-10,w-12,10);
     g.fillRect(x+12,y-20,10,12);
     if(windowColor){
       for(let wy=y+18;wy<Math.min(H,y+h);wy+=31)
         for(let wx=x+11;wx<x+w-12;wx+=24){
           if(((wx+wy+n)&3)===0)continue;
           g.fillStyle=windowColor;g.fillRect(wx,wy,5,8);g.fillStyle=color;
         }
     }
   }
 }
 // Far city, midground walls, and near columns. Relative movement grows
 // with proximity, in both X and Y, but never affects the collision world.
 skyline(speeds.distant,pal.far,H*.61,136,76,240,3,null);
 skyline(speeds.middle,pal.mid,H*.76,108,71,260,7,pal.window);
 skyline(speeds.near,pal.near,H*1.12,182,28,400,11,null);
 // A height-driven atmosphere wash: cooler near the rooftops, warmer
 // in the cellar. Overlay is deliberately subtle to preserve authored art.
 g.fillStyle=stage===1?'rgba(235,147,85,'+(t*.18).toFixed(3)+')':
   stage===2?'rgba(52,245,190,'+(t*.12).toFixed(3)+')':
   'rgba(255,110,55,'+(t*.17).toFixed(3)+')';
 g.fillRect(0,0,W,H);
 if(opt.labels){
   g.font='bold 13px monospace';g.textAlign='left';
   g.fillStyle='#f8e6ca';
   const name=t<.32?'UPPER ROOFTOPS':t<.7?'MID-CITY HEIGHT':'LOWER BAKERY';
   g.fillText(name+' · '+opt.profile.toUpperCase()+' PARALLAX',16,H-48);
 }
 g.restore();
}
window.CrustParallax=Object.freeze({render,profiles,version:'phase2-v1'});
})();