const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createFixedStepClock}=require('../timing.js');
const {game}=require('./game-harness.cjs');
test('30, 60 and 120Hz rendering all advance 60 simulation ticks per second',()=>{
 for(const fps of [30,60,120]){
  const clock=createFixedStepClock();let ticks=0;
  for(let i=0;i<=fps*2;i++)clock.advance(i*1000/fps,()=>ticks++);
  assert.equal(ticks,120,`${fps}fps`);
 }
});
test('catch-up is bounded and clock reset discards hidden-tab time',()=>{
 const clock=createFixedStepClock();let ticks=0;clock.advance(0,()=>ticks++);
 assert.equal(clock.advance(10000,()=>ticks++),8);
 clock.reset();assert.equal(clock.advance(20000,()=>ticks++),0);
 assert.equal(clock.advance(20000+1000/60,()=>ticks++),1);
 assert.equal(ticks,9);
});
test('actual game movement, jumping and camera match at 30, 60 and 120fps',()=>{
 let reference;
 for(const fps of [30,60,120]){
  const {run,audio}=game();
  run('draw=()=>{};diagnosticOverlay=()=>{};drawPhase3Map=()=>{};keys={right:true,jump:true};');
  run(`for(let i=0;i<=${fps*2};i++)loop(i*1000/${fps});`);
  assert.equal(run('tick'),120);
  const result=JSON.parse(run('JSON.stringify({player,camera,cameraY,state,collected})'));
  const current={result,sounds:audio.effects};
  if(reference)assert.deepEqual(current,reference,`${fps}fps`);else reference=current;
 }
});
test('hidden rendering does not advance play and returning does not fast-forward',()=>{
 const {run}=game();run('draw=()=>{};diagnosticOverlay=()=>{};drawPhase3Map=()=>{};loop(0);document.hidden=true;loop(10000);');
 assert.equal(run('tick'),0);
 run('document.hidden=false;loop(20000);');assert.equal(run('tick'),0);
 run('loop(20000+1000/60);');assert.equal(run('tick'),1);
});
