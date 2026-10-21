/* Non-colliding interior backing; all solid geometry is authored in the layout. */
'use strict';
function drawBakeryArchitecture(){
 if(bakery===3){drawFactoryEntrance();drawClockworkAscent();drawFinalDescent();return;}
 if(bakery===2){drawCavernFoothills();drawPlungeIndicatorArt();return;}
 if(bakery!==1||!currentVerticalLayout().workshop)return;
 const {x,y,w,h}=currentVerticalLayout().workshop,px=x*T,py=y*T;
 g.save();
 rect(px+T,py+T,(w-2)*T,(h-1)*T,'#202536');
 for(let row=1;row<h;row++){
  rect(px+T,py+row*T,(w-2)*T,2,'#37394b');
  for(let col=1;col<w-1;col++)rect(px+col*T+(row%2?16:0),py+row*T,1,T,'#303446');
 }
 // Back-wall windows and a workbench remain scenery, with no hidden collision.
 for(const wx of [13,17]){
  rect(wx*T,py+T+15,25,38,'#111b30');rect(wx*T+3,py+T+18,19,30,'#c59054');
  rect(wx*T+11,py+T+18,3,30,'#584349');rect(wx*T+3,py+T+32,19,3,'#584349');
 }
 rect(12*T,53*T+8,2*T,6,'#8a6450');rect(12*T+4,53*T+14,4,18,'#4e3e3f');rect(14*T-8,53*T+14,4,18,'#4e3e3f');
 g.font='bold 11px monospace';g.textAlign='center';g.fillStyle='#e2c69a';
 g.fillText('STARTER WORKSHOP',16*T+16,49*T+10);
 // Lintel trim is contained within the solid wall above each open doorway.
 for(const dx of [11,21]){rect(dx*T,51*T-5,T,5,'#b3936a');rect(dx*T+3,51*T-5,T-6,2,'#ecd3a0');}
 g.restore();
 const room=currentVerticalLayout().ascension?.room;
 if(room){
  const rx=room.x*T,ry=room.y*T;
  g.save();rect(rx+T,ry+T,(room.w-2)*T,(room.h-1)*T,'#242839');
  for(let row=1;row<room.h;row++){
   rect(rx+T,ry+row*T,(room.w-2)*T,2,'#3b3e50');
   for(let col=1;col<room.w-1;col++)rect(rx+col*T+(row%2?16:0),ry+row*T,1,T,'#343749');
  }
  for(const wx of [37,41]){
   rect(wx*T,ry+T+18,25,38,'#141c2a');rect(wx*T+3,ry+T+21,19,31,'#be8f54');
   rect(wx*T+11,ry+T+21,3,31,'#584449');rect(wx*T+3,ry+T+36,19,3,'#584449');
  }
  g.textAlign='center';g.font='bold 11px monospace';g.fillStyle='#e6cba1';g.fillText('PROOFING HALL',40*T,ry+T+11);
  for(const dx of [35,44]){rect(dx*T,35*T-5,T,5,'#ba9b70');rect(dx*T+3,35*T-5,T-6,2,'#eddbad');}
  g.restore();
 }
}

// Riveted backing sits behind actors and collision tiles. The solid roof and
// open doorways come from the layout; pipes and signs never add collision.
function drawFactoryEntrance(){
 const e=currentVerticalLayout().entrance;
 if(!e||camera>26*T||cameraY+H<43*T)return;
 const r=e.room,x=r.x*T,y=r.y*T,w=r.w*T;
 g.save();
 rect(x+T,y+T,w-2*T,4*T,'#18232c');
 for(let col=1;col<r.w-1;col++){
  const px=x+col*T;
  rect(px,y+T,2,4*T,'#47505a');rect(px+2,y+T,1,4*T,'#0e1822');
  for(const ry of [y+T+7,y+5*T-8]){rect(px+6,ry,3,3,'#9a8a6a');rect(px+23,ry,3,3,'#626975');}
 }
 // Recessed pipes and gauges, with restrained warm highlights.
 rect(x+T+8,y+T+30,w-2*T-16,9,'#101820');
 rect(x+T+8,y+T+31,w-2*T-16,3,'#8e6f48');
 for(const px of [11*T,17*T]){
  rect(px,y+T+24,10,22,'#302b28');rect(px+2,y+T+26,6,18,'#be925b');
  rect(px+3,y+T+27,2,9,'#ead4a1');
 }
 for(const dx of [9,19]){
  rect(dx*T,51*T-6,T,6,'#ad8752');rect(dx*T+3,51*T-6,T-6,2,'#f4d5a0');
 }
 g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#e8d6b5';
 g.fillText('MAINTENANCE / KEFIR RESERVE',14.5*T,50*T+15);
 // A permanent control cue works for both keyboard and the existing touch UI.
 rect(10*T+8,52*T-4,8*T-16,22,'#101a26');g.fillStyle='#d7e9ec';
 g.fillText('STORE NOW · V / KEFIR TO DASH',14*T,52*T+10);
 if(entranceIndicatorReady())drawEntrancePlate(0,17*T,48*T-96);
 else{g.fillStyle='#e8d6b5';g.fillText('SUPPLIES ↑',17*T,48*T-20);}
 // Exit wayfinding sits outside the combat silhouettes.
 if(entranceIndicatorReady())drawEntrancePlate(1,23*T,44*T+2);
 else{rect(21*T,44*T+7,4*T,20,'#15202a');g.fillStyle='#f4d5a0';
 g.fillText('LIFT SHAFT ↑',23*T,44*T+21);}
 g.restore();
}

function drawClockworkAscent(){
 const a=currentVerticalLayout().ascent;if(!a||camera+W<26*T||camera>78*T)return;
 g.save();
 for(const r of a.rooms){
  const x=r.x*T,y=r.y*T,w=r.w*T,h=r.h*T;
  if(x+w<camera||x>camera+W||y+h<cameraY||y>cameraY+H)continue;
  rect(x+T,y+T,w-2*T,h-T,'#16222d');
  for(let col=1;col<r.w-1;col++){
   const px=x+col*T;
   rect(px,y+T,2,h-T,'#46525f');rect(px+2,y+T,1,h-T,'#0c1721');
   for(const py of [y+T+6,y+h-9]){rect(px+6,py,3,3,'#a39170');rect(px+23,py,3,3,'#65717b');}
  }
  for(const col of [2,6]){
   const px=x+col*T;
   rect(px,y+2*T,26,40,'#0c1620');rect(px+3,y+2*T+3,20,34,'#67523c');
   rect(px+5,y+2*T+5,16,11,'#e3ba72');rect(px+12,y+2*T+4,3,33,'#353f47');
  }
  rect(x+T+8,y+h-15,w-2*T-16,7,'#403b34');rect(x+T+8,y+h-15,w-2*T-16,2,'#ac8551');
  g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#e8d6b5';g.fillText(r.name,x+w/2,y+T+15);
  for(const dx of [r.x,r.x+r.w-1]){rect(dx*T,(r.y+r.h-3)*T-6,T,6,'#ac8551');rect(dx*T+3,(r.y+r.h-3)*T-6,T-6,2,'#edcfa0');}
 }
 if(clockworkIndicatorReady()){
  const [fx,fy]=a.fork,px=fx*T,py=fy*T;
  // Narrow copper mast reaches the authored fork ledge; plates stay behind
  // collision tiles and actors. Keep the canopy landing above them visible.
  rect(px-4,py-264,8,264,'#202631');rect(px-2,py-264,3,264,'#b27c4f');
  drawClockworkPlate(0,px,py-256,128,56);
  drawClockworkPlate(1,px,py-160,128,56);
  // The continuation arrow sits above, rather than across, the summit flag.
  drawClockworkPlate(2,76*T,13*T+8,128,56);
 }else{
 // Shapes/arrows and explicit words distinguish the optional loop from cultures.
 for(const [x,y,label] of [[55,27,'MAIN → / CULTURES'],[55,26,'BONUS ↑ / DANGER'],[76,17,'DESCENT →']]){
  if(x*T+76<camera||x*T-76>camera+W||y*T+8<cameraY||y*T-12>cameraY+H)continue;
  rect(x*T-76,y*T-12,152,20,'#14212c');g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#ecd5aa';g.fillText(label,x*T,y*T+2);
 }
 }
 g.restore();
}

function drawFinalDescent(){
 if(!currentVerticalLayout().finale||camera+W<78*T)return;
 g.save();g.font='bold 10px monospace';g.textAlign='center';
 if(clockworkIndicatorReady()){
  // Hang just below the real ledges, keeping the larger plaques out of tiles.
  rect(98*T-2,32*T,4,8,'#b27c4f');drawClockworkPlate(3,98*T,32*T+8,128,56);
  rect(83*T-2,33*T,4,12,'#b27c4f');drawClockworkPlate(4,83*T,33*T+12,128,56);
  drawClockworkPlate(5,79*T,38*T-24,128,56);
 }else{
 // Small route plaques keep the quiet return leg legible against machinery.
 for(const [x,y,label] of [[98,32,'SERVICE STAIRS ←'],[83,33,'CHECKPOINT ←'],[79,38,'OVEN FLOOR ↓']]){
  if(x*T+70<camera||x*T-70>camera+W||y*T+9<cameraY||y*T-12>cameraY+H)continue;
  rect(x*T-70,y*T-12,140,21,'#15212c');g.fillStyle='#ecd5aa';g.fillText(label,x*T,y*T+2);
 }
 }
 // Side railing is backing only, outside the open checkpoint-to-oven path.
 for(let y=40;y<53;y+=3){rect(77*T+5,y*T,4,2*T,'#54463c');rect(77*T+6,y*T,1,2*T,'#b48c55');}
 g.restore();
}

// Visual trim stays inside the authored solid balcony and root lintel.
function drawCavernFoothills(){
 const f=currentVerticalLayout().foothills;if(!f||camera>1050||cameraY+H<1200)return;
 const {x,y,w}=f.balcony;
 // Dark recess under the balcony gives the lower route a sheltered silhouette.
 g.save();g.globalAlpha=.32;
 rect((x+.1)*T,(y+1)*T,(w-.2)*T,4*T,'#182535');g.restore();
 for(let i=0;i<6;i++){
  rect((x+i)*T+5,(y+1)*T,3,13+(i%3)*6,'#3f655d');
  rect((x+i)*T+5,(y+1)*T+10,7,3,'#739681');
 }
}
function drawCavernFoothillsTrim(){
 const f=currentVerticalLayout().foothills;if(!f||camera>1050||cameraY+H<1200)return;
 const dx=f.door.x*T,dy=(f.door.opening-1)*T;
 rect(dx+3,dy+23,26,5,'#527e70');rect(dx+5,dy+24,22,2,'#abd2ab');
 // Small spore nodes mark the passage without implying another rune switch.
 for(const nx of [dx+7,dx+24]){rect(nx,dy+27,2,3,'#91d8ca');}
}

// Entrance destinations share the approved literal arrow grammar.
let entranceIndicatorArt=null;
const ENTRANCE_ROUTE_CROPS=[[18,298,740,392],[780,298,740,392]];
function entranceIndicatorReady(){
 if(bakery!==3||!visualIndicatorEnabled('signs'))return false;
 if(!entranceIndicatorArt){entranceIndicatorArt=new Image();entranceIndicatorArt.src='art/clockwork-entrance-plates.png';}
 return entranceIndicatorArt.complete&&entranceIndicatorArt.naturalWidth===1536&&entranceIndicatorArt.naturalHeight===1024;
}
function drawEntrancePlate(index,cx,top){
 g.save();g.imageSmoothingEnabled=false;
 g.drawImage(entranceIndicatorArt,...ENTRANCE_ROUTE_CROPS[index],cx-56,top,112,56);g.restore();
}
// Riveted-metal variants of the same route/destination symbols. Kept out of
// gameplay layers, with the original labels retained as loading fallbacks.
let clockworkIndicatorArt=null;
const CLOCKWORK_ROUTE_CROPS=Object.freeze([
 [16,200,480,256],[516,200,504,256],[1036,200,488,256],
 [16,572,488,252],[524,572,484,252],[1028,572,488,252]
].map(Object.freeze));
function clockworkIndicatorReady(){
 if(bakery!==3||!visualIndicatorEnabled('signs'))return false;
 if(!clockworkIndicatorArt){clockworkIndicatorArt=new Image();clockworkIndicatorArt.src='art/clockwork-route-plates.png';}
 return clockworkIndicatorArt.complete&&clockworkIndicatorArt.naturalWidth===1536&&clockworkIndicatorArt.naturalHeight===1024;
}
function drawClockworkPlate(index,cx,top,width=144,height=64){
 if(!clockworkIndicatorReady()||!CLOCKWORK_ROUTE_CROPS[index])return;
 if(cx+width/2<camera||cx-width/2>camera+W||top+height<cameraY||top>cameraY+H)return;
 g.save();g.imageSmoothingEnabled=false;
 g.drawImage(clockworkIndicatorArt,...CLOCKWORK_ROUTE_CROPS[index],Math.round(cx-width/2),Math.round(top),width,height);
 g.restore();
}

// Text-free fork audition: render the approved root artwork behind terrain and
// actors. The established late text pass remains the loading/error fallback.
let plungeIndicatorArt=null;
function plungeIndicatorEnabled(){
 return bakery===2&&visualIndicatorEnabled('signs');
}
function plungeIndicatorReady(){
 if(!plungeIndicatorEnabled())return false;
 if(!plungeIndicatorArt){plungeIndicatorArt=new Image();plungeIndicatorArt.src='art/plunge-route-sign.png';}
 return plungeIndicatorArt.complete&&plungeIndicatorArt.naturalWidth===1105&&plungeIndicatorArt.naturalHeight===1423;
}
function drawPlungeIndicatorArt(){
 const p=currentVerticalLayout().plunge;
 if(!p||camera>2600||camera+W<1750||cameraY>1150||!plungeIndicatorReady())return;
 const [x,y]=p.fork,px=x*T,py=y*T;
 g.save();g.imageSmoothingEnabled=false;
 // Extend the sprite's own root texture to the existing support point. Both
 // plaques finish above the canopy's first landing; no new collision is added.
 g.drawImage(plungeIndicatorArt,180,1080,600,343,px-30,py-90,60,90);
 g.drawImage(plungeIndicatorArt,0,0,1105,1423,px-70,py-250,140,180);
 g.restore();
}
// Explicit scene shortcut for comparing this one fork without replaying B1 and
// the relay. This affects only the requested preview URL, never ordinary init.
function prepareWayfindingPreview(){
 const search=window.location&&window.location.search||'';
 if(/(?:^|[?&])scene=moonlit-summit(?:&|$)/.test(search)&&/(?:^|[?&])enemies=(?:pilot|off)(?:&|$)/.test(search)){
  init(1);player.x=69*T;player.y=19*T-player.h;player.ground=true;camera=player.x-W*.52;cameraY=player.y-H*.52;state='pause';return;
 }
 if(/(?:^|[?&])scene=slinger(?:&|$)/.test(search)&&/(?:^|[?&])slinger=(?:pilot|off)(?:&|$)/.test(search)){
  init(1);player.x=26*T;player.y=40*T-player.h;player.ground=true;camera=600;cameraY=1000;state='pause';return;
 }
 if(/(?:^|[?&])scene=baker-workshop(?:&|$)/.test(search)&&/(?:^|[?&])baker=(?:pilot|off)(?:&|$)/.test(search)){
  init(1);player.x=16*T;player.y=54*T-player.h;player.ground=true;camera=0;cameraY=rows*T-H;return;
 }
 if(/(?:^|[?&])scene=gremlins-roof(?:&|$)/.test(search)&&/(?:^|[?&])enemies=(?:pilot|off)(?:&|$)/.test(search)){
  init(1);player.x=12*T;player.y=48*T-player.h;player.ground=true;camera=0;cameraY=rows*T-H;return;
 }
 if(prepareSupplyPreview(search)||prepareOvenPreview(search))return;
 if(/(?:^|[?&])scene=entrance(?:&|$)/.test(search)&&/(?:^|[?&])signs=(?:pilot|off)(?:&|$)/.test(search)){
  init(3);player.x=3*T;player.y=54*T-player.h;player.ground=true;
  camera=0;cameraY=rows*T-H;return;
 }
 const scene=search.match(/(?:^|[?&])scene=(plunge|clockwork|clockwork-return)(?:&|$)/);
 if(!scene||!/(?:^|[?&])signs=(?:pilot|off)(?:&|$)/.test(search))return;
 if(scene[1]!=='plunge'){
  init(3);
  const returning=scene[1]==='clockwork-return',count=returning?4:2;
  for(let i=0;i<count;i++)gems[i].got=true;
  collected=count;checkpointState.current=returning?2:1;
  player.x=(returning?88:55.5)*T;player.y=(returning?32:28)*T-player.h;player.ground=true;
  camera=returning?world-W:Math.max(0,player.x-W*.52);
  cameraY=returning?820:Math.max(0,player.y-H*.52);
  return;
 }
 init(2);myceliumState.solved=true;myceliumState.progress=3;syncMyceliumBloom();
 for(let i=0;i<2;i++)gems[i].got=true;
 collected=2;checkpointState.current=1;
 player.x=60*T;player.y=31*T-player.h;player.ground=true;
 camera=Math.max(0,player.x-W*.52);cameraY=Math.max(0,player.y-H*.52);
}

// A permanent fork sign distinguishes mandatory cultures from optional combat.
function drawPlungeWayfinding(){
 if(plungeIndicatorReady())return;
 const p=currentVerticalLayout().plunge;if(!p||camera>2600||camera+W<1750||cameraY>1150)return;
 const [x,y]=p.fork,px=x*T,py=y*T;
 rect(px-2,py-160,4,160,'#6b7560');
 rect(px-85,py-172,170,30,'#162c37');rect(px-83,py-170,166,2,'#b4d2bd');
 rect(px-85,py-138,170,30,'#272735');rect(px-83,py-136,166,2,'#d5b487');
 g.textAlign='center';g.font='bold 11px monospace';g.fillStyle='#d4f2d2';g.fillText('MAIN DESCENT  ↓',px,py-152);
 g.fillStyle='#f1d2a1';g.fillText('BONUS / DANGER  ↑',px,py-118);
 g.textAlign='left';
}
