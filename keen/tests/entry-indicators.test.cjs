const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function labels(trace){return trace.filter(c=>c[0]==='fillText').map(c=>c[1]);}
test('entry audition is opt-in and scoped to Bakery 1',()=>{
 const {run}=game();
 assert.equal(run('entryIndicatorsEnabled()'),false);
 run("window.location={search:'?indicators=pilot'}");
 assert.equal(run('entryIndicatorsEnabled()'),true);
 for(const stage of [2,3]){
  run('init('+stage+')');
  assert.equal(run('entryIndicatorsEnabled()'),false);
 }
 run("init(1);window.location.search='?indicators=pilotish'");
 assert.equal(run('entryIndicatorsEnabled()'),false);
});
test('pilot removes only the first culture badge and changes no collectible state',()=>{
 const {run,trace}=game();
 run("window.location={search:'?indicators=pilot'}");
 const before=run('JSON.stringify({gems,player,collected,checkpointState})');
 trace.length=0;run('drawYeastCollectibles()');
 assert.equal(labels(trace).filter(s=>s==='YEAST').length,4);
 assert.equal(run('JSON.stringify({gems,player,collected,checkpointState})'),before);
});
test('pilot checkpoint teaches save briefly; other flags keep their labels',()=>{
 const {run,trace}=game();
 run("window.location={search:'?indicators=pilot'};drawCheckpoints();checkpointState.current=0;tick+=1;");
 const before=run('JSON.stringify({player,checkpointState})');
 trace.length=0;run('drawCheckpoints()');
 assert.ok(labels(trace).includes('CHECKPOINT SAVED'));
 assert.equal(labels(trace).filter(s=>s==='CHECKPOINT').length,3);
 assert.equal(run('JSON.stringify({player,checkpointState})'),before);
 trace.length=0;run('tick+=121;drawCheckpoints()');
 assert.ok(!labels(trace).includes('CHECKPOINT SAVED'));
 assert.ok(!labels(trace).includes('SAVED'));
});
test('disabling audition retains all original culture and checkpoint badges',()=>{
 const {run,trace}=game();
 run("window.location={search:'?indicators=off'}");
 trace.length=0;run('drawYeastCollectibles();drawCheckpoints()');
 assert.equal(labels(trace).filter(s=>s==='YEAST').length,5);
 assert.equal(labels(trace).filter(s=>s==='CHECKPOINT').length,4);
});
