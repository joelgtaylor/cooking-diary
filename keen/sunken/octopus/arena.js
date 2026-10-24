/* Milestone 6.1: one tool, one readable attack, fixed-camera underwater arena. */
'use strict';
const installBeforeDeep=installSunkenPrototype;
installSunkenPrototype=function(){installBeforeDeep();installDeepArena();};
function installDeepArena(options={}){
 const preview=window.sunkenPreview,slice=window.floodedEntrance,R=slice.render;
 const scraperReview=/(?:^|[?&])attack=scraper(?:&|$)/.test(window.location?.search||'');
 const fullReview=!!options.integrated||/(?:^|[?&])attack=full(?:&|$)/.test(window.location?.search||'');
 const inkReview=fullReview||/(?:^|[?&])attack=ink(?:&|$)/.test(window.location?.search||'');
 const Controller=fullReview?CrustDeepFight:inkReview?CrustInk:scraperReview?CrustScraper:CrustDeep;if(inkReview)document.title='The Master of the Deep · Ink attack review';if(scraperReview)document.title='The Master of the Deep · Bench scraper review';
 if(fullReview)document.title='The Master of the Deep · Full fight';
 const arena={boss:null,victory:false};window.deepArena=arena;
 const sheet=new Image();sheet.src='sunken/octopus/joined-master.png';
 const limb=new Image();limb.src='sunken/octopus/lame-slender.png';
 const defeat=new Image();defeat.src='sunken/octopus/defeat-frames.png';
 const scraper=new Image(),wake=new Image();if(scraperReview||inkReview){scraper.src='sunken/octopus/scraper-frames.png';wake.src='sunken/octopus/scraper-wake.png';}
 const inkBody=new Image(),inkCloud=new Image();if(inkReview){inkBody.src='sunken/octopus/ink-frames.png';inkCloud.src='sunken/octopus/ink-cloud.png';}
 const inkMask=document.createElement('canvas');inkMask.width=W;inkMask.height=H;const mask=inkMask.getContext('2d');
 let reducedInk=false;try{reducedInk=localStorage.getItem('crustQuestPreviewInkReduced')==='true';}catch(_){}
 const inkButton=document.getElementById('inkObstructionBtn');
 function inkSetting(){inkButton.hidden=!inkReview;inkButton.textContent='Ink obstruction: '+(reducedInk?'REDUCED':'FULL');inkButton.setAttribute('aria-pressed',String(reducedInk));}
 inkSetting();inkButton.addEventListener('click',()=>{reducedInk=!reducedInk;try{localStorage.setItem('crustQuestPreviewInkReduced',String(reducedInk));}catch(_){}inkSetting();});
 const startup=prepareStartupArtwork;prepareStartupArtwork=()=>[...startup(),{label:'Pixel octopus baker animation',image:sheet},{label:'Pixel tentacle and lame animation',image:limb},{label:'Octopus theatrical defeat',image:defeat},...((scraperReview||inkReview)?[{label:'Bench scraper animation',image:scraper},{label:'Pressure wave animation',image:wake}]:[]),...(inkReview?[{label:'Ink attack animation',image:inkBody},{label:'Camera ink splatter',image:inkCloud}]:[])];
 const defeatReview=/(?:^|[?&])scene=defeat(?:&|$)/.test(window.location?.search||'');
 function reset(){arena.boss=Controller.create();if(defeatReview)Object.assign(arena.boss,{hp:0,alive:false,phase:'defeat',deathT:CrustDeep.DEFEAT_DURATION,dropOrigin:{x:560,y:210}});arena.victory=false;slice.patroller.alive=false;slice.patroller.deathT=0;preview.rings=[];preview.targets=[];shots=[];}
 const setup=init;
 init=function(){if(!options.integrated)setup();map=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>x===0||x>=29||y<2||y>=16?'#':'.'));
  slice.width=W;slice.height=H;preview.water.splice(0,preview.water.length,{x:T,y:2*T,w:28*T,h:14*T});preview.currents.splice(0);
  preview.checkpoint={x:8*T,y:9*T,swimming:true};player.x=8*T;player.y=9*T;player.vx=player.vy=0;player.health=4;player.inv=60;
  CrustSwim.sync(player,preview.water,hit);camera=cameraY=0;reset();return player;
 };
 const recover=respawnCheckpoint;respawnCheckpoint=function(){recover();player.health=4;player.inv=60;reset();};
 updateViewCamera=function(){camera=cameraY=0;};
 const movement=updatePlayer;updatePlayer=function(){const actions=movement();if(scraperReview||inkReview){if(!arena.boss.alive)player.waterPush=null;else CrustScraper.applyPush(player,hit);}return actions;};
 const combat=updateCombat;
 function shot(s){const tip=CrustDeepArt.pose(arena.boss).tip,result=Controller.shot(arena.boss,s);if(result==='defeat')arena.boss.dropOrigin=tip;if(result==='hit'||result==='defeat')AudioKit.effect('enemy');}
 updateCombat=function(shoot,aimUp){
  const e=arena.boss;Controller.update(e,player,hit);
  for(const s of shots){const n=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy||0))));for(let i=0;i<=n&&!s.dead;i++){
   const probe={x:s.x+s.vx*i/n,y:s.y+(s.vy||0)*i/n,w:s.w,h:s.h};if(hit(probe.x,probe.y,probe.w,probe.h))break;shot(probe);if(probe.dead)s.dead=true;
  }}
  combat(shoot,aimUp);for(const s of shots)if(!s.dead)shot(s);shots=shots.filter(s=>!s.dead);
  if(player.health<=0)respawnCheckpoint();
 };
 updateWorldProgress=function(){if(!arena.boss.alive&&!arena.boss.deathT&&!arena.victory){arena.victory=true;AudioKit.effect('win');}};
 function line(x1,y1,x2,y2,color,width){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
 function drawAttackWarning(e,near=false){
  const wide=e.attack==='scraper'||scraperReview;
  g.save();if(near){g.beginPath();g.rect(player.x-95,62,player.w+205,450);g.clip();}
  if(e.phase==='prepare'){
   g.fillStyle=e.locked?'#f6deb337':'#d7eef11d';g.fillRect(62,e.lane-(wide?84:34),wide?518:644,wide?168:68);
   const half=wide?84:34,right=wide?580:706;line(62,e.lane-half,right,e.lane-half,'#f9e9c2',2);line(62,e.lane+half,right,e.lane+half,'#f9e9c2',2);
   for(let x=90;x<(wide?570:690);x+=80){line(x+10,e.lane-6,x,e.lane,'#f9e9c2',2);line(x,e.lane,x+10,e.lane+6,'#f9e9c2',2);}
  }
  g.restore();
 }
 function drawInk(e){
  if(!inkReview||!inkCloud.naturalWidth)return;
  const effect=CrustInk.overlay(e,player,reducedInk);if(!effect)return;
  mask.clearRect(0,0,W,H);mask.save();mask.imageSmoothingEnabled=false;mask.globalAlpha=effect.opacity;
  mask.drawImage(inkCloud,effect.x-effect.width/2,effect.y-effect.height/2,effect.width,effect.height);
  mask.globalAlpha=1;mask.globalCompositeOperation='destination-out';
  for(const hole of [effect.clear,effect.opening].filter(Boolean)){mask.beginPath();mask.arc(hole.x,hole.y,hole.r,0,Math.PI*2);mask.fill();}
  mask.restore();g.save();g.beginPath();g.rect(32,64,896,448);g.clip();g.drawImage(inkMask,0,0);g.restore();
  // Full ink hides actors and warnings; reduced mode restores visibility aids.
  g.strokeStyle='#b4d4c6';g.lineWidth=2;g.strokeRect(32,64,896,448);
  if(reducedInk){drawAttackWarning(e,true);
  if(e.phase==='sweep'&&Math.abs(e.tipX-player.x)<145){const t=CrustDeep.tool(e);g.strokeStyle='#fff1c5';g.lineWidth=2;g.strokeRect(t.x,t.y,t.w,t.h);}
  if(e.wave&&Math.abs(e.wave.x-player.x)<160)CrustDeepArt.drawWake(g,e,wake);
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();
  }
 }
 drawWorld=function(){
  const e=arena.boss;g.fillStyle='#103246';g.fillRect(0,0,W,H);R.distantCity();
  const shade=g.createLinearGradient(0,100,0,420);shade.addColorStop(0,'#102e4200');shade.addColorStop(1,'#102e42');g.fillStyle=shade;g.fillRect(0,100,W,H);
  R.drawSolidTiles();R.art('ledge',T,16*T,28*T,T);R.art('arch',22*T,3*T,6*T,4*T,.35);
  R.furniture('coldOven',22*T,12*T,6*T,4*T,.55);
  drawAttackWarning(e);
  if(e.phase==='sweep')for(let x=Math.min(e.previousX,e.tipX);x<=Math.max(e.previousX,e.tipX);x+=8){g.fillStyle='#eedcf5';g.fillRect(Math.round(x/2)*2,Math.round(e.lane/2)*2-2,4,4);}
  if(inkReview&&e.alive&&e.phase.startsWith('ink-'))CrustDeepArt.drawInkBody(g,e,inkBody);
  else if((scraperReview||e.attack==='scraper')&&e.alive)CrustDeepArt.drawScraper(g,e,scraper);else CrustDeepArt.draw(g,e,sheet,limb,defeat);
  if(e.wave)CrustDeepArt.drawWake(g,e,wake);
  if(CrustDeep.vulnerable(e)){const m=CrustDeep.mantle();g.strokeStyle='#fff1c5';g.lineWidth=2;g.strokeRect(m.x-4,m.y-4,m.w+8,m.h+8);R.text('EXPOSED',m.x+15,m.y-12,12);}
  for(const s of shots){g.fillStyle='#fff3cc';g.fillRect(s.x,s.y,s.w,s.h);}
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();
  for(let i=0;i<16;i++){const x=60+i*53,y=90+(i*41+tick*.25)%390;g.strokeStyle='#b5e5df35';g.lineWidth=1;g.beginPath();g.arc(x,y,2,0,7);g.stroke();}
  drawInk(e);
 };
 drawHUD=function(){const e=arena.boss,wide=e.attack==='scraper'||scraperReview;
  g.fillStyle='#071e2bf2';g.fillRect(0,0,W,61);R.text('THE MASTER OF THE DEEP',18,25,18);R.text((fullReview?'FULL FIGHT · ':inkReview?'INK + TOOL REVIEW · ':scraperReview?'BENCH SCRAPER REVIEW · ':'LAME ATTACK REVIEW · ')+selectedCharacter().name.toUpperCase(),18,46,10);
  R.text('♥ '.repeat(Math.max(0,player.health)),W-240,24,18);R.text('P · PAUSE / RETRY',W-240,45,11);
  const bars=fullReview?12:e.maxHp;for(let i=0;i<bars;i++){g.fillStyle=i<Math.ceil(e.hp/e.maxHp*bars)?'#edce99':'#40515b';g.fillRect(398+i*(fullReview?20:23),23,fullReview?15:18,8);}
  if(fullReview)R.text(e.battleStage==='opening'?'I · OPEN WATER':e.battleStage==='escalation'?'II · INK RISING':'III · DEEP FURY',398,46,10);
  const inkMessage=inkReview&&e.phase.startsWith('ink-')?(e.phase==='ink-inhale'?'CHEEKS PUFFING · INK INCOMING':e.phase==='ink-spit'?'INK ON THE GLASS · WATCH THE NEXT TOOL':'INK CLEARING · STAY READY'):null;
  const message=arena.victory?'DEFEAT COMPLETE · P to retry':!e.alive?CrustDeep.defeatPose(e).message:inkMessage|| (e.phase==='prepare'?(e.locked?'LANE LOCKED · SWIM CLEAR':wide?'SCRAPER BROADSIDE · WATCH THE WIDE LANE':'LAME RAISED · WATCH THE LANE'):e.phase==='shove'?'SCRAPER SHOVE · DODGE ABOVE OR BELOW':e.phase==='sweep'?'SCORING SWEEP':e.phase==='recover'?(wide?'SCRAPER RESETTING · SHOOT THE MANTLE':'TOOL STUCK · SHOOT THE EXPOSED MANTLE'):'“DO NOT DISTURB THE PROOF!”');
  g.fillStyle='#071e2bed';g.fillRect(116,H-35,W-232,28);R.text(message,130,H-16,12);
  document.getElementById('wrap').dataset.swimming='true';const jump=document.querySelector('[data-action="jump"]');if(jump){jump.setAttribute('aria-label','Aim upward while shooting');jump.querySelector('small').textContent='AIM UP';}
 };
 const pause=shellPause;shellPause=function(reason){pause(reason);document.getElementById('shellTitle').textContent=shellStarted?'Paused':'The Master of the Deep';
  if(!shellStarted)document.getElementById('shellMessage').textContent='First attack review: a precise lame sweep. Watch the raised tool and outlined lane, swim above or below it, then fire at the exposed mantle. Both heroes, free swimming, unlimited shots. Scraper and ink follow after this attack is approved.';
  if(!shellStarted&&scraperReview){document.getElementById('shellTitle').textContent='The Bench Scraper';document.getElementById('shellMessage').textContent='Second attack review: a broad scraper shove releases a slow pressure wave. Swim above or below the outlined lane; a hit pushes you back. Shoot the mantle during recovery. The approved lame and defeat remain in the original preview.';}
  if(!shellStarted&&inkReview){document.getElementById('shellTitle').textContent='Ink on the Glass';document.getElementById('shellMessage').textContent='Ink rushes toward the screen and blacks out much of the view for four seconds. It does no damage. A lame sweep or scraper wave follows behind it. FULL also hides your character and attack warnings: remember the timing. REDUCED keeps visibility aids. Use Ink obstruction to choose FULL or REDUCED.';}
  if(!shellStarted&&fullReview){document.getElementById('shellTitle').textContent='The Master of the Deep';document.getElementById('shellMessage').textContent='The combined fight: first learn two clear rounds of lame and scraper attacks. Then ink enters every other attack, before a final phase of ink followed by every tool attack. FULL hides you and the warning lanes. Remember the rhythm, shoot during recovery, and earn the Master’s indignant bow.';}
  if(!shellStarted&&defeatReview){document.getElementById('shellTitle').textContent='A Very Offended Baker';document.getElementById('shellMessage').textContent='Defeat animation review: tools fall harmlessly, tentacles tangle in his apron, the chef cap slumps and the Master takes an indignant bow. The normal arena still includes the approved lame fight.';}
  document.getElementById('shellResume').textContent=shellStarted?'Resume':defeatReview?'Watch the Defeat':fullReview?'Face the Master':inkReview?'Face the Ink':scraperReview?'Face the Scraper':'Face the Baker';};
}
