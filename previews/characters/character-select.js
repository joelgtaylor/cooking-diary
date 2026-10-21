/* Character roster and paused selection UI. Character art never changes physics. */
'use strict';
const CHARACTER_ROSTER=Object.freeze([
 Object.freeze({id:'loafy',name:'Loafy',playable:true}),
 Object.freeze({id:'vance-wick',name:'Vance Wick',playable:false})
]);
let selectedCharacterId='loafy',characterReturnState=null;
function selectedCharacter(){return CHARACTER_ROSTER.find(c=>c.id===selectedCharacterId)||CHARACTER_ROSTER[0];}
function refreshCharacterSelector(){
 document.getElementById('characterButton').textContent='Character: '+selectedCharacter().name;
 document.getElementById('characterLoafy').setAttribute?.('aria-pressed',String(selectedCharacterId==='loafy'));
}
function selectCharacter(id){
 const character=CHARACTER_ROSTER.find(c=>c.id===id&&c.playable);
 if(!character)return false;
 selectedCharacterId=character.id;
 try{localStorage.setItem('crustQuestCharacter',character.id);}catch{}
 refreshCharacterSelector();return true;
}
function closeCharacterSelector(){
 if(characterReturnState===null)return;
 document.getElementById('characterPanel').style.display='none';
 state=characterReturnState;characterReturnState=null;
 keys={};prevJump=false;player.buffer=0;
 document.getElementById('characterButton').focus?.();
}
function openCharacterSelector(){
 if(characterReturnState!==null)return;
 characterReturnState=state;state='character-select';keys={};prevJump=false;player.buffer=0;
 document.getElementById('characterConcept').style.display='none';
 document.getElementById('characterMessage').textContent='Choose your baker. Loafy is ready to play; Vance Wick is in concept development.';
 refreshCharacterSelector();document.getElementById('characterPanel').style.display='grid';
 document.getElementById('characterLoafy').focus?.();
}
function previewVanceConcept(){
 document.getElementById('characterConcept').style.display='block';
 document.getElementById('characterMessage').textContent='Vance Wick · concept preview. His full playable animation set is next.';
 document.getElementById('characterConcept').scrollIntoView?.({block:'nearest',behavior:'smooth'});
}
function handleCharacterSelectorKey(e){
 if(state!=='character-select')return false;
 keys={};
 if(e.key==='Escape'){e.preventDefault();if(!e.repeat)closeCharacterSelector();return true;}
 const nodes=['characterClose','characterLoafy','characterVance','characterConceptLink'].map(id=>document.getElementById(id));
 if(e.key==='Tab'){
  const active=nodes.indexOf(document.activeElement);
  if(e.shiftKey&&(active<=0)){e.preventDefault();nodes.at(-1).focus?.();}
  else if(!e.shiftKey&&(active===nodes.length-1||active<0)){e.preventDefault();nodes[0].focus?.();}
 }else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
  e.preventDefault();document.getElementById(e.key==='ArrowLeft'?'characterLoafy':'characterVance').focus?.();
 }
 // Let native button/link activation handle Enter and Space; game shortcuts
 // remain blocked so they cannot restart or advance the level behind the UI.
 return true;
}
function bindCharacterSelector(){
 try{
  const stored=localStorage.getItem('crustQuestCharacter');
  if(CHARACTER_ROSTER.some(c=>c.id===stored&&c.playable))selectedCharacterId=stored;
 }catch{}
 document.getElementById('characterButton').addEventListener('click',openCharacterSelector);
 document.getElementById('characterClose').addEventListener('click',closeCharacterSelector);
 document.getElementById('characterLoafy').addEventListener('click',()=>{selectCharacter('loafy');closeCharacterSelector();});
 document.getElementById('characterVance').addEventListener('click',previewVanceConcept);
 refreshCharacterSelector();
}
