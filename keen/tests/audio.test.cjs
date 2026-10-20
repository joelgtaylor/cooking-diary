const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {create,themes}=require('../audio-engine.js');
const approved=require('../../previews/audio/audition.js');
class Param{
 constructor(){this.value=0;this.events=[];}
 setValueAtTime(v,t){this.events.push(['set',v,t]);}
 exponentialRampToValueAtTime(v,t){this.events.push(['exp',v,t]);}
 linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);}
 setTargetAtTime(v,t,c){this.events.push(['target',v,t,c]);}
 cancelScheduledValues(){} cancelAndHoldAtTime(){}
}
class Node{
 constructor(ctx){this.ctx=ctx;this.gain=new Param;this.frequency=new Param;this.threshold=new Param;this.knee=new Param;this.ratio=new Param;this.ended=false;ctx.nodes.push(this);}
 connect(){}disconnect(){this.disconnected=true;}
 start(t){assert.ok(t>=this.ctx.currentTime,'must not start stale notes');this.ctx.starts++;}
 stop(t=this.ctx.currentTime){this.end=t;}
}
class Context{
 constructor(){this.currentTime=0;this.state='suspended';this.destination={};this.starts=0;this.nodes=[];this.oscillators=[];}
 createGain(){return new Node(this);}createDynamicsCompressor(){return new Node(this);}
 createOscillator(){const n=new Node(this);this.oscillators.push(n);return n;}
 async resume(){this.state='running';}async suspend(){this.state='suspended';}
 advance(t){this.currentTime=t;for(const n of this.oscillators)if(!n.ended&&n.end<=t){n.ended=true;n.onended?.();}}
}
function setup(AudioContext=Context){
 let cb=null,count=0;
 const a=create({AudioContext,setInterval:f=>{assert.equal(count,0);cb=f;count++;return 1;},clearInterval:()=>{count--;cb=null;}});
 return {a,tick:()=>cb?.(),timers:()=>count};
}
test('production scores exactly preserve every approved note and instrument',()=>{
 for(const [id,t] of Object.entries(themes)){
  assert.equal(t.bpm,approved.themes[id].bpm);assert.equal(t.length,approved.themes[id].length);
  for(let i=0;i<t.length;i++)assert.equal(JSON.stringify(t.score(i)),JSON.stringify(approved.themes[id].score(i)));
 }
});
test('world switching and repeated starts keep one scheduler',async()=>{
 const x=setup();
 for(const id of ['bakery1','bakery1','bakery2','bakery3','bakery1']){
  await x.a.start(id);assert.equal(x.a.status().theme,id);assert.equal(x.timers(),1);
  x.a.context.advance(x.a.context.currentTime+.3);x.tick();
 }
 x.a.stop();assert.equal(x.timers(),0);assert.equal(x.a.status().step,0);
});
test('pause preserves position, releases old notes and resume cannot catch up stale music',async()=>{
 const x=setup();await x.a.start();const s=x.a.status().step;
 x.a.pause();assert.equal(x.timers(),0);assert.equal(x.a.status().step,s);
 x.a.context.advance(300);assert.equal(x.a.status().voices,0);
 await x.a.start();assert.ok(x.a.status().step<=s+1);assert.equal(x.timers(),1);x.a.stop();
});
test('mute blocks effects, releases voices and unmute does not create a second timer',async()=>{
 const x=setup();await x.a.start();x.a.mute(true);
 const n=x.a.context.starts;await x.a.effect('shoot');await x.a.start();assert.equal(x.a.context.starts,n);
 assert.equal(x.timers(),0);x.a.context.advance(1);assert.equal(x.a.status().voices,0);
 x.a.mute(false);await x.a.start();assert.equal(x.timers(),1);x.a.stop();
});
test('hidden tabs suspend, suppress effects and leave no lingering voices',async()=>{
 const x=setup();await x.a.start();await x.a.visibility(true);
 const n=x.a.context.starts;await x.a.effect('collect');assert.equal(x.a.context.starts,n);
 assert.equal(x.a.context.state,'suspended');assert.equal(x.timers(),0);
 x.a.context.advance(100);assert.equal(x.a.status().voices,0);
 await x.a.visibility(false);await x.a.start();assert.equal(x.timers(),1);x.a.stop();
});
test('stop cancels a start awaiting browser resume',async()=>{
 let resolve;
 class DeferredContext extends Context{resume(){return new Promise(r=>{resolve=()=>{this.state='running';r();};});}}
 const x=setup(DeferredContext),pending=x.a.start();x.a.stop();resolve();await pending;
 assert.equal(x.timers(),0);assert.equal(x.a.status().playing,false);
});
test('effect cooldowns, relay pitches and voice reserve remain bounded',async()=>{
 const x=setup();await x.a.start();await x.a.effect('shoot');const n=x.a.context.starts;
 await x.a.effect('shoot');assert.equal(x.a.context.starts,n);
 for(const [i,name] of ['relay1','relay2','relay3'].entries()){
  const before=x.a.context.oscillators.length;await x.a.effect(name);
  const carrier=x.a.context.oscillators[before];
  assert.equal(carrier.frequency.events[0][1],440*2**(([72,76,79][i]-69)/12));
 }
 for(let i=0;i<100;i++){x.a.context.currentTime+=.1;await x.a.effect('pogo');}
 assert.ok(x.a.status().voices<=64);
 x.a.stop();
});
test('all existing gameplay effect names have synthesized responses',async()=>{
 const x=setup();await x.a.start();x.a.pause();x.a.context.advance(2);
 for(const name of ['jump','pogo','shoot','collect','hit','enemy','climb','win','relay1','relay2','relay3','relayReset']){
  const before=x.a.context.starts;await x.a.effect(name);assert.ok(x.a.context.starts>before,name);
  x.a.context.advance(x.a.context.currentTime+2);
 }
 assert.equal(x.timers(),0);
});
function facade(){
 const calls=[],listeners={},button={textContent:''},doc={hidden:false,getElementById:()=>button,addEventListener:(n,f)=>listeners[n]=f};
 const engine={mute:v=>calls.push(['mute',v]),visibility:async v=>{calls.push(['hidden',v]);},pause:()=>calls.push(['pause']),stop:()=>calls.push(['stop']),start:async id=>{calls.push(['start',id]);},effect:async n=>{calls.push(['effect',n]);}};
 let created=0;const win={CrustSoundtrack:{create(){created++;return engine;}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../audio.js'),'utf8'),{window:win,document:doc,console});
 return {a:win.AudioKit,calls,doc,button,listeners,created:()=>created};
}
test('facade has no autoplay and world selection does not initialize audio',()=>{
 const x=facade();x.a.scene(2,'play');assert.equal(x.created(),0);
 x.a.start();assert.equal(x.created(),1);assert.ok(x.calls.some(c=>c[0]==='start'&&c[1]==='bakery2'));
});
test('facade pauses for overlays, resumes current world, and resets on mission init',()=>{
 const x=facade();x.a.start();x.calls.length=0;
 for(const state of ['pause','codex','dialogue','clear','win']){x.a.scene(1,state);assert.equal(x.calls.at(-1)[0],'pause');}
 x.a.scene(3,'play');assert.equal(x.calls.at(-1)[1],'bakery3');
 x.a.reset(3);assert.ok(x.calls.some(c=>c[0]==='stop'));assert.equal(x.calls.at(-1)[1],'bakery3');
 const count=x.calls.length;x.a.scene(3,'play');assert.equal(x.calls.length,count);
});
test('facade master mute suppresses effects and visibility never unlocks autoplay',()=>{
 const x=facade();x.doc.hidden=true;x.listeners.visibilitychange();x.doc.hidden=false;x.listeners.visibilitychange();assert.equal(x.created(),0);
 x.a.start();x.a.toggle();assert.equal(x.button.textContent,'♫ Sound: OFF');x.calls.length=0;x.a.effect('shoot');assert.equal(x.calls.length,0);
 x.a.toggle();assert.equal(x.button.textContent,'♫ Sound: ON');
 x.doc.hidden=true;x.listeners.visibilitychange();assert.equal(x.calls.at(-1)[0],'pause');
});
test('audio failure never throws into game input',()=>{
 const doc={hidden:false,getElementById:()=>null,addEventListener(){}},win={};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../audio.js'),'utf8'),{window:win,document:doc,console:{warn(){}}});
 win.AudioKit.start();win.AudioKit.effect('shoot');win.AudioKit.scene(2,'play');win.AudioKit.toggle();win.AudioKit.toggle();
});
