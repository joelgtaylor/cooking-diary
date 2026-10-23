/* A single reviewable enemy arena, using the approved water/render/audio slice. */
'use strict';
const installFloodedSlice=installSunkenPrototype;
installSunkenPrototype=function(){installFloodedSlice();installRiderEncounter();};
function installRiderEncounter(){
 const preview=window.sunkenPreview,slice=window.floodedEntrance;
 const encounter={enemy:null,hits:0,victory:false};window.riderEncounter=encounter;
 const sheet=new Image();sheet.src='../previews/current-rider/rider-frames.png';
 const gate=prepareStartupArtwork;prepareStartupArtwork=()=>[...gate(),{label:'Current Rider animation',image:sheet}];
 function reset(){
  encounter.enemy=CrustRider.create({x:23*T,y:29*T,left:10*T,right:38*T,top:22*T+20,bottom:36*T});
  encounter.victory=false;encounter.hits=0;
  slice.patroller.alive=false;slice.patroller.deathT=0;preview.rings=[];
 }
 const setup=init;
 init=function(){setup();
  // Broad pool with no narrow choke: all three projectile lanes are dodgeable.
  for(let y=22;y<36;y++)for(let x=10;x<38;x++)map[y][x]='.';
  // The visible oven plinth keeps its collision; its top leaves ample dodge space.
  for(let y=33;y<35;y++)for(let x=17;x<22;x++)map[y][x]='#';
  preview.checkpoint={x:13*T,y:28*T,swimming:true};
  player.x=13*T;player.y=28*T;player.vx=player.vy=0;player.inv=60;
  CrustSwim.sync(player,[{x:10*T,y:22*T,w:28*T,h:14*T}],hit);
  camera=Math.max(0,player.x-W*.3);cameraY=Math.max(0,player.y-H*.46);reset();return player;
 };
 const recover=respawnCheckpoint;respawnCheckpoint=function(){recover();reset();};
 const combat=updateCombat;
 function checkShot(s){const result=CrustRider.shot(encounter.enemy,s);if(result==='hit'||result==='defeat')AudioKit.effect('enemy');return result;}
 updateCombat=function(shoot,aimUp){
  const e=encounter.enemy;const health=player.health;CrustRider.update(e,player,hit);if(player.health<health){encounter.hits++;AudioKit.effect('hit');}
  for(const s of shots){
   const n=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0))));
   for(let i=0;i<=n&&!s.dead;i++){
    const probe={x:s.x+s.vx*i/n,y:s.y+(s.vy||0)*i/n,w:s.w,h:s.h};
    if(hit(probe.x,probe.y,probe.w,probe.h))break;
    if(checkShot(probe))s.dead=true;
   }
  }
  combat(shoot,aimUp);
  for(const s of shots)if(!s.dead)checkShot(s);
  shots=shots.filter(s=>!s.dead);
  if(CrustRider.contact(e,player)){encounter.hits++;AudioKit.effect('hit');}
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){if(!encounter.enemy.alive&&!encounter.victory){encounter.victory=true;AudioKit.effect('win');}};
 const world=drawWorld;
 drawWorld=function(){world();
  const e=encounter.enemy;g.save();g.translate(-Math.round(camera),-Math.round(cameraY));
  for(const t of e.wake){g.strokeStyle='#d9e9e5';g.globalAlpha=t.life/36;g.lineWidth=2;g.beginPath();g.arc(t.x,t.y,8,0,7);g.stroke();}g.globalAlpha=1;
  if(e.phase==='coil'){
   g.save();g.setLineDash([7,8]);g.lineWidth=e.locked?3:2;g.strokeStyle=e.locked?'#fff0bc':'#d0e7e28c';
   g.beginPath();g.moveTo(e.x+32,e.y+16);g.lineTo(e.x+32+Math.cos(e.aim)*313,e.y+16+Math.sin(e.aim)*313);g.stroke();g.restore();
   g.strokeStyle='#fff0bc';g.lineWidth=3;g.beginPath();g.arc(e.x+32,e.y+16,44,-Math.PI/2,-Math.PI/2+Math.PI*2*(44-e.timer)/44);g.stroke();
  }
  if(e.alive||e.deathT){
   const frame=e.phase==='coil'?1:e.phase==='dash'?2:e.phase==='recover'||!e.alive?3:0;
   g.save();g.translate(Math.round(e.x+32),Math.round(e.y+16));
   // Rotate the streamlined pose toward its committed vector; body box stays fixed.
   if(e.phase==='dash'||e.phase==='coil')g.rotate(e.aim+(e.face<0?-Math.PI:0));
   g.scale(e.face,1);
   if(!e.alive){g.globalAlpha=e.deathT/48;g.rotate((48-e.deathT)*.03);}
   // Source poses have different antenna/tail extents. Use fixed body anchors
   // and one pixel scale, rather than stretching each pose to a common box.
   const crops=[[55,145,505,470,245,265],[600,115,440,500,220,310],
    [1040,245,620,295,350,195],[1654,210,518,420,246,225]];
   const [sx,sy,sw,sh,cx,cy]=crops[frame],scale=.22;
   if(sheet.naturalWidth)g.drawImage(sheet,sx,sy,sw,sh,-cx*scale,-cy*scale,sw*scale,sh*scale);g.restore();
   if(e.alive){for(let i=0;i<e.maxHp;i++){g.fillStyle=i<e.hp?'#fff0b5':'#384e60';g.fillRect(e.x+16+i*12,e.y-31,8,5);}
    if(e.wallStun){g.strokeStyle='#fff0bc';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.arc(e.x+18+i*14,e.y-16,3,0,7);g.stroke();}}
   }
  }
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();g.restore();
 };
 function label(t,x,y,size=14){g.font='bold '+size+'px monospace';g.fillStyle='#f4e7c9';g.fillText(t,x,y);}
 drawHUD=function(){
  const e=encounter.enemy;
  g.fillStyle='#081d2cf0';g.fillRect(0,0,W,58);
  label('CURRENT RIDER',18,25,18);label('AGGRESSIVE ENCOUNTER · '+selectedCharacter().name.toUpperCase(),18,46,10);
  label('♥ '.repeat(Math.max(0,player.health)),W-260,25,18);label('P · PAUSE / RETRY',W-260,46,11);
  const message=encounter.victory?'RIDER DEFEATED · P to retry':e.phase==='coil'?(e.locked?'LANE LOCKED · dodge across it':'COILING · watch the dash lane'):e.phase==='dash'?'COMMITTED DASH · cross the lane':e.phase==='recover'?(e.wallStun?'WALL STUN · counterattack':'RECOVERY · press the attack'):'Keep moving · three hits to defeat';
  g.fillStyle='#081d2be8';g.fillRect(125,H-37,W-250,28);label(message,140,H-18,12);
  document.getElementById('wrap').dataset.swimming=String(!!player.swimming);
  const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label','Aim upward while shooting');jump.querySelector('small').textContent='AIM UP';}
  document.getElementById('pogoBtn').textContent=pogoOn?'Mixer ON':'Mixer OFF';
 };
 const pause=shellPause;shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'Current Rider';
  if(!shellStarted)document.getElementById('shellMessage').textContent='He coils, locks a dash lane, then commits. Dodge across his path and counterattack. Lure him into a wall for a longer stun. Three hits to defeat.';
  document.getElementById('shellResume').textContent=shellStarted?'Resume':'Face the Rider';};
}
