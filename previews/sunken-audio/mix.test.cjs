const {test}=require('node:test'),assert=require('node:assert/strict');
const {createMix,create}=require('./underwater-mix.js');
class Param{constructor(){this.value=0;this.targets=[];}setTargetAtTime(v,t,s){this.targets.push([v,t,s]);}}
class Node{constructor(type){this.kind=type;this.connections=[];for(const p of ['gain','frequency','Q','delayTime'])this[p]=new Param;}connect(to){this.connections.push(to);}disconnect(){this.connections=[];}}
class Context{constructor(){this.currentTime=1;this.state='suspended';this.nodes=[];this.destination=new Node('destination');}node(k){const n=new Node(k);this.nodes.push(n);return n;}createGain(){return this.node('gain');}createBiquadFilter(){return this.node('filter');}createDelay(){return this.node('delay');}createOscillator(){return this.node('osc');}createDynamicsCompressor(){return this.node('compressor');}async resume(){this.state='running';}async suspend(){this.state='suspended';}}
test('underwater graph has bounded feedback, gentle filtering and smooth bypass',()=>{
 const ctx=new Context(),m=createMix(ctx),filters=ctx.nodes.filter(n=>n.kind==='filter');
 assert.equal(filters[0].type,'lowpass');assert.equal(filters[0].frequency.value,1050);
 assert.equal(filters[1].gain.value,2.3);
 const delay=ctx.nodes.find(n=>n.kind==='delay');assert.equal(delay.delayTime.value,.19);
 const feedback=ctx.nodes.find(n=>n.gain.value===.16);assert.ok(feedback.connections.includes(delay));
 m.set(false);assert.ok(ctx.nodes.some(n=>n.gain.targets.at(-1)?.[0]===0));
 for(const s of [0,64,128,160,192,240])m.depth(s);
 assert.deepEqual(filters[0].frequency.targets.map(t=>t[0]),[1350,1180,950,1050,1350,1350]);
 m.flush();m.flush();assert.equal(feedback.connections.length,0);
 m.resume();assert.deepEqual(feedback.connections,[delay]);m.resume();assert.deepEqual(feedback.connections,[delay]);
});
test('routing facade preserves native clock/lifecycle and routes only this audition',async()=>{
 let facade;const engine={create:env=>{facade=new env.AudioContext;return {context:facade};}};
 const r=create(engine,Context);assert.equal(r.player.context.destination,r.mix.input);
 assert.equal(facade.currentTime,1);await facade.resume();assert.equal(facade.state,'running');await facade.suspend();assert.equal(facade.state,'suspended');
 assert.equal(facade.createGain().kind,'gain');assert.equal(facade.createOscillator().kind,'osc');
});
