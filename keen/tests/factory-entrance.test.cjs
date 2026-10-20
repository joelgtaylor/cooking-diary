const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function level(options={}){const a=game({},options);a.run('init(3)');return a;}
test('factory entrance preserves later geometry, cultures, checkpoints and existing enemies',()=>{
 const a=level({layoutFixture3:'bakery3-entrance-approved.js'}),b=level({layoutFixture3:'bakery3-original.js'}),am=a.run('map'),bm=b.run('map');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(x>=4&&x<=25&&y>=43&&y<54,`${x},${y}`);
 for(const q of ['gems.slice(1)','checkpointState.spawns.slice(1)','enemies.slice(0,2)','currentVerticalLayout().oven','powerups.slice(2).map(({ph,...u})=>u)']){
  const old=q==='enemies.slice(0,2)'?'enemies.slice(1,3)':q.startsWith('powerups')?'powerups.map(({ph,...u})=>u)':q;
  assert.equal(a.run(`JSON.stringify(${q})`),b.run(`JSON.stringify(${old})`),q);
 }
 assert.equal(a.run('gems.length'),5);assert.equal(a.run('devourerState'),null);
});
test('normal jumps traverse both entrance routes and rejoin the untouched lift approach',()=>{
 for(const [name,sx,sy,tx,ty] of [
  ['first step',3,54,5,52],['roof approach',5,52,7,50],['maintenance roof',7,50,10,49],['roof supplies',13,49,17,49],
  ['roof exit',18,49,21,49],['passage exit',20,54,22,49],['catwalk',22,52,22,49],
  ['upper step',22,49,24,46],['lift landing',24,46,23,43],['original route rejoin',23,43,28,39]]){
  const a=level();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;keys={};pogoOn=false;`);
  let landed=false;
  for(let frame=0;frame<180;frame++){
   a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(frame>5&&a.run(`Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24&&player.ground`)){landed=true;break;}
  }assert.ok(landed,name);
 }
});
test('safe passage yields culture and stored kefir without activating the boost',()=>{
 const a=level();a.run('keys={right:true};');
 for(let i=0;i<175;i++)a.run('update();updateWorldProgress()');
 assert.ok(a.run('player.x>20*T'));assert.equal(a.run('gems[0].got'),true);
 assert.equal(a.run('player.kefirCharges'),1);assert.equal(a.run('player.speedT'),0);
 assert.equal(a.run('player.health'),3);assert.equal(a.run('checkpointState.current'),0);
 a.key('V');assert.equal(a.run('player.speedT'),480);
});
test('roof cache is optional and only rewards once; checkpoint stays clear of combat',()=>{
 const a=level();a.run("var cache=powerups.find(u=>u.kind==='cache');player.x=cache.x-14;player.y=49*T-player.h;updatePickups();updatePickups()");
 assert.equal(a.run('player.score'),500);assert.equal(a.run('player.ammo'),50);assert.equal(a.run('collected'),0);
 a.run('checkpointState.current=0;respawnCheckpoint();keys={};');
 for(let i=0;i<900;i++)a.run('updateEnemies();updateEnemyShots()');
 assert.equal(a.run('player.health'),3);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 assert.equal(a.run('enemies.filter(e=>e.encounter).every(e=>e.alive&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);
 assert.equal(a.run('enemies.find(e=>e.encounter&&e.type==="walker").y+25'),49*32);
});
test('exit thrower leaves the low passage quiet and retains its full warned attack',()=>{
 const a=level();a.run('player.x=23*T;player.y=54*T-player.h;camera=320;cameraY=1252;');
 a.run('for(let i=0;i<300;i++)updateEnemies()');assert.equal(a.run('enemyShots.length'),0);
 a.run("var t=enemies.find(e=>e.type==='thrower');player.x=21*T;player.y=43*T-player.h;cameraY=1050;for(let i=0;i<90;i++)updateThrower(t)");
 assert.equal(a.run('t.windup'),36);assert.equal(a.run('enemyShots.length'),0);
 a.run('for(let i=0;i<36;i++)updateThrower(t)');assert.equal(a.run('enemyShots.length'),1);
 a.run('player.face=1;keys={shoot:true};for(let i=0;i<35;i++)update()');assert.equal(a.run('t.alive'),false);
});
