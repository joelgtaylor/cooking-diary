/* Rendering-only feedback. Pickup/checkpoint rules remain in gameplay/world.js. */
'use strict';
const pickupVisuals=new WeakMap(),checkpointVisuals=new WeakMap();

/* Opt-in design audition: shared production renderer, Bakery Entry only.
 * The default path deliberately retains the reviewed rendering baseline.
 */
function entryIndicatorsEnabled(){
 return bakery===1&&typeof window.location==='object'&&
  /(?:^|[?&])indicators=pilot(?:&|$)/.test(window.location.search||'');
}
function drawEntryCheckpoint(cx,groundY,activated,current){
 const x=Math.round(cx),y=Math.round(groundY);
 g.save();
 // Foot stays on the authored support; no collision or actor positions change.
 rect(x-9,y-5,22,5,'#171c2c');
 rect(x-7,y-5,18,2,'#c5a474');
 if(current){rect(x-12,y-9,28,2,'#fff0c9');rect(x-12,y-9,2,6,'#fff0c9');rect(x+14,y-9,2,6,'#fff0c9');}
 rect(x,y-87,6,82,'#151b2a');
 rect(x+1,y-87,3,82,'#96734e');
 rect(x+1,y-87,1,82,'#e5c597');
 rect(x-2,y-91,9,6,'#171c2c');rect(x,y-90,5,4,'#efd5a3');
 // Inactive cloth is narrow and folded; saved cloth is broad and notched.
 if(!activated){
  rect(x+6,y-84,13,36,'#121a2b');
  rect(x+7,y-83,10,32,'#b9a991');
  rect(x+10,y-82,2,29,'#f0dec0');
  rect(x+15,y-82,2,29,'#756456');
 }else{
  g.fillStyle='#141b2a';g.beginPath();g.moveTo(x+5,y-85);g.lineTo(x+43,y-85);
  g.lineTo(x+37,y-69);g.lineTo(x+43,y-51);g.lineTo(x+5,y-51);g.closePath();g.fill();
  g.fillStyle='#e6ce9f';g.beginPath();g.moveTo(x+7,y-83);g.lineTo(x+40,y-83);
  g.lineTo(x+34,y-69);g.lineTo(x+40,y-53);g.lineTo(x+7,y-53);g.closePath();g.fill();
  rect(x+8,y-82,2,28,'#fff1d1');rect(x+12,y-57,22,2,'#b99564');
  // Chunky stitched check reads independently of colour and motion.
  rect(x+14,y-70,4,7,'#26313a');rect(x+18,y-66,4,7,'#26313a');
  rect(x+22,y-70,4,9,'#26313a');rect(x+26,y-75,4,9,'#26313a');
 }
 g.restore();
}

function worldBadge(text,cx,y,accent){
 const width=text.length*6+10,x=Math.round(cx-width/2);y=Math.round(y);
 g.save();g.fillStyle='#101426';g.fillRect(x-1,y-1,width+2,15);
 g.fillStyle='rgba(21,25,46,.94)';g.fillRect(x,y,width,13);
 g.fillStyle=accent;g.fillRect(x,y,width,1);
 g.font='bold 9px monospace';g.textAlign='center';g.fillStyle='#fff3d4';g.fillText(text,Math.round(cx),y+10);g.restore();
}
function feedbackCorners(cx,cy,radius,color,alpha){
 const r=Math.round(radius);cx=Math.round(cx);cy=Math.round(cy);
 g.save();g.globalAlpha=alpha;g.fillStyle=color;
 for(const sx of [-1,1])for(const sy of [-1,1]){
  const x=cx+sx*r,y=cy+sy*r;
  g.fillRect(sx<0?x:x-4,y,5,1);g.fillRect(x,sy<0?y:y-4,1,5);
 }
 g.restore();
}
function pickupVisual(gem){
 let visual=pickupVisuals.get(gem);
 if(!visual||tick<visual.lastTick){
  visual={got:gem.got,at:null,lastTick:tick,x:gem.x+2,y:gem.y-6};pickupVisuals.set(gem,visual);
 }
 if(gem.got&&!visual.got)visual.at=tick;
 if(!gem.got)visual.at=null;
 visual.got=gem.got;visual.lastTick=tick;
 return visual;
}
function drawYeastCollectibles(){
 const env=assets.environmentDecor,envReady=window.__crustWorldArtEnabled!==false&&env&&env.complete&&env.naturalWidth===256;
 for(const gem of gems){
  const visual=pickupVisual(gem);
  if(gem.got){
   const elapsed=visual.at===null?99:tick-visual.at;
   if(elapsed<18)feedbackCorners(visual.x,visual.y,18+elapsed*.65,'#fff0ac',.7*(1-elapsed/18));
   continue;
  }
  const cy=Math.round(gem.y+Math.sin(tick*.09)*5),cx=Math.round(gem.x+2);
  visual.x=cx;visual.y=cy-6;
  const pulse=(Math.sin(tick*.09)+1)*.5;
  g.save();
  // Local dark separation and a restrained halo keep the jar readable in firelight.
  const halo=g.createRadialGradient(cx,cy-6,4,cx,cy-6,23);
  halo.addColorStop(0,'rgba(255,233,151,'+(.18+pulse*.10)+')');halo.addColorStop(1,'rgba(255,210,95,0)');
  g.fillStyle=halo;g.beginPath();g.arc(cx,cy-6,23,0,Math.PI*2);g.fill();
  g.fillStyle='rgba(12,15,34,.55)';g.beginPath();g.ellipse(cx,cy-6,14,18,0,0,Math.PI*2);g.fill();
  g.imageSmoothingEnabled=false;
  if(envReady)g.drawImage(env,192,0,64,64,Math.round(gem.x-13),cy-23,30,34);
  else if(assets.items.complete&&assets.items.naturalWidth)g.drawImage(assets.items,0,0,32,32,Math.round(gem.x-9),cy-13,32,32);
  else rect(Math.round(gem.x),cy,18,18,'#f8d994');
  // Fixed glints replace orbiting crosses, reducing motion around small targets.
  g.globalAlpha=.65+pulse*.35;g.fillStyle='#fff4bf';
  for(const [dx,dy]of [[-19,-10],[19,3]]){g.fillRect(cx+dx-2,cy+dy,5,1);g.fillRect(cx+dx,cy+dy-2,1,5);}
  g.restore();
  if(!(entryIndicatorsEnabled()&&gem===gems[0]))worldBadge('YEAST',cx,gem.y-46,'#edc775');
 }
}
function checkpointVisual(){
 let visual=checkpointVisuals.get(checkpointState);
 if(!visual||tick<visual.lastTick){
  visual={current:checkpointState.current,lastTick:tick,flashes:new Map()};checkpointVisuals.set(checkpointState,visual);
 }
 if(checkpointState.current>visual.current)visual.flashes.set(checkpointState.current,tick);
 if(checkpointState.current<visual.current)visual.flashes.clear();
 visual.current=checkpointState.current;visual.lastTick=tick;
 return visual;
}
function drawCheckpoints(){
 const visual=checkpointVisual(),flag=assets.checkpointFlags;
 for(let i=0;i<currentVerticalLayout().checkpoints.length;i++){
  const [xx,yy]=currentVerticalLayout().checkpoints[i],activated=i<=checkpointState.current,current=i===checkpointState.current;
  const centerX=xx*T+16,groundY=checkpointSupportRow(xx,yy)*T;
  const pilot=entryIndicatorsEnabled()&&i===0;
  if(pilot){drawEntryCheckpoint(centerX,groundY,activated,current);}
  else if(flag&&flag.complete&&flag.naturalWidth===320){
   const frame=Math.floor(tick/(activated?8:10))%4,row=activated?1:0;
   const dw=66,dh=99,xScale=dw/80,yScale=dh/120;
   // Source frame-0 alpha baselines: inactive y=117, active y=112.
   const dx=Math.round(centerX-dw/2)+2,dy=groundY-Math.round((activated?112:117)*yScale);
   const splitX=43,splitY=87;
   const part=(col,sx,sy,sw,sh)=>g.drawImage(flag,col*80+sx,row*120+sy,sw,sh,
    Math.round(dx+sx*xScale),Math.round(dy+sy*yScale),Math.round(sw*xScale),Math.round(sh*yScale));
   g.save();g.imageSmoothingEnabled=false;
   // The cloth already contains motion; never translate it away from the pole.
   part(frame,splitX,0,80-splitX,splitY);
   part(0,0,0,splitX,splitY);part(0,0,splitY,80,120-splitY);
   g.restore();
  }else{
   g.fillStyle=activated?'#64f2bb':'#ffb976';g.beginPath();g.arc(centerX,yy*T+4,7,0,Math.PI*2);g.fill();
  }
  if(!pilot)worldBadge(current?'SAVED':activated?'PASSED':'CHECKPOINT',centerX,groundY-112,current?'#aeece0':'#dec899');
  const at=visual.flashes.get(i),elapsed=at===undefined?99:tick-at;
  if(pilot&&elapsed<120)worldBadge('CHECKPOINT SAVED',centerX,groundY-112,'#fff0c9');
  if(elapsed<30)feedbackCorners(centerX+3,groundY-6,9+elapsed*.6,'#d9fff2',.55*(1-elapsed/30));
 }
}
