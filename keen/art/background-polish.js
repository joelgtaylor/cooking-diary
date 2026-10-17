/* CRUST BACKGROUND PIXEL POLISH — PILOT V1
 * Bakery 2 (mushroom forest) ONLY. Original Phase 3 data URI images remain
 * untouched; other bakeries, tile collisions, physics and parallax are inert.
 *
 * Rather than a heavy black border, give the existing oval mushroom caps a
 * coherent upper highlight / lower shadow, 1px internal color ramps, crisp
 * shaded stem sides, and subtle silhouettes on the nearby purple towers.
 * Preserve every object's position and every pixel's opacity.
 */
(function(){
'use strict';
const W=960,H=540;
const COLORS=Object.freeze({
  purple:[166,71,186],pink:[210,91,191],blue:[84,143,212],
  rim:[255,171,231],stem:[136,213,197],tower:[77,65,102]
});
const cache=new WeakMap();
function same(d,i,c){
  return d[i]===c[0]&&d[i+1]===c[1]&&d[i+2]===c[2]&&d[i+3]===255;
}
function polish(image,stage=2){
  if(stage!==2||!image||!image.complete||!image.naturalWidth)return image;
  if(cache.has(image))return cache.get(image);
  try{
    if(image.naturalWidth!==W||image.naturalHeight!==H){
      console.warn('Mushroom pixel polish expects a 960x540 background');
      return image;
    }
    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const g=canvas.getContext('2d',{willReadFrequently:true});
    g.imageSmoothingEnabled=false;g.drawImage(image,0,0,W,H);
    const img=g.getImageData(0,0,W,H),out=img.data;
    const src=new Uint8ClampedArray(out),size=W*H;
    const masks={fill:new Uint8Array(size),purple:new Uint8Array(size),
      pink:new Uint8Array(size),blue:new Uint8Array(size),
      rim:new Uint8Array(size),stem:new Uint8Array(size),
      tower:new Uint8Array(size)};
    function write(pos,c){
      const i=pos*4;
      out[i]=c[0];out[i+1]=c[1];out[i+2]=c[2];
    }
    for(let pos=0;pos<size;pos++){
      const i=pos*4;
      for(const name of ['purple','pink','blue','rim','stem','tower']){
        masks[name][pos]=same(src,i,COLORS[name])?1:0;
      }
      masks.fill[pos]=masks.purple[pos]||masks.pink[pos]||masks.blue[pos]?1:0;
    }
    // Classify the original cap ring by its direction. Keep the bright upper
    // rim, make the bottom read like a clean violet underside, and use a
    // midtone around the sides. Isolated bright stars are ignored.
    const upper=new Uint8Array(size),lower=new Uint8Array(size);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const p=y*W+x;
      if(!masks.rim[p])continue;
      let nearFill=false,above=false,below=false;
      for(let dy=-2;dy<=2&&!nearFill;dy++)for(let dx=-2;dx<=2;dx++){
        const xx=x+dx,yy=y+dy;
        if(xx>=0&&xx<W&&yy>=0&&yy<H&&masks.fill[yy*W+xx]){
          nearFill=true;break;
        }
      }
      if(!nearFill)continue;
      for(let d=1;d<=3;d++){
        if(y>=d&&masks.fill[p-d*W])above=true;
        if(y+d<H&&masks.fill[p+d*W])below=true;
      }
      if(below&&!above){upper[p]=1;write(p,[255,191,236]);}
      else if(above&&!below){lower[p]=1;write(p,[202,111,193]);}
      else write(p,[239,151,225]);
    }
    // The band immediately within the rim uses source-matched hues; no new
    // pixels, shapes or additional outlines are drawn outside the caps.
    const caps=[
      [masks.purple,[191,86,202],[138,56,164]],
      [masks.pink,[231,110,211],[180,70,163]],
      [masks.blue,[109,163,224],[61,116,179]]
    ];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const p=y*W+x;
      for(const [mask,top,under] of caps){
        if(!mask[p])continue;
        let topRim=false,bottomRim=false;
        for(let d=1;d<=2;d++){
          if(y>=d&&upper[p-d*W])topRim=true;
          if(y+d<H&&lower[p+d*W])bottomRim=true;
        }
        if(topRim)write(p,top);
        if(bottomRim)write(p,under); // lower shadow takes precedence
        break;
      }
    }
    // Match left and right sides of each mint stem to muted ramp colors.
    // Keep the top face brightly lit so stems retain their original identity.
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const p=y*W+x;
      if(!masks.stem[p])continue;
      const previousStem=x>0&&masks.stem[p-1];
      const followingStem=x+1<W&&masks.stem[p+1];
      if(!previousStem)write(p,[158,229,212]);
      if(!followingStem)write(p,[103,179,170]);
      if(!y||!masks.stem[p-W])write(p,COLORS.stem);
    }
    // Only the vertical boundaries of the existing purple towers change.
    // Their broad, quieter fill remains untouched and atmospheric.
    for(let y=136;y<H;y++)for(let x=0;x<W;x++){
      const p=y*W+x;
      if(!masks.tower[p])continue;
      if(x===0||!masks.tower[p-1])write(p,[61,58,87]);
      if(x===W-1||!masks.tower[p+1])write(p,[91,78,117]);
    }
    g.putImageData(img,0,0);
    cache.set(image,canvas);
    return canvas;
  }catch(error){
    console.warn('Background polish unavailable; using original artwork',error);
    return image;
  }
}
window.CrustBackgroundPolish=Object.freeze({
  get:polish,version:'mushroom-pilot-v1',stage:2
});
})();