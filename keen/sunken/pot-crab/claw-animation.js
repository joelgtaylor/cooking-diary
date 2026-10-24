/* Visual-only timing adapter. Never changes crab state, damage, or collision. */
(function(root){
'use strict';
function pose(e){
 if(!e.alive||e.phase!=='open')return null;
 if(e.timer<=58&&e.timer>34){
  const t=(58-e.timer)/23,s=t*t*(3-2*t);
  return {frame:0,reach:12+48*s,stage:'reach'};
 }
 if(e.timer<=34&&e.timer>22)return {frame:e.timer>=33?1:2,reach:60,stage:'grab'};
 if(e.timer<=22&&e.timer>8)return {frame:e.timer>18?2:e.timer>14?1:0,reach:60*(e.timer-8)/14,stage:'retract'};
 return null;
}
const api={pose};root.CrustCrabClaws=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
