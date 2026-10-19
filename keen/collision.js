/* Shared tile, one-way platform, spike and rectangle collision queries. */
'use strict';
function tile(x,y){if(x<0||x>=cols||y>=rows)return'#';if(y<0)return'.';return map[y][x]}
// CRUST_ONE_WAY_PLATFORMS_V1: '=' blocks downward foot crossings only.
function oneWayTop(x,foot,nextFoot,w){
 if(nextFoot<foot)return null;
 const minY=Math.max(0,Math.floor((foot-1)/T));
 const maxY=Math.min(rows-1,Math.floor(nextFoot/T));
 const x0=Math.max(0,Math.floor(x/T)),x1=Math.min(cols-1,Math.floor((x+w-1)/T));
 for(let ty=minY;ty<=maxY;ty++){
  const top=ty*T;
  if(foot>top+1.3||nextFoot<top-.02)continue;
  for(let tx=x0;tx<=x1;tx++)if(tile(tx,ty)==='='||tile(tx,ty)==='M')return top;
 }
 return null;
}
function hit(x,y,w,h){let x0=Math.floor(x/T),x1=Math.floor((x+w-1)/T),y0=Math.floor(y/T),y1=Math.floor((y+h-1)/T);for(let a=x0;a<=x1;a++)for(let b=y0;b<=y1;b++)if(tile(a,b)==='#')return true;return false}
function spike(x,y,w,h){let x0=Math.floor(x/T),x1=Math.floor((x+w-1)/T),y0=Math.floor(y/T),y1=Math.floor((y+h-1)/T);for(let a=x0;a<=x1;a++)for(let b=y0;b<=y1;b++)if(tile(a,b)==='^')return true;return false}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
