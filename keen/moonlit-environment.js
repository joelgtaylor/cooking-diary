/* Moonlit Bakery architectural kit. Rendering only: the authored map is the
 * sole source of collision, platform extent and traversable landing height.
 * Art modules retain their source proportions inside those authored spans. */
'use strict';
const MOONLIT_ENVIRONMENT_CROPS=Object.freeze([
 // Crops are filled from the reviewed production atlas, not the concept map.
 [90,48,418,546],[640,48,255,546],[958,49,568,546],
 [32,740,512,184],[591,740,540,188],[1194,624,258,356]
].map(Object.freeze));
// Cache filtered architecture at its final display size. Immutable bitmaps
// avoid a new GPU filter surface for every panel and the large oven arch.
const moonlitPieceCache=new Map();
let moonlitPieceSource=null,moonlitPiecePixels=0;
function moonlitPreparedPiece(source,brightness,width,height){
 if(brightness===1||typeof OffscreenCanvas!=='function'||/(?:^|[?&])shading=off(?:&|$)/.test(window.location?.search||''))return null;
 const image=assets.moonlitArchitecture;
 if(moonlitPieceSource!==image){
  for(const entry of moonlitPieceCache.values())entry.image.close?.();
  moonlitPieceCache.clear();moonlitPiecePixels=0;moonlitPieceSource=image;
 }
 const key=[...source,brightness,width,height].join(',');
 if(moonlitPieceCache.has(key))return moonlitPieceCache.get(key).image;
 const pixels=width*height;
 if(!pixels||pixels>1024*1024)return null;
 try{
  const surface=new OffscreenCanvas(width,height),ctx=surface.getContext('2d');
  if(!ctx||!('filter' in ctx)||typeof surface.transferToImageBitmap!=='function')return null;
  ctx.imageSmoothingEnabled=false;ctx.filter='brightness('+brightness+')';
  ctx.drawImage(image,...source,0,0,width,height);
  const prepared=surface.transferToImageBitmap();
  // Keep retained bitmap storage below 4 MiB across repeated world visits.
  while(moonlitPiecePixels+pixels>1024*1024&&moonlitPieceCache.size){
   const first=moonlitPieceCache.keys().next().value,entry=moonlitPieceCache.get(first);
   entry.image.close?.();moonlitPiecePixels-=entry.pixels;moonlitPieceCache.delete(first);
  }
  moonlitPieceCache.set(key,{image:prepared,pixels});moonlitPiecePixels+=pixels;
  return prepared;
 }catch{return null;}
}
function moonlitEnvironmentReady(){
 const a=assets.moonlitArchitecture;
 return bakery===1&&window.__crustWorldArtEnabled!==false&&
  !/(?:^|[?&])environment=off(?:&|$)/.test(window.location?.search||'')&&
  a&&a.complete&&a.naturalWidth===1536&&a.naturalHeight===1024;
}
function moonlitPiece(cell,x,y,w,h,alpha=1,source=MOONLIT_ENVIRONMENT_CROPS[cell]){
 if(x+w<camera||x>camera+W||y+h<cameraY||y>cameraY+H)return;
 g.save();g.imageSmoothingEnabled=false;
 // Dim recessed materials without making masonry look transparent/ghostly.
 const [, ,sw,sh]=source;
 const scale=Math.min(w/sw,h/sh),dw=Math.round(sw*scale),dh=Math.round(sh*scale);
 const prepared=moonlitPreparedPiece(source,alpha,dw,dh);
 const dx=Math.round(x+(w-dw)/2),dy=Math.round(y);
 g.filter=prepared||alpha===1?'none':'brightness('+alpha+')';
 if(prepared)g.drawImage(prepared,dx,dy);
 else g.drawImage(assets.moonlitArchitecture,...source,dx,dy,dw,dh);
 g.restore();
}
function moonlitMasonry(x,y,w,h,brightness=.55){
 const margin=Math.ceil(shake)+1; // Camera rounding and impact shake expose edge pixels.
 if(x+w<camera-margin||x>camera+W+margin||y+h<cameraY-margin||y>cameraY+H+margin)return;
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 const a=assets.moonlitTerrain;
 const ready=a&&a.complete&&a.naturalWidth===256&&a.naturalHeight===96;
 const meta=window.CrustMoonlitShading;
 const shade=meta?.terrainBrightness.indexOf(brightness)??-1;
 const shaded=assets['moonlitShadedTerrain'+shade];
 const baked=!/(?:^|[?&])shading=off(?:&|$)/.test(window.location?.search||'')&&shade>=0&&shaded?.complete&&shaded.naturalWidth===256&&shaded.naturalHeight===96;
 g.filter=baked?'none':'brightness('+brightness+')';
 if(ready){
  // Keep the original texture origin when clipping to visible tile bays.
  const x0=x+Math.max(0,Math.floor((camera-margin-x)/T))*T;
  const y0=y+Math.max(0,Math.floor((cameraY-margin-y)/T))*T;
  for(let yy=y0;yy<Math.min(y+h,cameraY+H+margin);yy+=T)for(let xx=x0;xx<Math.min(x+w,camera+W+margin);xx+=T)
   g.drawImage(baked?shaded:a,((Math.floor(xx/T)+Math.floor(yy/T)*3)%8)*32,64,32,32,xx,yy,T,T);
 }else rect(x,y,w,h,'#252332');
 g.restore();
}
// Recessed walls use muted panels with no bright top coping. They sit behind
// actors; the brighter opaque tile pass alone defines a playable boundary.
function moonlitFacade(kind,x,y,w,h,alpha=.72){
 const margin=Math.ceil(shake)+1;
 if(x+w<camera-margin||x>camera+W+margin||y+h<cameraY-margin||y>cameraY+H+margin)return;
 const panelWidth=Math.min(w,kind===0?4*T:3*T);
 const [, ,sw,sh]=MOONLIT_ENVIRONMENT_CROPS[kind];
 const panelHeight=Math.round(panelWidth*sh/sw);
 const bays=Math.max(1,Math.floor(w/panelWidth)),pitch=w/bays;
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 moonlitMasonry(x,y,w,h,alpha);
 for(let yy=y;yy<y+h;yy+=panelHeight)
  for(let bay=0;bay<bays;bay++)
   moonlitPiece(kind,x+bay*pitch,yy,pitch,panelHeight,alpha);
 g.restore();
}
function drawMoonlitEnvironment(){
 if(!moonlitEnvironmentReady())return false;
 const layout=currentVerticalLayout();
 // The starter workshop and proofing hall have real solid roofs and open
// doorways. Keep their decoration strictly within those authored rooms.
 for(const [room,label] of [[layout.workshop,'STARTER WORKSHOP'],[layout.ascension?.room,'PROOFING HALL']]){
  if(!room)continue;
  const x=room.x*T,y=room.y*T,w=room.w*T,h=room.h*T;
  moonlitFacade(0,x+T,y+T,w-2*T,h-T,.92);
  // Broad timber posts are recessed, with doorway floor space left clear.
  for(const px of [x+T+3,x+w-T-9]){
   rect(px,y+T,6,h-T,'#3d3036');rect(px+1,y+T,1,h-T,'#8b6750');
  }
  rect(x+T,y+h-18,w-2*T,5,'#4a3540');
  g.save();g.font='bold 11px monospace';g.textAlign='center';g.fillStyle='#e2c69a';
  g.fillText(label,x+w/2,y+T+10);g.restore();
 }
 // Exposed roof stair tower is real solid geometry; the panel is contained
 // in its existing footprint, including its original flat landing height.
 moonlitFacade(1,19*T,44*T,3*T,4*T,.9);
 // Recessed buildings connect groups of ledges to the district below. Their
 // unlit tops sit under actual ledges; backing stays darker than terrain.
 moonlitFacade(0,24*T,40*T,8*T,14*T,.55);
 moonlitFacade(0,45*T,35*T,4*T,19*T,.48);
 // Tower foundations and vertical ribs make the summit feel immense without
 // introducing a front-facing collision wall in the one-way route.
 for(const [x,y,w] of [[54,33,8],[65,29,6],[70,19,3],[72,27,6]])
  moonlitFacade(1,x*T,y*T+T,w*T,(54-y-1)*T,.58);
 // The solid watchtower and checkpoint parapet retain their full silhouette.
 moonlitFacade(1,70*T,19*T,3*T,5*T,.95);
 // The descent uses progressively heavier oven masonry rather than timber.
 for(const [x,y,w] of [[82,24,5],[93,32,5],[98,36,6],[87,44,8]])
  moonlitFacade(1,x*T,(y+1)*T,w*T,(54-y-1)*T,.50);
 // Destination framing stays behind the entire Foreman encounter. No new
 // foreground objects cover attacks, the oven, flags or defeat animation.
 moonlitPiece(2,91*T,43*T,12*T,11*T,.67);
 for(const x of [89,103])moonlitMasonry(x*T,40*T,T,14*T,.65);
 return true;
}

// Describe contiguous authored one-way surfaces. This follows the actual map
// after layout.apply(), so obsolete metadata cannot invent decorative ledges.
function moonlitPlatformRuns(){
 const runs=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  if(map[y][x]!=='=')continue;
  const start=x;while(x+1<cols&&map[y][x+1]==='=')x++;
  runs.push({x:start,y,w:x-start+1});
 }
 return runs;
}
function moonlitPlatformKind(x,y){
 while(x>0&&map[y]?.[x-1]==='=')x--;
 if(x>=78)return 'stone';
 if(x>=53)return y<=23?'stone':'bridge';
 return (y<=35||x<23)?'roof':'bridge';
}
function drawMoonlitPlatformBacking(){
 if(!moonlitEnvironmentReady())return;
 // Open trusses preserve the visual promise of passing through from below.
 for(const r of moonlitPlatformRuns()){
  const x=r.x*T,y=r.y*T,w=r.w*T;
  if(x+w<camera||x>camera+W||y+T*2<cameraY||y>cameraY+H)continue;
  const kind=moonlitPlatformKind(r.x,r.y);
  if(kind==='bridge'){
   for(let dx=0;dx<w;dx+=4*T){
    const width=Math.min(4*T,w-dx);
    // A short end bay uses the right half (including its end post), never
    // a complete bridge squeezed to half width.
    const crop=width===2*T?[861,740,270,188]:MOONLIT_ENVIRONMENT_CROPS[4];
    moonlitPiece(4,x+dx,y,width,45,.85,crop);
   }
  }
  if(kind==='stone'){
   // Stepped cantilever corbels grow down from the real underside. Their
   // muted faces never add a second bright horizontal landing surface.
   for(const px of [x,x+w-22]){
    g.save();g.beginPath();g.moveTo(px,y+T);g.lineTo(px+22,y+T);
    g.lineTo(px+17,y+T+12);g.lineTo(px+11,y+T+12);
    g.lineTo(px+11,y+T+25);g.lineTo(px+5,y+T+32);
    g.lineTo(px,y+T+32);g.closePath();g.clip();
    moonlitPiece(1,px,y+T,22,T,.55);g.restore();
   }
  }
 }
}

function prepareMoonlitEnvironmentPreview(search){
 const match=/(?:^|[?&])scene=environment-(courtyard|hall|towers|forecourt)(?:&|$)/.exec(search);
 if(!match)return false;
 const scenes={courtyard:[8,51,0,1252],hall:[34,37,760,850],
  towers:[67,19,1540,430],forecourt:[92,54,2400,1252]};
 const [x,y,cx,cy]=scenes[match[1]];
 init(1);player.x=x*T;player.y=y*T-player.h;player.ground=true;
 camera=cx;cameraY=cy;state='pause';return true;
}
function drawMoonlitPlatformFaces(){
 if(!moonlitEnvironmentReady())return;
 for(const [x,y,w,h] of [[19,44,3,4],[70,19,3,5]]){
  moonlitMasonry(x*T,y*T,w*T,h*T,.8);
  moonlitPiece(1,x*T,y*T,w*T,h*T,.9);
  rect(x*T,y*T,w*T,4,'#d7bc91');rect(x*T,y*T+4,w*T,2,'#69505a');
 }
 for(const r of moonlitPlatformRuns()){
  const x=r.x*T,y=r.y*T,w=r.w*T;
  if(x+w<camera||x>camera+W||y+T<cameraY||y>cameraY+H)continue;
  const kind=moonlitPlatformKind(r.x,r.y);
  // Roof fascia is clipped inside exactly the existing one-way tile row.
  // Never replace opaque solid masonry with an alpha-bearing sprite.
  if(kind==='roof'){
   g.save();g.beginPath();g.rect(x,y,w,T);g.clip();
   for(let dx=0;dx<w;dx+=4*T)moonlitPiece(3,x+dx,y,4*T,46);
   g.restore();
  }else if(kind==='bridge'){
   // The open sprite was drawn beneath the terrain pass. A thin flat coping
   // marks the exact collision top; open space below stays visually open.
   rect(x,y,w,3,'#d7b785');rect(x,y+3,w,1,'#684533');
  }else{
   // Heavy oven/tower ledges share the original masonry texture, with flush
   // stone corbels contained in the authored platform footprint.
   for(const ex of [x+3,x+w-11]){
    rect(ex,y+10,8,19,'#544754');rect(ex+1,y+11,2,16,'#a18a79');
   }
  }
 }
}
