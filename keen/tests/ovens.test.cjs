const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const {createHash}=require('node:crypto');
const hash=createHash('sha256').update('art/grand-ovens.png').digest('hex');
function setup(stage){
 const harness=game();harness.run(`init(${stage});assets.grandOvens.complete=true;assets.grandOvens.naturalWidth=288;assets.grandOvens.naturalHeight=176;`);return harness;
}
test('each oven uses its own art and rests on its existing supporting platform',()=>{
 for(let stage=1;stage<=3;stage++){
  const {run,trace}=setup(stage);trace.length=0;run('drawGrandOven()');
  const draw=trace.find(c=>c[0]==='drawImage'&&c[1]?.image===hash);
  assert.equal(draw[2],(stage-1)*96);
  assert.deepEqual(trace.find(c=>c[0]==='translate'),['translate',102*32-8,(stage===1?52:54)*32-115]);
 }
});
test('ready artwork preserves the structure, game state and completion trigger',()=>{
 const {run,trace}=setup(2);run('collected=4;tick=16;');trace.length=0;run('drawGrandOven()');
 const dormant=trace.find(c=>c[0]==='drawImage'&&c[1]?.image===hash);
 run('collected=5');const before=run('JSON.stringify({player,collected,state,checkpointState,unlocked})');
 trace.length=0;run('drawGrandOven()');
 assert.deepEqual(trace.find(c=>c[0]==='drawImage'&&c[1]?.image===hash),dormant);
 assert.equal(run('JSON.stringify({player,collected,state,checkpointState,unlocked})'),before);
 assert.ok(trace.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]==='#ffbb49'));
 run('player.x=102*T;player.y=54*T-player.h;updateWorldProgress();');assert.equal(run('state'),'clear');
});
test('unloaded ovens retain their original fallback',()=>{
 const {run,trace}=game();trace.length=0;run('drawGrandOven()');
 assert.equal(trace.filter(c=>c[0]==='drawImage').length,0);
 assert.equal(trace.filter(c=>c[0]==='fillRect').length,7);
});
