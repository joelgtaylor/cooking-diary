const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function arena(){const a=game();a.run('checkpointState.current=3;player.x=92*T;player.y=54*T-player.h;player.ground=true;player.face=1;camera=2400;cameraY=1252;');return a;}
test('Foreman alternates a warned toss after the approved sweep and fires one slow bouncing ball',()=>{
 const a=arena();a.run("foremanState.phase='recovery';foremanState.timer=1;updateForeman()");
 assert.equal(a.run('foremanState.attack'),'toss');assert.equal(a.run('foremanState.timer'),60);
 a.run('for(let i=0;i<60;i++)updateForeman()');assert.equal(a.run('foremanState.phase'),'toss');assert.equal(a.run('foremanState.projectiles.length'),0);
 a.run('updateForeman()');assert.equal(a.run('foremanState.projectiles.length'),1);assert.equal(a.run('foremanState.projectiles[0].vx'),-2.6);
 a.run('player.y=foremanGeometry().base-180;for(let i=0;i<50;i++)updateForeman()');assert.equal(a.run('foremanState.projectiles[0].bounces'),1);
});
test('shooting only damages recovery and the short hit guard prevents volley damage',()=>{
 const a=arena();a.run("var body=foremanBodyBox();var s={x:body.x,y:body.y+50,w:10,h:6};hitForemanShot(s)");assert.equal(a.run('foremanState.health'),6);assert.equal(a.run('s.dead'),true);
 a.run("foremanState.phase='recovery';foremanState.timer=120;hitForemanShot(s);hitForemanShot(s)");assert.equal(a.run('foremanState.health'),5);
 a.run('for(let i=0;i<36;i++)updateForeman();hitForemanShot(s)');assert.equal(a.run('foremanState.health'),4);
});
test('pogo descent bounces off the Foreman and damages the recovery opening',()=>{
 const a=arena();a.run("foremanState.phase='recovery';foremanState.timer=120;player.x=foremanGeometry().cx-12;player.y=foremanBodyBox().y-player.h+6;player.vy=3;pogoOn=true;updateForeman()");
 assert.equal(a.run('foremanState.health'),5);assert.equal(a.run('player.vy'),-11);
 a.run("foremanState.phase='windup';foremanState.timer=60;foremanState.inv=0;player.vy=3;updateForeman()");assert.equal(a.run('foremanState.health'),5);assert.equal(a.run('player.vy'),-11);
});
test('one bouncing dough ball hits once; retreat and checkpoint recovery clear it',()=>{
 const a=arena();a.run("foremanState.projectiles=[{x:player.x,y:player.y+10,w:18,h:16,vx:0,vy:0,bounces:0,life:50}];updateForeman()");assert.equal(a.run('player.health'),2);assert.equal(a.run('foremanState.projectiles.length'),0);
 a.run("foremanState.health=2;foremanState.projectiles=[{x:3000,y:1600,w:18,h:16,vx:-2,vy:0,bounces:0,life:50}];player.x=88*T;updateForeman()");assert.equal(a.run('foremanState.projectiles.length'),0);
 a.run('gems[0].got=true;collected=1;player.ammo=0;respawnCheckpoint()');assert.equal(a.run('foremanState.health'),6);assert.equal(a.run('player.ammo'),35);assert.equal(a.run('collected'),1);assert.equal(a.run('gems[0].got'),true);
});
test('defeat clears attacks, rewards once and opens the oven only with all five cultures',()=>{
 const a=arena();a.run('collected=5;player.x=102*T;player.y=54*T-player.h;updateWorldProgress()');assert.equal(a.run('state'),'play');assert.equal(a.run('foremanOvenReady()'),false);
 a.run("foremanState.projectiles=[{}];for(let i=0;i<6;i++){foremanState.phase='recovery';foremanState.inv=0;hurtForeman()}");
 assert.equal(a.run('foremanState.health'),0);assert.equal(a.run('foremanState.phase'),'defeated');assert.equal(a.run('foremanState.projectiles.length'),0);assert.equal(a.run('player.score'),1000);
 a.run('collected=4;updateWorldProgress()');assert.equal(a.run('state'),'play');
 a.run('collected=5;updateWorldProgress()');assert.equal(a.run('state'),'clear');
 a.run("respawnCheckpoint();for(let i=0;i<6;i++){foremanState.phase='recovery';foremanState.inv=0;hurtForeman()}");assert.equal(a.run('player.score'),1000);
});
test('the full fight is beatable with ordinary shooting and jumps within starting ammo',()=>{
 const a=arena();let won=false;
 for(let i=0;i<1000;i++){
  a.run("keys={shoot:foremanState.phase==='recovery',jump:foremanState.phase==='windup'&&foremanState.timer<=18};if(hitStop>0)hitStop--;else update();");
  if(a.run('foremanState.health')===0){won=true;break;}
 }
 assert.ok(won);assert.ok(a.run('player.health>0'));assert.ok(a.run('player.ammo>=0'));
 a.run('for(const gem of gems)gem.got=true;collected=5;player.x=102*T;player.y=54*T-player.h;updateWorldProgress()');assert.equal(a.run('state'),'clear');assert.equal(a.run('unlocked.includes(0)'),true);
});
test('pogo attacks can complete the fight without spending ammo',()=>{
 const a=arena();a.run('pogoOn=true;');let won=false;
 for(let i=0;i<1600;i++){
  a.run("keys={jump:true,right:player.x<foremanGeometry().cx-player.w/2-4,left:player.x>foremanGeometry().cx-player.w/2+4};if(hitStop>0)hitStop--;else update();");
  if(a.run('foremanState.health')===0){won=true;break;}
 }
 assert.ok(won);assert.equal(a.run('player.ammo'),35);assert.ok(a.run('player.health>0'));
});
