const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('completion animation uses presentation time while simulation is frozen',()=>{
 const {run,trace}=game();run("state='clear';presentationNow=100;drawHUD();");
 const tick=run('tick');trace.length=0;run('presentationNow=1300;drawHUD();');
 assert.equal(run('tick'),tick);assert.equal(run('bakeRevealProgress().age'),1200);
 assert.ok(trace.some(x=>x[0]==='fillText'&&x[1]==='RECIPE UNLOCKED'));
 assert.ok(trace.some(x=>x[0]==='fillText'&&x[1]==='Artisan Sourdough Bread'));
});
test('completion rendering does not grant rewards, mutate progression or gate immediate advance',()=>{
 const {run,enter}=game();
 for(let n=1;n<=3;n++){
  run(`init(${n});state='clear';`);
  const before=run('JSON.stringify([player,unlocked,best,collected,checkpointState])');
  run('drawHUD();presentationNow+=1800;drawHUD();');
  assert.equal(run('JSON.stringify([player,unlocked,best,collected,checkpointState])'),before);
  enter();assert.equal(run('state'),n<3?'play':'win');
 }
 run('drawHUD()');assert.equal(run('bakeRevealProgress().age'),0);
});
test('reduced motion shows the completed reveal without steam animation',()=>{
 const {run,trace}=game();run("window.matchMedia=()=>({matches:true});state='clear';");
 trace.length=0;run('drawHUD()');const first=JSON.stringify(trace);trace.length=0;
 run('presentationNow=9000;drawHUD()');assert.equal(JSON.stringify(trace),first);
 assert.equal(run('bakeRevealProgress().age'),2400);
});
