/* Crust Quest audio facade: existing gesture/event API plus presentation scenes.
 * No audio callbacks mutate gameplay. M is a master mute for music and effects.
 */
'use strict';
window.AudioKit=(()=>{
 let engine=null,enabled=true,unlocked=false,world=1,gameState='play',selected=1,signature='',warned=false;
 try{enabled=localStorage.getItem('crustQuestMuted')!=='true';}catch{}
 function refreshButton(){const button=document.getElementById('audioBtn');if(button)button.textContent=enabled?'♫ Sound: ON':'♫ Sound: OFF';}
 refreshButton();
 const hidden=()=>!!document.hidden;
 function report(error){if(!warned){warned=true;console.warn('Audio unavailable:',error);}}
 function safely(fn){try{const result=fn();if(result&&typeof result.catch==='function')result.catch(report);}catch(error){report(error);}}
 function sync(force=false){
  const next=[world,gameState,enabled,unlocked,hidden()].join(':');
  if(!force&&signature===next)return;signature=next;
  if(!engine)return;
  safely(()=>{
   engine.mute(!enabled);engine.visibility(hidden()).catch(report);
   if(world!==selected){engine.stop();selected=world;}
   if(!enabled||!unlocked||hidden()||gameState!=='play'){engine.pause();return;}
   return engine.start('bakery'+world);
  });
 }
 function start(){
  if(!enabled||hidden())return;
  unlocked=true;
  safely(()=>{if(!engine)engine=window.SunkenPreviewAudio.create();sync(true);});
 }
 function effect(name){
  if(!enabled||!unlocked||hidden()||!engine)return;
  safely(()=>engine.effect(name));
 }
 function scene(bakery,state){
  world=Math.max(1,Math.min(3,Number(bakery)||1));gameState=state;if(engine)engine.waterDepth();sync();
 }
 function reset(bakery){
  if(bakery)world=Math.max(1,Math.min(3,Number(bakery)||1));
  gameState='play';if(engine)safely(()=>engine.stop());signature='';sync();
 }
 function toggle(){
  enabled=!enabled;
  try{localStorage.setItem('crustQuestMuted',String(!enabled));}catch{}
  const button=document.getElementById('audioBtn');
  if(button)button.textContent=enabled?'♫ Sound: ON':'♫ Sound: OFF';
  if(enabled)start();else sync(true);
 }
 document.addEventListener('visibilitychange',()=>sync(true));
 return {start,effect,toggle,scene,reset};
})();
