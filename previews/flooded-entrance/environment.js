/* Milestone 3: authored Flooded Entrance slice. Water tuning stays in sunken/. */
'use strict';
const installApprovedSwimming=installSunkenPrototype;
installSunkenPrototype=function(){installApprovedSwimming();installFloodedEntrance();};
function installFloodedEntrance(){
 const preview=window.sunkenPreview;
 const slice={width:48*T,height:38*T,patroller:null,hitFlash:0,checkpoint:false,finished:false};
 window.floodedEntrance=slice;
 const kit=new Image();kit.src='../previews/flooded-entrance/environment-kit.png';
 const fishArt=new Image();fishArt.src='../previews/flooded-entrance/reef-patroller.png';
 const background=new Image();background.src='art/sunken-patisserie/environment-concepts.png';
 const gate=prepareStartupArtwork;
 prepareStartupArtwork=()=>[...gate(),{label:'Flooded bakery architecture',image:kit},{label:'Reef patroller animation',image:fishArt}];
 const samples={
  arch:[12,8,645,436],oven:[678,15,627,430],coldOven:[13,453,501,417],
  jar:[1330,144,144,302],ledge:[542,514,541,132],vent:[1530,456,234,414],
  shortLedge:[720,710,330,130],coral:[1326,543,165,100]
 };
 function art(name,x,y,w,h,alpha=1){
  if(!kit.complete||!kit.naturalWidth)return;
  g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=false;g.drawImage(kit,...samples[name],x,y,w,h);g.restore();
 }
 const beforeInit=init;
 function resetPatroller(){slice.patroller=CrustReef.create({x:19*T,y:27*T,left:16*T,right:24*T});}
 init=function(){
  beforeInit();
  map=Array.from({length:rows},()=>Array(cols).fill('.'));
  function block(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)map[yy][xx]='#';}
  block(0,36,cols,20);block(0,0,1,36);block(48,0,cols-48,36);
  block(1,22,9,14);block(38,22,10,14);
  block(27,18,2,10);block(27,32,2,4); // broad, recoverable submerged passage
  block(17,33,5,2); // lower jar shelf, not a main-route gate
  preview.rings=[[14,25],[23,30],[34,27]].map(([x,y])=>({x:x*T,y:y*T,got:false}));
  preview.targets=[];preview.finished=false;preview.checkpoint={x:4*T,y:22*T-38,swimming:false};
  slice.checkpoint=false;slice.finished=false;slice.hitFlash=0;resetPatroller();player.health=3;
  if(/(?:^|[?&])scene=reef(?:&|$)/.test(window.location?.search||'')){
   player.x=15*T;player.y=27*T;CrustSwim.sync(player,[{x:10*T,y:22*T,w:28*T,h:14*T}],hit);
  }
  camera=Math.max(0,player.x-W*.4);cameraY=player.y-H*.46;return player;
 };
 const recover=respawnCheckpoint;
 respawnCheckpoint=function(){recover();resetPatroller();player.inv=90;slice.hitFlash=0;};
 // Water collision and shot cadence remain shared. The first enemy is tested
 // against every one-pixel projectile segment, so fast shots cannot tunnel.
 const shootCourse=updateCombat;
 updateCombat=function(shoot,aimUp){
  CrustReef.update(slice.patroller,hit);
  // Existing bullets have straight paths. Check the swept segment before
  // the shared updater moves them; newly fired rounds are checked afterwards.
  for(const s of shots)for(let i=0;i<=Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0)));i++){
   if(s.dead)break;
   const n=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0))));
   const probe={x:s.x+s.vx*i/n,y:s.y+(s.vy||0)*i/n,w:s.w,h:s.h};
   if(hit(probe.x,probe.y,probe.w,probe.h))break;
   if(CrustReef.shot(slice.patroller,probe)){s.dead=true;AudioKit.effect('enemy');break;}
  }
  shootCourse(shoot,aimUp);
  for(const s of shots)if(CrustReef.shot(slice.patroller,s))AudioKit.effect('enemy');
  shots=shots.filter(s=>!s.dead);
  if(CrustReef.contact(slice.patroller,player)){slice.hitFlash=12;AudioKit.effect('hit');}
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){
  if(state!=='play')return;
  if(slice.hitFlash>0)slice.hitFlash--;
  for(const ring of preview.rings)if(!ring.got&&Math.hypot(player.x+player.w/2-ring.x,player.y+player.h/2-ring.y)<48){ring.got=true;AudioKit.effect('collect');}
  if(!slice.checkpoint&&player.x>30*T&&player.swimming){
   slice.checkpoint=true;preview.checkpoint={x:32*T,y:29*T,swimming:true};AudioKit.effect('collect');
  }
  if(!slice.finished&&!player.swimming&&player.x>42*T&&player.y<22*T){slice.finished=true;preview.finished=true;AudioKit.effect('win');}
 };
 const follow=updateViewCamera;
 updateViewCamera=function(){follow();camera=Math.min(camera,slice.width-W);cameraY=Math.min(cameraY,slice.height-H);};
 function text(s,x,y,size=14,color='#f5e6c7'){
  g.font='bold '+size+'px monospace';g.fillStyle='#071e2b';g.fillText(s,x+1,y+2);g.fillStyle=color;g.fillText(s,x,y);
 }
 function copperPipe(x,y,w,h){
  g.fillStyle='#2c393b';g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle='#866245';g.fillRect(x,y,w,h);
  g.fillStyle='#c4a374';g.fillRect(x,y,Math.min(w,2),h);g.fillRect(x,y,w,Math.min(2,h));
 }
 function distantCity(){
  if(background.complete&&background.naturalWidth){g.save();g.globalAlpha=.23;
   const offset=(camera*.15)%960;for(let i=-1;i<=1;i++)g.drawImage(background,0,0,background.naturalWidth,260,i*960-offset,70-cameraY*.05,960,300);g.restore();}
  // Separate middle layer: giant bakery arches at a different parallax speed.
  for(let i=0;i<5;i++){
   const x=i*390-camera*.36-160,y=190-cameraY*.16;
   art('arch',x,y,340,255,.18);
  }
  g.save();g.fillStyle='#d0f4d90a';
  for(let i=0;i<5;i++){const x=i*250-camera*.08;g.beginPath();g.moveTo(x,0);g.lineTo(x+22,0);g.lineTo(x+190,H);g.lineTo(x+65,H);g.fill();}g.restore();
 }
 function warmRoom(){
  const x=T,y=13*T,w=9*T,h=9*T;
  const warm=g.createLinearGradient(0,y,0,y+h);warm.addColorStop(0,'#5b534244');warm.addColorStop(1,'#ba8b4544');g.fillStyle=warm;g.fillRect(x,y,w,h);
  copperPipe(x,y,9*T,7);copperPipe(x+6*T,y,7,7*T);
  art('arch',T,14*T,9*T,6*T,.45);
  // Oven is foreground of the distant arch but behind the standing actor.
  art('oven',2*T,22*T-184,8*T,184);
  for(let i=0;i<3;i++){g.fillStyle='#e4bb7166';g.fillRect(4*T+i*28,19*T+Math.sin(tick*.03+i)*2,2,2);}
 }
 function drawSolidTiles(){
  const x0=Math.max(0,Math.floor(camera/T)),x1=Math.min(48,Math.ceil((camera+W)/T));
  const y0=Math.max(0,Math.floor(cameraY/T)),y1=Math.min(rows,Math.ceil((cameraY+H)/T));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(tile(x,y)==='#'){
   const px=x*T,py=y*T;
   // Interior ceramic sample repeats at native 2:1 source-to-world scale.
   g.drawImage(kit,680+(x%3)*64,550,64,64,px,py,T,T);
   g.fillStyle=y<22?'#73573735':'#0b3b4555';g.fillRect(px,py,T,T);
   g.fillStyle='#203e43';g.fillRect(px,py+30,T,2);g.fillRect(px+(y%2?12:24),py,1,T);
   if(tile(x,y-1)!=='#'){g.fillStyle='#eee4bd';g.fillRect(px,py,T,4);g.fillStyle='#9bb19c';g.fillRect(px,py+4,T,2);}
   if(tile(x-1,y)!=='#'){g.fillStyle='#c6ccb0';g.fillRect(px,py,3,T);}
   if(tile(x+1,y)!=='#'){g.fillStyle='#97b1a0';g.fillRect(px+29,py,3,T);}
   if(tile(x,y+1)!=='#'){g.fillStyle='#a3beb1';g.fillRect(px,py+29,T,3);}
  }
 }
 function drawWater(){
  g.fillStyle='#1f75821d';g.fillRect(10*T,22*T,28*T,14*T);
  // The line and pale surface band distinguish water from warm air in motion
  // and in greyscale; the camera does not use a whole-screen ripple filter.
  g.fillStyle='#b3e4d80e';g.fillRect(10*T,22*T,28*T,10);
  g.strokeStyle='#b9e7df';g.lineWidth=2;g.beginPath();
  for(let x=10*T;x<=38*T;x+=6){const y=22*T+Math.sin(x*.034+tick*.065)*1.8;x===10*T?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
 }
 function drawEnemy(){
  const e=slice.patroller;if(!e||!e.alive&&!e.deathT)return;
  const frame=e.phase==='turn'?3:Math.floor(e.age/9)%3;
  const crops=[[37,184,508,403],[609,184,469,403],[1129,184,499,406],[1730,184,413,374]];
  g.save();g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h/2));g.scale(e.face,1);
  if(!e.alive){g.globalAlpha=e.deathT/36;g.rotate((36-e.deathT)*.025);}
  const crop=crops[frame],dw=crop[2]*.15,dh=crop[3]*.15;
  // Fix the head anchor while the tail changes width between frames.
  g.drawImage(fishArt,...crop,38-dw,-36,dw,dh);g.restore();
  if(e.phase==='turn'){
   // Small, stable fin-brace accent rather than a flashing alert.
   g.strokeStyle='#d7e8c1';g.lineWidth=2;g.beginPath();g.moveTo(e.x+20,e.y-9);g.lineTo(e.x+25,e.y-15);g.lineTo(e.x+30,e.y-9);g.stroke();
  }
  if(!e.alive){g.strokeStyle='#b5dfd7';for(let i=0;i<4;i++){g.beginPath();g.arc(e.x+8+i*11,e.y-i*6,2,0,7);g.stroke();}}
 }
 drawWorld=function(){
  const sea=g.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#183e4e');sea.addColorStop(1,'#092536');g.fillStyle=sea;g.fillRect(0,0,W,H);distantCity();
  // Fade the concept-backed skyline into the deep water; its raster boundary
  // must not resemble a second water surface halfway through the room.
  const depth=g.createLinearGradient(0,220,0,390);depth.addColorStop(0,'#09253600');depth.addColorStop(1,'#092536');g.fillStyle=depth;g.fillRect(0,220,W,H-220);
  g.save();g.translate(-Math.round(camera),-Math.round(cameraY));
  // Decorations behind collision masonry never hide the navigable edges.
  warmRoom();art('coldOven',16*T,33*T-146,6*T,146,.8);
  art('jar',14*T,36*T-155,66,155,.9);art('jar',33*T,36*T-155,66,155,.9);
  copperPipe(30*T,24*T,5,11*T);copperPipe(30*T,24*T,5*T,5);
  art('vent',35*T,36*T-180,100,180,.85);
  // The abandoned entry arch marks the submerged passage. Rendering behind
  // its collision outlines avoids an ornamental border becoming a fake wall.
  art('arch',25*T,27*T,6*T,5*T,.52);
  drawWater();drawSolidTiles();
  // Facades sit wholly inside solid shelves so visual top/collision agree.
  art('ledge',17*T,33*T,5*T,2*T);
  art('shortLedge',38*T,22*T,6*T,2*T);
  for(const [x,y,w]of [[T,22*T,9*T],[38*T,22*T,10*T]]){
   g.fillStyle='#e8dfb7';g.fillRect(x,y,w,3);
  }
  // Small foreground coral sits on supported surfaces and out of the route.
  art('coral',11*T,36*T-40,68,40);art('coral',36*T,36*T-40,68,40);
  for(let i=0;i<20;i++){
   const x=(11+i*1.27)*T,y=36*T-((tick*.42+i*47)%(13*T));
   if(x<camera-10||x>camera+W+10)continue;
   g.strokeStyle='#a9d4d142';g.lineWidth=1;g.beginPath();g.arc(x,y,1+i%3,0,7);g.stroke();
  }
  for(const ring of preview.rings){g.strokeStyle=ring.got?'#a8cdb155':'#f4d59c';g.lineWidth=3;g.beginPath();g.arc(ring.x,ring.y,17,0,7);g.stroke();if(ring.got)text('✓',ring.x-5,ring.y+5);}
  // Subtle route cues, rather than paragraphs across the swimming space.
  text('↓',25*T,26*T,26);text('→',30*T,30*T,26);text('↑',36*T,24*T,26);
  if(slice.checkpoint){g.strokeStyle='#e4d4ac';g.strokeRect(32*T-5,29*T-12,60,46);text('✓',32*T+13,29*T+16,22);}
  art('oven',40*T,22*T-174,7*T,174,.9);
  drawEnemy();
  for(const s of shots){g.fillStyle='#fff0ca';g.fillRect(s.x,s.y,s.w,s.h);}
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();
  // Clear dry exit: warm workbench and the established flag silhouette.
  g.fillStyle='#eadcb6';g.fillRect(43*T,20*T,3,2*T);g.fillStyle='#b6dfd3';g.beginPath();g.moveTo(43*T+3,20*T);g.lineTo(43*T+27,20*T+10);g.lineTo(43*T+3,20*T+22);g.fill();
  g.restore();
 };
 drawHUD=function(){
  g.fillStyle='#081d2ce8';g.fillRect(0,0,W,56);text('THE FLOODED ENTRANCE',18,25,17);text('SUNKEN PATISSERIE · ENVIRONMENT SLICE',18,44,10,'#aec9c5');
  text(selectedCharacter().name.toUpperCase(),365,25,14);text(player.swimming?'SWIMMING':'DRY LAND',365,44,10,'#aec9c5');
  text('♥ '.repeat(Math.max(0,player.health)),560,25,17);text('RINGS '+preview.rings.filter(r=>r.got).length+'/3',560,44,10,'#aec9c5');
  text('✦ UNLIMITED',740,25,14);text('P · PAUSE',740,44,10,'#aec9c5');
  const hint=slice.finished?'ENTRANCE EXPLORED · P to replay':!player.swimming&&player.x<10*T?'Enter the water · arrows / WASD swim':player.x<25*T?'Reef patroller ahead · shoot or swim around':player.x<30*T?'Follow the submerged passage →':'Rise to the dry exit ↑';
  g.fillStyle='#081d2bbb';g.fillRect(200,H-38,560,29);text(hint,216,H-18,12);
  document.getElementById('wrap').dataset.swimming=String(!!player.swimming);
  const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label',player.swimming?'Aim upward while shooting':'Jump');jump.querySelector('small').textContent=player.swimming?'AIM UP':'JUMP';}
  document.getElementById('pogoBtn').textContent=pogoOn?'Mixer ON':'Mixer OFF';
 };
 const pause=shellPause;
 shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'The Flooded Entrance';
  if(!shellStarted)document.getElementById('shellMessage').textContent='An abandoned bakery beneath the tide. Explore the first flooded room and meet its reef patroller.';
  document.getElementById('shellResume').textContent=shellStarted?'Resume':'Explore the entrance';};
}
