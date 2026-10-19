const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
function arena(){const a=game();a.run('startBloomrotPreview();updateBloomrot();');return a;}
test('Bloomrot prototype is absent from all normal worlds and closes entry only after engagement',()=>{
 const a=game();for(const i of [1,2,3]){a.run(`init(${i})`);assert.equal(a.run('bloomrotState'),null);}
 a.run('startBloomrotPreview()');assert.equal(a.run('tile(84,50)'),'.');a.run('updateBloomrot()');assert.equal(a.run('tile(84,50)'),'#');assert.equal(a.run('bloomrotState.engaged'),true);
});
test('dash warns for42 ticks, locks direction, then crosses the lane with a75 tick recovery',()=>{
 const a=arena();a.run('bloomrotState.timer=1;updateBloomrot()');assert.equal(a.run('bloomrotState.phase'),'windup');
 a.run('player.x=101*T;for(let i=0;i<41;i++)updateBloomrot()');assert.equal(a.run('bloomrotState.phase'),'windup');assert.equal(a.run('bloomrotState.face'),-1);
 a.run('updateBloomrot()');assert.equal(a.run('bloomrotState.phase'),'dash');a.run('for(let i=0;i<44;i++)updateBloomrot()');assert.equal(a.run('bloomrotState.phase'),'recovery');assert.equal(a.run('bloomrotState.timer'),75);
});
test('a nearby incoming shot triggers one dodge; distant, departing and dead shots do not',()=>{
 const a=arena();
 for(const shot of ['{x:bloomrotState.x-220,y:1710,w:10,h:6,vx:10}','{x:bloomrotState.x-60,y:1710,w:10,h:6,vx:-10}','{x:bloomrotState.x-60,y:1710,w:10,h:6,vx:10,dead:true}']){a.run(`shots=[${shot}];updateBloomrot()`);assert.equal(a.run('bloomrotState.phase'),'idle');}
 a.run('shots=[{x:bloomrotState.x-70,y:1710,w:10,h:6,vx:10}];updateBloomrot()');assert.equal(a.run('bloomrotState.phase'),'dodge');assert.equal(a.run('bloomrotState.dodgeCooldown'),110);
 a.run('shots=[];for(let i=0;i<45;i++)updateBloomrot()');assert.equal(a.run('bloomrotState.phase'),'recovery');
});
test('sustained firing cannot keep restarting the dodge and starve the dash',()=>{
 const a=arena();a.run('shots=[{x:bloomrotState.x-70,y:1710,w:10,h:6,vx:10}];');let dashed=false;
 for(let i=0;i<260;i++){a.run('updateBloomrot()');if(a.run('bloomrotState.phase')==='dash'){dashed=true;break;}}assert.ok(dashed);
});
test('boss remains vulnerable during its dodge and recovery, with invulnerability limiting repeated hits',()=>{
 const a=arena();a.run("bloomrotState.phase='dodge';hurtBloomrot();hurtBloomrot()");assert.equal(a.run('bloomrotState.health'),9);
 a.run("bloomrotState.inv=0;bloomrotState.phase='recovery';hurtBloomrot()");assert.equal(a.run('bloomrotState.health'),8);
});
test('dash contact damages once per charge; a normal held jump clears it with existing physics',()=>{
 const a=arena();a.run("bloomrotState.phase='dash';bloomrotState.timer=44;bloomrotState.face=-1;player.x=bloomrotState.x-12;updateBloomrot();player.inv=0;updateBloomrot()");assert.equal(a.run('player.health'),2);
 const b=arena();b.run("bloomrotState.phase='dash';bloomrotState.timer=44;bloomrotState.face=-1;bloomrotState.x=player.x+150;keys={jump:true};");for(let i=0;i<40;i++)b.run('update()');assert.equal(b.run('player.health'),3);
});
test('pogo hits rebound and can defeat the boss; reward is once-only and both gates open',()=>{
 const a=arena();a.run('bloomrotState.health=1;player.x=bloomrotState.x;player.y=bloomrotState.y-player.h+4;player.vy=2;pogoOn=true;updateBloomrot()');assert.equal(a.run('bloomrotState.health'),0);assert.equal(a.run('player.vy'),-11);assert.equal(a.run('player.score'),1000);assert.equal(a.run('tile(103,50)'),'.');assert.equal(a.run('tile(84,50)'),'.');a.run('hurtBloomrot()');assert.equal(a.run('player.score'),1000);
});
test('checkpoint retry and restart reset fight safely without affecting relay completion',()=>{
 const a=arena();a.run('myceliumState.solved=true;myceliumState.clueKnown=true;collected=1;bloomrotState.health=3;player.ammo=0;respawnCheckpoint()');assert.equal(a.run('player.x'),82*32);assert.equal(a.run('bloomrotState.health'),10);assert.equal(a.run('player.ammo'),45);assert.equal(a.run('collected'),1);assert.equal(a.run('myceliumState.solved'),true);assert.equal(a.run('tile(84,50)'),'.');
 a.run('restart()');assert.equal(a.run('checkpointState.current'),4);assert.equal(a.run('enemies.length'),0);assert.equal(a.run('bloomrotState.health'),10);a.run('leaveBloomrotPreview()');assert.equal(a.run('bloomrotState'),null);
});
test('pause and render calls never advance the attack clock',()=>{
 const a=arena();a.run("state='pause';assets.bloomrotPoses.complete=true;assets.bloomrotPoses.naturalWidth=1254;assets.bloomrotPoses.naturalHeight=1254;");const before=a.run('JSON.stringify(bloomrotState)');a.run('for(let i=0;i<100;i++){updateBloomrot();drawBloomrot()}');assert.equal(a.run('JSON.stringify(bloomrotState)'),before);
});
test('an actual approaching projectile is dodged before collision, without bullet deletion',()=>{
 const a=arena();a.run('shots=[{x:bloomrotState.x-100,y:1710,w:10,h:6,vx:10}];for(let i=0;i<15;i++)update()');assert.equal(a.run('bloomrotState.health'),10);assert.equal(a.run('bloomrotState.phase'),'dodge');assert.ok(a.run('shots[0].x>bloomrotState.x'));
});
test('the fight advances identically at30,60 and120 render fps',()=>{
 let expected;
 for(const fps of [30,60,120]){const a=arena();a.run('draw=()=>{};diagnosticOverlay=()=>{};drawPhase3Map=()=>{};');a.run(`for(let i=0;i<=${fps*5};i++)loop(i*1000/${fps})`);const actual=a.run('JSON.stringify([bloomrotState,player,tick])');if(expected)assert.equal(actual,expected);else expected=actual;}
});
