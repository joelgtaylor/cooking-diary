/* Crust Quest production audio engine.
 * Scores and instrument settings copied from the approved three-world audition.
 * Original compositions; no external samples. Audio-clock transport, never simulation timing.
 */
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
// Independently composed world scores. All scheduling stays on the audio clock.
const cavernMelodies=[
 [74,0,77,81,0,79,76,0,74,0,72,76,79,0,77,0,74,0,69,72,76,0,77,81],
 [81,0,84,83,0,79,77,0,76,0,79,83,86,0,84,81,79,0,77,76,74,0,0,0],
 [77,0,81,84,0,88,86,0,84,0,81,79,83,0,86,84,81,0,79,77,76,0,0,0],
 [74,0,77,81,0,83,84,0,81,0,79,76,77,0,74,72,69,0,72,76,74,0,0,0]
];
const cavernChords=[[38,45,53,60],[41,48,55,62],[43,50,59,65],[38,45,52,60],
 [45,52,55,62],[43,50,59,65],[41,48,55,64],[38,45,53,60],
 [41,48,57,64],[48,55,59,65],[43,50,59,64],[45,52,55,62],
 [38,45,53,60],[43,50,59,65],[45,52,55,62],[38,45,52,60]];
function cavernScore(step){
 const s=step%192,bar=Math.floor(s/6),b=s%6,section=Math.floor(bar/8),c=cavernChords[Math.floor(bar/2)];
 const ev=[],add=(n,d,v,k)=>ev.push({n,d,v,k}),unit=60/90/2;
 // Lilting 6/8, open D Dorian harmony. Space between phrases leaves room for relays.
 if(s%2===0){let n=cavernMelodies[section][Math.floor(s%48/2)];if(n)add(n+(bar%8>=4&&b===4?12:0),unit*2.6,.073,'glass');}
 if(b===0){add(c[0],unit*5.4,.10,'bass');c.slice(1).forEach(n=>add(n+12,unit*5.5,.021,'mist'));}
 if(b===3)add(c[1],unit*2.2,.048,'pluck');
 if((b===1||b===5)&&bar%2===1)add(c[2]+24,unit*2,.027,'drop');
 if(b===0&&bar%2===0)add(36,.14,.055,'kick');
 if(b===3)add(90,.035,.012,'brush');
 return ev;
}
const clockMelodies=[
 [64,0,67,71,0,74,71,67,66,0,69,72,71,0,67,66,64,67,71,0,76,74,71,67,66,0,63,66,71,0,0,0],
 [71,0,74,78,76,0,74,71,72,0,76,79,78,76,72,0,69,0,72,76,74,0,72,69,71,0,75,78,76,75,71,0],
 [67,0,71,74,76,0,79,78,76,0,74,71,72,0,76,79,78,0,76,74,71,0,69,67,66,0,69,72,71,0,0,0],
 [64,0,0,71,0,67,0,66,64,0,67,0,71,0,74,0,72,0,0,69,0,66,0,64,63,0,66,0,71,0,0,0],
 [76,0,74,71,67,0,71,74,76,0,79,78,76,74,71,0,72,0,76,74,71,0,69,67,66,0,63,66,64,0,0,0]
];
const clockChords=[[40,47,55,59],[40,47,54,59],[48,55,59,64],[47,54,57,63],
 [40,47,55,62],[48,55,59,64],[45,52,60,64],[47,54,57,63],
 [43,50,59,62],[48,55,59,64],[45,52,60,64],[47,54,57,63],
 [40,47,55,59],[40,47,54,59],[41,48,57,64],[47,54,57,63],
 [40,47,55,59],[43,50,59,62],[48,55,57,64],[47,54,57,63]];
function clockScore(step){
 const s=step%320,bar=Math.floor(s/8),b=s%8,section=Math.floor(bar/8),c=clockChords[Math.floor(bar/2)],unit=60/140/2;
 const ev=[],add=(n,d,v,k)=>ev.push({n,d,v,k});
 const n=clockMelodies[section][Math.floor(s%64/2)];
 if(s%2===0&&n)add(n,unit*(section===3?1.2:1.6),.066,'brass');
 // Alternating piston bass and interlocking gear teeth; section four strips back.
 if(b%2===0||b===7)add(c[0]+(b===4?12:b===7?7:0),unit*.8,.105,'piston');
 if(b===1||b===5)add(c[1]+12,unit*.7,.031,'pluck');
 if(b===0)c.slice(1).forEach(n=>add(n,unit*(section===3?2:5),.024,'pad'));
 if((b===3||b===7)&&section!==3)add(c[2]+12,unit*.8,.024,'metal');
 if(b===0||b===4)add(36,.10,.105,'kick');
 if(b===2||b===6)add(57,.065,.040,'metal');
 if(b%2===1)add(90,.024,.013,'brush');
 if(bar%8===7&&b===7)add(69,.06,.028,'metal');
 return ev;
}
const themes={
 bakery1:{title:'Moonlit Bakery',bpm:116,length:256,score},
 bakery2:{title:'Fungal Caverns',bpm:90,length:192,score:cavernScore},
 bakery3:{title:'Clockwork Ovens',bpm:140,length:320,score:clockScore}
};

function create(env={}){
 let ctx,bus,music,fx,limiter,timer=null,next=0,step=0,playing=false,hidden=false,theme=themes.bakery1;
 let musicLevel=.75,fxLevel=.8,muted=false,wanted=false,generation=0;
 const voices=new Set(),cooldown={};
 const interval=env.setInterval||setInterval,clear=env.clearInterval||clearInterval;
 function init(){if(ctx)return;ctx=new (env.AudioContext||root.AudioContext||root.webkitAudioContext)();
  bus=ctx.createGain();bus.gain.value=muted?0:.65;
  limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=10;limiter.ratio.value=4;
  bus.connect(limiter);limiter.connect(ctx.destination);
  music=ctx.createGain();fx=ctx.createGain();music.gain.value=musicLevel;fx.gain.value=fxLevel;music.connect(env.musicDestination?env.musicDestination(ctx,bus):bus);fx.connect(bus);
 }
 function voice(n,t,d,v,k,out){
 if(voices.size>=(out===music?48:64))return;
 const o=ctx.createOscillator(),g=ctx.createGain(),nodes=[o,g];let mod;
 const hz=440*2**((n-69)/12);o.type=k==='bass'?'triangle':'sine';o.frequency.setValueAtTime(hz,t);
 if(['reed','bell','pad','glass','mist','pluck','drop','brass','metal','piston'].includes(k)){
 mod=ctx.createOscillator();const mg=ctx.createGain();const ratios={bell:2,glass:3,mist:1,pluck:2,drop:2.76,brass:1,metal:3.51,piston:1};
 const indices={bell:1.8,glass:1.15,mist:.2,pluck:.7,drop:1.4,brass:1.25,metal:2.2,piston:.8};
 mod.frequency.value=hz*(ratios[k]||1);mg.gain.setValueAtTime(hz*(indices[k]??.55),t);mg.gain.exponentialRampToValueAtTime(hz*.02,t+d);mod.connect(mg);mg.connect(o.frequency);nodes.push(mod,mg);mod.start(t);mod.stop(t+d+.03);}
 if(k==='kick'){o.frequency.setValueAtTime(135,t);o.frequency.exponentialRampToValueAtTime(43,t+d);}
 if(k==='brush'){o.type='triangle';o.frequency.setValueAtTime(n===90?6800:1800,t);}
 if(k==='spring'){o.frequency.setValueAtTime(hz*.6,t);o.frequency.exponentialRampToValueAtTime(hz*2,t+d*.45);o.frequency.exponentialRampToValueAtTime(hz,t+d);}
 if(k==='shot'){o.type='triangle';o.frequency.exponentialRampToValueAtTime(hz*.18,t+d);}
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(['pad','mist'].includes(k)?.08:.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.auditionOutput=out;o.auditionGain=g;o.auditionNodes=nodes;voices.add(o);
 o.onended=()=>{voices.delete(o);nodes.forEach(x=>x.disconnect());};o.start(t);o.stop(t+d+.03);
 }

 function tick(){
  if(!playing||hidden||muted||!ctx||ctx.state!=='running')return;
  if(next<ctx.currentTime+.005)next=ctx.currentTime+.025;
  let count=0;
  while(next<ctx.currentTime+.12&&count++<8){
   theme.score(step++).forEach(e=>voice(e.n,next,e.d,e.v,e.k,music));
   next+=60/theme.bpm/2;step%=theme.length;
  }
 }
 // Fade a snapshot of existing voices; a later start must not revive their tails.
 function release(all=false){
  if(!ctx)return;
  for(const o of [...voices]){
   if(!all&&o.auditionOutput!==music)continue;
   const gain=o.auditionGain.gain;
   if(typeof gain.cancelAndHoldAtTime==='function')gain.cancelAndHoldAtTime(ctx.currentTime);
   else {gain.cancelScheduledValues(ctx.currentTime);gain.setValueAtTime(Math.max(.0001,gain.value||.0001),ctx.currentTime);}
   gain.linearRampToValueAtTime(.0001,ctx.currentTime+.015);
   try{o.stop(ctx.currentTime+.015);}catch{}
   for(const node of o.auditionNodes)if(node!==o&&typeof node.stop==='function'){try{node.stop(ctx.currentTime+.015);}catch{}}
  }
 }
 function pause(){wanted=false;generation++;playing=false;if(timer!==null){clear(timer);timer=null;}release();}
 function stop(){pause();step=0;}
 async function start(id='bakery1'){
  if(!themes[id])throw new Error('Unknown theme');
  if(theme!==themes[id]){stop();theme=themes[id];}
  if(hidden||muted)return;
  init();wanted=true;const token=++generation;
  await ctx.resume();
  if(token!==generation||!wanted||hidden||muted||playing)return;
  playing=true;next=ctx.currentTime+.035;
  if(timer===null)timer=interval(tick,25);
  tick();
 }
 async function effect(name){
  if(hidden||muted)return;
  init();await ctx.resume();if(hidden||muted||ctx.state!=='running')return;
  const t=ctx.currentTime+.005;
  const delay=name==='shoot'?.075:name==='win'?.6:.09;
  if(t-(cooldown[name]??-99)<delay)return;cooldown[name]=t;
  const note=(n,d,v,k='reed',offset=0)=>voice(n,t+offset,d,v,k,fx);
  if(name==='jump')note(65,.16,.13,'spring');
  if(name==='pogo')note(52,.22,.15,'spring');
  if(name==='shoot')note(88,.065,.115,'shot');
  if(name==='land')note(39,.065,.13,'kick');
  if(name==='hit'){note(52,.18,.15,'shot');note(40,.16,.12,'reed',.06);}
  if(name==='death')[64,59,55,48].forEach((n,i)=>note(n,.25,.12,'reed',i*.12));
  if(name==='collect')[79,83,88].forEach((n,i)=>note(n,.24,.11,'bell',i*.065));
  // Preserve the relay's existing C5-E5-G5 correspondence.
  if(/^relay[123]$/.test(name))note([72,76,79][Number(name.slice(-1))-1],.24,.16,'bass');
  if(name==='relayReset'){note(64,.12,.12,'bass');note(57,.18,.10,'bass',.10);}
  if(name==='enemy'){note(57,.09,.12);note(69,.12,.12,'bass',.08);}
  if(name==='climb'){note(64,.08,.09,'bass');note(69,.11,.1,'bass',.10);}
  if(name==='win')[72,76,79,84,88].forEach((n,i)=>note(n,.34,.10,'bell',i*.13));
 }
 function mute(value){muted=!!value;if(ctx)bus.gain.setTargetAtTime(muted?0:.65,ctx.currentTime,.015);if(muted){pause();release(true);}}
 async function visibility(value){hidden=!!value;if(hidden){pause();release(true);if(ctx)await ctx.suspend();}}
 return {start,pause,stop,effect,mute,visibility,
  status:()=>({playing,step,voices:voices.size,timer:timer!==null,theme:Object.keys(themes).find(k=>themes[k]===theme)}),
  get context(){return ctx;}};
}
root.CrustSoundtrack={create,themes};
if(typeof module!=='undefined')module.exports=root.CrustSoundtrack;
})(typeof window!=='undefined'?window:globalThis);
