/* Crust Quest baker rig, V1.
 * Composes an eight-phase, consistent running cycle from one AI-painted torso.
 * Also makes four gentle variants of the SAME jumping/falling artworks.
 * This module is inert until CrustBakerRig.ensure(spriteAtlas) is called.
 */
(function(){
'use strict';
const W=96,H=112,TAU=Math.PI*2;
const C={
 ink:'#2a283d',denim:'#285a86',lit:'#3584b1',
 denimDark:'#1c4165',boot:'#864529',bootDark:'#552934',
 bootHi:'#d78d51',white:'#f8eee1',gray:'#bbb6bf',
 skin:'#ffdab0',skinShadow:'#e9a06c'
};
let cacheImg=null,cache=null;
function makeCanvas(w,h){
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  return canvas;
}
function pixelContext(canvas){
  const g=canvas.getContext('2d',{willReadFrequently:true});
  g.imageSmoothingEnabled=false;
  return g;
}
function sourceTile(img,row,col){
  const tile=makeCanvas(W,H),g=pixelContext(tile);
  g.drawImage(img,col*W,row*H,W,H,0,0,W,H);
  return tile;
}
function cutCanonicalTorso(img){
  // Source row 1, frame 1: the SAME face, hat, scarf and torso in all 8 run poses.
  // Remove the old limbs; the animated rig replaces them.
  const tile=sourceTile(img,1,1),g=pixelContext(tile);
  const pixels=g.getImageData(0,0,W,H),d=pixels.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(y>=80||(y>=62&&x<32)||(y>=63&&x>=66))
      d[(y*W+x)*4+3]=0;
  }
  g.putImageData(pixels,0,0);
  return tile;
}
function path(g,points){
  g.beginPath();
  g.moveTo(Math.round(points[0][0]),Math.round(points[0][1]));
  for(let i=1;i<points.length;i++)
    g.lineTo(Math.round(points[i][0]),Math.round(points[i][1]));
}
function polygon(g,points,color){
  path(g,points);g.closePath();g.fillStyle=color;g.fill();
}
function stroke(g,points,width,color){
  g.lineJoin='round';g.lineCap='round';
  path(g,points);g.lineWidth=width+4;g.strokeStyle=C.ink;g.stroke();
  path(g,points);g.lineWidth=width;g.strokeStyle=color;g.stroke();
}
function shoe(g,x,y,far){
  x=Math.round(x);y=Math.round(y);
  polygon(g,[[x-4,y-4],[x+3,y-5],[x+11,y-4],[x+13,y],
    [x+8,y+3],[x-6,y+3]],C.ink);
  polygon(g,[[x-3,y-3],[x+7,y-4],[x+11,y-2],
    [x+9,y+1],[x-4,y+1]],far?C.bootDark:C.boot);
  path(g,[[x+1,y-3],[x+8,y-3]]);
  g.strokeStyle=far?C.boot:C.bootHi;g.lineWidth=2;g.stroke();
  path(g,[[x-4,y+2],[x+9,y+2]]);
  g.strokeStyle='#b1a0a1';g.lineWidth=1;g.stroke();
}
function leg(g,hipX,phase,far){
  const stride=Math.sin(phase),lift=Math.max(0,Math.cos(phase));
  const knee=[hipX+9*stride,87-4*lift];
  const ankle=[hipX+19*stride,97-7*lift];
  stroke(g,[[hipX,78],knee,ankle],9,far?C.denimDark:C.denim);
  path(g,[[knee[0]-1,knee[1]-1],[ankle[0]-1,ankle[1]-2]]);
  g.strokeStyle=far?C.denim:C.lit;g.lineWidth=3;g.stroke();
  shoe(g,ankle[0],ankle[1],far);
}
function arm(g,origin,phase,near){
  const sx=origin[0],sy=origin[1],a=Math.sin(phase);
  const elbow=near
    ?[sx+5-7*a,sy+5+3*Math.cos(phase)]
    :[sx-5+7*a,sy+6-2*Math.cos(phase)];
  const hand=near
    ?[sx+10-14*a,sy+7+4*Math.cos(phase)]
    :[sx-12+14*a,sy+8-3*Math.cos(phase)];
  stroke(g,[origin,elbow],9,near?C.white:C.gray);
  stroke(g,[elbow,hand],7,near?C.gray:C.white);
  stroke(g,[hand,[hand[0]+1,hand[1]+1]],5,C.skin);
  path(g,[[hand[0]-2,hand[1]+1],[hand[0]+2,hand[1]+1]]);
  g.strokeStyle=C.skinShadow;g.lineWidth=2;g.stroke();
}
function buildRunning(img){
  const torso=cutCanonicalTorso(img),atlas=makeCanvas(8*W,H);
  const out=pixelContext(atlas);
  for(let frame=0;frame<8;frame++){
    const t=TAU*frame/8;
    const tile=makeCanvas(W,H),g=pixelContext(tile);
    const bob=(frame%2)?1:0;
    leg(g,41,t+Math.PI,true);
    arm(g,[33,59],t,false);
    leg(g,52,t,false);
    polygon(g,[[34,75],[58,74],[64,82],[60,86],[36,85],[31,80]],C.ink);
    polygon(g,[[36,76],[58,76],[61,82],[57,84],[37,83],[34,80]],C.denimDark);
    g.drawImage(torso,0,-bob);
    arm(g,[63,65-bob],t,true);
    out.drawImage(tile,frame*W,0);
  }
  return atlas;
}
function buildFlight(img,row,col,fall){
  // Four poses from ONE painting: the beautiful original face/hat/upper body
  // never changes. Only the lower legs tuck and extend beneath the jacket.
  const source=sourceTile(img,row,col);
  const feet=makeCanvas(W,H);
  const fg=pixelContext(feet);
  // Two-pixel overlap at the waist prevents visible seams.
  fg.drawImage(source,0,80,W,H-80,0,80,W,H-80);
  const atlas=makeCanvas(4*W,H),g=pixelContext(atlas);
  const angles=fall?[12,5,-4,-12]:[-12,-4,6,13];
  for(let i=0;i<4;i++){
    g.save();
    g.translate(i*W+48,80);
    g.rotate(angles[i]*Math.PI/180);
    g.drawImage(feet,-48,-80);
    g.restore();
    // Paint the identical upper character OVER the limb joint to hide the seam.
    g.drawImage(source,0,0,W,83,i*W,0,W,83);
  }
  return atlas;
}
function ensure(image){
  if(!image||!image.complete||!image.naturalWidth)return null;
  if(image===cacheImg)return cache;
  cacheImg=image;
  try{
    cache={
      run:buildRunning(image),
      jump:buildFlight(image,2,1,false),
      fall:buildFlight(image,3,3,true),
      width:W,height:H
    };
  }catch(err){
    console.warn('Crust Quest rig asset could not be built; using original sprites.',err);
    cache=null;
  }
  return cache;
}
window.CrustBakerRig={ensure,version:'1.0'};
})();
