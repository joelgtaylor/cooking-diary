/* Rendering-only feedback. Pickup/checkpoint rules remain in gameplay/world.js. */
'use strict';
const pickupVisuals=new WeakMap(),checkpointVisuals=new WeakMap();

/* Approved culture / kefir art audition. Opt-in keeps the reviewed default
 * render path intact until playtesting is approved. All pickup rules stay put.
 */
let pickupIdentityArt=null;
const PICKUP_IDENTITY_SPRITES=Object.freeze({
 culture:Object.freeze({sx:96,sy:96,sw:752,sh:744,w:34,h:34}),
 kefir:Object.freeze({sx:1200,sy:40,sw:272,sh:816,w:16,h:40})
});
function drawIdentityPickup(kind,cx,cy){
 if(!window.location||!/(?:^|[?&])pickups=pilot(?:&|$)/.test(window.location.search||''))return false;
 const sprite=PICKUP_IDENTITY_SPRITES[kind];
 if(!sprite)return false;
 if(!pickupIdentityArt){
  pickupIdentityArt=new Image();
  pickupIdentityArt.src='art/culture-kefir-pickups.png';
 }
 // Keep original artwork AND labels on loading/error, never an invisible item.
 if(!pickupIdentityArt.complete||pickupIdentityArt.naturalWidth!==1774||pickupIdentityArt.naturalHeight!==887)return false;
 g.save();g.imageSmoothingEnabled=false;
 g.drawImage(pickupIdentityArt,sprite.sx,sprite.sy,sprite.sw,sprite.sh,
  Math.round(cx-sprite.w/2),Math.round(cy-sprite.h/2),sprite.w,sprite.h);
 g.restore();
 return true;
}

// Approved supply art audition. This renderer never grants resources or
// advances the cooldown; gameplay.js remains the authority for both.
let supplyPickupArt=null;
const SUPPLY_PICKUP_SPRITES=Object.freeze({
 rye:Object.freeze({crop:[16,140,496,328],w:38,h:26}),
 banneton:Object.freeze({crop:[538,122,460,350],w:38,h:30}),
 cache:Object.freeze({crop:[1024,144,484,332],w:36,h:26}),
 ammo:Object.freeze({crop:[12,592,488,340],w:40,h:28}),
 empty:Object.freeze({crop:[524,592,488,340],w:40,h:28})
});
function supplyRechargeSegments(u){
 if(!u.got)return 5;
 return Math.max(0,Math.min(5,Math.floor(((u.refreshTicks||300)-(u.refreshT||0))*5/(u.refreshTicks||300))));
}
function drawSupplyPickup(u,uy){
 if(!window.location||!/(?:^|[?&])supplies=pilot(?:&|$)/.test(window.location.search||''))return false;
 const sprite=SUPPLY_PICKUP_SPRITES[u.kind==='ammo'&&u.got?'empty':u.kind];
 if(!sprite)return false;
 if(!supplyPickupArt){supplyPickupArt=new Image();supplyPickupArt.src='art/supply-pickups.png';}
 if(!supplyPickupArt.complete||supplyPickupArt.naturalWidth!==1536||supplyPickupArt.naturalHeight!==1024)return false;
 const cx=Math.round(u.x),cy=Math.round(uy-1);
 g.save();g.imageSmoothingEnabled=false;
 g.drawImage(supplyPickupArt,...sprite.crop,Math.round(cx-sprite.w/2),Math.round(cy-sprite.h/2),sprite.w,sprite.h);
 if(u.kind==='ammo'){
  const lit=supplyRechargeSegments(u);
  for(let i=0;i<5;i++){g.fillStyle=i<lit?'#ffe3a1':'#303a4b';g.fillRect(cx-10+i*4,Math.round(uy+4),3,3);}
 }
 g.restore();
 if(u.kind==='ammo')worldBadge(u.got?Math.ceil(u.refreshT/60)+'s':'+25 AMMO',cx,uy-36,'#ffe3a1');
 return true;
}
function prepareSupplyPreview(search){
 const scene=search.match(/(?:^|[?&])scene=(supplies|ammo)(?:&|$)/);
 if(!scene||!/(?:^|[?&])supplies=(?:pilot|off)(?:&|$)/.test(search))return false;
 init(3);
 if(scene[1]==='supplies'){
  // A focused sample row in the real maintenance passage, using real pickups.
  powerups=['rye','banneton','cache','ammo'].map((kind,i)=>({kind,x:(12+i*2)*T,y:53*T,got:false,ph:i*1.5}));
  gems[0].got=true;collected=1;
  player.x=10*T;player.health=2;player.ammo=10;checkpointState.current=0;
  camera=0;
 }else{
  // Actual authored shelter, supply positions and boss rules are untouched.
  player.x=103*T;player.ammo=10;checkpointState.current=3;camera=world-W;
 }
 player.y=54*T-player.h;player.ground=true;cameraY=rows*T-H;
 return true;
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
  const identity=drawIdentityPickup('culture',cx,cy-6);
  if(identity){/* The broad cloth-covered jar identifies the required culture. */}
  else if(envReady)g.drawImage(env,192,0,64,64,Math.round(gem.x-13),cy-23,30,34);
  else if(assets.items.complete&&assets.items.naturalWidth)g.drawImage(assets.items,0,0,32,32,Math.round(gem.x-9),cy-13,32,32);
  else rect(Math.round(gem.x),cy,18,18,'#f8d994');
  // Fixed glints replace orbiting crosses, reducing motion around small targets.
  g.globalAlpha=.65+pulse*.35;g.fillStyle='#fff4bf';
  for(const [dx,dy]of [[-19,-10],[19,3]]){g.fillRect(cx+dx-2,cy+dy,5,1);g.fillRect(cx+dx,cy+dy-2,1,5);}
  g.restore();
  if(!identity)worldBadge('YEAST',cx,gem.y-46,'#edc775');
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
  if(flag&&flag.complete&&flag.naturalWidth===320){
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
  worldBadge(current?'SAVED':activated?'PASSED':'CHECKPOINT',centerX,groundY-112,current?'#aeece0':'#dec899');
  const at=visual.flashes.get(i),elapsed=at===undefined?99:tick-at;
  if(elapsed<30)feedbackCorners(centerX+3,groundY-6,9+elapsed*.6,'#d9fff2',.55*(1-elapsed/30));
 }
}
