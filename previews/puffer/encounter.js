/* A single reviewable enemy arena, using the approved water/render/audio slice. */
'use strict';
const installFloodedSlice=installSunkenPrototype;
installSunkenPrototype=function(){installFloodedSlice();installPufferEncounter();};
function installPufferEncounter(){
 const preview=window.sunkenPreview,slice=window.floodedEntrance;
 const encounter={enemy:null,hits:0,victory:false};window.pufferEncounter=encounter;
 const sheet=new Image();sheet.src='../previews/puffer/puffer-frames.png';
 const gate=prepareStartupArtwork;prepareStartupArtwork=()=>[...gate(),{label:'Bubble Puffer animation',image:sheet}];
 function reset(){
  encounter.enemy=CrustPuffer.create({x:22*T,y:29*T,left:10*T,right:38*T,top:22*T+20,bottom:36*T});
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
 function checkShot(s){const result=CrustPuffer.shot(encounter.enemy,s);if(result==='hit'||result==='defeat')AudioKit.effect('enemy');return result;}
 updateCombat=function(shoot,aimUp){
  const e=encounter.enemy;CrustPuffer.update(e,player,hit);
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
  if(CrustPuffer.contact(e,player)){encounter.hits++;AudioKit.effect('hit');}
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){if(!encounter.enemy.alive&&!encounter.victory){encounter.victory=true;AudioKit.effect('win');}};
 const world=drawWorld;
 drawWorld=function(){world();
  const e=encounter.enemy;g.save();g.translate(-Math.round(camera),-Math.round(cameraY));
  for(const b of e.bubbles)if(!b.dead){
   // Pale double outline and central glint stay readable without colour cues.
   g.fillStyle='#87a6d344';g.beginPath();g.arc(b.x+10,b.y+10,10,0,7);g.fill();
   g.strokeStyle='#eef5e5';g.lineWidth=2;g.stroke();g.strokeStyle='#b2c4ed';g.lineWidth=1;
   g.beginPath();g.arc(b.x+10,b.y+10,7,0,7);g.stroke();g.fillStyle='#fff7d8';g.fillRect(b.x+5,b.y+4,4,3);
  }
  for(const pop of e.pops){g.strokeStyle='#dbeed8';g.lineWidth=2;g.beginPath();g.arc(pop.x,pop.y,16-pop.t/2,0,7);g.stroke();}
  if(e.alive||e.deathT){
   let frame=e.phase==='inflate'?1:e.phase==='burst'?2:e.phase==='recover'?3:0;
   if(!e.alive)frame=3;
   g.save();g.translate(Math.round(e.x+30),Math.round(e.y+28));g.scale(e.face,1);
   if(!e.alive){g.globalAlpha=e.deathT/48;g.rotate((48-e.deathT)*.025);}
   const inflate=e.phase==='inflate'?1+(48-e.timer)/480:1;
   g.scale(inflate,inflate);g.drawImage(sheet,frame*543,0,543,724,-55,-73,110,146);g.restore();
   if(e.alive){
    // Telegraph is a growing stable arc; the three locked lanes remain brief.
    if(e.phase==='inflate'){
     g.strokeStyle='#fff0bc';g.lineWidth=3;g.beginPath();g.arc(e.x+30,e.y+28,49,-Math.PI/2,-Math.PI/2+Math.PI*2*(48-e.timer)/48);g.stroke();
     if(e.locked){g.save();g.setLineDash([5,7]);g.strokeStyle='#f8eac799';g.lineWidth=2;
      for(const a of [e.aim-.34,e.aim,e.aim+.34]){g.beginPath();g.moveTo(e.x+30+Math.cos(a)*44,e.y+28+Math.sin(a)*44);g.lineTo(e.x+30+Math.cos(a)*120,e.y+28+Math.sin(a)*120);g.stroke();}g.restore();}
    }
    for(let i=0;i<e.maxHp;i++){g.fillStyle=i<e.hp?'#fff0b5':'#384e60';g.fillRect(e.x+9+i*12,e.y-29,8,5);}
   }
  }
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();g.restore();
 };
 function label(t,x,y,size=14){g.font='bold '+size+'px monospace';g.fillStyle='#f4e7c9';g.fillText(t,x,y);}
 drawHUD=function(){
  const e=encounter.enemy;
  g.fillStyle='#081d2cf0';g.fillRect(0,0,W,58);
  label('BUBBLE PUFFER',18,25,18);label('AGGRESSIVE ENCOUNTER · '+selectedCharacter().name.toUpperCase(),18,46,10);
  label('♥ '.repeat(Math.max(0,player.health)),W-260,25,18);label('P · PAUSE / RETRY',W-260,46,11);
  const message=encounter.victory?'PUFFER DEFEATED · P to retry':e.phase==='inflate'?'INFLATING · move off his aim':e.phase==='burst'?'TWO VOLLEYS · swim across the lanes':e.phase==='recover'?'RECOVERY · press the attack':'Shoot bubbles to clear a lane · keep moving';
  g.fillStyle='#081d2be8';g.fillRect(125,H-37,W-250,28);label(message,140,H-18,12);
  document.getElementById('wrap').dataset.swimming=String(!!player.swimming);
  const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label','Aim upward while shooting');jump.querySelector('small').textContent='AIM UP';}
  document.getElementById('pogoBtn').textContent=pogoOn?'Mixer ON':'Mixer OFF';
 };
 const pause=shellPause;shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'Bubble Puffer';
  if(!shellStarted)document.getElementById('shellMessage').textContent='He pursues, inflates, then fires two aimed bubble spreads. Keep moving and shoot bubbles to open a lane. Four hits to defeat. Both heroes available.';
  document.getElementById('shellResume').textContent=shellStarted?'Resume':'Face the Puffer';};
}
