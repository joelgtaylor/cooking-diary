const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function chamber(){const a=game();a.run('init(2);enemies=[];checkpointState.current=1;camera=960;cameraY=650;');return a;}
function land(a,index,pogo=true){a.run(`player.x=(${[37,42,47][index]}*T);player.y=33*T-player.h;myceliumLanding(${pogo});`);}
function solve(a){for(const i of [0,1,2])land(a,i);a.run('for(let i=0;i<45;i++)updateMycelium()');}
test('ordinary landings do nothing; repeated pogo contacts on one cap count once',()=>{
 const a=chamber();land(a,0,false);assert.equal(a.run('myceliumState.progress'),0);land(a,0);land(a,0);assert.equal(a.run('myceliumState.progress'),1);land(a,1);assert.equal(a.run('myceliumState.progress'),2);
});
test('wrong order gives a harmless reset and permits another attempt',()=>{
 const a=chamber();land(a,0);land(a,2);assert.equal(a.run('myceliumState.progress'),0);assert.equal(a.run('player.health'),3);assert.ok(a.audio.effects.includes('relayReset'));solve(a);assert.equal(a.run('myceliumState.solved'),true);
});
test('gate stays solid during bloom then opens with an aligned fixed one-way cap',()=>{
 const a=chamber();for(const i of [0,1,2])land(a,i);
 assert.equal(a.run('tile(55,32)'), '#');assert.equal(a.run('tile(52,31)'),'.');
 a.run('for(let i=0;i<44;i++)updateMycelium()');assert.equal(a.run('tile(55,32)'),'#');
 a.run('updateMycelium()');assert.equal(a.run('tile(55,32)'),'.');assert.equal(a.run('tile(52,31)'),'M');
 assert.equal(a.run('oneWayTop(52*T,990,995,29)'),992);assert.equal(a.run('oneWayTop(52*T,995,990,29)'),null);
});
test('checkpoint recovery preserves solved roots and cultures; restart clears the puzzle',()=>{
 const a=chamber();land(a,0);a.run('gems[0].got=true;collected=1;respawnCheckpoint()');assert.equal(a.run('myceliumState.progress'),0);assert.equal(a.run('collected'),1);
 solve(a);a.run('respawnCheckpoint()');assert.equal(a.run('myceliumState.solved'),true);assert.equal(a.run('tile(55,32)'),'.');assert.equal(a.run('collected'),1);
 a.run('restart()');assert.equal(a.run('myceliumState.solved'),false);assert.equal(a.run('tile(55,32)'),'#');
 a.run('init(1)');assert.equal(a.run('myceliumState'),null);a.run('init(3)');assert.equal(a.run('myceliumState'),null);
});
test('pause and drawing do not advance bloom or consume gameplay randomness',()=>{
 const a=chamber();for(const i of [0,1,2])land(a,i);const before=a.run('JSON.stringify(myceliumState)');a.run("state='pause';Math.random=()=>{throw Error('render random')};for(let i=0;i<100;i++){updateMycelium();drawMycelium();}");assert.equal(a.run('JSON.stringify(myceliumState)'),before);
});
test('actual descending pogo physics activates each cap without modifying bounce velocity',()=>{
 const a=chamber();for(const [n,x] of [37,42,47].entries()){
  a.run(`player.x=${x}*T;player.y=33*T-player.h-3;player.vy=5;player.ground=false;pogoOn=true;keys={};update()`);
  assert.equal(a.run('myceliumState.progress'),n+1);assert.equal(a.run('player.vy'),-12.3);
 }
});
test('root gate blocks jump, pogo and ledge movement before solve, and exit is reachable after',()=>{
 const a=chamber();
 for(const pogo of [false,true]){a.run(`player.x=53*T;player.y=33*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=${pogo};keys={right:true,jump:true};`);a.run('for(let i=0;i<100;i++)updatePlayer()');assert.ok(a.run('player.x+player.w')<=55*32+1);}
 solve(a);a.run('player.x=52*T;player.y=31*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=false;keys={right:true};for(let i=0;i<55;i++)updatePlayer()');
 assert.ok(a.run('player.x')>56*32);assert.ok(a.run('player.y+player.h')<=35*32);
});

test('grotto edits are local; cultures, oven, and outside map cells remain unchanged',()=>{
 const a=chamber(),b=game({}, {originalLayout:true});b.run('init(2)');
 const am=a.run('map'),bm=b.run('map');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(x>=32&&x<64&&y>=20&&y<39,`${x},${y}`);
 for(const expr of ['JSON.stringify(gems)','JSON.stringify(powerups)','JSON.stringify(currentVerticalLayout().oven)'])assert.equal(a.run(expr),b.run(expr));
});
test('existing movement can enter the chamber and pogo through all three switches',()=>{
 const a=chamber();a.run('player.x=31*T;player.y=38*T-player.h;player.ground=true;keys={jump:true,right:true};');
 let entered=false;
 for(let i=0;i<100;i++){a.run('updatePlayer()');if(a.run('player.x>33*T&&player.y+player.h<=35*T+.1')){entered=true;break;}}
 assert.ok(entered,'entrance');
 a.run('player.x=34*T;player.y=35*T-player.h;player.vx=0;player.vy=0;player.ground=true;togglePogo();');
 for(const [i,target] of [37,42,47].entries()){
  for(let n=0;n<180&&a.run('myceliumState.progress')<=i;n++)a.run(`keys={right:player.x<${target}*T-5,left:player.x>${target}*T+5};update()`);
  assert.equal(a.run('myceliumState.progress'),i+1,`switch ${i}`);
 }
});
