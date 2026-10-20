/* Original Crust Quest audition 01. No samples or third-party music.
 * 32 bars at 116 BPM: 66.21 seconds. Independent of game/simulation state. */
'use strict';
(function(root){
const BPM=116, STEP=60/BPM/2, LENGTH=256;
// Four eight-bar phrases: invitation, answer, moonlit bridge, homecoming.
const phrases=[
[76,0,79,81,79,76,74,0,72,0,76,79,74,0,71,74,76,0,79,83,81,0,79,76,74,76,79,0,74,0,71,0],
[79,0,83,86,84,83,81,0,79,0,76,79,81,0,79,76,77,0,81,84,83,81,79,0,74,0,78,81,79,0,74,0],
[81,0,84,88,86,0,84,81,79,0,83,86,84,83,79,0,77,0,81,84,83,0,81,77,78,0,81,86,84,81,78,0],
[76,0,79,81,83,0,81,79,84,0,83,79,76,0,74,0,77,0,81,79,76,0,74,71,74,0,79,83,84,0,0,0]
];
const chords=[[48,52,55,59],[45,48,52,55],[53,57,60,64],[43,47,50,57],
[48,52,55,59],[52,55,59,62],[53,57,60,64],[43,47,50,57],
[45,48,52,59],[52,55,59,62],[53,57,60,64],[50,54,57,60],
[48,52,55,59],[45,48,52,55],[53,57,60,64],[43,47,50,59]];
function score(step){
 const s=step%LENGTH,bar=Math.floor(s/8),beat=s%8,c=chords[Math.floor(bar/2)];
 const phrase=Math.floor(bar/8),p=phrases[phrase];
 const events=[]; const add=(n,d,v,k)=>events.push({n,d,v,k});
 // Motif breathes at eighth-note resolution, with a changed second statement.
 let n=p[Math.floor((s%64)/2)];
 if(s%2===0&&n){if(bar%8>=4&&phrase!==3&&s%8===4)n+=12;add(n,STEP*1.55,.068,'reed');}
 if(beat===0||beat===4)add(c[0],STEP*3.2,.115,'bass');
 if(beat===6)add(c[0]+7,STEP*1.5,.065,'bass');
 if(beat===0)c.slice(1).forEach(x=>add(x+12,STEP*6.8,.018,'pad'));
 if(beat===3||beat===7)add(c[1+(bar%3)]+24,STEP*1.5,.032,'bell');
 if(phrase===2&&beat===2)add(c[3]+12,STEP*2,.026,'bell');
 if(beat===0||beat===4)add(36,.11,.10,'kick');
 if(beat===2||beat===6)add(62,.07,.033,'brush');
 if(beat%2===1)add(90,.035,.018,'brush');
 return events;
}
function create(env={}){
 let ctx,bus,music,fx,limiter,timer=null,next=0,step=0,playing=false,hidden=false;
 let musicLevel=.75,fxLevel=.8,muted=false; const voices=new Set(),cooldown={};
 const interval=env.setInterval||setInterval,clear=env.clearInterval||clearInterval;
 function init(){if(ctx)return;ctx=new (env.AudioContext||root.AudioContext||root.webkitAudioContext)();
 bus=ctx.createGain();bus.gain.value=muted?0:.65;limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=10;limiter.ratio.value=4;bus.connect(limiter);limiter.connect(ctx.destination);
 music=ctx.createGain();fx=ctx.createGain();music.gain.value=musicLevel;fx.gain.value=fxLevel;music.connect(bus);fx.connect(bus);}
 function voice(n,t,d,v,k,out){
 if(voices.size>=64)return;
 const o=ctx.createOscillator(),g=ctx.createGain(),nodes=[o,g];let mod;
 const hz=440*2**((n-69)/12);o.type=k==='bass'?'triangle':'sine';o.frequency.setValueAtTime(hz,t);
 if(k==='reed'||k==='bell'||k==='pad'){
 mod=ctx.createOscillator();const mg=ctx.createGain();mod.frequency.value=hz*(k==='bell'?2:1);mg.gain.setValueAtTime(hz*(k==='bell'?1.8:.55),t);mg.gain.exponentialRampToValueAtTime(hz*.02,t+d);mod.connect(mg);mg.connect(o.frequency);nodes.push(mod,mg);mod.start(t);mod.stop(t+d+.03);}
 if(k==='kick'){o.frequency.setValueAtTime(135,t);o.frequency.exponentialRampToValueAtTime(43,t+d);}
 if(k==='brush'){o.type='triangle';o.frequency.setValueAtTime(n===90?6800:1800,t);}
 if(k==='spring'){o.frequency.setValueAtTime(hz*.6,t);o.frequency.exponentialRampToValueAtTime(hz*2,t+d*.45);o.frequency.exponentialRampToValueAtTime(hz,t+d);}
 if(k==='shot'){o.type='triangle';o.frequency.exponentialRampToValueAtTime(hz*.18,t+d);}
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(k==='pad'?.08:.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.auditionOutput=out;voices.add(o);
 o.onended=()=>{voices.delete(o);nodes.forEach(x=>x.disconnect());};o.start(t);o.stop(t+d+.03);
 }
 function tick(){if(!playing||hidden||!ctx||ctx.state!=='running')return;
 if(next<ctx.currentTime-.1)next=ctx.currentTime+.025; // never replay missed notes
 let count=0;while(next<ctx.currentTime+.12&&count++<8){score(step++).forEach(e=>voice(e.n,next,e.d,e.v,e.k,music));next+=STEP;}}
 function silence(){voices.forEach(o=>{if(o.auditionOutput===music){try{o.stop()}catch{}}});}
 async function play(){init();await ctx.resume();if(playing)return;playing=true;next=ctx.currentTime+.035;if(timer===null)timer=interval(tick,25);tick();}
 function stop(){playing=false;if(timer!==null){clear(timer);timer=null;}if(ctx){music.gain.cancelScheduledValues(ctx.currentTime);music.gain.setTargetAtTime(0,ctx.currentTime,.012);setTimeout(()=>{if(!playing)silence()},70);}step=0;}
 async function start(){init();music.gain.setTargetAtTime(musicLevel,ctx.currentTime,.02);await play();}
 async function effect(name){init();await ctx.resume();if(hidden)return;const t=ctx.currentTime+.005;
 if(t-(cooldown[name]??-99)<(name==='shoot'?.075:.09))return;cooldown[name]=t;
 if(name==='hit'||name==='death'){fx.gain.setTargetAtTime(fxLevel*.7,t,.005);fx.gain.setTargetAtTime(fxLevel,t+.25,.04);}
 const note=(n,d,v,k='reed',delay=0)=>voice(n,t+delay,d,v,k,fx);
 if(name==='jump')note(65,.16,.13,'spring');
 if(name==='pogo')note(52,.22,.15,'spring');
 if(name==='shoot')note(88,.065,.115,'shot');
 if(name==='land')note(39,.065,.13,'kick');
 if(name==='hit'){note(52,.18,.15,'shot');note(40,.16,.12,'reed',.06);}
 if(name==='death')[64,59,55,48].forEach((n,i)=>note(n,.25,.12,'reed',i*.12));
 if(name==='collect')[79,83,88].forEach((n,i)=>note(n,.24,.11,'bell',i*.065));
 }
 function levels(m,f){musicLevel=m;fxLevel=f;if(ctx){music.gain.setTargetAtTime(m,ctx.currentTime,.02);fx.gain.setTargetAtTime(f,ctx.currentTime,.02);}}
 function mute(value){muted=value;if(ctx)bus.gain.setTargetAtTime(muted?0:.65,ctx.currentTime,.015);}
 async function visibility(value){hidden=value;if(!ctx)return;if(value){await ctx.suspend();}else{next=ctx.currentTime+.035;await ctx.resume();}}
 return {start,stop,effect,levels,mute,visibility,status:()=>({playing,step,voices:voices.size,timer:timer!==null}),get context(){return ctx;}};
}
root.BakeryAudition={create,score,BPM,STEP,LENGTH};
if(typeof module!=='undefined')module.exports=root.BakeryAudition;
})(typeof window!=='undefined'?window:globalThis);
