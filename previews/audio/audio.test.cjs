const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,score,STEP,LENGTH}=require('./audition.js');
class Param{constructor(){this.value=0;}setValueAtTime(){}exponentialRampToValueAtTime(){}setTargetAtTime(){}cancelScheduledValues(){}}
class Node{constructor(ctx){this.ctx=ctx;this.gain=new Param;this.frequency=new Param;for(const n of ['threshold','knee','ratio'])this[n]=new Param;}connect(){}disconnect(){}start(t){assert.ok(t>=this.ctx.currentTime);this.ctx.starts++;}stop(){}}
class Context{constructor(){this.currentTime=0;this.state='suspended';this.destination={};this.starts=0;}createGain(){return new Node(this)}createDynamicsCompressor(){return new Node(this)}createOscillator(){return new Node(this)}async resume(){this.state='running'}async suspend(){this.state='suspended'}}
function setup(){let cb,timers=0;const a=create({AudioContext:Context,setInterval:f=>{cb=f;timers++;return 1},clearInterval:()=>timers--});return {a,tick:()=>cb(),timers:()=>timers};}
test('score is a finite 66-second seamless cycle with four distinct sections',()=>{assert.ok(Math.abs(STEP*LENGTH-66.2069)<.001);for(let i=0;i<LENGTH;i++){assert.deepEqual(score(i),score(i+LENGTH));for(const e of score(i))assert.ok(Number.isFinite(e.n)&&e.d>0&&e.v>0);}assert.notDeepEqual(score(0),score(64));assert.notDeepEqual(score(64),score(128));});
test('repeated starts create one timer; stale clock never bursts or schedules past notes',async()=>{const x=setup();await x.a.start();await x.a.start();assert.equal(x.timers(),1);x.a.context.currentTime=300;x.tick();assert.ok(x.a.status().step<10);assert.ok(x.a.status().voices<=64);x.a.stop();assert.equal(x.timers(),0);assert.equal(x.a.status().step,0);});
test('hidden tab suspends; restart remains bounded; effects have cooldown and voice cap',async()=>{const x=setup();await x.a.start();await x.a.visibility(true);const s=x.a.status().step;x.tick();assert.equal(x.a.status().step,s);await x.a.visibility(false);await x.a.effect('shoot');const n=x.a.context.starts;await x.a.effect('shoot');assert.equal(x.a.context.starts,n);for(let i=0;i<200;i++){x.a.context.currentTime+=.1;await x.a.effect('pogo')}assert.ok(x.a.status().voices<=64);x.a.mute(true);x.a.mute(false);x.a.stop();await x.a.start();assert.equal(x.timers(),1);x.a.stop();});
const {themes}=require('./audition.js');
test('world themes have distinct meters, instruments and developed finite cycles',()=>{
 const palettes=[];
 for(const [id,t] of Object.entries(themes)){
  const duration=t.length*60/t.bpm/2;assert.ok(duration>=60&&duration<=90,id);
  const instruments=new Set;
  for(let i=0;i<t.length;i++){
   assert.deepEqual(t.score(i),t.score(i+t.length));
   for(const e of t.score(i)){assert.ok(Number.isFinite(e.n)&&e.n>=0&&e.n<=127);assert.ok(e.d>0&&e.v>0&&e.v<=.2);instruments.add(e.k);}
  }
  palettes.push([...instruments].sort().join(','));
 }
 assert.equal(new Set(palettes).size,3);
 assert.equal(themes.bakery2.length,32*6);assert.equal(themes.bakery3.length,40*8);
});
test('switching all world themes retains one scheduler and uses the selected tempo',async()=>{
 const x=setup();
 for(const id of ['bakery1','bakery2','bakery3','bakery2','bakery1']){
  await x.a.start(id);assert.equal(x.a.status().theme,id);assert.equal(x.timers(),1);
  x.a.context.currentTime+=.3;x.tick();assert.ok(x.a.status().voices<=64);
 }
 await assert.rejects(x.a.start('missing'),/Unknown theme/);x.a.stop();assert.equal(x.timers(),0);
});
