const {test}=require('node:test');
const assert=require('node:assert/strict');
const {physicsCases}=require('./physics-cases.cjs');
const {game}=require('./game-harness.cjs');
test('physics/combat match 4320 reviewed frames with the approved faster fire and upward aim',()=>{
 assert.deepEqual(physicsCases({originalLayout:true}),require('./physics-baseline.json'));
});
test('one-way platforms catch descending feet but permit upward passage',()=>{
 const {run}=game();
 run("map=Array.from({length:rows},()=>Array(cols).fill('.'));map[10][5]='=';");
 assert.equal(run('oneWayTop(5*T,315,325,29)'),320);
 assert.equal(run('oneWayTop(5*T,325,315,29)'),null);
 assert.equal(run('hit(5*T,10*T,29,38)'),false);
 run("map[10][5]='#'");assert.equal(run('hit(5*T,10*T,29,38)'),true);
});
test('ledge handling skips the rest of the frame and completes the climb at the original tick',()=>{
 const {run}=game();
 run('player.hang={x:100,y:300,timer:0,destX:135,top:320};player.inv=40;keys={shoot:true};tick=12;');
 run('update()');assert.equal(run('tick'),13);assert.equal(run('shots.length'),0);assert.equal(run('player.inv'),40);
 run('for(let i=0;i<11;i++)update();');assert.equal(run('player.hang'),null);
 assert.equal(run('player.x'),135);assert.equal(run('player.y'),282);assert.equal(run('player.ground'),true);
});
test('shield absorbs one hit; invulnerability blocks another; shooting consumes ammo',()=>{
 const {run}=game();
 run('player.shield=true;damage();');assert.equal(run('player.health'),3);assert.equal(run('player.shield'),false);
 run('damage()');assert.equal(run('player.health'),3);
 run('player.inv=0;damage()');assert.equal(run('player.health'),2);
 run('init(1);tick=12;keys={shoot:true};update()');assert.equal(run('player.ammo'),34);
});
