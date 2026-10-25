/* Fungal Caverns environment: scenery and materials only. The applied map
 * remains authoritative for every landing, doorway and puzzle boundary. */
'use strict';
const FUNGAL_ENVIRONMENT_CROPS=Object.freeze({
 shelf:Object.freeze([21,200,530,202]),
 cap:Object.freeze([578,200,429,100]),
 root:Object.freeze([1038,200,474,232]),
 arch:Object.freeze([16,470,640,461]),
 formation:Object.freeze([644,477,307,490]),
 trunk:Object.freeze([997,483,526,460]),
 // Interior texture samples are fully opaque; repeating silhouette fragments
 // would introduce horizontal cuts and disconnected stem segments.
 rockBody:Object.freeze([710,490,140,150]),
 rootBody:Object.freeze([1210,510,110,180]),
 mushroomBody:Object.freeze([756,296,68,64])
});
function fungalEnvironmentReady(){
 const a=assets.fungalEnvironment;
 return bakery===2&&window.__crustWorldArtEnabled!==false&&
  !/(?:^|[?&])environment=off(?:&|$)/.test(window.location?.search||'')&&
  a&&a.complete&&a.naturalWidth===1536&&a.naturalHeight===1024;
}
// Small reusable stamps, capped at 2 MiB of RGBA pixels. Never allocate a
// world-sized canvas on a phone. Eviction only affects rendering cost.
const fungalStampCache={image:null,entries:new Map(),pixels:0,hits:0,misses:0,disabled:false};
const FUNGAL_STAMP_PIXELS=512*1024;
function fungalVisible(x,y,w,h){
 const margin=Math.ceil(typeof shake==='number'?shake:0)+1;
 return x+w>=camera-margin&&x<=camera+W+margin&&y+h>=cameraY-margin&&y<=cameraY+H+margin;
}
function fungalStamp(key,x,y,w,h,paint){
 const cache=fungalStampCache,image=assets.fungalEnvironment;
 if(cache.disabled||/(?:^|[?&])fungalCache=off(?:&|$)/.test(window.location?.search||''))return false;
 if(cache.image!==image){cache.entries.clear();cache.pixels=0;cache.image=image;}
 let entry=cache.entries.get(key);
 if(entry){cache.hits++;cache.entries.delete(key);cache.entries.set(key,entry);}
 else{
  w=Math.ceil(w);h=Math.ceil(h);if(w<=0||h<=0||w*h>FUNGAL_STAMP_PIXELS)return false;
  let canvas,brush;
  try{
   canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(w,h):document.createElement?.('canvas');
   if(!canvas){cache.disabled=true;return false;}
   canvas.width=w;canvas.height=h;brush=canvas.getContext('2d');
   // Headless tests and unsupported contexts keep the original direct path.
   if(!brush||brush.canvas!==canvas){cache.disabled=true;return false;}
   brush.imageSmoothingEnabled=false;paint(brush);
  }catch{cache.disabled=true;return false;}
  while(cache.entries.size&&(cache.pixels+w*h>FUNGAL_STAMP_PIXELS||cache.entries.size>=128)){
   const oldest=cache.entries.keys().next().value,old=cache.entries.get(oldest);
   cache.pixels-=old.width*old.height;cache.entries.delete(oldest);
  }
  entry=canvas;cache.entries.set(key,entry);cache.pixels+=w*h;cache.misses++;
 }
 g.save();g.imageSmoothingEnabled=false;g.filter='none';
 g.drawImage(entry,Math.round(x),Math.round(y));g.restore();return true;
}
let fungalGeometryCache=null;
function invalidateFungalGeometry(){fungalGeometryCache=null;}
function fungalGeometryRuns(){
 if(fungalGeometryCache?.map===map)return fungalGeometryCache;
 const platforms=[],surfaces=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  if(map[y][x]!=='=')continue;
  const start=x;while(x+1<cols&&map[y][x+1]==='=')x++;
  platforms.push({x:start,y,w:x-start+1});
 }
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  if(map[y][x]!=='#'||tile(x,y-1)==='#'||tile(x,y-1)==='=')continue;
  const start=x;while(x+1<cols&&map[y][x+1]==='#'&&tile(x+1,y-1)!=='#'&&tile(x+1,y-1)!=='=')x++;
  surfaces.push({x:start,y,w:x-start+1});
 }
 return fungalGeometryCache={map,platforms,surfaces};
}
function fungalSprite(crop,x,y,width,brightness=1,flipY=false,ctx=g){
 const [sx,sy,sw,sh]=crop,height=Math.round(width*sh/sw);
 if(ctx===g){
  if(!fungalVisible(x,y,width,height))return;
  if(fungalStamp('sprite:'+crop.join(',')+':'+width+':'+brightness+':'+flipY,x,y,width,height,
   brush=>fungalSprite(crop,0,0,width,brightness,flipY,brush)))return;
 }
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.filter='brightness('+brightness+')';
 if(flipY){ctx.translate(Math.round(x),Math.round(y)+height);ctx.scale(1,-1);}
 ctx.drawImage(assets.fungalEnvironment,sx,sy,sw,sh,
  flipY?0:Math.round(x),flipY?0:Math.round(y),Math.round(width),height);ctx.restore();
}
function fungalPlatformRuns(){return fungalGeometryRuns().platforms;}
function fungalPlatformKind(x,y){
 if(x>=56&&y<=31)return 'cap';
 if(x>=32&&x<56&&y===35)return 'root';
 if(x<32&&y<=42)return 'root';
 return 'shelf';
}
// Repeated four-tile strips retain one source scale. Short final bays crop
// the source's right end rather than compressing an entire shelf/root.
function fungalStrip(kind,x,y,width,brightness=1){
 const source=FUNGAL_ENVIRONMENT_CROPS[kind];
 for(let dx=0;dx<width;dx+=4*T){
  const remaining=Math.min(4*T,width-dx),fraction=remaining/(4*T);
  const crop=[source[0]+source[2]*(1-fraction),source[1],source[2]*fraction,source[3]];
  fungalSprite(crop,x+dx,y,remaining,brightness);
 }
}
function drawFungalDepthVeil(){
 if(!fungalEnvironmentReady())return;
 const depth=camera<24*T?.16:camera<54*T?.25:cameraY<800?.13:.28;
 g.save();g.fillStyle='rgba(5,8,27,'+depth+')';g.fillRect(0,0,W,H);g.restore();
}
// Stem textures repeat vertically at their own aspect ratio and terminate in
// a proportioned root foot. Their dark faces sit behind all gameplay art.
// Overlap textured samples at their native scale; feather only the join band.
// No extra silhouettes or collision surfaces. Joined pieces are cached once.
function fungalJoinedSprite(crop,x,y,width,brightness,fadeTop=0,ctx=g){
 const height=Math.round(width*crop[3]/crop[2]),fade=Math.min(fadeTop,height);
 if(!fade){fungalSprite(crop,x,y,width,brightness,false,ctx);return;}
 for(let i=0;i<4;i++){
  const top=fade*i/4,bottom=fade*(i+1)/4;
  ctx.save();ctx.globalAlpha*=((i+1)/4);
  fungalSprite([crop[0],crop[1]+crop[3]*top/height,crop[2],crop[3]*(bottom-top)/height],x,y+top,width,brightness,false,ctx);ctx.restore();
 }
 if(height>fade)fungalSprite([crop[0],crop[1]+crop[3]*fade/height,crop[2],crop[3]*(height-fade)/height],x,y+fade,width,brightness,false,ctx);
}
function fungalStem(cx,top,bottom,width=3*T,brightness=.48,kind='root',ctx=g){
 if(ctx===g){
  if(!fungalVisible(cx-width,top,width*2,bottom-top))return;
  if(fungalStamp('stem:'+width+':'+(bottom-top)+':'+brightness+':'+kind,cx-width,top,width*2,bottom-top,
   brush=>fungalStem(width,0,bottom-top,width,brightness,kind,brush)))return;
 }
 const body=FUNGAL_ENVIRONMENT_CROPS[kind==='mushroom'?'mushroomBody':'rootBody'],foot=FUNGAL_ENVIRONMENT_CROPS.trunk;
 const bodyHeight=Math.round(width*body[3]/body[2]),footWidth=width*2;
 const footHeight=Math.round(footWidth*foot[3]/foot[2]);
 const join=Math.max(top,bottom-footHeight+width*.28);
 ctx.save();ctx.beginPath();ctx.rect(cx-width,top,width*2,Math.max(0,bottom-top));ctx.clip();
 const overlap=Math.min(12,bodyHeight/4);
 for(let y=top,i=0;y<join;y+=bodyHeight-overlap,i++)
  fungalJoinedSprite(body,cx-width/2,y,width,brightness,i?overlap:0,ctx);
 fungalJoinedSprite(foot,cx-footWidth/2,Math.max(top,bottom-footHeight),footWidth,brightness,12,ctx);
 ctx.restore();
}
function fungalCliff(x,top,width,bottom,brightness=.55,ctx=g){
 if(ctx===g){
  if(!fungalVisible(x,top,width,bottom-top))return;
  if(fungalStamp('cliff:'+width+':'+(bottom-top)+':'+brightness,x,top,width,bottom-top,
   brush=>fungalCliff(0,0,width,bottom-top,brightness,brush)))return;
 }
 const body=FUNGAL_ENVIRONMENT_CROPS.rockBody,height=Math.round(width*body[3]/body[2]);
 ctx.save();ctx.beginPath();ctx.rect(x,top,width,Math.max(0,bottom-top));ctx.clip();
 const overlap=Math.min(12,height/4);
 for(let y=top,i=0;y<bottom;y+=height-overlap,i++)fungalJoinedSprite(body,x,y,width,brightness,i?overlap:0,ctx);
 ctx.restore();
}
function drawFungalEnvironment(){
 if(!fungalEnvironmentReady())return;
 // Rooted foothills: one cliff footing and a recessed root arch beneath the
 // authored balcony. The existing three-tile passage stays visibly open.
 fungalSprite(FUNGAL_ENVIRONMENT_CROPS.arch,5*T,49.8*T,11*T,.60);
 fungalCliff(5*T,52*T,5*T,54*T,.62);
 // Upper stairways grow out of trunks rather than disconnected tile bars.
 for(const [cx,top,width] of [[24.5,40,2],[29.5,38,2]])
  fungalStem(cx*T,(top+1)*T,54*T,width*T,.44);
 // Three organic vaults give the existing relay a sheltered identity. They
 // are clipped inside its authored room and add no glyphs or puzzle lights.
 g.save();g.beginPath();g.rect(33*T,27*T,22*T,8*T);g.clip();
 for(const x of [33,40.5,48]){
  const width=7*T,h=width*461/640;
  fungalSprite(FUNGAL_ENVIRONMENT_CROPS.arch,x*T,35*T-h,width,.55);
 }
 g.restore();
 // The optional upper canopy has giant stems and wider root feet. The main
 // plunge keeps open sky gaps between much darker vertical rock formations.
 for(const [cx,top,bottom] of [[60,28,39],[63.5,25,43],[67.5,22,35],
  [72.5,19,43],[78.5,22,47],[81.5,26,50]])
  fungalStem(cx*T,top*T+16,bottom*T,1.5*T,.50,'mushroom');
 for(const [x,top,w] of [[56,31,3],[69,35,2],[60,39,2]])
  fungalCliff(x*T,(top+1)*T,w*T,54*T,.56);
 // Large hanging formations establish the scale of the chasm. Their dark
 // top edges have no luminous rim, so they cannot read as extra landings.
 for(const [x,y,w] of [[57,12,5],[69,9,5],[77,12,4]])
  fungalSprite(FUNGAL_ENVIRONMENT_CROPS.formation,x*T,y*T,w*T,.42);
 // Preserve the approved Bloomrot chamber plate and its clear combat floor.
 // Organic side framing remains behind boss attacks, arena gates and oven.
 if(camera+W>=80*T){
  const width=19*T,h=width*461/640;
  fungalSprite(FUNGAL_ENVIRONMENT_CROPS.arch,85*T,54*T-h,width,.62);
 }
}
function drawFungalPlatformBacking(){
 if(!fungalEnvironmentReady())return;
 for(const r of fungalPlatformRuns()){
  const x=r.x*T,y=r.y*T,w=r.w*T;
  if(x+w<camera||x>camera+W||y+3*T<cameraY||y>cameraY+H)continue;
  const kind=fungalPlatformKind(r.x,r.y);
  if(kind==='cap'){
   // Crown-only crop: the source's short root foot must not repeat halfway
   // down the extended support. The continuous stem is drawn behind it.
   fungalSprite(FUNGAL_ENVIRONMENT_CROPS.cap,x,y,w,.88);
  }else fungalStrip(kind,x,y,w,kind==='root'?.82:.9);
 }
}
function drawFungalPlatformFaces(){
 if(!fungalEnvironmentReady())return;
 for(const r of fungalPlatformRuns()){
  const x=r.x*T,y=r.y*T,w=r.w*T;
  if(x+w<camera||x>camera+W||y+3*T<cameraY||y>cameraY+H)continue;
  // The single flat, high-luminance line is exactly the collision top.
  // Gills and dangling roots always sit underneath it, never above it.
  rect(x,y,w,2,'#c5f6f4');rect(x,y+2,w,2,'#64b6d1');
 }
 // Solid cells keep their opaque original terrain. Natural trim is clipped
 // inside the real cell, including the low doorway and relay ceiling.
 for(const r of fungalGeometryRuns().surfaces){
  const px=r.x*T,py=r.y*T,w=r.w*T,y=r.y;
  if(px+w<camera||px>camera+W||py+T<cameraY||py>cameraY+H)continue;
  g.save();g.beginPath();g.rect(px,py,w,T);g.clip();
  fungalStrip(y===26?'root':'shelf',px,py,w,.88);g.restore();
 }
}
function prepareFungalEnvironmentPreview(search){
 const m=/(?:^|[?&])scene=environment-(foothills|grotto|canopy|plunge|bloomrot)(?:&|$)/.exec(search);
 if(!m)return false;
 const scenes={foothills:[9,52,0,1252],grotto:[34,35,940,780],
  canopy:[67,22,1730,470],plunge:[63,39,1700,1130],bloomrot:[82,54,2400,1252]};
 const [x,y,cx,cy]=scenes[m[1]];
 init(2);player.x=x*T;player.y=y*T-player.h;player.ground=true;
 camera=cx;cameraY=cy;state='pause';return true;
}

