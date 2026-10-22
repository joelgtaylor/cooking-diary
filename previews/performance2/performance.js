/* Opt-in local frame timings. No network, storage or gameplay changes. */
'use strict';
function createFrameMonitor(){
 if(!/(?:^|[?&])perf=1(?:&|$)/.test(window.location?.search||''))return null;
 const output=document.createElement('pre');
 output.id='frameTiming';output.setAttribute('aria-live','off');
 output.style.cssText='position:fixed;right:8px;top:8px;z-index:10;padding:8px;background:#101522ee;color:#fff;font:12px/1.4 monospace;pointer-events:none;white-space:pre';
 document.getElementById('wrap').appendChild(output);
 const intervals=[],cpu=[];let previous=null,start=0,frames=0;
 return {
  begin(now){
   if(previous!==null&&now>previous&&now-previous<250){intervals.push(now-previous);if(intervals.length>180)intervals.shift();}
   previous=now;start=performance.now();
  },
  end(){
   cpu.push(performance.now()-start);if(cpu.length>180)cpu.shift();
   if(++frames%30!==0)return;
   const average=a=>a.length?a.reduce((sum,v)=>sum+v,0)/a.length:0;
   const ordered=intervals.slice().sort((a,b)=>a-b);
   const p95=ordered[Math.max(0,Math.ceil(ordered.length*.95)-1)]||0;
   const ready=Array.from({length:9},(_,i)=>assets['moonlitShadedTerrain'+i]).filter(a=>a?.complete&&a.naturalWidth===256&&a.naturalHeight===96).length;
   output.textContent='Forecourt performance v2\n'+(1000/(average(intervals)||Infinity)).toFixed(0)+' FPS · p95 '+p95.toFixed(1)+' ms\nCPU '+average(cpu).toFixed(1)+' ms/frame\nShaded textures '+ready+'/9\nBakery '+bakery+' · '+state;
  }
 };
}
