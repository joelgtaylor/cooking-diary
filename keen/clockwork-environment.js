/* Clockwork environmental architecture. All supports and machinery are rear
 * scenery; the applied map alone defines collision and playable surfaces. */
'use strict';
const CLOCKWORK_ENVIRONMENT_CROPS=Object.freeze({
 deck:Object.freeze([17,257,698,150]),
 column:Object.freeze([786,9,116,422]),
 service:Object.freeze([1008,64,477,345]),
 boiler:Object.freeze([15,431,452,535]),
 gear:Object.freeze([480,502,469,458]),
 arch:Object.freeze([961,449,566,528]),
 masonry:Object.freeze([1181,73,138,20])
});
function clockworkEnvironmentReady(){
 const a=assets.clockworkEnvironment;
 return bakery===3&&window.__crustWorldArtEnabled!==false&&
  !/(?:^|[?&])environment=off(?:&|$)/.test(window.location?.search||'')&&
  a&&a.complete&&a.naturalWidth===1536&&a.naturalHeight===1024;
}
function clockworkSprite(crop,x,y,width,brightness=1){
 const [sx,sy,sw,sh]=crop,height=Math.round(width*sh/sw);
 if(x+width<camera||x>camera+W||y+height<cameraY||y>cameraY+H)return;
 g.save();g.imageSmoothingEnabled=false;g.filter='brightness('+brightness+')';
 g.drawImage(assets.clockworkEnvironment,sx,sy,sw,sh,
  Math.round(x),Math.round(y),Math.round(width),height);g.restore();
}
function clockworkDeck(x,y,width,brightness=.95){
 const source=CLOCKWORK_ENVIRONMENT_CROPS.deck;
 for(let dx=0;dx<width;dx+=4*T){
  const remaining=Math.min(4*T,width-dx),fraction=remaining/(4*T);
  // Preserve the end plate on a short final bay at the full bay's scale.
  const crop=[source[0]+source[2]*(1-fraction),source[1],source[2]*fraction,source[3]];
  clockworkSprite(crop,x+dx,y,remaining,brightness);
 }
}
function clockworkPlatformRuns(){
 const out=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  if(map[y][x]!=='=')continue;
  const start=x;while(x+1<cols&&map[y][x+1]==='=')x++;
  out.push({x:start,y,w:x-start+1});
 }
 return out;
}
function drawClockworkDepthVeil(){
 if(!clockworkEnvironmentReady())return;
 g.save();g.fillStyle='rgba(8,9,22,'+(cameraY<800?.08:.14)+')';
 g.fillRect(0,0,W,H);g.restore();
}
function clockworkColumn(x,top,bottom,width=T,brightness=.52){
 const crop=CLOCKWORK_ENVIRONMENT_CROPS.column,height=Math.round(width*crop[3]/crop[2]);
 if(x+width<camera||x>camera+W||bottom<cameraY||top>cameraY+H)return;
 g.save();g.beginPath();g.rect(x,top,width,bottom-top);g.clip();
 for(let y=top;y<bottom;y+=height)clockworkSprite(crop,x,y,width,brightness);
 g.restore();
}
function drawClockworkRoomBacking(room){
 if(!clockworkEnvironmentReady())return;
 const x=(room.x+1)*T,y=(room.y+1)*T,w=(room.w-2)*T,h=(room.h-1)*T;
 const crop=CLOCKWORK_ENVIRONMENT_CROPS.service,width=4*T;
 const panelHeight=Math.round(width*crop[3]/crop[2]);
 const count=Math.max(1,Math.floor(w/width)),pitch=w/count;
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 const masonry=CLOCKWORK_ENVIRONMENT_CROPS.masonry;
 // Quiet soot masonry replaces the old flat backing, at a fixed texture
 // scale. Recessed pipe bays sit within it without being stretched to fit.
 const tw=64,th=Math.round(tw*masonry[3]/masonry[2]);
 g.save();g.imageSmoothingEnabled=false;g.filter='brightness(.58)';
 for(let yy=y;yy<y+h;yy+=th)for(let xx=x;xx<x+w;xx+=tw)
  g.drawImage(assets.clockworkEnvironment,...masonry,xx,yy,tw,th);
 g.restore();
 for(let i=0;i<count;i++)
  clockworkSprite(crop,x+i*pitch+(pitch-width)/2,y+(h-panelHeight)/2,width,.70);
 g.restore();
}
function drawClockworkEnvironment(){
 if(!clockworkEnvironmentReady())return;
 // Entrance service machinery is attached to the ground, behind the real
 // roof, open doorways, supply plates, checkpoint and player silhouettes.
 for(const [x,width] of [[2,5],[21,4]]){
  const w=width*T,h=Math.round(w*535/452);
  clockworkSprite(CLOCKWORK_ENVIRONMENT_CROPS.boiler,x*T,54*T-h,w,.60);
 }
 // Open structural shafts connect the existing service platforms and halls.
 // Their bays repeat at a fixed scale instead of stretching a whole column.
 for(const [x,top,bottom] of [[28,40,54],[33,40,54],[37,38,54],[44,38,54],
  [49,35,54],[52,35,54],[56,29,54],[61,26,40],[68,26,40]])
  clockworkColumn(x*T,top*T,bottom*T,T,.48);
 for(const [x,w] of [[38,5],[49,3]]){
  const width=w*T,h=Math.round(width*535/452);
  clockworkSprite(CLOCKWORK_ENVIRONMENT_CROPS.boiler,x*T,54*T-h,width,.48);
 }
 // One massive recessed flywheel anchors the high route. Existing animated
 // parallax cogs, vents and pistons remain intact; this adds no new timing.
 clockworkSprite(CLOCKWORK_ENVIRONMENT_CROPS.gear,55*T,22*T,14*T,.40);
 // Upper descent gantries attach to the authored broad service terrace.
 for(const [x,top,bottom] of [[79,23,32],[83,23,32],[89,29,32],
  [92,33,40],[99,32,40],[78,37,54]])
  clockworkColumn(x*T,top*T,bottom*T,T,.50);
 // The transparent opening frames the existing Devourer/disguised oven,
 // released real oven and defeat sequence, never painting over them.
 const width=19*T,h=Math.round(width*528/566);
 clockworkSprite(CLOCKWORK_ENVIRONMENT_CROPS.arch,85*T,54*T-h,width,.52);
}
function drawClockworkPlatformBacking(){
 if(!clockworkEnvironmentReady())return;
 for(const r of clockworkPlatformRuns()){
  const x=r.x*T,y=r.y*T,w=r.w*T;
  if(x+w<camera||x>camera+W||y+T<cameraY||y>cameraY+H)continue;
  clockworkDeck(x,y,w);
 }
}
function drawClockworkPlatformFaces(){
 if(!clockworkEnvironmentReady())return;
 for(const r of clockworkPlatformRuns()){
  const x=r.x*T,y=r.y*T,w=r.w*T;
  if(x+w<camera||x>camera+W||y+T<cameraY||y>cameraY+H)continue;
  rect(x,y,w,3,'#edcf9b');rect(x,y+3,w,1,'#715343');
 }
 // Solid ground and room walls remain opaque under their new flush trim.
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  if(map[y][x]!=='#'||tile(x,y-1)==='#'||tile(x,y-1)==='=')continue;
  const start=x;while(x+1<cols&&map[y][x+1]==='#'&&tile(x+1,y-1)!=='#'&&tile(x+1,y-1)!=='=')x++;
  const px=start*T,py=y*T,w=(x-start+1)*T;
  if(px+w<camera||px>camera+W||py+T<cameraY||py>cameraY+H)continue;
  g.save();g.beginPath();g.rect(px,py,w,T);g.clip();
  clockworkDeck(px,py,w);g.restore();
 }
}
function prepareClockworkEnvironmentPreview(search){
 const m=/(?:^|[?&])scene=environment-(boilerworks|shafts|skybridge|descent|ovenhall)(?:&|$)/.exec(search);
 if(!m)return false;
 const scenes={boilerworks:[6,54,0,1252],shafts:[33,37,800,850],
  skybridge:[64,25,1640,400],descent:[90,32,2400,750],ovenhall:[79,54,2400,1252]};
 const [x,y,cx,cy]=scenes[m[1]];
 init(3);player.x=x*T;player.y=y*T-player.h;player.ground=true;
 camera=cx;cameraY=cy;state='pause';return true;
}
