const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const engine=require('./audio-engine.js');require('../sunken-audio/theme.js').install(engine);require('../sunken-audio/underwater-mix.js');
const {create}=require('./soundtrack.js');
class Param{constructor(){this.value=.1;}setValueAtTime(){}exponentialRampToValueAtTime(){}linearRampToValueAtTime(){}setTargetAtTime(){}cancelScheduledValues(){}}
class Node{constructor(ctx,kind){this.kind=kind;this.to=[];ctx.nodes.push(this);for(const k of ['gain','frequency','threshold','knee','ratio','Q','delayTime'])this[k]=new Param;}connect(n){this.to.push(n);}disconnect(){this.to=[];}start(){}stop(){}}
class Context{constructor(){this.currentTime=0;this.state='suspended';this.nodes=[];this.destination={};}createGain(){return new Node(this,'gain')}createOscillator(){return new Node(this,'osc')}createDynamicsCompressor(){return new Node(this,'compressor')}createBiquadFilter(){return new Node(this,'filter')}createDelay(){return new Node(this,'delay')}async resume(){this.state='running'}async suspend(){this.state='suspended'}}
test('integrated preview selects approved score, filters only music, and honors lifecycle',async()=>{
 let timers=0;const a=create({AudioContext:Context,setInterval:()=>{timers++;return 1},clearInterval:()=>timers--});
 await a.start('bakery2');assert.equal(a.status().theme,'sunken');assert.equal(timers,1);
 const nodes=a.context.nodes,bus=nodes[0],music=nodes[2],fx=nodes[3];
 assert.equal(fx.to[0],bus);assert.notEqual(music.to[0],bus);assert.ok(nodes.some(n=>n.kind==='filter'));
 a.waterDepth();a.pause();a.pause();assert.equal(timers,0);
 await a.start();assert.equal(timers,1);a.mute(true);assert.equal(timers,0);
 a.mute(false);await a.start();await a.visibility(true);assert.equal(timers,0);
 await a.visibility(false);assert.equal(a.status().playing,false);
 await a.start();a.stop();assert.equal(a.status().step,0);assert.equal(timers,0);
});
test('preview engine is generated from production with only the music routing hook',()=>{
 const original=fs.readFileSync(require.resolve('../../keen/audio-engine.js'),'utf8');
 assert.equal(fs.readFileSync(require.resolve('./audio-engine.js'),'utf8'),original.replace('music.connect(bus);','music.connect(env.musicDestination?env.musicDestination(ctx,bus):bus);'));
});
