/* Milestone 6.1: one tool, one readable attack, fixed-camera underwater arena. */
'use strict';
const installBeforeDeep=installSunkenPrototype;
installSunkenPrototype=function(){installBeforeDeep();installDeepArena();};
function installDeepArena(){
 const preview=window.sunkenPreview,slice=window.floodedEntrance,R=slice.render;
 const arena={boss:null,victory:false};window.deepArena=arena;
 const sheet=new Image();sheet.src='../previews/octopus/joined-master.png';
 const limb=new Image();limb.src='../previews/octopus/lame-slender.png';
 const startup=prepareStartupArtwork;prepareStartupArtwork=()=>[...startup(),{label:'Pixel octopus baker animation',image:sheet},{label:'Pixel tentacle and lame animation',image:limb}];
 function reset(){arena.boss=CrustDeep.create();arena.victory=false;slice.patroller.alive=false;slice.patroller.deathT=0;preview.rings=[];preview.targets=[];shots=[];}
 const setup=init;
 init=function(){setup();map=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>x===0||x>=29||y<2||y>=16?'#':'.'));
  slice.width=W;slice.height=H;preview.water.splice(0,preview.water.length,{x:T,y:2*T,w:28*T,h:14*T});preview.currents.splice(0);
  preview.checkpoint={x:8*T,y:9*T,swimming:true};player.x=8*T;player.y=9*T;player.vx=player.vy=0;player.health=4;player.inv=60;
  CrustSwim.sync(player,preview.water,hit);camera=cameraY=0;reset();return player;
 };
 const recover=respawnCheckpoint;respawnCheckpoint=function(){recover();player.health=4;player.inv=60;reset();};
 updateViewCamera=function(){camera=cameraY=0;};
 const combat=updateCombat;
 function shot(s){const result=CrustDeep.shot(arena.boss,s);if(result==='hit'||result==='defeat')AudioKit.effect('enemy');}
 updateCombat=function(shoot,aimUp){
  const e=arena.boss;CrustDeep.update(e,player);
  for(const s of shots){const n=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0))));for(let i=0;i<=n&&!s.dead;i++){
   const probe={x:s.x+s.vx*i/n,y:s.y+(s.vy||0)*i/n,w:s.w,h:s.h};if(hit(probe.x,probe.y,probe.w,probe.h))break;shot(probe);if(probe.dead)s.dead=true;
  }}
  combat(shoot,aimUp);for(const s of shots)if(!s.dead)shot(s);shots=shots.filter(s=>!s.dead);
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){if(!arena.boss.alive&&!arena.boss.deathT&&!arena.victory){arena.victory=true;AudioKit.effect('win');}};
 function line(x1,y1,x2,y2,color,width){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
 drawWorld=function(){
  const e=arena.boss;g.fillStyle='#103246';g.fillRect(0,0,W,H);R.distantCity();
  const shade=g.createLinearGradient(0,100,0,420);shade.addColorStop(0,'#102e4200');shade.addColorStop(1,'#102e42');g.fillStyle=shade;g.fillRect(0,100,W,H);
  R.drawSolidTiles();R.art('ledge',T,16*T,28*T,T);R.art('arch',22*T,3*T,6*T,4*T,.35);
  R.furniture('coldOven',22*T,12*T,6*T,4*T,.55);
  // Broad, steady warning ribbon remains visible without flashing or color dependence.
  if(e.phase==='prepare'){
   g.fillStyle=e.locked?'#f6deb337':'#d7eef11d';g.fillRect(62,e.lane-34,644,68);
   line(62,e.lane-34,706,e.lane-34,'#f9e9c2',2);line(62,e.lane+34,706,e.lane+34,'#f9e9c2',2);
   for(let x=90;x<690;x+=80){line(x+10,e.lane-6,x,e.lane,'#f9e9c2',2);line(x,e.lane,x+10,e.lane+6,'#f9e9c2',2);}
  }
  if(e.phase==='sweep')for(let x=Math.min(e.previousX,e.tipX);x<=Math.max(e.previousX,e.tipX);x+=8){g.fillStyle='#eedcf5';g.fillRect(Math.round(x/2)*2,Math.round(e.lane/2)*2-2,4,4);}
  CrustDeepArt.draw(g,e,sheet,limb);
  if(CrustDeep.vulnerable(e)){const m=CrustDeep.mantle();g.strokeStyle='#fff1c5';g.lineWidth=2;g.strokeRect(m.x-4,m.y-4,m.w+8,m.h+8);R.text('EXPOSED',m.x+15,m.y-12,12);}
  for(const s of shots){g.fillStyle='#fff3cc';g.fillRect(s.x,s.y,s.w,s.h);}
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();
  for(let i=0;i<16;i++){const x=60+i*53,y=90+(i*41+tick*.25)%390;g.strokeStyle='#b5e5df35';g.lineWidth=1;g.beginPath();g.arc(x,y,2,0,7);g.stroke();}
 };
 drawHUD=function(){const e=arena.boss;
  g.fillStyle='#071e2bf2';g.fillRect(0,0,W,61);R.text('THE MASTER OF THE DEEP',18,25,18);R.text('LAME ATTACK REVIEW · '+selectedCharacter().name.toUpperCase(),18,46,10);
  R.text('♥ '.repeat(Math.max(0,player.health)),W-240,24,18);R.text('P · PAUSE / RETRY',W-240,45,11);
  for(let i=0;i<e.maxHp;i++){g.fillStyle=i<e.hp?'#edce99':'#40515b';g.fillRect(398+i*23,23,18,8);}
  const message=arena.victory?'ATTACK REVIEW COMPLETE · P to retry':!e.alive?'“MY PERFECT SCORING!”':e.phase==='prepare'?(e.locked?'LANE LOCKED · SWIM CLEAR':'LAME RAISED · WATCH THE LANE'):e.phase==='sweep'?'SCORING SWEEP':e.phase==='recover'?'TOOL STUCK · SHOOT THE EXPOSED MANTLE':'“DO NOT DISTURB THE PROOF!”';
  g.fillStyle='#071e2bed';g.fillRect(116,H-35,W-232,28);R.text(message,130,H-16,12);
  document.getElementById('wrap').dataset.swimming='true';const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label','Aim upward while shooting');jump.querySelector('small').textContent='AIM UP';}
 };
 const pause=shellPause;shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'The Master of the Deep';
  if(!shellStarted)document.getElementById('shellMessage').textContent='First attack review: a precise lame sweep. Watch the raised tool and outlined lane, swim above or below it, then fire at the exposed mantle. Both heroes, free swimming, unlimited shots. Scraper and ink follow after this attack is approved.';
  document.getElementById('shellResume').textContent=shellStarted?'Resume':'Face the Baker';};
}
