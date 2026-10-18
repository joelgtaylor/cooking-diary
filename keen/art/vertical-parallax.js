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
 const profile=profiles[opt.profile]||profiles.dramatic;
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
 // Phase 3 outside-world treatment: the original single-screen painting
 // has indoor ceiling beams and hanging lamps baked into its top 160px.
 // Replace only that outdated *distant canvas* with open sky. The detailed
 // generated parallax layers remain untouched and keep their visual depth.
 if(opt.outdoorCity&&stage===1){
   const sky=g.createLinearGradient(0,0,0,H);
   sky.addColorStop(0,'#060c30');
   sky.addColorStop(.48,'#14236b');
   sky.addColorStop(1,'#343d94');
   g.fillStyle=sky;g.fillRect(0,0,W,H);
   // Star points are deterministic, lightweight, and screen-space distant.
   const driftX=Math.round(cx*speeds.distant*.018);
   const driftY=Math.round(cy*speeds.distant*.012);
   for(let i=0;i<58;i++){
     const x=((i*197+71-driftX)%W+W)%W;
     const y=((i*97+37-driftY)%(H*.64)+(H*.64))%(H*.64);
     const r=i%9===0?2:1;
     g.fillStyle=i%5===0?'#b8cafa':'#f2eafc';
     g.fillRect(Math.round(x),Math.round(y),r,r);
   }
   // Reuse the original painting's actual pixel-art moon, tightly clipped
   // so none of the old ceiling beams or suspension columns can appear.
   if(background&&background.complete&&background.naturalWidth>0){
     const sx=background.naturalWidth*(1160/1672),
       sy=background.naturalHeight*(123/941);
     const sw=background.naturalWidth*(180/1672),
       sh=background.naturalHeight*(173/941);
     g.save();
     const mx=Math.round(W*.75-cx*.008),my=Math.round(105-cy*.005);
     g.beginPath();g.arc(mx+65,my+63,61,0,Math.PI*2);g.clip();
     g.drawImage(background,sx,sy,sw,sh,mx,my,130,126);
     g.restore();
   }
 }else if(background&&background.complete&&background.naturalWidth>0){
   const pad=76;
   const sx=-pad/2-(cx*speeds.distant*.032)%38;
   const sy=-pad/2-(cy*speeds.distant*.030)%30;
   g.drawImage(background,Math.round(sx),Math.round(sy),W+pad,H+pad);
 }
 if(!enabled){g.restore();return;}
 // Phase 2.1: replace the geometric city silhouettes with the approved
 // transparent Bakery 1 illustrations. Drawing remains behind the world.
 const illustration=opt.layers;
 const hasIllustration=stage===1&&illustration&&
   ['far','mid','near'].every(key=>{
     const im=illustration[key];return im&&im.complete&&im.naturalWidth>0;
   });
 if(hasIllustration){
   const maxX=Math.max(1,(opt.worldWidth||3360)-W);
   const dx=clamp(cx/maxX,0,1)-.5,dy=clamp(cy/maxY,0,1)-.5;
   const entries=[
     {image:illustration.far,speed:speeds.distant},
     {image:illustration.mid,speed:speeds.middle},
     {image:illustration.near,speed:speeds.near}
   ];
   for(const item of entries){
     // Overscan ensures no black edge during vertical or horizontal travel.
     const padX=250,padY=146;
     const offsetX=dx*item.speed*190;
     const offsetY=dy*item.speed*130;
     const x=Math.round(-padX/2-offsetX);
     const y=Math.round(-padY/2-offsetY);
     g.drawImage(item.image,x,y,W+padX,H+padY);
   }
 }else if(stage!==1){
   // Other bakeries keep Phase 2 prototype architecture for now; their
   // corresponding detailed art passes are separate work.
   function skyline(depth,color,base,spacing,width,height,seed,windowColor){
     const scrollX=cx*depth,scrollY=cy*depth;
     const offset=Math.floor(scrollX/spacing);
     g.fillStyle=color;
     for(let n=offset-3;n<offset+Math.ceil(W/spacing)+4;n++){
       const variation=((n*127+seed*43)%11+11)%11;
       const x=Math.round(n*spacing-scrollX),y=Math.round(base+variation*11-scrollY*.48);
       const w=width+((variation*7)%30),h=height+variation*10;
       g.fillRect(x,y,w,h);
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
   skyline(speeds.distant,pal.far,H*.61,136,76,240,3,null);
   skyline(speeds.middle,pal.mid,H*.76,108,71,260,7,pal.window);
   skyline(speeds.near,pal.near,H*1.12,182,28,400,11,null);
 }
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
window.CrustParallax=Object.freeze({render,profiles,version:'phase2-art-cohesion-v1'});
})();