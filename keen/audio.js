/* Crust Quest soundtrack and sound effects. Extracted intact from keen/index.html.
 * Public API: window.AudioKit.start(), effect(name), toggle().
 * Audio starts only in response to the existing game interaction paths.
 */
'use strict';
window.AudioKit=(()=>{
 let ctx=null, master=null, musicGain=null, fxGain=null, enabled=true, nextBeat=0, step=0, timer=null;
 const tempo=148, beat=60/tempo/2;
 const melody=[76,79,81,79,76,74,72,74,76,79,83,81,79,76,74,72,74,76,79,76,74,72,71,74,76,79,81,83,81,79,76,74];
 const bass=[48,48,55,55,53,53,55,55,48,48,55,55,53,53,55,55];
 function tone(midi,when,duration,type='square',vol=.1,output=musicGain){
  if(!ctx||!output)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(440*Math.pow(2,(midi-69)/12),when);
  gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),when+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,when+Math.max(.035,duration));
  osc.connect(gain);gain.connect(output);osc.start(when);osc.stop(when+duration+.035);
 }
 function beatTick(){if(!ctx||ctx.state!=='running'||!enabled)return;
  while(nextBeat<ctx.currentTime+.18){
   const i=step%32,bar=Math.floor(step/8)%4;
   if(i%2===0)tone(melody[i],nextBeat,beat*.85,'square',.052);
   else if(i%4===3)tone(melody[i]-12,nextBeat,beat*.45,'triangle',.027);
   if(i%4===0)tone(bass[Math.floor(step/4)%16],nextBeat,beat*3.3,'triangle',.075);
   if(i%8===4)tone(bass[Math.floor(step/4)%16]+12,nextBeat,beat*1.3,'sawtooth',.018);
   // lightly percussive off-beat shaker
   if(i%2===1)tone(90,nextBeat,.028,'triangle',.011);
   if(i===0&&bar===3)tone(84,nextBeat,beat*.8,'sine',.025);
   nextBeat+=beat;step++;
  }
 }
 function start(){if(!enabled)return;
  try{
   if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);
    musicGain=ctx.createGain();musicGain.gain.value=.65;musicGain.connect(master);
    fxGain=ctx.createGain();fxGain.gain.value=.95;fxGain.connect(master);
   }
   ctx.resume();nextBeat=Math.max(ctx.currentTime+.05,nextBeat||0);
   if(!timer)timer=setInterval(beatTick,45);
  }catch(e){console.warn('Audio unavailable:',e)}
 }
 function effect(name){if(!enabled||!ctx||ctx.state!=='running')return;
  const t=ctx.currentTime+.005;
  if(/^relay[123]$/.test(name))tone([72,76,79][Number(name.slice(-1))-1],t,.24,'triangle',.16,fxGain);
  if(name==='relayReset'){tone(64,t,.12,'triangle',.12,fxGain);tone(57,t+.10,.18,'triangle',.10,fxGain)}
  if(name==='jump'){tone(60,t,.10,'square',.12,fxGain);tone(67,t+.07,.13,'triangle',.10,fxGain)}
  if(name==='pogo'){tone(50,t,.08,'sawtooth',.085,fxGain);tone(74,t+.055,.17,'square',.085,fxGain)}
  if(name==='shoot')tone(86,t,.065,'square',.09,fxGain);
  if(name==='collect'){[76,81,88].forEach((n,i)=>tone(n,t+i*.08,.18,'triangle',.16,fxGain))}
  if(name==='hit'){[49,45,40].forEach((n,i)=>tone(n,t+i*.075,.16,'sawtooth',.1,fxGain))}
  if(name==='enemy'){tone(57,t,.09,'square',.12,fxGain);tone(69,t+.08,.12,'triangle',.12,fxGain)}
  if(name==='climb'){tone(64,t,.08,'triangle',.09,fxGain);tone(69,t+.10,.11,'triangle',.1,fxGain)}
  if(name==='win'){[72,76,79,84,88].forEach((n,i)=>tone(n,t+i*.13,.34,'square',.12,fxGain))}
 }
 function toggle(){enabled=!enabled;document.getElementById('audioBtn').textContent=enabled?'♫ Music: ON':'♫ Music: OFF';
  if(enabled){nextBeat=0;start()}else if(ctx){ctx.suspend();nextBeat=0}
 }
 return {start,effect,toggle};
})();
