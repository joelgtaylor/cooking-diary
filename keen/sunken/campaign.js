/* Production completion adapter. The water controller remains page-scoped. */
'use strict';
const installSunkenLevel=installSunkenPrototype;
installSunkenPrototype=function(){
 installSunkenLevel();
 const progress=updateWorldProgress,begin=init,pause=shellPause;
 init=function(){const result=begin();document.title='Crust Quest · The Sunken Patisserie';return result;};
 updateWorldProgress=function(){
  progress();
  if(sunkenLevel.complete&&state==='play'){
   if(!unlocked.includes(3))unlocked.push(3);
   try{localStorage.setItem('crustQuestCodex',JSON.stringify(unlocked));}catch{}
   if(player.score>best){best=player.score;try{localStorage.setItem('crustQuestBest',String(best));}catch{}}
   state='win';shellSavedState='win';
  }
 };
 shellPause=function(reason){pause(reason);if(!shellStarted)document.getElementById('shellMessage').textContent='World 4 · Gather five cultures, master the currents, and defeat the Master of the Deep. Enter his finishing oven to unlock your fourth recipe. FULL ink is the recommended challenge.';};
 // The campaign ending replays from World 1; in-level restart stays in World 4.
 const bind=bindInput;
 bindInput=function(){bind();document.getElementById('creditsReplay').addEventListener('click',e=>{e.stopImmediatePropagation();window.location.assign('index.html');},true);};
};
