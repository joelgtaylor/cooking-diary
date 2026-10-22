/* Isolated interface POC: shared levels, simulation, artwork and save rules. */
'use strict';
const shellInput=createShellInput(),shellPointers=new Map();
let shellStarted=false,shellSavedState='play',shellPage='main',shellPendingShoot=-1,shellRecipePage=0,shellConfirm=null,shellStartingFullscreen=false,shellRotationDismissed=false,shellPortrait=null,shellReady=false;
const shellEl=id=>document.getElementById(id);
function shellPublishInput(){keys=shellInput.snapshot();if(shellPendingShoot>=tick)keys.shoot=true;}
function shellClearInput(){
 shellInput.clear();shellPointers.clear();shellPendingShoot=-1;keys={};prevJump=false;prevPogo=false;player.buffer=0;
 for(const el of document.querySelectorAll('[data-action]'))el.classList.remove('is-held');
}
function shellPause(reason='Paused'){
 shellClearInput();if(!shellReady)return;
 if(state==='character-select'){characterReturnState='shell-menu';return;}
 if(state!=='shell-menu')shellSavedState=state;
 state='shell-menu';shellPage='main';shellEl('shellMain').hidden=false;shellEl('shellSheet').hidden=true;shellEl('shellOverlay').setAttribute('aria-labelledby','shellTitle');
 shellEl('shellOverlay').hidden=false;shellEl('wrap').dataset.mode='menu';
 shellEl('shellTitle').textContent=shellStarted?'Paused':'Rise of the Starter';
 shellEl('shellMessage').textContent=shellStarted?reason+' · resume when you’re ready.':'Choose your baker, then start your adventure.';
 shellEl('shellResume').textContent=shellStarted?'Resume':'Play';shellEl('shellResume').focus();
}
function shellResume(){
 if(document.hidden)return;
 shellClearInput();shellStarted=true;shellEl('wrap').dataset.started='true';
 state=shellSavedState==='shell-menu'?'play':shellSavedState;
 shellEl('shellOverlay').hidden=true;shellEl('wrap').dataset.mode='play';
 minimap.style.display='none';shellEl('gameStage').focus();AudioKit.start();simulationClock.reset();
}
function togglePause(){if(state==='shell-menu'&&shellStarted&&shellPage==='main')shellResume();else shellPause();}
function toggleMap(){shellOpenSheet('map');}
function shellOpenSheet(page){
 shellPause();shellEl('shellOverlay').setAttribute('aria-labelledby','sheetTitle');shellPage=page;shellEl('shellMain').hidden=true;shellEl('shellSheet').hidden=false;
 shellEl('mapViewport').hidden=page!=='map';shellEl('recipeSheet').hidden=page!=='recipes';shellEl('confirmSheet').hidden=page!=='confirm';
 shellEl('sheetTitle').textContent=page==='map'?'World map':page==='recipes'?'Recipes':'Confirm action';
 minimap.style.display=page==='map'?'block':'none';
 if(page==='map')drawPhase3Map();if(page==='recipes')shellRenderRecipe();shellEl('sheetBack').focus();
}
function shellRenderRecipe(){
 const r=RECIPES[shellRecipePage],body=shellEl('recipeBody');body.replaceChildren();shellEl('recipeTitle').textContent=r.name;
 const add=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;body.append(el);return el;};
 if(!unlocked.includes(shellRecipePage))add('p','Clear Bakery '+(shellRecipePage+1)+' to unlock this recipe.');
 else{add('p',r.sub);add('h4','Ingredients');const ul=add('ul','');for(const text of r.ing){const li=document.createElement('li');li.textContent=text;ul.append(li);}add('h4','Method');const ol=add('ol','');for(const text of r.steps){const li=document.createElement('li');li.textContent=text;ol.append(li);}}
 shellEl('recipePage').textContent=(shellRecipePage+1)+' / '+RECIPES.length;
}
function shellAsk(action){
 shellConfirm=action;shellOpenSheet('confirm');
 shellEl('confirmMessage').textContent=action==='restart'?'Restart this bakery? Progress within the current attempt will reset.':'Return to your latest checkpoint? The existing checkpoint recovery rules apply.';
 shellEl('confirmAction').textContent=action==='restart'?'Restart bakery':'Return to checkpoint';
}
async function shellFullscreen(start=false){
 shellPause();shellStartingFullscreen=start;
 try{
  if(document.fullscreenElement)await document.exitFullscreen();
  else if(shellEl('wrap').requestFullscreen)await shellEl('wrap').requestFullscreen();
  else throw Error('unavailable');
  shellEl('shellNotice').textContent='';
 }catch{shellEl('shellNotice').textContent='Fullscreen is unavailable here. The fitted game layout still works.';}
 finally{shellStartingFullscreen=false;shellFit();if(start)shellResume();}
}
function shellFit(){
 const root=shellEl('wrap'),w=root.clientWidth||window.innerWidth,h=root.clientHeight||window.innerHeight,portrait=h>w,touch=root.dataset.touch==='true';
 const reserved=portrait&&touch?220:0,available=Math.max(120,h-reserved),scale=Math.min(w/960,available/540);
 root.style.setProperty('--canvas-width',(960*scale)+'px');root.style.setProperty('--canvas-height',(540*scale)+'px');
 root.style.setProperty('--canvas-left',((w-960*scale)/2)+'px');root.style.setProperty('--canvas-top',((available-540*scale)/2)+'px');
 shellEl('rotateHint').hidden=!portrait||!touch||shellRotationDismissed||!shellStarted||state==='shell-menu';
 if(shellPortrait!==null&&shellPortrait!==portrait&&shellStarted&&!shellStartingFullscreen)shellPause('Orientation changed');
 shellPortrait=portrait;
}
function shellSettings(){
 const touch=shellEl('showTouch').checked,size=Number(shellEl('controlSize').value),opacity=Number(shellEl('controlOpacity').value),root=shellEl('wrap');
 root.dataset.touch=String(touch);root.style.setProperty('--control-scale',size/100);root.style.setProperty('--control-opacity',opacity/100);
 shellEl('sizeValue').textContent=size+'%';shellEl('opacityValue').textContent=opacity+'%';
 try{localStorage.setItem('crustQuestShellSettings',JSON.stringify({touch,size,opacity}));}catch{}
 shellFit();
}
function shellLoadSettings(){
 let value={};try{value=JSON.parse(localStorage.getItem('crustQuestShellSettings')||'{}')||{};}catch{}
 const forcedTouch=/(?:^|[?&])touch=([01])(?:&|$)/.exec(window.location?.search||'');
 shellEl('showTouch').checked=forcedTouch?forcedTouch[1]==='1':typeof value.touch==='boolean'?value.touch:!!window.matchMedia?.('(pointer:coarse)').matches;
 shellEl('controlSize').value=Math.max(85,Math.min(120,Number(value.size)||100));
 shellEl('controlOpacity').value=Math.max(40,Math.min(90,Number(value.opacity)||65));shellSettings();
}
function shellPointerAction(e,owner){
 if(owner.group==='direction'){
  const hit=document.elementFromPoint(e.clientX,e.clientY),action=hit?.closest?.('[data-action]')?.dataset.action;
  return action==='left'||action==='right'?action:null;
 }
 const r=owner.button.getBoundingClientRect();return e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-12&&e.clientY<=r.bottom+12?owner.action:null;
}
function shellRefreshHeld(){
 const held=shellInput.snapshot();for(const button of document.querySelectorAll('[data-action]'))button.classList.toggle('is-held',!!held[button.dataset.action]);
}
function shellBindPointer(button){
 const action=button.dataset.action;
 button.addEventListener('pointerdown',e=>{
  if(e.button!==0||state!=='play')return;e.preventDefault();e.stopPropagation();AudioKit.start();
  const owner={button,action,group:action==='left'||action==='right'?'direction':'action'};
  shellPointers.set(e.pointerId,owner);button.setPointerCapture(e.pointerId);shellInput.set('pointer:'+e.pointerId,action);
  if(action==='jump')player.buffer=9;if(action==='shoot')shellPendingShoot=tick;
  shellPublishInput();shellRefreshHeld();
 });
 button.addEventListener('pointermove',e=>{
  const owner=shellPointers.get(e.pointerId);if(!owner)return;e.preventDefault();
  const next=shellPointerAction(e,owner);shellInput.set('pointer:'+e.pointerId,next);shellPublishInput();shellRefreshHeld();
 });
 const release=e=>{shellPointers.delete(e.pointerId);shellInput.release('pointer:'+e.pointerId);shellPublishInput();shellRefreshHeld();};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);
 button.addEventListener('click',e=>{
  if(e.detail!==0||state!=='play')return;
  if(action==='jump')player.buffer=9;
  if(action==='shoot'){shellPendingShoot=tick;shellPublishInput();}
 });
}
function shellTrapFocus(e){
 if(e.key!=='Tab'||shellEl('shellOverlay').hidden)return;
 const nodes=[...shellEl('shellOverlay').querySelectorAll('button,input,summary,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
 if(!nodes.length)return;const i=nodes.indexOf(document.activeElement);
 if(e.shiftKey&&i<=0){e.preventDefault();nodes.at(-1).focus();}
 else if(!e.shiftKey&&(i===nodes.length-1||i<0)){e.preventDefault();nodes[0].focus();}
}
function bindInput(){
 const click=(id,fn)=>shellEl(id).addEventListener('click',fn);
 click('shellResume',shellResume);click('shellPause',()=>shellPause());click('shellFullscreen',()=>shellFullscreen(!shellStarted));
 click('sheetBack',()=>shellPause());click('confirmCancel',()=>shellPause());
 click('confirmAction',()=>{shellClearInput();if(shellConfirm==='restart')restart();else respawnCheckpoint();shellPause('Ready at '+(shellConfirm==='restart'?'the bakery entrance':'your checkpoint'));});
 click('mapButton',()=>shellOpenSheet('map'));click('codexBtn',()=>shellOpenSheet('recipes'));
 click('restartBtn',()=>shellAsk('restart'));click('restartSection',()=>shellAsk('checkpoint'));
 click('audioBtn',()=>AudioKit.toggle());click('pogoBtn',()=>{if(state==='play'){AudioKit.start();togglePogo();}});
 click('kefirBtn',()=>activateKefir());click('talkBtn',()=>{AudioKit.start();talkMycelium();});
 click('exploreBtn',()=>{AudioKit.start();interactCavernExploration();});
 click('recipePrevious',()=>{shellRecipePage=(shellRecipePage+RECIPES.length-1)%RECIPES.length;shellRenderRecipe();});
 click('recipeNext',()=>{shellRecipePage=(shellRecipePage+1)%RECIPES.length;shellRenderRecipe();});
 click('dismissRotate',()=>{shellRotationDismissed=true;shellEl('rotateHint').hidden=true;});
 click('advanceBtn',()=>{if(state==='clear'){shellClearInput();advanceBakery();}});
 for(const id of ['showTouch','controlSize','controlOpacity'])shellEl(id).addEventListener('input',shellSettings);
 for(const button of document.querySelectorAll('[data-action]'))shellBindPointer(button);
 for(const event of ['contextmenu','selectstart','dragstart'])shellEl('gameStage').addEventListener(event,e=>e.preventDefault());
 c.addEventListener('pointerdown',e=>{e.preventDefault();AudioKit.start();if(state==='clear'){shellClearInput();advanceBakery();}});
 document.addEventListener('keydown',e=>{
  if(handleCharacterSelectorKey(e))return;
  shellTrapFocus(e);
  const k=e.key.toLowerCase();
  if(k==='escape'){e.preventDefault();if(shellPage!=='main'&&state==='shell-menu')shellPause();else if(state!=='shell-menu')shellPause();return;}
  if(e.target?.matches?.('input,select,textarea'))return;
  if(k==='p'){e.preventDefault();if(!e.repeat)togglePause();return;}
  if(k==='f'){e.preventDefault();if(!e.repeat)shellFullscreen(!shellStarted);return;}
  if(state==='shell-menu')return;
  if(state==='dialogue'){if(!e.repeat&&['e','enter'].includes(k)){e.preventDefault();talkMycelium();}return;}
  if(k==='m'){if(!e.repeat)AudioKit.toggle();return;}
  if(k==='q'||k==='t'||k==='r'){e.preventDefault();if(!e.repeat){if(k==='r')shellAsk('restart');else shellOpenSheet(k==='q'?'map':'recipes');}return;}
  if(k==='enter'&&state==='clear'){e.preventDefault();shellClearInput();advanceBakery();return;}
  if(state!=='play')return;
  if((k===' '||k==='enter')&&e.target?.closest?.('[data-action]'))return;
  const actions={arrowleft:'left',a:'left',arrowright:'right',d:'right',arrowup:'jump',w:'jump',' ':'jump',x:'shoot',k:'shoot'};
  if(actions[k]){e.preventDefault();shellInput.set('key:'+e.code,actions[k]);if(!e.repeat&&actions[k]==='jump')player.buffer=9;if(!e.repeat&&actions[k]==='shoot')shellPendingShoot=tick;shellPublishInput();AudioKit.start();}
  if(!e.repeat&&k==='c'){e.preventDefault();togglePogo();}
  if(!e.repeat&&k==='v'){e.preventDefault();activateKefir();}
  if(!e.repeat&&k==='e'){e.preventDefault();if(!interactCavernExploration())talkMycelium();}
 });
 document.addEventListener('keyup',e=>{shellInput.release('key:'+e.code);shellPublishInput();shellRefreshHeld();});
 window.addEventListener('blur',()=>shellPause('Window lost focus'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)shellPause('Game was interrupted');});
 document.addEventListener('fullscreenchange',()=>{if(!shellStartingFullscreen)shellPause('Display mode changed');shellFit();});
 window.addEventListener('resize',shellFit);window.visualViewport?.addEventListener('resize',shellFit);
 window.addEventListener('orientationchange',()=>{if(shellStarted)shellPause('Orientation changed');shellFit();});
}
function initGameShell(){
 const recover=respawnCheckpoint;respawnCheckpoint=function(){shellClearInput();return recover();};
 shellReady=true;shellEl('wrap').dataset.started='false';shellLoadSettings();shellSavedState='play';shellPause();
}
function syncGameShell(){
 if(!shellReady)return;
 if(shellPendingShoot>=0&&tick>shellPendingShoot){shellPendingShoot=-1;shellPublishInput();}
 shellEl('pogoBtn').setAttribute('aria-pressed',String(pogoOn));
 shellEl('interactIdle').style.display=shellEl('exploreBtn').style.display==='none'&&shellEl('talkBtn').style.display==='none'?'':'none';
 shellEl('advanceBtn').hidden=state!=='clear';
 shellEl('shellFullscreen').textContent=!shellStarted?'Play fullscreen':document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';
 shellEl('wrap').dataset.mode=state==='shell-menu'||state==='character-select'?'menu':'play';
 shellEl('rotateHint').hidden=!shellStarted||shellPortrait!==true||shellEl('wrap').dataset.touch!=='true'||shellRotationDismissed||state==='shell-menu';
 shellEl('status').classList.toggle('game-error',shellEl('status').textContent.startsWith('Game error:'));
}
