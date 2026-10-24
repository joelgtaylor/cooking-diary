/* Reviewable combined encounter: clear lessons, first ink, then sustained obscuration. */
(function(root){
'use strict';
const Core=root.CrustDeep||(typeof require==='function'?require('./master-of-deep.js'):null);
const Scraper=root.CrustScraper||(typeof require==='function'?require('./bench-scraper.js'):null);
const Ink=root.CrustInk||(typeof require==='function'?require('./ink-attack.js'):null);
function stage(completed){return completed<4?'opening':completed<6?'escalation':'fury';}
function plan(completed){const battleStage=stage(completed);return {battleStage,attack:completed%2?'scraper':'lame',ink:battleStage==='fury'||battleStage==='escalation'&&completed%2===1};}
function create(){return {...Core.create(),hp:36,maxHp:36,fullFight:true,phase:'bout-rest',timer:90,completed:0,battleStage:'opening',attack:'lame',ink:null,wave:null,inkCycles:0};}
function prepare(e){e.phase='prepare';e.timer=e.attack==='scraper'?72:60;e.locked=false;e.lane=e.attack==='scraper'?300:280;e.wave=null;}
function update(e,p,hit=()=>false){
 if(!e.alive){e.ink=null;e.wave=null;p.waterPush=null;Core.update(e,p);return;}
 if(e.ink&&++e.ink.age>=Ink.INK_LIFE)e.ink=null;
 if(e.phase==='bout-rest'||e.phase.startsWith('ink-')){
  e.age++;e.inv=Math.max(0,e.inv-1);if(--e.timer>0)return;
  if(e.phase==='bout-rest'){
   const next=plan(e.completed);e.battleStage=next.battleStage;e.attack=next.attack;
   if(next.ink){e.phase='ink-inhale';e.timer=72;}else prepare(e);
  }else if(e.phase==='ink-inhale'){e.phase='ink-spit';e.timer=24;e.ink={age:0};e.inkCycles++;}
  else prepare(e);
  return;
 }
 const recovering=e.phase==='recover';
 if(e.attack==='scraper')Scraper.update(e,p,hit);else Core.update(e,p);
 if(recovering&&e.phase==='observe'){
  e.completed++;e.battleStage=stage(e.completed);e.phase='bout-rest';e.timer=e.battleStage==='fury'?24:e.battleStage==='escalation'?40:52;
 }
}
function shot(e,s){const result=Core.shot(e,s);if(result==='defeat'){e.ink=null;e.wave=null;}return result;}
const api={create,update,shot,plan,stage};root.CrustDeepFight=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
