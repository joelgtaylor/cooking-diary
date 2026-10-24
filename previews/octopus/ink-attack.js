/* Camera-facing ink is a harmless timed overlay, followed by approved tool attacks. */
(function(root){
'use strict';
const Core=root.CrustDeep||(typeof require==='function'?require('./master-of-deep.js'):null);
const Scraper=root.CrustScraper||(typeof require==='function'?require('./bench-scraper.js'):null);
const INK_LIFE=240;
function create(){return {...Core.create(),inkTrial:true,phase:'ink-inhale',timer:72,ink:null,inkCycles:0,nextAttack:'lame',attack:'lame',wave:null};}
function update(e,p,hit=()=>false){
 if(!e.alive){e.ink=null;e.wave=null;p.waterPush=null;Core.update(e,p);return;}
 if(e.ink&&++e.ink.age>=INK_LIFE)e.ink=null;
 if(e.phase.startsWith('ink-')){
  e.age++;e.inv=Math.max(0,e.inv-1);
  if(--e.timer>0)return;
  if(e.phase==='ink-rest'){e.phase='ink-inhale';e.timer=72;return;}
  if(e.phase==='ink-inhale'){e.phase='ink-spit';e.timer=24;e.ink={age:0};return;}
  e.attack=e.nextAttack;e.nextAttack=e.attack==='lame'?'scraper':'lame';e.inkCycles++;
  e.phase='prepare';e.timer=e.attack==='scraper'?72:60;e.locked=false;e.lane=e.attack==='scraper'?300:280;e.wave=null;
  return;
 }
 const recovering=e.phase==='recover';
 if(e.attack==='scraper')Scraper.update(e,p,hit);else Core.update(e,p);
 if(recovering&&e.phase==='observe'){e.phase='ink-rest';e.timer=70;}
}
function shot(e,s){const result=Core.shot(e,s);if(result==='defeat'){e.ink=null;e.wave=null;}return result;}
function overlay(e,p,reduced=false){
 if(!e.ink||!e.alive)return null;
 const age=e.ink.age,arrival=Math.min(1,age/18),fade=age>186?(INK_LIFE-age)/54:1;
 return {age,arrival,opacity:Math.max(0,Math.min(.98,.98*arrival*fade))*(reduced?.28:1),
  clear:reduced?{x:p.x+p.w/2,y:p.y+p.h/2,r:100}:null,
  opening:{x:650+Math.sin(age*.015)*130,y:170+Math.cos(age*.021)*45,r:55},
  width:70+1280*arrival,height:45+850*arrival,x:760+(480-760)*arrival,y:250+(290-250)*arrival};
}
const api={create,update,shot,overlay,INK_LIFE};root.CrustInk=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
