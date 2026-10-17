/* Crust Quest outline polish, Phase 1 revision 2.
 * The first pass only darkened edges ~10%, which was imperceptible in play.
 * This pass gives the EXISTING opaque outer pixel a deliberate retro contour,
 * and snaps the adjacent inner pixel to a small color-ramp palette.
 * Alpha, silhouette, tile size and interior shading remain unchanged.
 */
(function(){
'use strict';
const CELL_W=96,CELL_H=112,COUNTS=[5,4,4,4,4,4,3,2];
const COLORS=[[31,30,48],[52,39,58],[80,49,57],[113,65,63],[89,84,109],[119,113,144],[154,148,170],[181,173,191],[198,184,190],[227,217,212],[246,237,231],[124,47,62],[176,48,65],[210,73,79],[234,108,102],[109,65,66],[155,83,65],[200,123,84],[239,175,118],[253,209,155],[26,48,76],[30,66,101],[35,89,136],[57,127,166],[90,162,186],[77,46,52],[109,62,51],[164,94,60],[210,145,95],[115,103,111],[161,152,155],[211,210,211]];
const OUTLINE=[[34,34,53],[61,46,61],[80,49,57],[113,65,63],[103,99,131],[119,113,144],[154,148,170],[181,173,191],[181,173,191],[181,173,191],[181,173,191],[124,47,62],[135,35,51],[152,46,61],[162,68,75],[98,60,61],[113,63,53],[129,77,62],[153,95,78],[169,113,89],[26,48,76],[30,66,101],[32,76,115],[40,83,121],[48,103,145],[77,46,52],[94,54,50],[112,68,52],[138,86,60],[102,88,103],[126,116,133],[145,136,149]];
const cache=new WeakMap();
function nearest(r,g,b){
  let best=0,dist=Infinity;
  for(let i=0;i<COLORS.length;i++){
    const c=COLORS[i],dr=r-c[0],dg=g-c[1],db=b-c[2];
    const d=dr*dr+dg*dg+db*db;
    if(d<dist){dist=d;best=i;}
  }
  return best;
}
function get(image){
  if(!image||!image.complete||!image.naturalWidth)return image;
  if(cache.has(image))return cache.get(image);
  try{
    if(image.naturalWidth!==960||image.naturalHeight!==896){
      console.warn('Crust outline polish: unexpected atlas geometry');
      return image;
    }
    const outCanvas=document.createElement('canvas');
    outCanvas.width=960;outCanvas.height=896;
    const ctx=outCanvas.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(image,0,0);
    const imageData=ctx.getImageData(0,0,960,896);
    const output=imageData.data,src=new Uint8ClampedArray(output);
    for(let row=0;row<COUNTS.length;row++){
      for(let col=0;col<COUNTS[row];col++){
        const cellX=col*CELL_W,cellY=row*CELL_H;
        const opaque=new Uint8Array(CELL_W*CELL_H);
        const outer=new Uint8Array(CELL_W*CELL_H);
        // Read only the original binary-alpha silhouette, per cell.
        for(let y=0;y<CELL_H;y++)for(let x=0;x<CELL_W;x++){
          const pos=y*CELL_W+x;
          opaque[pos]=src[((cellY+y)*960+cellX+x)*4+3]===255?1:0;
        }
        for(let y=0;y<CELL_H;y++)for(let x=0;x<CELL_W;x++){
          const pos=y*CELL_W+x;
          if(!opaque[pos])continue;
          let exposed=false;
          for(let dy=-1;dy<=1&&!exposed;dy++)for(let dx=-1;dx<=1;dx++){
            if(!dx&&!dy)continue;
            const xx=x+dx,yy=y+dy;
            if(xx<0||xx>=CELL_W||yy<0||yy>=CELL_H||
               !opaque[yy*CELL_W+xx]){exposed=true;break;}
          }
          if(exposed)outer[pos]=1;
        }
        for(let y=0;y<CELL_H;y++)for(let x=0;x<CELL_W;x++){
          const pos=y*CELL_W+x;
          if(!opaque[pos])continue;
          const index=((cellY+y)*960+cellX+x)*4;
          // Two known stray fragments in the original atlas, not clothing.
          if((row===1&&col===1&&x<=20&&y>=95)||
             (row===3&&col===3&&x<=24&&y<=35)){
            output[index]=output[index+1]=output[index+2]=0;
            output[index+3]=0;
            continue;
          }
          // Limit palette work to the original one- or two-pixel edge band.
          let near=!!outer[pos];
          if(!near){
            for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++){
              if(!dx&&!dy)continue;
              const xx=x+dx,yy=y+dy;
              if(xx>=0&&xx<CELL_W&&yy>=0&&yy<CELL_H&&
                 outer[yy*CELL_W+xx]){near=true;break;}
            }
          }
          if(!near)continue;
          const match=nearest(src[index],src[index+1],src[index+2]);
          const newColor=outer[pos]?OUTLINE[match]:COLORS[match];
          output[index]=newColor[0];output[index+1]=newColor[1];
          output[index+2]=newColor[2];
        }
      }
    }
    ctx.putImageData(imageData,0,0);
    // Preserve Image-like readiness for the existing drawImage paths.
    outCanvas.complete=true;
    outCanvas.naturalWidth=960;
    outCanvas.naturalHeight=896;
    cache.set(image,outCanvas);
    return outCanvas;
  }catch(e){
    console.warn('Crust outline polish failed, using original atlas',e);
    return image;
  }
}
window.CrustOutlinePolish=Object.freeze({
  get,version:'phase1-v2',cellWidth:CELL_W,cellHeight:CELL_H
});
})();
