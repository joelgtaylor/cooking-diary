/* World renderer: backgrounds, scenery, pickups, enemies, effects and checkpoints.
 * drawPlayer runs inside the world transform; drawHUD runs after restore.
 * Classic-script functions share game state and run only after setup.
 */
'use strict';
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h)}
function draw(){drawWorld();drawHUD();drawMyceliumUI();syncMyceliumTalkButton();}
function drawWorld(){
const hazardArt=assets.spikeHazards;
const hazardsReady=hazardArt&&hazardArt.complete&&hazardArt.naturalWidth===96&&hazardArt.naturalHeight===32;
const env=assets.environmentDecor;
const envReady=window.__crustWorldArtEnabled!==false&&env&&env.complete&&env.naturalWidth===256;
function drawEnv(cell,x,y,w,h){
 g.imageSmoothingEnabled=false;
 g.drawImage(env,(cell%4)*64,Math.floor(cell/4)*64,64,64,x,y,w,h);
}
const terrain=assets.moonlitTerrain;
const moonlitReady=bakery===1&&terrain&&terrain.complete&&terrain.naturalWidth===256&&terrain.naturalHeight===96;
function drawMoonlitTerrain(tx,ty,b){
 if(b==='='&&moonlitEnvironmentReady()&&moonlitPlatformKind(tx,ty)==='bridge')return;
 const x=tx*T,y=ty*T;
 const left=tile(tx-1,ty)!==b,right=tile(tx+1,ty)!==b;
 const surface=tile(tx,ty-1)!=='#'&&tile(tx,ty-1)!=='=';
 // All pixels stay inside the original 32px cell. The flat coping is
 // exactly on the collision surface; decorative caps never protrude.
 g.imageSmoothingEnabled=false;
 const variant=(tx+ty*3)%8;
 if(b==='='){
  g.drawImage(terrain,variant*32,32,32,32,x,y,32,32);
  g.drawImage(terrain,variant*32,0,32,32,x,y,32,9);
  g.fillStyle='#30283f';g.fillRect(x,y+30,32,2);
 }else{
  // Opaque masonry fills the entire solid cell, including interior rows.
  g.drawImage(terrain,variant*32,64,32,32,x,y,32,32);
  if(surface){
   g.drawImage(terrain,variant*32,0,32,32,x,y,32,9);
   g.fillStyle='#493542';g.fillRect(x,y+9,32,2);
   g.fillStyle='#a16c48';g.fillRect(x,y+9,32,1);
  }
 }
 if(left||right){
  g.fillStyle='#3b3045';
  if(left)g.fillRect(x,y,2,32);
  if(right)g.fillRect(x+30,y,2,32);
  if(b==='='||surface){
   g.fillStyle='#bd956b';
   if(left)g.fillRect(x+2,y+2,2,7);
   if(right)g.fillRect(x+28,y+2,2,7);
   g.fillStyle='#895a40';
   if(left)g.fillRect(x+2,y+11,3,17);
   if(right)g.fillRect(x+27,y+11,3,17);
  }
 }
}
const cavern=assets.cavernTerrain;
const cavernReady=bakery===2&&cavern&&cavern.complete&&cavern.naturalWidth===256&&cavern.naturalHeight===96;
function drawCavernTerrain(tx,ty,b){
 const x=tx*T,y=ty*T,variant=(tx+ty*3)%8;
 const surface=tile(tx,ty-1)!=='#'&&tile(tx,ty-1)!=='=';
 g.imageSmoothingEnabled=false;
 if(b==='='){
  // The chipped silhouette is purely visual and contained in this cell.
  // Shared 26px end heights keep neighbouring ledge samples connected.
  const tip=26+(variant%3)*2;
  g.save();g.beginPath();g.moveTo(x,y);g.lineTo(x+32,y);
  g.lineTo(x+32,y+26);g.lineTo(x+25,y+26);
  g.lineTo(x+25,y+tip);g.lineTo(x+18,y+tip);
  g.lineTo(x+18,y+23);g.lineTo(x+10,y+23);
  g.lineTo(x+10,y+29);g.lineTo(x+5,y+29);
  g.lineTo(x+5,y+26);g.lineTo(x,y+26);g.closePath();g.clip();
  g.drawImage(cavern,variant*32,32,32,32,x,y,32,32);
  g.drawImage(cavern,variant*32,0,32,32,x,y,32,7);
  g.restore();
 }else{
  // Never clip solid ground: every collision cell is fully opaque.
  g.drawImage(cavern,variant*32,64,32,32,x,y,32,32);
  if(surface)g.drawImage(cavern,variant*32,0,32,32,x,y,32,7);
 }
 // End shading stays below the readable landing line.
 g.fillStyle='#171d35';
 if(tile(tx-1,ty)!==b)g.fillRect(x,y+7,2,b==='='?19:25);
 if(tile(tx+1,ty)!==b)g.fillRect(x+30,y+7,2,b==='='?19:25);
}
const forge=assets.forgeTerrain;
const forgeReady=bakery===3&&forge&&forge.complete&&forge.naturalWidth===256&&forge.naturalHeight===96;
function drawForgeTerrain(tx,ty,b){
 const x=tx*T,y=ty*T,variant=(tx+ty*3)%8;
 const surface=tile(tx,ty-1)!=='#'&&tile(tx,ty-1)!=='=';
 g.imageSmoothingEnabled=false;
 g.drawImage(forge,variant*32,b==='='?32:64,32,32,x,y,32,32);
 if(b==='='||surface){
  // Flat steel tread sits on the existing collision top, with no railing.
  g.drawImage(forge,variant*32,0,32,32,x,y,32,7);
  g.fillStyle='#282435';g.fillRect(x,y+7,32,2);
 }
 if(b==='='){
  g.fillStyle='#211e2c';g.fillRect(x,y+30,32,2);
 }
 // Flush copper end plates remain inside the original platform footprint.
 for(const edge of [0,1])if(tile(tx+(edge?1:-1),ty)!==b){
  const ex=x+(edge?28:0);
  g.fillStyle='#5e3c37';g.fillRect(ex,y+7,4,23);
  g.fillStyle='#b67850';g.fillRect(ex+1,y+8,2,21);
  g.fillStyle='#e7b57a';g.fillRect(ex+1,y+11,1,1);g.fillRect(ex+1,y+25,1,1);
 }
}
const th=THEMES[bakery-1];const retro=assets['retroStage'+bakery];
const p3bg=assets['phase3'+bakery];
const generatedBackground=bakery===1?assets.generatedMoonlitBG
 :bakery===2?assets.generatedMushroomBG
 :assets.generatedClockworkBG;
if(window.CrustParallax&&window.__crustParallaxEnabled!==false){
 window.CrustParallax.render(g,{width:W,height:H,cameraX:camera,cameraY:cameraY,
  worldHeight:rows*T,worldWidth:world,
  background:generatedBackground,stage:bakery,
  outdoorCity:bakery===1,fungalCavern:bakery===2,clockworkOvens:bakery===3,
  layers:bakery===1?
    {far:assets.bakery1ParallaxFar,mid:assets.bakery1ParallaxMid,near:assets.bakery1ParallaxNear}:
    bakery===2?
    {far:assets.bakery2ParallaxFar,mid:assets.bakery2ParallaxMid,near:assets.bakery2ParallaxNear}:
    {far:assets.bakery3ParallaxFar,mid:assets.bakery3ParallaxMid,near:assets.bakery3ParallaxNear},
  profile:window.__crustParallaxProfile||'dramatic',enabled:true,time:tick/60,
  atmosphere:window.__crustAtmosphereEnabled!==false,
  reducedMotion:typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches});
}else if(generatedBackground&&generatedBackground.complete&&generatedBackground.naturalWidth){
 g.imageSmoothingEnabled=false;
 g.drawImage(generatedBackground,0,0,W,H);
}else if(p3bg&&p3bg.complete&&p3bg.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(p3bg,0,0,W,H)}
else if(retro&&retro.complete&&retro.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(retro,0,0,W,H)}
else if(assets.background.complete&&assets.background.naturalWidth){g.drawImage(assets.background,0,0,W,H);if(th.tint)rect(0,0,W,H,th.tint)}
else rect(0,0,W,H,'#382c49');
// Keep old flour motes only in the flat-background comparison.
if(window.__crustParallaxEnabled===false)for(let i=0;i<35;i++){let px=(i*157-camera*.14)%W;if(px<0)px+=W;rect(px,(i*89)%410,2,2,th.mote)}
g.save();g.translate(-Math.round(camera)+(shake>0.6?(Math.random()-.5)*shake:0),-Math.round(cameraY)+(shake>0.6?(Math.random()-.5)*shake*.6:0));
drawBloomrotChamber();
drawBakeryArchitecture();
drawMoonlitPlatformBacking();
let lo=Math.max(0,Math.floor(camera/T)-1),hi=Math.min(cols,Math.ceil((camera+W)/T)+1);
let vy0=Math.max(0,Math.floor(cameraY/T)-3),vy1=Math.min(rows,Math.ceil((cameraY+H)/T)+3);
for(let x=lo;x<hi;x++)for(let y=vy0;y<vy1;y++){let b=map[y][x];if(b==='#'||b==='='){if(moonlitReady)drawMoonlitTerrain(x,y,b);
 else if(cavernReady)drawCavernTerrain(x,y,b);
 else if(forgeReady)drawForgeTerrain(x,y,b);
 else if(envReady)drawEnv(10,x*T,y*T,32,32);
 else if(assets.tiles.complete&&assets.tiles.naturalWidth)g.drawImage(assets.tiles,((x+y*3)%8)*32,0,32,32,x*T,y*T,32,32);
 else rect(x*T,y*T,32,32,'#b47b51')}else if(b==='^'){
 if(hazardsReady){
  g.imageSmoothingEnabled=false;
  g.drawImage(hazardArt,(bakery-1)*32,0,32,32,x*T,y*T,32,32);
 }else if(envReady)drawEnv(bakery===1?15:bakery===2?0:2,x*T,y*T,32,32);
 else{
  // Load-failure spikes must sit in the actual hazard cell, not legacy row 14.
  const hx=x*T,hy=y*T;
  rect(hx,hy+24,32,8,'#17192e');
  for(const [left,tip,right,top]of [[0,6,13,12],[7,16,25,0],[20,26,32,12]]){
   g.fillStyle='#111326';g.beginPath();g.moveTo(hx+left,hy+25);
   g.lineTo(hx+tip,hy+top);g.lineTo(hx+right,hy+25);g.closePath();g.fill();
   g.fillStyle='#f1e7cf';g.beginPath();g.moveTo(hx+left+3,hy+23);
   g.lineTo(hx+tip,hy+top+4);g.lineTo(hx+right-3,hy+23);g.closePath();g.fill();
  }
 }

}}// Decorative brick seams and icing along visible solid tile surfaces.
for(let tx=lo;tx<hi;tx++)for(let ty=vy0;ty<vy1;ty++){
 if(moonlitReady||cavernReady||forgeReady)continue;
 if(map[ty][tx]!=='#'&&map[ty][tx]!=='=')continue;
 const xx=tx*T,yy=ty*T;
 g.fillStyle=bakery===2?'#443452':bakery===3?'#603b43':'#56405c';
 g.fillRect(xx+3,yy+11,26,2);g.fillRect(xx+14,yy+12,2,12);
 g.fillStyle=bakery===2?'#bb65d6':bakery===3?'#e5a35e':'#e4c1b0';
 if(ty===0||map[ty-1][tx]!=='#'){g.fillRect(xx,yy,32,5);g.fillStyle='#fff1d5';g.fillRect(xx+2,yy,14,2);}
}

drawMoonlitPlatformFaces();
// Original copper highlights are retained only for the load-failure fallback.
if(bakery===3&&!forgeReady){
 g.save();g.imageSmoothingEnabled=false;
 for(let tx=lo;tx<hi;tx++)for(let ty=vy0;ty<vy1;ty++){
  if(map[ty][tx]!=='='||tile(tx,ty-1)==='^')continue;
  const x=tx*T,y=ty*T;
  g.fillStyle='#4b3040';g.fillRect(x+1,y+3,30,6);
  g.fillStyle=tx%3===0?'#ffa34f':'#c88760';g.fillRect(x+2,y+1,28,4);
  g.fillStyle='#ffe2a6';g.fillRect(x+5,y+1,5,2);
  if(tx%5===1){g.fillStyle='rgba(255,160,78,.48)';g.fillRect(x+13,y-9,3,3);g.fillRect(x+21,y-14,2,2);}
 }
 g.restore();
}
// Legacy cave motes and rooftop steam. Clockwork cogs belong to the parallax art.
if(bakery!==3)for(let k=0;k<18;k++){
 const x=(k*173+37)%(cols*T),y=145+(k*71)%270;
 if(x<camera-30||x>camera+W+30)continue;
 const drift=Math.sin(tick*.025+k*2.1)*7;
  g.fillStyle=bakery===2?'#a2f6e5':'#e8d2aa';
  g.fillRect(x+drift,y+Math.sin(tick*.035+k)*9,3,3);
}
drawYeastCollectibles();
for(const u of powerups)if(!u.got||u.kind==='ammo'){const uy=u.y+(u.got?0:Math.sin(tick*.08+u.ph)*3);
if(drawSupplyPickup(u,uy))continue;
if(u.kind==='ammo'){
 rect(u.x-14,uy-13,28,25,'#272633');rect(u.x-11,uy-10,22,19,u.got?'#51505b':'#a77d50');
 for(let i=0;i<3;i++){rect(u.x-8+i*6,uy-7,4,12,u.got?'#77727b':'#ffe2a4');rect(u.x-7+i*6,uy-9,2,2,u.got?'#77727b':'#fff1cf');}
 g.save();g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#ffe5ad';g.fillText(u.got?'AMMO '+Math.ceil(u.refreshT/60)+'s':'+25 AMMO',u.x,uy-20);g.restore();
 }else if(u.kind==='cache'){rect(u.x-13,uy-13,26,24,'#302c38');rect(u.x-11,uy-11,22,20,'#a77d50');rect(u.x-9,uy-8,18,3,'#d6b278');rect(u.x-9,uy+2,18,3,'#d6b278');rect(u.x-4,uy-9,3,16,'#655043');rect(u.x+3,uy-9,3,16,'#655043');rect(u.x-1,uy-3,3,5,'#f8e4a7');}
else if(u.kind==='kefir'&&drawIdentityPickup('kefir',u.x,uy-4)){/* Slim lightning bottle; existing pickup anchor and rules. */}
else if(envReady){drawEnv(u.kind==='kefir'?14:u.kind==='rye'?8:13,u.x-19,uy-23,38,38);}
else if(u.kind==='kefir'){rect(u.x-8,uy-10,16,20,'#f4f1ea');rect(u.x-8,uy-10,16,6,'#d23b3b');rect(u.x-3,uy-2,6,8,'#7ec8e3')}
else if(u.kind==='rye'){g.fillStyle='#a06830';g.beginPath();g.ellipse(u.x,uy,13,9,0,0,7);g.fill();g.fillStyle='#d8a860';g.beginPath();g.ellipse(u.x,uy-3,8,5,0,0,7);g.fill()}
else{rect(u.x-11,uy-8,22,14,'#c9a06a');rect(u.x-11,uy-8,22,4,'#a87f4e');for(let qi=-8;qi<=8;qi+=8)rect(u.x+qi-1,uy-8,2,14,'#a87f4e')}}
// CRUST_DOUGH_GREMLINS_V1: art-only integration. No changes to AI,
// hitboxes, damage, collision, movement speed, or enemy spawn logic.
for(const e of enemies)if(e.alive){
 if(drawClockworkEnemy(e)||drawFungalEnemy(e)||drawDoughSlinger(e)||drawOpeningEnemy(e))continue;
 const bob=Math.sin(tick*.1+e.x*.02)*2;
 const atlas=(e.type==='hopper'||e.type==='thrower')?assets.gremlinExpressions:assets.gremlinRun;
 const newArt=window.__crustGremlinArt!==false&&atlas&&atlas.complete&&atlas.naturalWidth===128;
 if(newArt){
   const {row,frame}=gremlinAnimation(e);
   // Preserve sprite sizes and physics. Only grounded frame padding is aligned.
   const drawSize=window.__crustLargeGremlins!==false?42:32;
   const supported=contactSurface(e)!==null&&Math.abs(e.vy||0)<=1;
   const bottoms=e.type==='hopper'?
    [[27,28,27,26],[27,26,28,27]]:[[27,28,28,27],[28,29,27,28]];
   const foot=supported&&row<2?bottoms[row][frame]:28;
   const drawTop=-Math.round(foot*drawSize/32);
   if(supported)drawContactShadow(e,22);
   g.save();
   g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));
   g.scale((e.type==='thrower'?e.face:e.vx)<0?-1:1,1);
   g.imageSmoothingEnabled=false;
   g.drawImage(atlas,frame*32,row*32,32,32,-drawSize/2,drawTop,drawSize,drawSize);
   g.restore();
 }else{
   if(assets.items.complete&&assets.items.naturalWidth){
     g.save();g.translate(e.x+(e.vx>0?0:25),e.y+bob);
     g.scale(e.vx>0?1:-1,1);
     g.drawImage(assets.items,32,0,32,32,0,-5,29,32);g.restore();
   }else rect(e.x,e.y+bob,25,25,'#9c5e42');
   if(e.type==='hopper')rect(e.x+8,e.y+bob-9,9,5,'#ff9d2e');
   if(e.type==='chaser')rect(e.x+8,e.y+bob-9,9,5,'#ff4d5e');
   // Original blinking face drawn only for fallback old sprites.
   const blink=tick%113<5;
   g.fillStyle='#2a1d32';
   g.fillRect(e.x+7,e.y+8+bob,blink?8:4,blink?2:5);
   g.fillRect(e.x+18,e.y+8+bob,blink?7:4,blink?2:5);
   g.fillStyle='#fff5d7';
   if(!blink){
     g.fillRect(e.x+8,e.y+9+bob,2,2);
     g.fillRect(e.x+19,e.y+9+bob,2,2);
   }
   g.fillStyle='#8d2b46';
   g.fillRect(e.x+11,e.y+19+bob,8,3);
 }
 if(e.type==='thrower')drawThrowerCue(e);
}
drawForeman();drawMycelium();drawBloomrot();drawDevourer();if(bakery===2)drawCavernFoothillsTrim();if(bakery===2)drawPlungeWayfinding();
drawEnemyShots();
for(const s of shots){if(drawDoughShot(s))continue;rect(s.x,s.y,s.w,s.h,'#ffff88');rect(s.x+3,s.y-2,4,2,'#fff')}for(const p of particles)rect(p.x,p.y,4,4,p.color);g.font='bold 15px monospace';g.textAlign='center';for(const fl of floaters){g.globalAlpha=Math.min(1,fl.life/30);g.fillStyle=fl.color;g.fillText(fl.txt,fl.x,fl.y)}g.globalAlpha=1;g.textAlign='left';drawPlayer();
if(!window.__crustBloomrotArena&&!(bakery===3&&window.__crustDevourerPreview)){if(!devourerArena())drawGrandOven();drawCheckpoints();}
g.restore();
}
