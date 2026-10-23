/* Isolated pressure-door guardian. Physical obstruction, no invisible kill gate. */
'use strict';
const installFloodedSlice=installSunkenPrototype;
installSunkenPrototype=function(){installFloodedSlice();installCrabEncounter();};
function installCrabEncounter(){
 const preview=window.sunkenPreview,slice=window.floodedEntrance;
 const encounter={enemy:null,hits:0,victory:false,crossed:false};window.crabEncounter=encounter;
 const sheet=new Image();sheet.src='../previews/pot-crab/crab-frames.png';
 const gate=prepareStartupArtwork;prepareStartupArtwork=()=>[...gate(),{label:'Copper pot crab animation',image:sheet}];
 const terrainHit=hit;
 hit=function(x,y,w,h){return terrainHit(x,y,w,h)||CrustCrab.blocks(encounter.enemy,x,y,w,h);};
 function reset(){encounter.enemy=CrustCrab.create({x:26*T,y:28*T});encounter.hits=0;encounter.victory=false;encounter.crossed=false;slice.patroller.alive=false;slice.patroller.deathT=0;preview.rings=[];}
 const setup=init;
 init=function(){setup();
  // Full-height masonry divide: the only opening is exactly the crab's body.
  for(let y=0;y<36;y++)for(let x=26;x<29;x++)map[y][x]='#';
  for(let y=28;y<31;y++)for(let x=26;x<29;x++)map[y][x]='.';
  for(let x=0;x<cols;x++)map[0][x]='#';
  preview.checkpoint={x:18*T,y:29*T,swimming:true};
  player.x=18*T;player.y=29*T;player.vx=player.vy=0;player.inv=60;
  CrustSwim.sync(player,[{x:10*T,y:22*T,w:28*T,h:14*T}],hit);
  camera=Math.max(0,player.x-W*.32);cameraY=Math.max(0,player.y-H*.46);reset();return player;
 };
 const recover=respawnCheckpoint;respawnCheckpoint=function(){recover();reset();};
 const combat=updateCombat;
 function checkShot(s){const result=CrustCrab.shot(encounter.enemy,s);if(result==='hit'||result==='defeat')AudioKit.effect('enemy');return result;}
 updateCombat=function(shoot,aimUp){
  const e=encounter.enemy;CrustCrab.update(e,player);
  for(const s of shots){
   const n=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0))));
   for(let i=0;i<=n&&!s.dead;i++){
    const probe={x:s.x+s.vx*i/n,y:s.y+(s.vy||0)*i/n,w:s.w,h:s.h};
    if(terrainHit(probe.x,probe.y,probe.w,probe.h))break;
    if(checkShot(probe))s.dead=true;
   }
  }
  // Bullets may reach the pot surface even when the player stands next to it.
  // Player movement has already used the dynamic solid-body collision above.
  const solidHit=hit;hit=terrainHit;
  try{combat(shoot,aimUp);}finally{hit=solidHit;}
  for(const s of shots)if(!s.dead)checkShot(s);shots=shots.filter(s=>!s.dead);
  if(CrustCrab.contact(e,player)){encounter.hits++;AudioKit.effect('hit');}
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){
  if(!CrustCrab.solid(encounter.enemy)&&!encounter.victory){encounter.victory=true;AudioKit.effect('win');}
  if(encounter.victory&&player.x>30*T)encounter.crossed=true;
 };
 const world=drawWorld;
 drawWorld=function(){world();const e=encounter.enemy;
  g.save();g.translate(-Math.round(camera),-Math.round(cameraY));
  // Brass pressure-door jamb makes the one navigable opening unambiguous.
  g.fillStyle='#cea879';g.fillRect(26*T-5,28*T-5,106,5);g.fillRect(26*T-5,31*T,106,5);
  g.strokeStyle='#f0ddae';g.lineWidth=2;g.strokeRect(26*T-3,28*T-3,102,102);
  if(e.alive||e.deathT){
   const frame=!e.alive?3:e.phase==='open'?2:e.phase==='rattle'||e.phase==='tuck'?1:0;
   g.save();g.translate(e.x+48,e.y);
   if(!e.alive){g.globalAlpha=e.deathT/48;g.translate((48-e.deathT)*1.5,(48-e.deathT)*.3);}
   if(sheet.naturalWidth){const sw=sheet.naturalWidth/4;g.drawImage(sheet,frame*sw,140,sw,460,-72,-12,144,122);}
   g.restore();
   if(e.alive){
    for(let i=0;i<e.maxHp;i++){g.fillStyle=i<e.hp?'#fff0b5':'#384e60';g.fillRect(e.x+29+i*13,e.y-22,8,5);}
    // Fixed rim outlines the collision body; lid animation never opens a swim gap.
    g.strokeStyle=e.phase==='open'?'#fff0bc':'#9fb7c1';g.lineWidth=2;g.strokeRect(e.x+1,e.y+1,94,94);
    if(e.phase==='rattle'){g.strokeStyle='#f5e5bc';g.beginPath();g.arc(e.x+48,e.y+16,27,-Math.PI*.8,-Math.PI*.2);g.stroke();}
    if(e.clang){g.strokeStyle='#eee9d2';g.beginPath();g.moveTo(e.x-6,e.y+42);g.lineTo(e.x-14,e.y+32);g.moveTo(e.x-8,e.y+51);g.lineTo(e.x-20,e.y+53);g.stroke();}
    if(e.warning||e.jab){
     g.strokeStyle=e.jab?'#fff0bc':'#dacda588';g.lineWidth=e.jab?4:2;
     for(const direction of [-1,1]){g.beginPath();g.moveTo(e.x+48+direction*48,e.y+56);g.lineTo(e.x+48+direction*(e.jab?108:88),e.y+56);g.lineTo(e.x+48+direction*(e.jab?100:80),e.y+48);g.stroke();}
    }
   }
  }
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();g.restore();
 };
 function label(t,x,y,size=14){g.font='bold '+size+'px monospace';g.fillStyle='#f4e7c9';g.fillText(t,x,y);}
 drawHUD=function(){
  const e=encounter.enemy;g.fillStyle='#081d2cf0';g.fillRect(0,0,W,58);
  label('COPPER POT CRAB',18,25,18);label('GUARDED PASSAGE · '+selectedCharacter().name.toUpperCase(),18,46,10);
  label('♥ '.repeat(Math.max(0,player.health)),W-260,25,18);label('P · PAUSE / RETRY',W-260,46,11);
  const message=encounter.crossed?'PASSAGE CLEARED · P to retry':encounter.victory?'WAY OPEN · swim through →':!e.alive?'POT TUMBLING · passage clearing':e.phase==='open'?'LID OPEN · shoot the exposed crab':e.phase==='rattle'?'LID RATTLING · prepare your shot':'ARMOUR CLOSED · wait for the lid';
  g.fillStyle='#081d2be8';g.fillRect(125,H-37,W-250,28);label(message,140,H-18,12);
  document.getElementById('wrap').dataset.swimming=String(!!player.swimming);
  const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label','Aim upward while shooting');jump.querySelector('small').textContent='AIM UP';}
  document.getElementById('pogoBtn').textContent=pogoOn?'Mixer ON':'Mixer OFF';
 };
 const pause=shellPause;shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'Copper Pot Crab';
  if(!shellStarted)document.getElementById('shellMessage').textContent='A stubborn crab plugs the pressure doorway. Wait for the lid to lift, then shoot. Stay back from his short claw jab. Defeat him to swim through.';
  document.getElementById('shellResume').textContent=shellStarted?'Resume':'Meet the Crab';};
}
