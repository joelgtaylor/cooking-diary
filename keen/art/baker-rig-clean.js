/* Crust Quest V2: clean cutout-puppet sprite.
 * Reuses ONE AI-painted baker pose; old limbs are cut out, not left ghosting
 * behind the animated limbs. Kept separate from V1 for A/B comparison.
 */
(function(){
'use strict';
const W=96,H=112,TAU=Math.PI*2,DEG=Math.PI/180;
let cachedImage=null,cachedArt=null;
function canvas(w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;return c;
}
function ctx(canvas){
  const g=canvas.getContext('2d',{willReadFrequently:true});
  g.imageSmoothingEnabled=false;
  return g;
}
function sourceTile(image,row,col){
  const c=canvas(W,H),g=ctx(c);
  g.drawImage(image,col*W,row*H,W,H,0,0,W,H);
  return c;
}
// Polygon masks cut limbs directly out of the painting. No procedural
// geometry sits on top of original painted hands, sleeves, shoes or trousers.
function inside(x,y,polygon){
  let hit=false;
  for(let a=0,b=polygon.length-1;a<polygon.length;b=a++){
    const p=polygon[a],q=polygon[b];
    if(((p[1]>y)!==(q[1]>y)) &&
       (x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0]))hit=!hit;
  }
  return hit;
}
function maskPart(original,polygon){
  const c=canvas(W,H),g=ctx(c);g.drawImage(original,0,0);
  const id=g.getImageData(0,0,W,H),d=id.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)
    if(!inside(x+.5,y+.5,polygon))d[(y*W+x)*4+3]=0;
  g.putImageData(id,0,0);return c;
}
function cleanTorso(original){
  const c=canvas(W,H),g=ctx(c);g.drawImage(original,0,0);
  const id=g.getImageData(0,0,W,H),d=id.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=(y*W+x)*4,r=d[i],gr=d[i+1],b=d[i+2];
    // Maintain the entire hat/face/neck and the red scarf tail.
    // Clip old left arm, old right fist and both original running legs.
    const redScarf=(x<41 && y<57 && r>95 && gr<90 &&
                    b<100 && r>gr*1.4);
    const keep=(y<53)
      ||(y<60&&(x>=41||redScarf))
      ||(y<66&&x>=41&&x<=71)
      ||(y<78&&x>=38&&x<=64)
      ||(y<83&&x>=38&&x<=61);
    if(!keep)d[i+3]=0;
  }
  g.putImageData(id,0,0);return c;
}
function swing(g,part,x,y,degrees){
  g.save();g.translate(x,y);g.rotate(degrees*DEG);
  g.drawImage(part,-x,-y);g.restore();
}
function createParts(image){
  const source=sourceTile(image,1,1);
  return {
    torso:cleanTorso(source),
    farArm:maskPart(source,[
      [16,59],[21,56],[28,53],[31,52],[37,52],[43,56],
      [44,62],[39,66],[31,65],[26,72],[18,71],[14,68]
    ]),
    nearArm:maskPart(source,[
      [61,62],[69,61],[78,63],[83,69],
      [82,76],[76,80],[68,78],[60,72]
    ]),
    backLeg:maskPart(source,[
      [13,81],[22,78],[31,76],[40,73],[52,75],[51,86],
      [39,88],[27,94],[15,95],[12,89]
    ]),
    frontLeg:maskPart(source,[
      [43,75],[55,74],[63,80],[68,86],[80,94],
      [81,99],[73,103],[64,101],[57,96],[51,86],[44,85]
    ])
  };
}
function runAtlas(image){
  const parts=createParts(image);
  const atlas=canvas(8*W,H),out=ctx(atlas);
  for(let i=0;i<8;i++){
    const t=i*TAU/8,s=Math.sin(t),c=Math.cos(t);
    const frame=canvas(W,H),g=ctx(frame);
    // Back-to-front layering places the limb roots BEHIND the jacket,
    // except for the near hand which belongs in front.
    swing(g,parts.backLeg,40,77,-(33*s+8*c));
    swing(g,parts.farArm,42,57,25*s-7*c);
    swing(g,parts.frontLeg,51,77,29*s-7*c);
    g.drawImage(parts.torso,0,0);
    swing(g,parts.nearArm,62,65,20*s-5*c);
    out.drawImage(frame,i*W,0);
  }
  return atlas;
}
function flightAtlas(image,row,col,fall){
  // Keep the successful jumping illustration; move lower legs only.
  // Head, expression, hat, scarf and jacket are identical across 4 frames.
  const source=sourceTile(image,row,col);
  const lower=canvas(W,H),lg=ctx(lower);
  lg.drawImage(source,0,80,W,H-80,0,80,W,H-80);
  const atlas=canvas(4*W,H),g=ctx(atlas);
  const angles=fall?[12,5,-4,-12]:[-12,-4,6,13];
  for(let i=0;i<4;i++){
    g.save();g.translate(i*W+48,80);
    g.rotate(angles[i]*DEG);g.drawImage(lower,-48,-80);
    g.restore();
    g.drawImage(source,0,0,W,83,i*W,0,W,83);
  }
  return atlas;
}
function ensure(image){
  if(!image||!image.complete||!image.naturalWidth)return null;
  if(image===cachedImage)return cachedArt;
  cachedImage=image;
  try{
    cachedArt={
      run:runAtlas(image),jump:flightAtlas(image,2,1,false),
      fall:flightAtlas(image,3,3,true),width:W,height:H
    };
  }catch(e){
    console.warn('Clean Crust Quest rig could not build; using old sprites.',e);
    cachedArt=null;
  }
  return cachedArt;
}
window.CrustBakerRigClean={ensure,version:'2.0'};
})();
