const {test}=require('node:test'),assert=require('node:assert/strict');
const engine=require('../../keen/audio-engine.js');
const previous=Object.fromEntries(Object.entries(engine.themes).map(([id,t])=>[id,Array.from({length:t.length},(_,i)=>t.score(i))]));
const {theme,install}=require('./theme.js');
install(engine);
test('sunken score develops four phrases and loops with finite playable events',()=>{
 assert.ok(Math.abs(theme.length*60/theme.bpm/2-73.84615)<.001);
 const instruments=new Set(),sections=[];
 for(let i=0;i<theme.length;i++){
  assert.deepEqual(theme.score(i),theme.score(i+theme.length));
  for(const e of theme.score(i)){assert.ok(e.n>=24&&e.n<=96);assert.ok(e.d>.03&&e.d<3);assert.ok(e.v>0&&e.v<=.1);instruments.add(e.k);}
 }
 for(let start=0;start<256;start+=64)sections.push(JSON.stringify(Array.from({length:64},(_,i)=>theme.score(start+i))));
 assert.equal(new Set(sections).size,4);assert.ok(instruments.has('bell')&&instruments.has('drop'));
 assert.notDeepEqual(theme.score(0),engine.themes.bakery2.score(0));
});
test('audition registration leaves all three approved world scores intact',()=>{
 for(const [id,events] of Object.entries(previous))assert.deepEqual(Array.from({length:engine.themes[id].length},(_,i)=>engine.themes[id].score(i)),events);
 assert.equal(engine.themes.sunken,theme);
});
class Param{constructor(){this.value=.1;}setValueAtTime(){}exponentialRampToValueAtTime(){}linearRampToValueAtTime(){}setTargetAtTime(){}cancelScheduledValues(){}}
class Node{constructor(ctx){this.ctx=ctx;this.gain=new Param;this.frequency=new Param;for(const k of ['threshold','knee','ratio'])this[k]=new Param;}connect(){}disconnect(){}start(t){assert.ok(t>=this.ctx.currentTime);}stop(){}}
class Context{constructor(){this.currentTime=0;this.state='suspended';this.destination={};}createGain(){return new Node(this)}createOscillator(){return new Node(this)}createDynamicsCompressor(){return new Node(this)}async resume(){this.state='running'}async suspend(){this.state='suspended'}}
test('new theme uses existing transport bounds, scene switching and hidden-tab lifecycle',async()=>{
 let tick,timers=0;const a=engine.create({AudioContext:Context,setInterval:f=>{tick=f;timers++;return 1},clearInterval:()=>timers--});
 await a.start('sunken');await a.start('sunken');assert.equal(timers,1);assert.equal(a.status().theme,'sunken');
 a.context.currentTime=200;tick();assert.ok(a.status().step<10);assert.ok(a.status().voices<=48);
 await a.start('bakery2');await a.start('sunken');assert.equal(timers,1);
 await a.visibility(true);assert.equal(a.status().playing,false);assert.equal(timers,0);
 await a.visibility(false);assert.equal(a.status().playing,false);
 await a.start('sunken');a.mute(true);assert.equal(timers,0);assert.equal(a.status().playing,false);
 a.mute(false);await a.start('sunken');a.stop();assert.equal(a.status().step,0);assert.equal(timers,0);
});
test('arrangement creates a sparse opening, deep breakdown, full chorus and release',()=>{
 const count=(from,to)=>Array.from({length:to-from},(_,i)=>theme.score(from+i).length).reduce((a,b)=>a+b,0);
 assert.ok(count(64,96)>count(0,32));
 assert.ok(count(192,224)>count(128,160));
 assert.ok(count(224,240)>count(240,256));
 const kinds=(from,to,k)=>Array.from({length:to-from},(_,i)=>theme.score(from+i).filter(e=>e.k===k).length).reduce((a,b)=>a+b,0);
 assert.ok(kinds(192,224,'glass')>kinds(64,96,'glass'));
});
