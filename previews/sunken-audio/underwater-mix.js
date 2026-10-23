/* Audition-only output treatment. No production graph or effects are changed. */
'use strict';
(function(root){
function createMix(ctx,output=ctx.destination){
 const input=ctx.createGain(),low=ctx.createBiquadFilter(),body=ctx.createBiquadFilter();
 const submerged=ctx.createGain(),clear=ctx.createGain(),delay=ctx.createDelay(.5),feedback=ctx.createGain(),wet=ctx.createGain();
 low.type='lowpass';low.frequency.value=1050;low.Q.value=.45;
 body.type='peaking';body.frequency.value=280;body.Q.value=.7;body.gain.value=2.3;
 submerged.gain.value=1;clear.gain.value=0;delay.delayTime.value=.19;feedback.gain.value=.16;wet.gain.value=.18;
 input.connect(low);low.connect(body);body.connect(submerged);submerged.connect(output);
 input.connect(clear);clear.connect(output);
 submerged.connect(delay);delay.connect(wet);wet.connect(output);delay.connect(feedback);feedback.connect(delay);
 let enabled=true;
 function set(value){enabled=!!value;const t=ctx.currentTime;submerged.gain.setTargetAtTime(enabled?1:0,t,.045);clear.gain.setTargetAtTime(enabled?0:1,t,.045);wet.gain.setTargetAtTime(enabled?.18:0,t,.045);}
 function depth(step){
  // A small opening in the final chorus; never a dramatic filter sweep.
  const cutoff=step<64?1350:step<128?1180:step<160?950:step<192?1050:1350;
  low.frequency.setTargetAtTime(cutoff,ctx.currentTime,.7);
 }
 function flush(){
  // Kill the short delay tail on Stop/mute; reconnect on the next start.
  submerged.disconnect();submerged.connect(output);feedback.disconnect();wet.gain.setTargetAtTime(0,ctx.currentTime,.012);
 }
 function resume(){submerged.disconnect();submerged.connect(output);submerged.connect(delay);feedback.disconnect();feedback.connect(delay);set(enabled);}
 return {input,set,depth,flush,resume};
}
function create(engine,Context){
 let mix;
 function RoutedContext(){
  const ctx=new Context();mix=createMix(ctx);
  // Explicit facade binds native Web Audio methods and substitutes only output.
  return {get currentTime(){return ctx.currentTime;},get state(){return ctx.state;},destination:mix.input,
   createGain:ctx.createGain.bind(ctx),createOscillator:ctx.createOscillator.bind(ctx),
   createDynamicsCompressor:ctx.createDynamicsCompressor.bind(ctx),resume:ctx.resume.bind(ctx),suspend:ctx.suspend.bind(ctx)};
 }
 const player=engine.create({AudioContext:RoutedContext});
 return {player,get mix(){return mix;}};
}
root.SunkenMix={createMix,create};
if(typeof module!=='undefined')module.exports=root.SunkenMix;
})(typeof window!=='undefined'?window:globalThis);
