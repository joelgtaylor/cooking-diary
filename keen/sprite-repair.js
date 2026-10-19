/* Build-time, pixel-preserving repair of small enclosed baker transparency holes.
 * Exterior-connected gaps, large openings and the pogo spring remain transparent.
 * This never moves a pixel or changes an existing non-transparent pixel.
 */
'use strict';
function repairBakerPixels(source,width,height,frameWidth=96,frameHeight=112,counts=[5,4,4,4,4,4,3,2]){
 const pixels=new Uint8ClampedArray(source);
 let repaired=0;
 for(let row=0;row<counts.length;row++)for(let frame=0;frame<counts[row];frame++){
  const ox=frame*frameWidth,oy=row*frameHeight;
  if(ox+frameWidth>width||oy+frameHeight>height)continue;
  const seen=new Uint8Array(frameWidth*frameHeight);
  const index=(x,y)=>((oy+y)*width+ox+x)*4;
  for(let sy=0;sy<frameHeight;sy++)for(let sx=0;sx<frameWidth;sx++){
   const start=sy*frameWidth+sx;
   if(seen[start]||source[index(sx,sy)+3])continue;
   const queue=[start],component=[],boundary=new Set();seen[start]=1;
   let exterior=false,minY=sy;
   for(let q=0;q<queue.length;q++){
    const cell=queue[q],x=cell%frameWidth,y=Math.floor(cell/frameWidth);
    component.push(cell);minY=Math.min(minY,y);
    if(x===0||y===0||x===frameWidth-1||y===frameHeight-1)exterior=true;
    for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){
     const nx=x+dx,ny=y+dy;
     if(nx<0||ny<0||nx>=frameWidth||ny>=frameHeight)continue;
     const neighbour=ny*frameWidth+nx;
     if(source[index(nx,ny)+3])boundary.add(neighbour);
     else if(!seen[neighbour]){seen[neighbour]=1;queue.push(neighbour);}
    }
   }
   // Small accidental pinholes only; preserve spring loops and foot/particle edges.
   if(exterior||component.length>64||!boundary.size||minY>=98||(row===6&&minY>=85))continue;
   for(const cell of component){
    const x=cell%frameWidth,y=Math.floor(cell/frameWidth);
    let nearest=-1,distance=Infinity;
    for(const edge of boundary){
     const bx=edge%frameWidth,by=Math.floor(edge/frameWidth),d=(x-bx)**2+(y-by)**2;
     if(d<distance){distance=d;nearest=edge;}
    }
    const target=index(x,y),from=index(nearest%frameWidth,Math.floor(nearest/frameWidth));
    pixels[target]=source[from];pixels[target+1]=source[from+1];pixels[target+2]=source[from+2];pixels[target+3]=255;
    repaired++;
   }
  }
 }
 return {pixels,repaired};
}
if(typeof module!=='undefined')module.exports={repairBakerPixels};
