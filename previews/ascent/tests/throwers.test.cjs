const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function encounter(){const a=game();a.run("var thrower=enemies.find(e=>e.type==='thrower');player.x=26*T;player.y=40*T-player.h;camera=600;cameraY=1000;");return a;}
test('thrower gives a full wind-up before a slow direction-locked shot',()=>{
 const a=encounter();a.run('thrower.attackT=1;updateThrower(thrower)');
 assert.equal(a.run('thrower.windup'),36);assert.equal(a.run('enemyShots.length'),0);
 a.run('for(let i=0;i<35;i++)updateThrower(thrower)');assert.equal(a.run('enemyShots.length'),0);
 a.run('player.x=31*T;updateThrower(thrower)');assert.equal(a.run('enemyShots.length'),1);
 assert.equal(a.run('enemyShots[0].vx'),-2.3);assert.equal(a.run('thrower.attackT'),150);
});
test('thrower stays quiet offscreen, out of range or behind a solid wall',()=>{
 for(const setup of ['camera=0','player.x=0',"map[39][28]='#'"]){
  const a=encounter();a.run(setup+';thrower.attackT=1;for(let i=0;i<300;i++)updateThrower(thrower)');
  assert.equal(a.run('enemyShots.length'),0);assert.equal(a.run('thrower.windup'),0);
 }
});
test('dough shots hit once, can be jumped over, and stop at walls',()=>{
 const a=encounter();
 const seed='enemyShots=[{x:player.x-8,y:player.y+18,w:9,h:9,vx:2.3,life:150,owner:thrower}]';
 a.run(seed+';updateEnemyShots()');assert.equal(a.run('player.health'),2);assert.equal(a.run('enemyShots.length'),0);
 a.run('player.inv=0;'+seed+';player.y-=50;updateEnemyShots()');assert.equal(a.run('player.health'),2);
 a.run("enemyShots=[{x:28*T,y:39*T,w:9,h:9,vx:2.3,life:150,owner:thrower}];map[39][28]='#';updateEnemyShots()");assert.equal(a.run('enemyShots.length'),0);
});
test('defeating thrower, checkpoint recovery and restart clear hostile shots',()=>{
 const a=encounter();const seed='enemyShots=[{x:thrower.x-20,y:thrower.y,w:9,h:9,vx:-2.3,life:150,owner:thrower}]';
 a.run(seed+';thrower.alive=false;updateEnemyShots()');assert.equal(a.run('enemyShots.length'),0);
 a.run(seed+';respawnCheckpoint()');assert.equal(a.run('enemyShots.length'),0);
 a.run(seed+';restart()');assert.equal(a.run('enemyShots.length'),0);
});
test('thrower remains stationary and can be defeated with ordinary player shots',()=>{
 const a=encounter();const x=a.run('thrower.x');a.run('keys={shoot:true};player.face=1;');
 for(let i=0;i<60;i++)a.run('update()');
 assert.equal(a.run('thrower.alive'),false);assert.equal(a.run('thrower.x'),x);assert.ok(a.run('player.score>=100'));
});
