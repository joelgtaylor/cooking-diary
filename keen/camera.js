/* Camera follow for vertical and classic levels.
 * Uses the shared game state in index.html; call after player/world initialization.
 * Physics stays subpixel; the renderer owns pixel rounding.
 */
'use strict';
function updateViewCamera(){
 if(!window.__crustCameraDemo){
   // Keep the shipped horizontal camera exactly as it was.
   camera=Math.max(0,Math.min(world-W,player.x-250));
   cameraY=0;return;
 }
 const px=player.x+player.w/2,py=player.y+player.h/2;
 const x=px-camera,y=py-cameraY;
 const left=W*.28,right=W*.64,upper=H*.32,lower=H*.68;
 let targetX=camera,targetY=cameraY;
 if(x<left)targetX=px-left;
 else if(x>right)targetX=px-right;
 if(y<upper)targetY=py-upper;
 else if(y>lower)targetY=py-lower;
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 targetX=clamp(targetX,0,world-W);
 targetY=clamp(targetY,0,rows*T-H);
 if(window.__crustCameraSnap){camera=targetX;cameraY=targetY;return;}
 // Physics remains subpixel; rounding happens only at canvas translation.
 camera+=clamp((targetX-camera)*.13,-14,14);
 cameraY+=clamp((targetY-cameraY)*(player.vy>3?.18:.14),-18,18);
 camera=clamp(camera,0,world-W);
 cameraY=clamp(cameraY,0,rows*T-H);
}
