/* Isolated preview adapter. Reuses production dry physics, timing, shell,
 * character roster, pause/fullscreen and audio lifecycle. Not loaded by keen/. */
'use strict';
function installSunkenPrototype(){
 const water=[{x:10*T,y:22*T,w:60*T,h:27*T}];
 const currents=[{x:33*T,y:37*T,w:15*T,h:5*T,vx:-1.05,vy:0},
  {x:51*T,y:29*T,w:8*T,h:18*T,vx:0,vy:-1.35}];
 const start={x:4*T,y:22*T-38};
 const preview={mode:'free',checkpoint:null,finished:false,targets:[],rings:[],sprites:[],lastShot:-100};
 window.sunkenPreview=preview;
 const sheet=new Image();sheet.crossOrigin='anonymous';sheet.src='art/sunken-patisserie/heroes-horizontal-swim-concept.png';
 const backdrop=new Image();backdrop.src='art/sunken-patisserie/environment-concepts.png';
 // Concept poses are temporary runtime samples, not production animation art.
 // The runtime sprite material keys only the connected teal backdrop. Original
 // concept PNG remains unchanged; tiny attached bubbles are acceptable here.
 function prepareConceptSprites(){
  if(preview.sprites.length||!sheet.naturalWidth)return;
  const crops=[[[25,115,485,220],[555,120,460,235],[1020,110,505,250]],
   [[25,475,485,235],[550,450,470,270],[1020,465,505,245]]];
  preview.sprites=crops.map(row=>row.map(([x,y,w,h])=>{
   const c=document.createElement('canvas');c.width=w;c.height=h;
   const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(sheet,x,y,w,h,0,0,w,h);
   let pixels;
   try{pixels=ctx.getImageData(0,0,w,h);}catch(error){
    // A host may redirect images without CORS. Keep the reference crop usable
    // rather than trapping the entire preview behind the artwork gate.
    if(error.name!=='SecurityError')throw error;
    return c;
   }
   const p=pixels.data,seen=new Uint8Array(w*h),queue=[];
   const ocean=i=>{const q=i*4,r=p[q],g=p[q+1],b=p[q+2];return r<45&&g<110&&b<120&&g>r+12&&b>r+12;};
   const push=i=>{if(!seen[i]&&ocean(i)){seen[i]=1;queue.push(i);}};
   for(let xx=0;xx<w;xx++){push(xx);push((h-1)*w+xx);}for(let yy=0;yy<h;yy++){push(yy*w);push(yy*w+w-1);}
   for(let n=0;n<queue.length;n++){const i=queue[n];p[i*4+3]=0;const xx=i%w,yy=Math.floor(i/w);if(xx)push(i-1);if(xx<w-1)push(i+1);if(yy)push(i-w);if(yy<h-1)push(i+w);}
   ctx.putImageData(pixels,0,0);return c;
  }));
 }
 const originalGate=completeArtworkLoading;
 completeArtworkLoading=function(){prepareConceptSprites();originalGate();};
 prepareStartupArtwork=function(){
  const entries=[{label:'Horizontal swimming concepts',image:sheet},{label:'Sunken environment concepts',image:backdrop}];
  for(const [file,set]of [['baker-grunge-actions.png',img=>bakerPilotArt=img],['vance-wick-actions.webp',img=>vanceWickArt=img]]){
   const image=new Image();set(image);image.src='art/'+file;entries.push({label:file,image});
  }
  return entries;
 };
 function fillRect(map,x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)map[yy][xx]='#';}
 const layout={rows:56,cols:105,checkpoints:[],oven:{x:75,y:20},apply({map}){
  fillRect(map,0,49,105,7);fillRect(map,0,0,1,49);fillRect(map,82,0,23,49);
  fillRect(map,1,22,9,27);fillRect(map,70,22,12,27);
  fillRect(map,27,18,2,14);fillRect(map,27,37,2,12); // dive through the submerged arch
  fillRect(map,49,22,2,15);fillRect(map,49,42,2,7); // low inlet to current shaft
  fillRect(map,59,30,2,19); // open at the top, recoverable below
  fillRect(map,15,43,7,2);fillRect(map,36,44,7,2);
  return {gems:[],enemies:[],powerups:[]};
 }};
 currentVerticalLayout=()=>layout;
 const originalInit=init,originalDryMove=updatePlayer,originalToggle=togglePogo;
 const originalDrawPlayer=drawPlayer;
 function actorAt(x,y,swimming=false){return {x,y,w:swimming?58:29,h:swimming?26:38,vx:0,vy:0,ground:false,
  health:3,inv:0,face:1,ammo:999,score:0,hang:null,climb:0,speedT:0,shield:false,kefirCharges:3,swimming};}
 init=function(){
  originalInit(1);player=actorAt(start.x,start.y);preview.checkpoint={...start,swimming:false};preview.finished=false;
  preview.targets=[{x:21*T,y:29*T,r:18,timer:0},{x:40*T,y:36*T,r:18,timer:0},{x:64*T,y:25*T,r:18,timer:0}];
  preview.rings=[[18,30],[26,34],[41,40],[55,33],[65,26]].map(([x,y])=>({x:x*T,y:y*T,got:false}));
  camera=0;cameraY=Math.max(0,player.y-H*.46);player.ammo=999;
  shellSavedState='play';return player;
 };
 respawnCheckpoint=function(){
  const cp=preview.checkpoint||start;player=actorAt(cp.x,cp.y,cp.swimming);
  keys={};shots=[];resetPlayerFire();shellClearInput();state='play';cameraY=Math.max(0,player.y-H*.46);
 };
 restart=()=>init();advanceBakery=()=>init();
 // Shared dry controller is called unchanged, with Up translated to its
 // established jump action. Water has independent movement and aim actions.
 updatePlayer=function(){
  const enter=CrustSwim.sync(player,water,hit);
  if(enter==='enter'){prevJump=false;AudioKit.effect('collect');}
  if(player.swimming){
   const movement=CrustSwim.step(player,keys,{hit,currents,mode:preview.mode});
   CrustSwim.sync(player,water,hit);prevJump=false;return movement;
  }
  const held=keys;keys={...held,jump:held.jump||held.up};
  let movement;try{movement=originalDryMove();}finally{keys=held;}
  if(CrustSwim.sync(player,water,hit)==='enter'){prevJump=false;return {shoot:!!held.shoot,aimUp:!!held.jump};}
  return movement;
 };
 togglePogo=function(){if(!player.swimming)return originalToggle();pogoOn=!pogoOn;};
 updateCombat=function(shoot,aimUp){
  if(playerFireCooldown>0)playerFireCooldown-=3;
  if(shoot&&playerFireCooldown<=0){
   const actor=player.swimming?player:{...player,y:player.y+6,h:26,w:29};
   const s=CrustSwim.shot(actor,aimUp,hit);
   if(s){shots.push(s);rememberBakerShot(aimUp);preview.lastShot=tick;AudioKit.effect('shoot');}
   playerFireCooldown+=26;
  }
  for(const s of shots){
   const n=Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy)));
   for(let i=0;i<n&&!s.dead;i++){
    s.x+=s.vx/n;s.y+=s.vy/n;
    if(hit(s.x,s.y,s.w,s.h))s.dead=true;
    for(const target of preview.targets)if(Math.hypot(s.x-target.x,s.y-target.y)<target.r){target.timer=120;s.dead=true;}
   }
   if(--s.life<=0)s.dead=true;
  }
  shots=shots.filter(s=>!s.dead);
 };
 updateWorldProgress=function(){
  if(state!=='play')return;
  if(!preview.checkpoint.swimming&&player.swimming&&player.x>34*T&&player.x<48*T&&player.y>36*T){
   preview.checkpoint={x:39*T,y:39*T,swimming:true};AudioKit.effect('collect');
  }
  if(player.y>rows*T)respawnCheckpoint();
  for(const ring of preview.rings)if(!ring.got&&Math.hypot(player.x+player.w/2-ring.x,player.y+player.h/2-ring.y)<48){ring.got=true;AudioKit.effect('collect');}
  for(const target of preview.targets)if(target.timer>0)target.timer--;
  if(!preview.finished&&!player.swimming&&player.x>72*T&&player.y<22*T){preview.finished=true;AudioKit.effect('win');}
 };
 updatePickups=function(){};updateAmmoCaches=function(){};
 // No production progression writes or recipe unlocks occur in this preview.
 saveBest=function(){};saveCodex=function(){};prepareWayfindingPreview=function(){};
 drawPhase3Map=function(){};
 function label(text,x,y,size=16,color='#e7e7c7'){
  g.font='bold '+size+'px monospace';g.fillStyle='#071b28';g.fillText(text,x+1,y+2);g.fillStyle=color;g.fillText(text,x,y);
 }
 function drawWetHero(){
  const row=preview.sprites[vanceWickSelected()?1:0];if(!row)return;
  const firing=tick-preview.lastShot<7,aim=!!keys.jump;
  const pose=firing&&!aim?2:Math.hypot(player.vx,player.vy)>.6?Math.floor(tick/12)%2:0;
  const sprite=row[pose],cx=Math.round(player.x+player.w/2),cy=Math.round(player.y+player.h/2);
  g.save();g.translate(cx,cy);g.scale(player.face,1);
  // Stable torso/body dimensions; small visual lean only, no hitbox rotation.
  const lean=Math.max(-.16,Math.min(.16,player.vy*.035));g.rotate(lean*player.face);
  g.drawImage(sprite,-49,-22,98,44);g.restore();
  if(firing&&aim){
   const tip=CrustSwim.muzzle(player,true);g.fillStyle=vanceWickSelected()?'#b3bdc2':'#efe3c4';
   g.fillRect(tip.x-3,tip.y,6,18);g.fillStyle='#435661';g.fillRect(tip.x-2,tip.y-3,4,5);
  }
  if(pogoOn){g.fillStyle='#d2dfd6';g.fillRect(cx-8,cy+18,16,8);g.strokeStyle='#9fe2d8';g.beginPath();g.moveTo(cx-5,cy+26);g.lineTo(cx+5,cy+31);g.lineTo(cx-5,cy+36);g.stroke();}
 }
 drawPlayer=function(){if(player.swimming)drawWetHero();else originalDrawPlayer();};
 drawWorld=function(){
  const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#123b4c');grad.addColorStop(1,'#061b2c');g.fillStyle=grad;g.fillRect(0,0,W,H);
  if(backdrop.complete&&backdrop.naturalWidth){g.save();g.globalAlpha=.12;
   const offset=(camera*.15)%W;for(let i=-1;i<2;i++)g.drawImage(backdrop,0,0,backdrop.naturalWidth,260,i*W-offset,-cameraY*.05,W,300);g.restore();}
  // Light shafts and distant windowed arches remain low contrast.
  g.save();g.fillStyle='#b5ead609';for(let i=0;i<6;i++){const x=i*230-camera*.08;g.beginPath();g.moveTo(x,0);g.lineTo(x+20,0);g.lineTo(x+130,H);g.lineTo(x+45,H);g.fill();}g.restore();
  g.save();g.translate(-Math.round(camera),-Math.round(cameraY));
  g.fillStyle='#78b5a510';g.fillRect(10*T,22*T,60*T,27*T);
  const x0=Math.max(0,Math.floor(camera/T)),x1=Math.min(cols,Math.ceil((camera+W)/T));
  const y0=Math.max(0,Math.floor(cameraY/T)),y1=Math.min(rows,Math.ceil((cameraY+H)/T));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(map[y][x]==='#'){
   const px=x*T,py=y*T;g.fillStyle=(x+y)%2?'#274952':'#294c55';g.fillRect(px,py,T,T);
   g.fillStyle='#182e3a';g.fillRect(px,py+T-2,T,2);g.fillRect(px+(y%2?12:24),py,2,T);
   if(tile(x,y-1)!=='#'){g.fillStyle='#d6d7b5';g.fillRect(px,py,T,4);g.fillStyle='#779e91';g.fillRect(px,py+4,T,3);}
   if(tile(x-1,y)!=='#'){g.fillStyle='#91b4a4';g.fillRect(px,py,3,T);}
   if(tile(x+1,y)!=='#'){g.fillStyle='#688e88';g.fillRect(px+T-3,py,3,T);}
   if(tile(x,y+1)!=='#'){g.fillStyle='#aac5ac';g.fillRect(px,py+T-3,T,3);}
  }
  // Copper side rails delineate the current shaft.
  for(const x of [51*T+10,59*T-10]){g.fillStyle='#8c714e';g.fillRect(x,30*T,5,17*T);g.fillStyle='#bca37a';g.fillRect(x,30*T,2,17*T);}
  for(const flow of currents){
   g.fillStyle=flow.vy?'#6acecb0c':'#b4daca09';g.fillRect(flow.x,flow.y,flow.w,flow.h);
   g.strokeStyle='#abd9d966';g.lineWidth=2;
   for(let i=0;i<18;i++){
    const x=flow.x+((i*83+tick*(flow.vx||.12))%flow.w+flow.w)%flow.w;
    const y=flow.y+((i*59+tick*(flow.vy||.1))%flow.h+flow.h)%flow.h;
    g.beginPath();g.arc(x,y,2+i%3,0,Math.PI*2);g.stroke();
   }
  }
  g.strokeStyle='#a1d9ca';g.lineWidth=2;g.beginPath();
  for(let x=10*T;x<=70*T;x+=8){const y=22*T+Math.sin(x*.035+tick*.07)*2;x===10*T?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
  // Learning spaces are named rather than disguised as a finished level.
  label('THE FLOODED ENTRANCE',2*T,19*T,18);
  label('SWIM DOWN THROUGH THE ARCH',14*T,25*T,14);
  label('← GENTLE CURRENT',34*T,38*T,14);
  label('BUBBLE LIFT ↑',51*T,28*T,14);
  label('SURFACE EXIT →',62*T,21*T,14);
  for(const r of preview.rings){g.strokeStyle=r.got?'#a1cec455':'#f1d498';g.lineWidth=3;g.beginPath();g.arc(r.x,r.y,20,0,Math.PI*2);g.stroke();if(r.got)label('✓',r.x-6,r.y+6,20);}
  for(const target of preview.targets){g.strokeStyle=target.timer?'#fff2bc':'#9cd4cf';g.lineWidth=3;g.beginPath();g.arc(target.x,target.y,target.r,0,Math.PI*2);g.stroke();g.strokeRect(target.x-4,target.y-4,8,8);}
  const cp=preview.checkpoint;
  if(cp.swimming){g.strokeStyle='#baded1';g.strokeRect(39*T-12,39*T-12,80,56);label('CHECKPOINT',38*T,38*T,12);}
  g.fillStyle='#ebd7ae';g.fillRect(74*T,20*T,3,2*T);g.fillStyle='#b1dfcc';g.beginPath();g.moveTo(74*T+3,20*T);g.lineTo(74*T+32,20*T+12);g.lineTo(74*T+3,20*T+24);g.fill();
  for(const s of shots){g.fillStyle='#ffedbd';g.fillRect(s.x,s.y,s.w,s.h);}
  drawPlayer();
  // Sparse wake bubbles track motion; no full-screen animated filter.
  if(player.swimming){g.strokeStyle='#bbdfd85a';for(let i=0;i<5;i++){const t=(tick+i*11)%50;g.beginPath();g.arc(player.x+player.w/2-player.face*(38+t),player.y+16-t*.35,1+i%2,0,7);g.stroke();}}
  g.restore();
 };
 drawHUD=function(){
  g.fillStyle='#071c2be8';g.fillRect(0,0,W,56);label('SUNKEN PATISSERIE',18,24,18);label('MOVEMENT PREVIEW',18,43,11,'#a8c7c6');
  label(selectedCharacter().name.toUpperCase(),298,25,15);label(player.swimming?'SWIMMING':'DRY LAND',298,44,11,'#a8c7c6');
  label('RINGS '+preview.rings.filter(r=>r.got).length+'/5',520,25,15);label(preview.mode==='free'?'FREE SWIM':'BUOYANT STROKES',520,44,11,'#a8c7c6');
  label('✦ UNLIMITED',730,25,14);label('P · PAUSE',730,44,11,'#a8c7c6');
  const section=player.x<29*T?'Dive below the arch':player.x<51*T?'Explore the lower gallery':player.x<61*T?'Ride the bubble lift':'Rise and cross onto the exit ledge';
  g.fillStyle='#071c2bbf';g.fillRect(260,H-39,440,29);label(preview.finished?'COURSE COMPLETE · P to replay':section,274,H-19,12);
  const wrap=document.getElementById('wrap');wrap.dataset.swimming=String(!!player.swimming);
  const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label',player.swimming?'Aim upward while shooting':'Jump');jump.querySelector('small').textContent=player.swimming?'AIM UP':'JUMP';}
  document.getElementById('pogoBtn').textContent=pogoOn?'Mixer ON':'Mixer OFF';
 };
 draw=function(){drawWorld();drawHUD();};
 // Reuse production Pointer Events ownership, adding a vector per direction
 // finger. Releasing one finger never releases another or keyboard input.
 const originalPointer=shellBindPointer;
 shellBindPointer=function(button){
  if(!['up','down','left','right'].includes(button.dataset.action))return originalPointer(button);
  function publish(e){
   const rect=document.getElementById('directionPad').getBoundingClientRect(),v=CrustSwim.pad(e.clientX,e.clientY,rect);
   for(const a of ['up','down','left','right']){const id='pad:'+e.pointerId+':'+a;v[a]?shellInput.set(id,a):shellInput.release(id);}
   shellPublishInput();shellRefreshHeld();
  }
  button.addEventListener('pointerdown',e=>{if(e.button!==0||state!=='play')return;e.preventDefault();e.stopPropagation();
   shellPointers.set(e.pointerId,{group:'swim-direction'});button.setPointerCapture(e.pointerId);publish(e);AudioKit.start();});
  button.addEventListener('pointermove',e=>{if(shellPointers.get(e.pointerId)?.group!=='swim-direction')return;e.preventDefault();publish(e);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{
   shellPointers.delete(e.pointerId);for(const a of ['up','down','left','right'])shellInput.release('pad:'+e.pointerId+':'+a);shellPublishInput();shellRefreshHeld();
  });
 };
 document.addEventListener('keydown',e=>{
  if(state!=='play'||artworkLoading||e.target?.matches?.('input,select,textarea'))return;
  const a={arrowup:'up',w:'up',arrowdown:'down',s:'down'}[e.key.toLowerCase()];if(!a)return;
  e.preventDefault();e.stopImmediatePropagation();shellInput.set('key:'+e.code,a);shellPublishInput();AudioKit.start();
 },true);
 const preset=document.getElementById('swimPreset');preset.addEventListener('change',()=>{preview.mode=preset.value==='buoyant'?'buoyant':'free';shellClearInput();});
 document.getElementById('shellMessage').textContent='Explore the flooded entrance. Swim, shoot, ride the lift, and return to dry land.';
 document.getElementById('shellResume').textContent='Try swimming';
 // Keep shell wording scoped to this preview every time it opens.
 const originalPause=shellPause;
 shellPause=function(reason){originalPause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'The Sunken Patisserie';
  if(!shellStarted)document.getElementById('shellMessage').textContent='Explore a flooded bakery. Both heroes, free swimming, currents and surface exits.';
  document.getElementById('shellResume').textContent=shellStarted?'Resume':'Try swimming';};
 const originalScene=AudioKit.scene;
 AudioKit.scene=(world,state)=>originalScene?.(2,state); // Existing cavern score, clearly temporary.
}
