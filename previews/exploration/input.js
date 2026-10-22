/* Keyboard, canvas and button input. Bind once after game/UI state is ready.
 * M mutes; Q opens the map. Held movement stays in the existing keys object.
 * Pointer capture covers touch, pen and mouse without duplicate event streams.
 */
'use strict';
function toggleMap(){
 const open=minimap.style.display==='none';
 minimap.style.display=open?'block':'none';
 mapButton.textContent=open?'Hide map (Q)':'World map (Q)';
}
function togglePause(){state=state==='play'?'pause':state==='pause'?'play':state;}
function bindInput(){
 document.addEventListener('keydown',e=>{
  if(typeof handleCharacterSelectorKey==='function'&&handleCharacterSelectorKey(e))return;
  const k=e.key.toLowerCase();
  if(state==='dialogue'){e.preventDefault();if(!e.repeat&&['e','enter','escape'].includes(k))talkMycelium();return;}
  if(['arrowleft','arrowright','arrowup',' '].includes(k))e.preventDefault();
  keys[e.key.length===1?k:e.key]=true;AudioKit.start();
  if(e.repeat)return;
  if(k==='v'){e.preventDefault();activateKefir();}
  if(k==='e'){e.preventDefault();if(typeof interactCavernExploration!=='function'||!interactCavernExploration())talkMycelium();}
  if(k==='m')AudioKit.toggle();
  if(k==='q'){e.preventDefault();toggleMap();}
  if(k==='r')restart();
  if(k==='p')togglePause();
  if(k==='t')toggleCodex();
  if(k==='enter')advanceBakery();
  if(state==='codex'){
   if(k==='arrowleft'||k==='a')codexFlip(-1);
   else if(k==='arrowright'||k==='d')codexFlip(1);
  }
 });
 document.addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false;});
 const click=(id,fn)=>document.getElementById(id).addEventListener('click',fn);
 click('kefirBtn',()=>{AudioKit.start();activateKefir();});
 click('talkBtn',()=>{AudioKit.start();talkMycelium();});
 if(document.getElementById('exploreBtn'))click('exploreBtn',()=>{AudioKit.start();interactCavernExploration();});
 click('pogoBtn',()=>{AudioKit.start();togglePogo();AudioKit.effect('pogo');});
 click('codexBtn',()=>{AudioKit.start();toggleCodex();});
 click('restartBtn',()=>{AudioKit.start();restart();});
 click('audioBtn',()=>AudioKit.toggle());
 click('mapButton',toggleMap);
 click('restartSection',respawnCheckpoint);
 click('pauseBtn',togglePause);
 c.addEventListener('pointerdown',e=>{
  AudioKit.start();
  if(state==='clear')advanceBakery();
  else if(state==='codex'){
   const rc=c.getBoundingClientRect(),tx=(e.clientX-rc.left)*960/rc.width;
   if(tx<211)codexFlip(-1);else if(tx>749)codexFlip(1);else toggleCodex();
  }
 });
 const controls=[];
 for(const b of document.querySelectorAll('[data-key]')){
  const k=b.dataset.key,pointers=new Set();
  const release=e=>{
   pointers.delete(e.pointerId);keys[k]=pointers.size>0;
   if(!pointers.size)b.style.background='';
  };
  controls.push({b,pointers});
  b.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;
   e.preventDefault();AudioKit.start();
   if(state==='codex'&&(k==='left'||k==='right')){codexFlip(k==='left'?-1:1);return;}
   pointers.add(e.pointerId);b.setPointerCapture(e.pointerId);keys[k]=true;
   b.style.background='#58a5a2';
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,release);
  b.addEventListener('click',()=>{
   if(k==='jump')player.buffer=9;

  });
 }
 const clearHeld=()=>{
  keys={};
  for(const {b,pointers} of controls){pointers.clear();b.style.background='';}
 };
 window.addEventListener('blur',clearHeld);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHeld();});
}
