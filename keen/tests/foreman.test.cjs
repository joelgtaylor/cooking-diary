const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function arena(){const a=game();a.run('checkpointState.current=3;player.x=foremanGeometry().cx-110;player.y=54*T-player.h;player.ground=true;camera=2400;cameraY=1252;');return a;}
test('Foreman grants 60 full warning ticks before the low sweep and 120 recovery ticks after it',()=>{
 const a=arena();a.run('foremanState.timer=1;updateForeman()');assert.equal(a.run('foremanState.phase'),'windup');
 a.run('for(let i=0;i<59;i++)updateForeman()');assert.equal(a.run('player.health'),3);assert.equal(a.run('foremanState.timer'),1);
 a.run('updateForeman()');assert.equal(a.run('foremanState.phase'),'sweep');assert.equal(a.run('player.health'),3);
 a.run('for(let i=0;i<18;i++)updateForeman()');assert.equal(a.run('player.health'),2);assert.equal(a.run('foremanState.phase'),'recovery');assert.equal(a.run('foremanState.timer'),120);
 a.run('for(let i=0;i<119;i++)updateForeman()');assert.equal(a.run('foremanState.phase'),'recovery');
 a.run('updateForeman()');assert.equal(a.run('foremanState.phase'),'windup');
});
test('ordinary held jump clears the entire active sweep using real physics',()=>{
 const a=arena();a.run("foremanState.phase='windup';foremanState.timer=18;keys={jump:true};");
 for(let i=0;i<40;i++)a.run('update()');
 assert.equal(a.run('player.health'),3);assert.equal(a.run('foremanState.phase'),'recovery');
});
test('sweep damage occurs at most once per cycle and direction locks during the warning',()=>{
 const a=arena();a.run("foremanState.phase='sweep';foremanState.timer=18;updateForeman();player.inv=0;for(let i=0;i<17;i++)updateForeman()");assert.equal(a.run('player.health'),2);
 a.run("foremanState.phase='idle';foremanState.timer=1;updateForeman();player.x=foremanGeometry().cx+80;for(let i=0;i<78;i++)updateForeman()");
 assert.equal(a.run('foremanState.face'),-1);assert.equal(a.run('player.health'),2);
});
test('retreat, recovery and restarting cancel attacks; collected yeast survives checkpoint recovery',()=>{
 const a=arena();a.run("gems[0].got=true;collected=1;foremanState.phase='sweep';foremanState.timer=10;respawnCheckpoint()");
 assert.equal(a.run('foremanState.phase'),'idle');assert.equal(a.run('foremanState.timer'),90);assert.equal(a.run('collected'),1);assert.equal(a.run('gems[0].got'),true);
 a.run('for(let i=0;i<400;i++)updateForeman()');assert.equal(a.run('player.health'),3);assert.equal(a.run('foremanState.phase'),'idle');
 a.run("foremanState.phase='windup';restart()");assert.equal(a.run('foremanState.phase'),'idle');
 a.run('init(2)');assert.equal(a.run('foremanState'),null);
});
test('pause and render calls do not advance the Foreman attack clock',()=>{
 const a=arena();a.run("foremanState.phase='windup';foremanState.timer=30;state='pause';assets.foremanConcept.complete=true;assets.foremanConcept.naturalWidth=1331;");
 const before=a.run('JSON.stringify(foremanState)');a.run('for(let i=0;i<100;i++){updateForeman();drawForeman()}');assert.equal(a.run('JSON.stringify(foremanState)'),before);
});
test('Foreman simulation matches at 30, 60 and 120 render fps',()=>{
 let expected;
 for(const fps of [30,60,120]){
  const a=arena();a.run('draw=()=>{};diagnosticOverlay=()=>{};drawPhase3Map=()=>{};player.x=89*T;');
  a.run(`for(let i=0;i<=${fps*3};i++)loop(i*1000/${fps})`);
  const actual=a.run('JSON.stringify([foremanState,player.health,tick])');if(expected)assert.equal(actual,expected);else expected=actual;
 }
});
