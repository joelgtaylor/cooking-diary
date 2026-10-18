/* World renderer: backgrounds, scenery, pickups, enemies, effects and checkpoints.
 * drawPlayer runs inside the world transform; drawHUD runs after restore.
 * Classic-script functions share game state and run only after setup.
 */
'use strict';
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h)}
function draw(){drawWorld();drawHUD();}
function drawWorld(){
const env=assets.environmentDecor;
const envReady=window.__crustWorldArtEnabled!==false&&env&&env.complete&&env.naturalWidth===256;
function drawEnv(cell,x,y,w,h){
 g.imageSmoothingEnabled=false;
 g.drawImage(env,(cell%4)*64,Math.floor(cell/4)*64,64,64,x,y,w,h);
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
  profile:window.__crustParallaxProfile||'dramatic',enabled:true});
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
let lo=Math.max(0,Math.floor(camera/T)-1),hi=Math.min(cols,Math.ceil((camera+W)/T)+1);
let vy0=Math.max(0,Math.floor(cameraY/T)-3),vy1=Math.min(rows,Math.ceil((cameraY+H)/T)+3);
for(let x=lo;x<hi;x++)for(let y=vy0;y<vy1;y++){let b=map[y][x];if(b==='#'||b==='='){if(envReady)drawEnv(10,x*T,y*T,32,32);
 else if(assets.tiles.complete&&assets.tiles.naturalWidth)g.drawImage(assets.tiles,((x+y*3)%8)*32,0,32,32,x*T,y*T,32,32);
 else rect(x*T,y*T,32,32,'#b47b51')}else if(b==='^'){
 if(envReady)drawEnv(bakery===1?15:bakery===2?0:2,x*T,y*T,32,32);
 else{g.fillStyle='#f47a9e';g.beginPath();g.moveTo(x*T,15*T+0);g.lineTo(x*T+16,14*T);g.lineTo(x*T+32,15*T);g.fill()}
}}// Decorative brick seams and icing along visible solid tile surfaces.
for(let tx=lo;tx<hi;tx++)for(let ty=vy0;ty<vy1;ty++){
 if(map[ty][tx]!=='#'&&map[ty][tx]!=='=')continue;
 const xx=tx*T,yy=ty*T;
 g.fillStyle=bakery===2?'#443452':bakery===3?'#603b43':'#56405c';
 g.fillRect(xx+3,yy+11,26,2);g.fillRect(xx+14,yy+12,2,12);
 g.fillStyle=bakery===2?'#bb65d6':bakery===3?'#e5a35e':'#e4c1b0';
 if(ty===0||map[ty-1][tx]!=='#'){g.fillRect(xx,yy,32,5);g.fillStyle='#fff1d5';g.fillRect(xx+2,yy,14,2);}
}

// PHASE 5: copper gear-tooth highlights on pass-through ledges.
if(bakery===3){
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
// Clockwork machinery, magical cave motes, or rooftop steam: visual only.
for(let k=0;k<18;k++){
 const x=(k*173+37)%(cols*T),y=145+(k*71)%270;
 if(x<camera-30||x>camera+W+30)continue;
 const drift=Math.sin(tick*.025+k*2.1)*7;
 if(bakery===3){
  const r=10+(k%3)*5,spin=tick*.025*(k%2?1:-1);
  g.strokeStyle='#e3a15f';g.lineWidth=3;
  g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
  for(let j=0;j<6;j++){const a=spin+j*Math.PI/3;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);g.stroke();}
 }else{
  g.fillStyle=bakery===2?'#a2f6e5':'#e8d2aa';
  g.fillRect(x+drift,y+Math.sin(tick*.035+k)*9,3,3);
 }
}
// CRUST_PICKUP_READABILITY_V1: collectible yeast jars are deliberately
// distinguishable from identical decorative jars. The effect is visual only.
for(const gem of gems)if(!gem.got){
 const cy=gem.y+Math.sin(tick*.09)*5;
 const cx=gem.x+2, pulse=(Math.sin(tick*.09)+1)*.5;
 g.save();
 // Warm halo behind the collectible, not behind decorative scenery.
 const halo=g.createRadialGradient(cx,cy-6,3,cx,cy-6,26);
 halo.addColorStop(0,'rgba(255,244,151,'+(0.28+pulse*.16)+')');
 halo.addColorStop(1,'rgba(255,210,95,0)');
 g.fillStyle=halo;g.beginPath();g.arc(cx,cy-6,26,0,Math.PI*2);g.fill();
 if(envReady)drawEnv(3,gem.x-13,cy-23,30,34);
 else if(assets.items.complete&&assets.items.naturalWidth)g.drawImage(assets.items,0,0,32,32,gem.x-9,cy-13,32,32);
 else rect(gem.x,cy,18,18,'#f8d994');
 // Four-point twinkles move with the collectible. Avoid additional
 // game objects, hitboxes or camera-dependent effects.
 g.strokeStyle='#fff6bc';g.lineWidth=2;
 for(let j=0;j<3;j++){
   const a=tick*.035+j*Math.PI*2/3;
   const sx=Math.round(cx+Math.cos(a)*22);
   const sy=Math.round(cy-7+Math.sin(a)*14);
   const size=j===0?5:3;
   g.beginPath();g.moveTo(sx-size,sy);g.lineTo(sx+size,sy);
   g.moveTo(sx,sy-size);g.lineTo(sx,sy+size);g.stroke();
 }
 // Stable, crisp objective marker above the jar, independent of frame art.
 g.font='bold 10px monospace';g.textAlign='center';
 g.fillStyle='#31243a';g.fillText('YEAST',cx+1,cy-31+1);
 g.fillStyle='#fff1a8';g.fillText('YEAST',cx,cy-31);
 g.restore();
}
for(const u of powerups)if(!u.got){const uy=u.y+Math.sin(tick*.08+u.ph)*3;
if(envReady){drawEnv(u.kind==='kefir'?14:u.kind==='rye'?8:13,u.x-19,uy-23,38,38);}
else if(u.kind==='kefir'){rect(u.x-8,uy-10,16,20,'#f4f1ea');rect(u.x-8,uy-10,16,6,'#d23b3b');rect(u.x-3,uy-2,6,8,'#7ec8e3')}
else if(u.kind==='rye'){g.fillStyle='#a06830';g.beginPath();g.ellipse(u.x,uy,13,9,0,0,7);g.fill();g.fillStyle='#d8a860';g.beginPath();g.ellipse(u.x,uy-3,8,5,0,0,7);g.fill()}
else{rect(u.x-11,uy-8,22,14,'#c9a06a');rect(u.x-11,uy-8,22,4,'#a87f4e');for(let qi=-8;qi<=8;qi+=8)rect(u.x+qi-1,uy-8,2,14,'#a87f4e')}}
// CRUST_DOUGH_GREMLINS_V1: art-only integration. No changes to AI,
// hitboxes, damage, collision, movement speed, or enemy spawn logic.
for(const e of enemies)if(e.alive){
 const bob=Math.sin(tick*.1+e.x*.02)*2;
 const atlas=e.type==='hopper'?assets.gremlinExpressions:assets.gremlinRun;
 const newArt=window.__crustGremlinArt!==false&&atlas&&atlas.complete&&atlas.naturalWidth===128;
 if(newArt){
   let row=0,frame=0;
   if(e.type==='hopper'&&Math.abs(e.vy||0)>1){
     row=2;frame=Math.min(3,Math.floor((tick+e.x*.1)/7)%4);
   }else if(Math.abs(e.vx)>0.15){
     row=1;frame=Math.floor((tick+e.x*.12)/9)%4;
   }else{
     row=0;frame=Math.floor((tick+e.x*.1)/18)%4;
   }
   // CRUST_GREMLIN_SCALE_V2: enlarge only the visual sprite; keep the
   // original 25x25 enemy hitbox, velocity, AI and ground contact untouched.
   // The source 32x32 cells contain a few transparent pixels under the boots.
   // At 42px display size, -37 places the visible feet on the original floor.
   const large=window.__crustLargeGremlins!==false;
   const drawSize=large?42:32;
   const drawTop=large?-37:-32;
   g.save();
   g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h+bob));
   g.scale(e.vx<0?-1:1,1);
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
}
for(const s of shots){rect(s.x,s.y,s.w,s.h,'#ffff88');rect(s.x+3,s.y-2,4,2,'#fff')}for(const p of particles)rect(p.x,p.y,4,4,p.color);g.font='bold 15px monospace';g.textAlign='center';for(const fl of floaters){g.globalAlpha=Math.min(1,fl.life/30);g.fillStyle=fl.color;g.fillText(fl.txt,fl.x,fl.y)}g.globalAlpha=1;g.textAlign='left';drawPlayer();
const ex=currentVerticalLayout().oven.x*T;
rect(ex-8,currentVerticalLayout().oven.y*T,65,115,'#6b4945');rect(ex-3,currentVerticalLayout().oven.y*T+6,55,106,'#c0aaa0');rect(ex+3,currentVerticalLayout().oven.y*T+23,43,70,'#523a3c');
rect(ex+7,currentVerticalLayout().oven.y*T+27,35,62,collected===5?'#ffb54e':'#7a5252');
rect(ex+13,currentVerticalLayout().oven.y*T+49,23,15,'#b46c36');
rect(ex+17,currentVerticalLayout().oven.y*T+46,15,6,'#f2cd8c');
rect(ex+1,currentVerticalLayout().oven.y*T+9,47,8,'#fff0cd');
{
 for(let i=0;i<currentVerticalLayout().checkpoints.length;i++){
  const [xx,yy]=currentVerticalLayout().checkpoints[i];
  const activated=i<=checkpointState.current;
  // CRUST_CHECKPOINT_FLAG_ANIM_V1: game-art banner frames.
  const flag=assets.checkpointFlags;
  if(flag&&flag.complete&&flag.naturalWidth===320){
    const frame=Math.floor(tick/(activated?8:10))%4;
    const row=activated?1:0;
    const dw=66,dh=99;
    const centerX=xx*T+16,groundY=checkpointSupportRow(xx,yy)*T;
    // CRUST_CHECKPOINT_STABLE_POLE_V3: freeze the rigid structure at frame 0.
    // Generated art varies the stone pedestal and pole by a few pixels,
    // which can't be fixed perfectly by moving the entire waving sprite.
    // Only the cloth (upper-right region) is animated. Its pole, stone
    // footing, and lantern always come from the identical frame-0 pixels.
    const footPadding=row===1?10:6;
    const dx=Math.round(centerX-dw/2)+2;
    const dy=Math.round(groundY-dh)+2+Math.round(footPadding*dh/120);
    const splitX=43,splitY=87;
    const xScale=dw/80,yScale=dh/120;
    const drawPart=(col,sx,sy,sw,sh,xShift=0)=>{
      g.drawImage(flag,col*80+sx,row*120+sy,sw,sh,
        Math.round(dx+sx*xScale)+xShift,Math.round(dy+sy*yScale),
        Math.round(sw*xScale),Math.round(sh*yScale));
    };
    g.save();
    g.imageSmoothingEnabled=false;
    // Animated banner; its moving edge is the only part allowed to sway.
    const sway=[0,2,6,6];
    drawPart(frame,splitX,0,80-splitX,splitY,
      Math.round(sway[frame]*xScale));
    // Fixed lantern, flagpole, finial and mounting hardware.
    drawPart(0,0,0,splitX,splitY);
    // Fixed stone base and flowers, even where they extend past the pole.
    drawPart(0,0,splitY,80,120-splitY);
    g.restore();
  }else{
    // Preload fallback: small marker stays visible on slow connections.
    g.fillStyle=activated?'#64f2bb':'#ffb976';
    g.beginPath();g.arc(xx*T+16,yy*T+4,7,0,Math.PI*2);g.fill();
  }
 }
}g.restore();
}
