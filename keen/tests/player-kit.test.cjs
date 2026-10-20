const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
test('continuous shooting is exactly 50 percent faster, with no burst on release or restart',()=>{
 const a=game();a.run('player.ammo=500;enemies=[];for(let i=0;i<780;i++)updateProjectiles(true)');assert.equal(a.audio.effects.filter(x=>x==='shoot').length,90);assert.equal(a.run('player.ammo'),410);
 a.run('for(let i=0;i<100;i++)updateProjectiles(false);var n=shots.length;updateProjectiles(true)');assert.equal(a.run('shots.length'),a.run('n+1'));
 a.run('init(1);updateProjectiles(true)');assert.equal(a.run('player.ammo'),34);
});
test('jump plus shoot sends a real bullet up; releasing jump permits horizontal airborne shooting',()=>{
 const a=game();a.run('keys={jump:true,shoot:true};update()');assert.equal(a.run('shots[0].vx'),0);assert.equal(a.run('shots[0].vy'),-10);const y=a.run('shots[0].y');a.run('update()');assert.ok(a.run('shots[0].y')<y);
 a.run('resetPlayerFire();keys={shoot:true};update()');assert.equal(a.run('shots.at(-1).vx'),10);assert.equal(a.run('shots.at(-1).vy'),undefined);assert.equal(a.run('player.ground'),false);
});
test('kefir is stored on pickup, activated once by keyboard or touch, and reaches 8.1px per tick',()=>{
 const a=game();a.run("powerups=[{x:player.x+14,y:player.y+19,kind:'kefir',got:false}];updatePickups()");assert.equal(a.run('player.kefirCharges'),1);assert.equal(a.run('player.speedT'),0);
 a.key('V');assert.equal(a.run('player.kefirCharges'),0);assert.equal(a.run('player.speedT'),480);a.key('V','keydown',true);assert.equal(a.run('player.speedT'),480);
 a.run("map=Array.from({length:rows},(_,y)=>Array(cols).fill(y>=54?'#':'.'));keys={right:true};for(let i=0;i<80;i++)updatePlayer()");assert.ok(Math.abs(a.run('player.vx')-8.1)<.01);
 a.run('player.speedT=0;player.kefirCharges=1;syncKefirButton()');a.elements.get('kefirBtn').listeners.click[0]();assert.equal(a.run('player.speedT'),480);assert.equal(a.run('player.kefirCharges'),0);
});
test('kefir cannot be consumed while paused or already active, and a death ends the active boost',()=>{
 const a=game();a.run("player.kefirCharges=2;state='pause';activateKefir()");assert.equal(a.run('player.kefirCharges'),2);a.run("state='play';activateKefir();activateKefir()");assert.equal(a.run('player.kefirCharges'),1);
 a.run("state='pause';for(let i=0;i<100;i++)update()");assert.equal(a.run('player.speedT'),480);a.run('respawnCheckpoint()');assert.equal(a.run('player.speedT'),0);assert.equal(a.run('player.kefirCharges'),1);
});
test('Devourer reaches twice the height and descends at about 70 percent of the old average speed',()=>{
 const a=game();a.run('startDevourerPreview();player.x=91*T;updateDevourer();for(let i=0;i<24;i++)updateDevourer()');assert.ok(Math.abs(a.run('54*T-devourerState.foot')-380)<.001);assert.equal(a.run('devourerState.fallTicks'),34);assert.ok(Math.abs((380/34)/(190/12)-.7)<.01);
 a.run('for(let i=0;i<33;i++)updateDevourer()');assert.equal(a.run('devourerState.phase'),'slam');a.run('updateDevourer()');assert.equal(a.run('devourerState.phase'),'landing');assert.equal(a.run('devourerState.foot'),54*32);
});
test('the service shelter fits the baker, blocks the boss and boules, and has a real solid roof',()=>{
 const a=game();a.run('startDevourerPreview();player.x=101*T;player.y=54*T-player.h;updateDevourer();');assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.run('tile(101,50)'),'#');assert.ok(a.run('devourerState.targetX+56<=100*T'));
 a.run('for(let i=0;i<150;i++)updateDevourer()');assert.equal(a.run('player.health'),3);assert.ok(a.run('devourerState.x+56<=100*T'));
 a.run('keys={jump:true};for(let i=0;i<35;i++)updatePlayer()');assert.ok(a.run('player.y>=51*T'));
});
test('upward shots can enter an open furnace through the legs, but closed armor stops them',()=>{
 for(const open of [false,true]){const a=game();a.run(`startDevourerPreview();devourerState.phase='${open?'recovery':'landing'}';devourerState.timer=${open?84:100};player.x=devourerState.x-player.w/2;keys={jump:true,shoot:true};for(let i=0;i<20;i++)update()`);assert.equal(a.run('devourerState.health<12'),open);}
});
