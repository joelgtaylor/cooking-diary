const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('workshop patroller and rooftop hopper stay in their arenas and the hopper survives below 620px',()=>{
 const a=game();a.run('player.x=0;var hopperMin=enemies[4].y,hopperMax=enemies[4].y;');
 for(let i=0;i<900;i++){
  a.run('updateEnemies();hopperMin=Math.min(hopperMin,enemies[4].y);hopperMax=Math.max(hopperMax,enemies[4].y)');
  assert.equal(a.run('enemies.filter(e=>e.encounter).every(e=>e.alive&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);
 }
 assert.ok(a.run('hopperMax-hopperMin>40'));assert.equal(a.run('hopperMax'),48*32-25);
 assert.equal(a.run('enemies[3].y'),54*32-25);
});
test('checkpoint recovery and the first roof landing remain clear of encounter bounds',()=>{
 const a=game();a.run('checkpointState.current=0;respawnCheckpoint();');
 for(let i=0;i<600;i++)a.run('updateEnemies()');
 assert.equal(a.run('player.health'),3);
 assert.ok(a.run('enemies[4].encounter.left>=14*T'));
 assert.ok(a.run('enemies[3].encounter.left>17*T'));
});
test('workshop patroller can be shot from the yeast approach without entering its patrol',()=>{
 const a=game();a.run('player.x=16*T;player.y=54*T-player.h;player.face=1;keys={shoot:true};');
 for(let i=0;i<55;i++)a.run('update()');
 assert.equal(a.run('enemies[3].alive'),false);assert.equal(a.run('player.health'),3);
 assert.ok(a.run('player.score>=100'));
});
test('roof hopper uses the existing pogo stomp and reward',()=>{
 const a=game();a.run('var e=enemies[4];e.vx=0;e.hopT=100;player.x=e.x;player.y=e.y-player.h+4;player.vy=2;pogoOn=true;updateEnemies();');
 assert.equal(a.run('enemies[4].alive'),false);assert.equal(a.run('player.vy'),-11);assert.equal(a.run('player.score'),150);
});
