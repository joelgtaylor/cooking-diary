/* Complete level assembly. Reuses the route and approved arena without a second game loop. */
'use strict';
// arena.js retains the route installer as installBeforeDeep. Install the route
// first, then capture its hooks and mount the arena behind a scene dispatcher.
installSunkenPrototype=function(){installBeforeDeep();installSunkenCompleteLevel();};
function installSunkenCompleteLevel(){
 const level={mode:'route',bossDefeated:false,complete:false,entered:false,awarded:false,routeSnapshot:null};window.sunkenLevel=level;
 const route=window.sunkenWorld,preview=window.sunkenPreview,R=window.floodedEntrance.render;
 const routeHooks={init,respawnCheckpoint,updatePlayer,updateCombat,updateWorldProgress,updateViewCamera,drawWorld,drawHUD,shellPause,shellOpenSheet,drawPhase3Map};
 installDeepArena({integrated:true});
 const arenaHooks={init,respawnCheckpoint,updatePlayer,updateCombat,updateWorldProgress,updateViewCamera,drawWorld,drawHUD,shellPause};
 document.title='The Sunken Patisserie · Complete level';
 function isRoute(){return level.mode==='route';}
 function enterBoss(){
  if(level.entered||collected!==5)return false;
  level.entered=true;
  level.routeSnapshot={map,rows,cols,water:preview.water.map(r=>({...r})),currents:preview.currents.map(r=>({...r})),checkpoint:{...preview.checkpoint}};
  const health=player.health;level.mode='boss';keys={};shots=[];shellClearInput();resetPlayerFire();
  arenaHooks.init();player.health=Math.max(4,health);player.inv=90;
  document.getElementById('exploreBtn').style.display='none';return true;
 }
 level.enterBoss=enterBoss;route.onApproach=enterBoss;
 init=function(){
  level.mode='route';level.bossDefeated=false;level.complete=false;level.entered=false;level.awarded=false;level.routeSnapshot=null;
  routeHooks.init();route.onApproach=enterBoss;
  const scene=/(?:^|[?&])scene=(boss|oven)(?:&|$)/.exec(window.location?.search||'');
  if(scene){for(const gem of route.cultures)gem.got=true;collected=5;route.checkpoint=4;const cp=route.layout.checkpoints[4];preview.checkpoint={x:cp.x*T,y:cp.y*T,swimming:false};enterBoss();
   if(scene[1]==='oven'){Object.assign(deepArena.boss,{hp:0,alive:false,phase:'defeat',deathT:0});deepArena.victory=true;openOven();}
  }
  return player;
 };
 respawnCheckpoint=function(){
  const score=player.score,kefir=player.kefirCharges;
  if(isRoute())routeHooks.respawnCheckpoint();
  else if(level.bossDefeated){
   preview.checkpoint={x:352,y:380,swimming:true};routeHooks.respawnCheckpoint();player.health=Math.max(4,player.health);level.mode='finish';level.complete=false;route.complete=false;
  }else arenaHooks.respawnCheckpoint();
  player.score=score;player.kefirCharges=kefir;player.waterPush=null;updateViewCamera();
 };
 updatePlayer=function(){
  if(level.complete){player.vx=player.vy=0;return {shoot:false,aimUp:false};}
  return (isRoute()?routeHooks:arenaHooks).updatePlayer();
 };
 updateCombat=function(shoot,aimUp){return(isRoute()?routeHooks:arenaHooks).updateCombat(shoot,aimUp);};
 updateViewCamera=function(){return(isRoute()?routeHooks:arenaHooks).updateViewCamera();};
 function openOven(){
  if(level.bossDefeated)return;
  level.bossDefeated=true;level.mode='finish';shots=[];player.waterPush=null;
  // A pressure-sealed dry pocket opens after the bow. Its water rectangles,
  // visible seal, roof and floor share the same coordinates.
  for(let x=2;x<10;x++){map[6][x]='#';map[14][x]='#';}map[15][2]='#';map[15][9]='#';
  preview.water.splice(0,preview.water.length,{x:32,y:64,w:896,h:160},{x:32,y:224,w:32,h:224},{x:320,y:224,w:608,h:224},{x:32,y:448,w:896,h:64});
  if(hit(player.x,player.y,player.w,player.h)){player.x=352;player.y=380;player.vx=player.vy=0;}
  CrustSwim.sync(player,preview.water,hit);preview.checkpoint={x:352,y:380,swimming:true};
 }
 updateWorldProgress=function(){
  if(state!=='play')return;
  if(isRoute()){routeHooks.updateWorldProgress();return;}
  if(level.mode==='boss'){arenaHooks.updateWorldProgress();if(deepArena.victory)openOven();return;}
  if(!level.complete&&level.bossDefeated&&collected===5&&!player.swimming&&Math.hypot(player.x+player.w/2-192,player.y+player.h/2-412)<46){
   level.complete=true;level.mode='complete';route.complete=true;preview.finished=true;if(!level.awarded){player.score+=1500;level.awarded=true;}keys={};shots=[];shellClearInput();AudioKit.effect('win');
  }
 };
 function drawOvenRoom(){
  g.fillStyle='#302b27';g.fillRect(64,224,256,224);
  const glow=g.createRadialGradient(188,385,8,188,385,180);glow.addColorStop(0,'#e6aa6155');glow.addColorStop(1,'#ab804611');g.fillStyle=glow;g.fillRect(64,224,256,224);
  R.furniture('oven',80,284,224,164);R.copperPipe(61,220,6,232);R.copperPipe(317,220,6,232);
  g.strokeStyle='#d7e4ce';g.lineWidth=2;g.beginPath();g.moveTo(320,224);g.lineTo(320,448);g.stroke();
  R.text('THE FINISHING OVEN',79,247,13);R.text('AIR POCKET',145,266,11);
  if(!player.inv||Math.floor(player.inv/12)%2===0)drawPlayer();
 }
 drawWorld=function(){
  if(isRoute())return routeHooks.drawWorld();
  arenaHooks.drawWorld();if(level.bossDefeated)drawOvenRoom();
 };
 drawHUD=function(){
  if(isRoute())return routeHooks.drawHUD();
  arenaHooks.drawHUD();
  if(level.bossDefeated){g.fillStyle='#071e2bf2';g.fillRect(0,0,W,61);R.text('THE SUNKEN PATISSERIE',18,25,18);R.text('FINISHING OVEN · CULTURES '+collected+'/5',18,46,11);R.text('♥ '.repeat(Math.max(0,player.health)),W-240,25,18);R.text('P · PAUSE   Q · MAP',W-240,46,11);g.fillRect(115,H-36,W-230,29);R.text(level.complete?'THE SUNKEN PATISSERIE · COMPLETE':'PRESSURE SEAL OPEN · ENTER THE OVEN ←',132,H-16,12);}
  if(level.complete){
   g.fillStyle='#071e2bf2';g.fillRect(180,120,600,250);g.strokeStyle='#dbc38e';g.lineWidth=3;g.strokeRect(180,120,600,250);
   R.text('THE SUNKEN PATISSERIE',235,172,25);R.text('COMPLETE',365,215,28);R.text('5 CULTURES · THE MASTER DEFEATED',260,254,16);
   R.text('SCORE '+player.score,390,292,16);R.text('P · pause / restart the level',305,334,13);
  }
 };
 shellPause=function(reason){
  (isRoute()?routeHooks:arenaHooks).shellPause(reason);
  if(!shellStarted){document.getElementById('shellTitle').textContent='The Sunken Patisserie';document.getElementById('shellMessage').textContent='Explore four connected sections, collect five cultures, and defeat the Master of the Deep. His final bow opens a pressure-sealed finishing oven. Checkpoints preserve route progress; the boss can be retried directly. FULL ink is the recommended challenge.';document.getElementById('shellResume').textContent='Explore World 4';}
 };
 shellOpenSheet=function(page){routeHooks.shellOpenSheet(page);if(page==='map'&&!isRoute())document.getElementById('sheetTitle').textContent='The Abyssal Patisserie · arena map';};
 drawPhase3Map=function(){
  if(isRoute())return routeHooks.drawPhase3Map();
  const m=minimap.getContext('2d'),s=.7;minimap.width=720;minimap.height=420;m.fillStyle='#0a2233';m.fillRect(0,0,720,420);
  for(let y=0;y<17;y++)for(let x=0;x<30;x++)if(map[y][x]==='#'){m.fillStyle='#738f91';m.fillRect(x*T*s,y*T*s,T*s,T*s);}
  m.fillStyle='#fff';m.fillRect(player.x*s,player.y*s,8,8);m.fillStyle='#d3a3d7';m.fillRect(750*s,300*s,14,14);
  if(level.bossDefeated){m.fillStyle='#f1d5a0';m.fillRect(192*s,412*s,14,14);}m.font='13px monospace';m.fillStyle='#e9d6a1';m.fillText('YOU · MASTER · FINISHING OVEN',20,405);
 };
 level.openOven=openOven;
}
