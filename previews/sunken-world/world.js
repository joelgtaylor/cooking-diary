/* Milestone 5 route preview. No recipe/save migration or campaign integration. */
'use strict';
const installEntrance=installSunkenPrototype;
installSunkenPrototype=function(){installEntrance();installSunkenWorld();};
function installSunkenWorld(){
 const preview=window.sunkenPreview,slice=window.floodedEntrance,R=slice.render;
 const route={layout:null,actors:[],cultures:[],supplies:[],checkpoint:0,pumpOn:false,pumpCooldown:0,complete:false};window.sunkenWorld=route;
 const images={};
 for(const [id,path]of Object.entries({reef:'flooded-entrance/reef-patroller.png',puffer:'puffer/puffer-frames.png',rider:'current-rider/rider-frames.png',crab:'pot-crab/crab-frames.png',claws:'pot-crab/claw-grab.png'})){images[id]=new Image();images[id].src='../previews/'+path;}
 pickupIdentityArt=new Image();pickupIdentityArt.src='art/culture-kefir-pickups.png';
 supplyPickupArt=new Image();supplyPickupArt.src='art/supply-pickups.png';
 const flag=new Image();flag.src=window.__CRUST_CHECKPOINT_FLAG_ART;
 const gate=prepareStartupArtwork;prepareStartupArtwork=()=>[...gate(),...Object.entries(images).map(([label,image])=>({label,image})),{label:'Culture jars',image:pickupIdentityArt},{label:'Supply artwork',image:supplyPickupArt},{label:'Checkpoint flags',image:flag}];
 const api={reef:CrustReef,puffer:CrustPuffer,rider:CrustRider,crab:CrustCrab};
 const terrainHit=hit;hit=function(x,y,w,h){return terrainHit(x,y,w,h)||route.actors.some(a=>a.kind==='crab'&&CrustCrab.blocks(a.e,x,y,w,h));};
 function createActor(kind,spec){
  const opts=Object.fromEntries(Object.entries(spec).map(([k,v])=>[k,typeof v==='number'?v*T:v]));
  return {kind,spec,e:api[kind].create(opts)};
 }
 const setup=init;
 init=function(){setup();const l=SunkenRoute.create();route.layout=l;map=l.map;rows=l.rows;slice.width=cols*T;slice.height=rows*T;
  route.cultures=l.cultures.map(([x,y])=>({x:x*T,y:y*T,got:false}));gems=route.cultures;collected=0;
  route.supplies=l.supplies.map(s=>({...s,x:s.x*T,y:s.y*T,got:false}));route.checkpoint=0;route.pumpOn=false;route.pumpCooldown=0;route.complete=false;
  route.actors=[...l.reef.map(s=>createActor('reef',s)),...l.puffers.map(s=>createActor('puffer',s)),createActor('rider',l.rider),createActor('crab',l.crab)];
  slice.patroller.alive=false;slice.patroller.deathT=0;preview.rings=[];preview.targets=[];
  preview.water.splice(0,preview.water.length,...l.water.map(r=>({x:r.x*T,y:r.y*T,w:r.w*T,h:r.h*T})));
  preview.currents.splice(0,preview.currents.length,{x:53*T,y:46*T,w:12*T,h:5*T,vx:-.75,vy:0},{x:74*T,y:37*T,w:3*T,h:14*T,vx:0,vy:-1.1});
  preview.checkpoint={x:l.checkpoints[0].x*T,y:l.checkpoints[0].y*T,swimming:false};player.x=preview.checkpoint.x;player.y=preview.checkpoint.y;player.health=3;
  camera=0;cameraY=Math.max(0,player.y-H*.46);
  const scene=/(?:^|[?&])scene=(kitchen|garden-floor)(?:&|$)/.exec(window.location?.search||'');
  if(scene){
   player.x=(scene[1]==='kitchen'?58:40)*T;player.y=scene[1]==='kitchen'?32*T-38:53*T;
   CrustSwim.sync(player,preview.water,hit);
   camera=Math.max(0,Math.min(cols*T-W,player.x-W*.45));
   cameraY=scene[1]==='kitchen'?23*T-90:rows*T-H;
  }
  return player;
 };
 const recover=respawnCheckpoint;
 respawnCheckpoint=function(){
  recover();slice.patroller.alive=false;slice.patroller.deathT=0;
  for(const a of route.actors){if(a.e.alive)a.e=api[a.kind].create(Object.fromEntries(Object.entries(a.spec).map(([k,v])=>[k,typeof v==='number'?v*T:v])));else{a.e.deathT=0;if(a.e.bubbles)a.e.bubbles=[];if(a.e.wake)a.e.wake=[];}}
  player.inv=120;camera=Math.max(0,Math.min(cols*T-W,player.x-W*.35));
 };
 function pumpNear(){const p=route.layout?.pump;return p&&Math.hypot(player.x+player.w/2-p.x*T,player.y+player.h/2-p.y*T)<100;}
 function togglePump(){if(!pumpNear()||route.pumpCooldown)return false;route.pumpOn=!route.pumpOn;route.pumpCooldown=40;preview.currents[0].vx=route.pumpOn?.75:-.75;AudioKit.effect('relay1');return true;}
 interactCavernExploration=togglePump;talkMycelium=()=>{};
 const combat=updateCombat;
 function checkShot(s){
  const p=route.layout.pump;if(!route.pumpCooldown&&Math.abs(s.x-p.x*T)<24&&Math.abs(s.y-p.y*T)<24){s.dead=true;route.pumpOn=!route.pumpOn;route.pumpCooldown=40;preview.currents[0].vx=route.pumpOn?.75:-.75;AudioKit.effect('relay1');return true;}
  for(const a of route.actors){const result=api[a.kind].shot(a.e,s);if(result){if(result==='hit'||result==='defeat'||a.kind==='reef')AudioKit.effect('enemy');return true;}}return false;
 }
 updateCombat=function(shoot,aimUp){
  const healthBefore=player.health;
  for(const a of route.actors){if(a.kind==='reef')CrustReef.update(a.e,terrainHit);else if(a.kind==='crab')CrustCrab.update(a.e,player);else api[a.kind].update(a.e,player,terrainHit);}
  if(player.health<healthBefore)AudioKit.effect('hit');
  for(const s of shots){const n=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0))));for(let i=0;i<=n&&!s.dead;i++){const probe={x:s.x+s.vx*i/n,y:s.y+(s.vy||0)*i/n,w:s.w,h:s.h};if(terrainHit(probe.x,probe.y,probe.w,probe.h))break;if(checkShot(probe))s.dead=true;}}
  const solid=hit;hit=terrainHit;try{combat(shoot,aimUp);}finally{hit=solid;}
  for(const s of shots)if(!s.dead)checkShot(s);shots=shots.filter(s=>!s.dead);
  for(const a of route.actors)if(api[a.kind].contact(a.e,player))AudioKit.effect('hit');
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){
  if(state!=='play')return;if(route.pumpCooldown)route.pumpCooldown--;
  for(const gem of route.cultures)if(!gem.got&&Math.hypot(player.x+player.w/2-gem.x,player.y+player.h/2-gem.y)<33){gem.got=true;collected++;player.score+=250;AudioKit.effect('collect');}
  for(const item of route.supplies)if(!item.got&&Math.hypot(player.x+player.w/2-item.x,player.y+player.h/2-item.y)<35){item.got=true;if(item.kind==='rye')player.health=Math.min(5,player.health+1);if(item.kind==='kefir')player.kefirCharges++;if(item.kind==='cache')player.score+=500;AudioKit.effect('collect');}
  route.layout.checkpoints.forEach((cp,i)=>{if(i>route.checkpoint&&Math.hypot(player.x-cp.x*T,player.y-cp.y*T)<75){route.checkpoint=i;preview.checkpoint={x:cp.x*T,y:cp.y*T,swimming:cp.wet};player.health=Math.max(3,player.health);AudioKit.effect('collect');}});
  const f=route.layout.finish;if(!route.complete&&collected===5&&Math.hypot(player.x-f.x*T,player.y-f.y*T)<95){if(route.onApproach)route.onApproach();else{route.complete=true;AudioKit.effect('win');}}
  const button=document.getElementById('exploreBtn');button.style.display=pumpNear()?'':'none';button.textContent=route.pumpOn?'Pump ← (E)':'Pump → (E)';
 };
 function visible(x,y,w=100,h=100){return x+w>=camera&&x<=camera+W&&y+h>=cameraY&&y<=cameraY+H;}
 function arrow(s,x,y){R.text(s,x*T,y*T,25);}
 function drawAirChamber(){
  const room=route.layout.airChamber,x=room.x*T,y=room.y*T,w=room.w*T,h=room.h*T;
  if(!visible(x,y,w,h))return;
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  // Opaque warm back wall replaces the submerged skyline inside the air pocket.
  g.fillStyle='#302e2b';g.fillRect(x,y,w,h);
  const glow=g.createRadialGradient(x+w*.4,y+h*.72,10,x+w*.4,y+h*.72,w);
  glow.addColorStop(0,'#d6a15b55');glow.addColorStop(1,'#9b794114');g.fillStyle=glow;g.fillRect(x,y,w,h);
  g.strokeStyle='#b8a07c28';g.lineWidth=1;
  for(let yy=y;yy<y+h;yy+=32)for(let xx=x;xx<x+w;xx+=64){g.strokeRect(xx+(Math.floor((yy-y)/32)%2?32:0),yy,64,32);}
  R.art('arch',x+8,y+8,w-16,h-16,.18);
  // Gentle oven heat rises inside; water particles are excluded from this room.
  for(let i=0;i<5;i++){const yy=y+h-72-(tick*.25+i*29)%(h-80);g.fillStyle='#ffe0a63b';g.fillRect(x+66+i*31,yy,2,2);}
  g.restore();
 }
 function drawAirSeals(){
  const room=route.layout.airChamber,x=room.x*T,y=room.y*T,w=room.w*T,h=room.h*T;
  if(!visible(x-12,y,w+24,h))return;
  // Door frames join the real ceiling and floor, enclosing a pressure-sealed room.
  for(const edge of [x,x+w]){
   g.fillStyle='#172c32';g.fillRect(edge-9,y-7,18,h+14);
   g.fillStyle='#987c57';g.fillRect(edge-7,y-7,4,h+14);g.fillRect(edge+3,y-7,4,h+14);
   g.strokeStyle='#e9ead6';g.lineWidth=2;g.beginPath();g.moveTo(edge,y);g.lineTo(edge,y+h);g.stroke();
   // Tiny stationary waves indicate a permeable pressure seal rather than a wall.
   g.strokeStyle='#a7d4db';g.lineWidth=1;g.beginPath();
   for(let yy=y;yy<=y+h;yy+=6){const xx=edge+Math.sin(yy*.07+tick*.035)*2;yy===y?g.moveTo(xx,yy):g.lineTo(xx,yy);}g.stroke();
   for(const yy of [y,y+h]){g.fillStyle='#d7b27b';g.fillRect(edge-12,yy-4,24,8);}
  }
  g.fillStyle='#d9b67e';g.fillRect(x-7,y-7,w+14,5);
  R.text('AIR POCKET',x+w/2-39,y+23,12,'#f3dcac');
 }
 drawWorld=function(){
  const index=route.layout.sections.findIndex(s=>player.x/T>=s.from&&player.x/T<s.to),palettes=[['#183e4e','#092536'],['#184b54','#102e42'],['#22414b','#0c283a'],['#152b44','#080f27']],colors=palettes[Math.max(0,index)];
  const sea=g.createLinearGradient(0,0,0,H);sea.addColorStop(0,colors[0]);sea.addColorStop(1,colors[1]);g.fillStyle=sea;g.fillRect(0,0,W,H);R.distantCity();
  const fadeEnd=Math.max(100,Math.min(370-cameraY*.05,445-cameraY*.16)-4),fadeStart=Math.max(60,fadeEnd-140);
  const depth=g.createLinearGradient(0,fadeStart,0,fadeEnd);depth.addColorStop(0,colors[1]+'00');depth.addColorStop(1,colors[1]);g.fillStyle=depth;g.fillRect(0,fadeStart,W,H-fadeStart);
  g.save();g.translate(-Math.round(camera),-Math.round(cameraY));
  for(const r of preview.water){
   g.fillStyle='#2b88961c';g.fillRect(r.x,r.y,r.w,r.h);
   // A surface is visible only at open air/water, never through a solid floor.
   g.strokeStyle='#bce7dc';g.lineWidth=2;g.beginPath();let drawing=false;
   for(let x=r.x;x<=r.x+r.w;x+=8){
    if(terrainHit(x-1,r.y-4,2,8)){drawing=false;continue;}
    const y=r.y+Math.sin(x*.03+tick*.05)*2;drawing?g.lineTo(x,y):g.moveTo(x,y);drawing=true;
   }g.stroke();
  }
  drawAirChamber();
  // Every foreground furnishing has an explicit solid support in layout metadata.
  for(const [name,x,y,w,h]of route.layout.decor)if(visible(x*T,y*T,w*T,h*T))R.furniture(name,x*T,y*T,w*T,h*T,.85);
  R.drawSolidTiles();
  for(const [x,y,w,h]of route.layout.facades)if(visible(x*T,y*T,w*T,h*T))R.art('ledge',x*T,y*T,w*T,h*T);
  drawAirSeals();
  for(const flow of preview.currents)if(visible(flow.x,flow.y,flow.w,flow.h)){
   for(let i=0;i<14;i++){const x=flow.x+((i*41+tick*flow.vx*2)%flow.w+flow.w)%flow.w,y=flow.y+((i*53+tick*flow.vy*2)%flow.h+flow.h)%flow.h;g.strokeStyle='#d5e7df70';g.lineWidth=1;g.beginPath();g.arc(x,y,2+i%2,0,7);g.stroke();}
  }
  const p=route.layout.pump;R.copperPipe(p.x*T,p.y*T,7,6*T);R.copperPipe(p.x*T,p.y*T,9*T,6);
  g.strokeStyle='#ead9ae';g.lineWidth=4;g.beginPath();g.arc(p.x*T,p.y*T,20,0,7);g.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2+(route.pumpOn?Math.PI/4:0);g.beginPath();g.moveTo(p.x*T,p.y*T);g.lineTo(p.x*T+Math.cos(a)*18,p.y*T+Math.sin(a)*18);g.stroke();}arrow(route.pumpOn?'→':'←',p.x+2,p.y);
  for(const cp of route.layout.checkpoints){if(!visible(cp.x*T,cp.ground*T-100))continue;const i=route.layout.checkpoints.indexOf(cp),frame=Math.floor(tick/10)%4,row=i<=route.checkpoint?1:0;const dx=cp.x*T-12,dy=cp.ground*T-Math.round((row?112:117)*66/120),xs=44/80,ys=66/120;
   const part=(col,sx,sy,sw,sh)=>g.drawImage(flag,col*80+sx,row*120+sy,sw,sh,Math.round(dx+sx*xs),Math.round(dy+sy*ys),Math.round(sw*xs),Math.round(sh*ys));
   // Match production: animate cloth only; keep the pole and foot on frame zero.
   part(frame,43,0,37,87);part(0,0,0,43,87);part(0,0,87,80,33);}
  for(const gem of route.cultures)if(!gem.got&&visible(gem.x,gem.y)){g.fillStyle='#f1df9b30';g.beginPath();g.arc(gem.x,gem.y,25,0,7);g.fill();drawIdentityPickup('culture',gem.x,gem.y+Math.sin(tick*.06)*3);}
  for(const item of route.supplies)if(!item.got&&visible(item.x,item.y)){if(item.kind==='kefir')drawIdentityPickup('kefir',item.x,item.y);else drawSupplyPickup(item,item.y);}
  for(const [s,x,y]of [['↓',23,28],['→',26,32],['↓',47,34],['→',48,48],['↑',70,47],['←',66,29],['→',74,29],['↓',84,33],['→',89,49],['↑',100,46],['←',97,30],['↑',94,25]])arrow(s,x,y);
  for(let i=0;i<32;i++){const x=(12+i*2.8)*T;if(!visible(x,cameraY,6,H))continue;const y=22*T+(i*57+tick*.3)%(33*T);if(!SunkenRoute.isWater(route.layout,x/T,y/T)||terrainHit(x,y,6,6))continue;g.strokeStyle='#afdbcf40';g.beginPath();g.arc(x,y,1+i%3,0,7);g.stroke();}
  for(const a of route.actors)if(visible(a.e.x-150,a.e.y-100,400,250))drawSunkenActor(a.kind,a.e,images);
  for(const s of shots){g.fillStyle='#fff0ca';g.fillRect(s.x,s.y,s.w,s.h);}
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();
  const f=route.layout.finish;g.strokeStyle='#eadbb5';g.lineWidth=3;g.strokeRect(f.x*T-40,16*T,80,6*T);R.text(route.onApproach?'THE MASTER':'BOSS APPROACH',f.x*T-53,17*T,11);if(collected<5)R.text('5 CULTURES',f.x*T-40,18*T,11);g.restore();
 };
 drawHUD=function(){const section=route.layout.sections.find(s=>player.x/T>=s.from&&player.x/T<s.to)||route.layout.sections[0];
  g.fillStyle='#081d2cf0';g.fillRect(0,0,W,58);R.text('THE SUNKEN PATISSERIE',18,25,17);R.text(section.name.toUpperCase(),18,45,11);
  R.text('CULTURES '+collected+'/5',390,25,14);R.text('CHECKPOINT '+route.checkpoint+'/4',390,45,10);R.text('♥ '.repeat(Math.max(0,player.health)),590,25,17);R.text('P · PAUSE   Q · MAP',740,25,11);const room=route.layout.airChamber,insideAir=player.x+player.w/2>=room.x*T&&player.x+player.w/2<(room.x+room.w)*T&&player.y+player.h/2>=room.y*T&&player.y+player.h/2<(room.y+room.h)*T;R.text(player.swimming?'SWIMMING':insideAir?'AIR POCKET':'DRY LAND',740,45,10);
  if(route.complete){g.fillStyle='#081d2be8';g.fillRect(160,H-40,640,30);R.text('ROUTE COMPLETE · OCTOPUS ENCOUNTER COMES NEXT',180,H-20,12);}
  document.getElementById('wrap').dataset.swimming=String(!!player.swimming);const jump=document.querySelector('[data-action="jump"]');if(jump){jump.querySelector('small').textContent=player.swimming?'AIM UP':'JUMP';jump.setAttribute('aria-label',player.swimming?'Aim upward while shooting':'Jump');}
  document.getElementById('pogoBtn').textContent=pogoOn?'Mixer ON':'Mixer OFF';
 };
 const oldSheet=shellOpenSheet;
 shellOpenSheet=function(page){if(page!=='map')return oldSheet(page);shellPause();shellPage='map';document.getElementById('shellOverlay').setAttribute('aria-labelledby','sheetTitle');document.getElementById('shellMain').hidden=true;document.getElementById('shellSheet').hidden=false;document.getElementById('mapViewport').hidden=false;document.getElementById('recipeSheet').hidden=true;document.getElementById('confirmSheet').hidden=true;document.getElementById('sheetTitle').textContent='The Sunken Patisserie · route map';minimap.style.display='block';minimap.style.width='100%';minimap.style.maxWidth='100%';minimap.style.height='auto';drawPhase3Map();document.getElementById('sheetBack').focus();};
 drawPhase3Map=function(){const m=minimap.getContext('2d'),scale=8;minimap.width=840;minimap.height=500;m.fillStyle='#0a2233';m.fillRect(0,0,840,500);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(map[y][x]==='#'){m.fillStyle='#738f91';m.fillRect(x*scale,y*scale,scale,scale);}
  m.strokeStyle='#e9d6a1';m.lineWidth=2;m.beginPath();route.layout.mainRoute.forEach(([x,y],i)=>i?m.lineTo(x*scale,y*scale):m.moveTo(x*scale,y*scale));m.stroke();
  for(const gem of route.cultures){m.fillStyle=gem.got?'#668789':'#ffe4a0';m.fillRect(gem.x/T*scale-3,gem.y/T*scale-3,7,7);}m.fillStyle='#fff';m.beginPath();m.arc((player.x+player.w/2)/T*scale,(player.y+player.h/2)/T*scale,5,0,7);m.fill();m.font='13px monospace';m.fillText('● YOU   ■ CULTURES   — MAIN ROUTE',20,480);
 };
 const pause=shellPause;shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'The Sunken Patisserie';if(!shellStarted)document.getElementById('shellMessage').textContent='Four connected sections, five cultures, checkpoints, a current pump, and the approved aquatic enemies. The route ends at the octopus boss approach; this preview does not unlock a recipe.';document.getElementById('shellResume').textContent=shellStarted?'Resume':'Explore World 4';};
}
