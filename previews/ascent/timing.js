/* Preserve the original 60Hz simulation regardless of display/render cadence. */
'use strict';
function createFixedStepClock(stepMs=1000/60,maxSteps=8){
 let previous=null,accumulator=0;
 return {
  reset(){previous=null;accumulator=0;},
  advance(now,step){
   if(!Number.isFinite(now))return 0;
   if(previous===null||now<previous){previous=now;accumulator=0;return 0;}
   const elapsed=Math.min(now-previous,stepMs*maxSteps);previous=now;
   accumulator+=elapsed;let count=0;
   while(count<maxSteps&&accumulator+1e-7>=stepMs){
    step();accumulator=Math.max(0,accumulator-stepMs);count++;
   }
   return count;
  }
 };
}
if(typeof module!=='undefined')module.exports={createFixedStepClock};
