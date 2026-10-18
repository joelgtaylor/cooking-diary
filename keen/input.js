/* Keyboard, canvas and button input. Bind once after game/UI state is ready.
 * M mutes; Q opens the map. Held movement stays in the existing keys object.
 * Pointer capture covers touch, pen and mouse without duplicate event streams.
 */
'use strict';
function toggleMap(){
 const open=minimap.style.display==='none';
 minimap.style.display=open?'block':'none';
 mapButton.textContent=open?'🗺️ HIDE MAP (Q)':'🗺️ WORLD MAP (Q)';
}
function toggleParallax(){
 window.__crustParallaxEnabled=window.__crustParallaxEnabled===false;
 updateParallaxUI();
}
function bindInput(){
 document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowleft','arrowright','arrowup',' '].includes(k))e.preventDefault();
  keys[e.key.length===1?k:e.key]=true;AudioKit.start();statusEl.textContent='Keyboard input: '+e.key;
  if(e.repeat)return;
  if(k==='m')AudioKit.toggle();
  if(k==='q'){e.preventDefault();toggleMap();}
  if(k==='r')restart();
  if(k==='p')state=state==='play'?'pause':state==='pause'?'play':state;
  if(k==='t')toggleCodex();
  if(k==='enter')advanceBakery();
  if(k==='b')toggleParallax();
  if(k==='g'){window.__crustCameraDebug=!window.__crustCameraDebug;cameraUI();}
  if(k==='v'){window.__crustCameraSnap=!window.__crustCameraSnap;cameraUI();}
  if(k==='1'||k==='2'||k==='3'){e.preventDefault();moveToAltitude(Number(k)-1);}
  if(state==='codex'){
   if(k==='arrowleft'||k==='a')codexFlip(-1);
   else if(k==='arrowright'||k==='d')codexFlip(1);
  }
 });
 document.addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false;});
 const click=(id,fn)=>document.getElementById(id).addEventListener('click',fn);
 click('pogoBtn',()=>{AudioKit.start();togglePogo();AudioKit.effect('pogo');});
 click('codexBtn',()=>{AudioKit.start();toggleCodex();});
 click('restartBtn',()=>{AudioKit.start();restart();});
 click('audioBtn',()=>AudioKit.toggle());
 click('mapButton',toggleMap);
 click('restartSection',respawnCheckpoint);
 click('parallaxToggleBtn',toggleParallax);
 for(const profile of ['subtle','balanced','dramatic']){
  click('parallax'+profile[0].toUpperCase()+profile.slice(1)+'Btn',()=>{
   window.__crustParallaxProfile=profile;window.__crustParallaxEnabled=true;updateParallaxUI();
  });
 }
 click('cameraSmoothBtn',()=>{window.__crustCameraSnap=!window.__crustCameraSnap;cameraUI();});
 click('cameraGridBtn',()=>{window.__crustCameraDebug=!window.__crustCameraDebug;cameraUI();});
 ['cameraFootBtn','cameraMiddleBtn','cameraTopBtn'].forEach((id,i)=>click(id,()=>moveToAltitude(i)));
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
   statusEl.textContent='Input detected: '+k;b.style.background='#58a5a2';
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,release);
  b.addEventListener('click',()=>{
   if(k==='jump')player.buffer=9;
   statusEl.textContent='Button activated: '+k;
  });
 }
 const clearHeld=()=>{
  keys={};
  for(const {b,pointers} of controls){pointers.clear();b.style.background='';}
 };
 window.addEventListener('blur',clearHeld);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHeld();});
}
