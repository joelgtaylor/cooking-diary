/* Approved World 4 score, scoped to this preview. Effects bypass the water filter. */
'use strict';
(function(root){
function create(env={}){
 let mix;
 const player=root.CrustSoundtrack.create({...env,musicDestination(ctx,bus){mix=root.SunkenMix.createMix(ctx,bus);return mix.input;}});
 return {...player,
  async start(){await player.start('sunken');if(player.status().playing){mix.resume();mix.depth(player.status().step);}},
  pause(){player.pause();mix?.flush();},
  stop(){player.stop();mix?.flush();},
  mute(value){player.mute(value);if(value)mix?.flush();},
  async visibility(value){if(value)mix?.flush();await player.visibility(value);},
  waterDepth(){if(mix&&player.status().playing)mix.depth(player.status().step);},
  get context(){return player.context;}
 };
}
root.SunkenPreviewAudio={create};
if(typeof module!=='undefined')module.exports=root.SunkenPreviewAudio;
})(typeof window!=='undefined'?window:globalThis);
