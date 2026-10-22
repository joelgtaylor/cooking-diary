/* Startup artwork gate. Primary sprites are eager-loaded once, then reused by
 * their existing renderers. No gameplay runs behind the loading screen. */
'use strict';
function waitForArtwork(entry,{retry=false,timeout=30000,timers=globalThis}={}){
 const img=entry.image;
 return new Promise((resolve,reject)=>{
  let settled=false,decoding=false,timer;
  const finish=error=>{if(settled)return;settled=true;timers.clearTimeout?.(timer);img.removeEventListener?.('load',loaded);img.removeEventListener?.('error',failed);error?reject(error):resolve(entry);};
  const failed=()=>finish(Error('Artwork unavailable: '+entry.label));
  const loaded=()=>{
   if(decoding||settled)return;
   if(!img.naturalWidth||!img.naturalHeight||entry.width&&img.naturalWidth!==entry.width||entry.height&&img.naturalHeight!==entry.height){failed();return;}
   decoding=true;
   Promise.resolve().then(()=>img.decode?.()).then(()=>finish(),failed);
  };
  img.addEventListener?.('load',loaded);img.addEventListener?.('error',failed);
  timer=timers.setTimeout?.(failed,timeout);
  if(retry)img.src=img.src;
  if(img.complete)loaded();
 });
}
let artworkLoading=false,artworkLoadGeneration=0;
function prepareStartupArtwork(){
 loadBloomrotArt();
 if(!assets.devourerForms)loadArt('devourerForms','art/devourer-forms.png');
 if(!assets.devourerDefeated)loadArt('devourerDefeated','art/devourer-defeated.png');
 const lazy=[
  ['baker-grunge-actions.png',img=>bakerPilotArt=img,887,1774],
  ['vance-wick-actions.webp',img=>vanceWickArt=img,1024,2048],
  ['moonlit-opening-enemies.png',img=>openingEnemyArt=img,1536,1024],
  ['moonlit-dough-slinger.png',img=>slingerArt=img,2172,724],
  ['fungal-enemies.png',img=>fungalArt=img,1536,1024],
  ['sporewing.png',img=>sporewingArt=img,1536,1024],
  ['clockwork-enemies.png',img=>clockworkEnemyArt=img,1536,1024],
  ['foreman-walk.png',img=>foremanWalkArt=img,2172,724],
  ['oven-goal-indicators.png',img=>ovenGoalArt=img,1254,1254],
  ['culture-kefir-pickups.png',img=>pickupIdentityArt=img,1774,887],
  ['supply-pickups.png',img=>supplyPickupArt=img,1536,1024],
  ['cavern-discovery-atlas.webp',img=>cavernDistrictArt=img,1536,1024],
  ['clockwork-entrance-plates.png',img=>entranceIndicatorArt=img,1536,1024],
  ['clockwork-route-plates.png',img=>clockworkIndicatorArt=img,1536,1024],
  ['plunge-route-sign.png',img=>plungeIndicatorArt=img,1105,1423]
 ];
 const fallback=/^(retroStage|phase3|bakerAI|bakerReimagined|bakerPhase4|tiles$|background$|items$|gremlinRun$|gremlinExpressions$)/;
 const entries=Object.entries(assets).filter(([name])=>!fallback.test(name)).map(([label,image])=>({label,image}));
 for(const [file,assign,width,height]of lazy){const image=new Image();assign(image);image.src='art/'+file;entries.push({label:file,image,width,height});}
 return entries;
}
function completeArtworkLoading(){
 artworkLoading=false;document.getElementById('wrap').dataset.loading='false';
 document.getElementById('loadingOverlay').hidden=true;document.getElementById('gameStage').setAttribute('aria-busy','false');
 shellClearInput();simulationClock.reset();document.getElementById('shellResume').focus();
}
function beginArtworkLoading(){
 const entries=prepareStartupArtwork(),overlay=document.getElementById('loadingOverlay'),message=document.getElementById('loadingMessage'),progress=document.getElementById('loadingProgress'),retryButton=document.getElementById('loadingRetry');
 let failed=[];
 async function run(batch,retry=false){
  const generation=++artworkLoadGeneration;
  artworkLoading=true;document.getElementById('wrap').dataset.loading='true';overlay.hidden=false;retryButton.hidden=true;
  document.getElementById('gameStage').setAttribute('aria-busy','true');overlay.focus();
  let done=entries.length-batch.length;progress.max=entries.length;progress.value=done;
  message.textContent='Preparing the bakeries…';
  const results=await Promise.allSettled(batch.map(entry=>waitForArtwork(entry,{retry}).finally(()=>{if(generation===artworkLoadGeneration)progress.value=++done;})));
  if(generation!==artworkLoadGeneration)return;
  failed=batch.filter((entry,i)=>results[i].status==='rejected');
  if(failed.length){message.textContent='Some artwork couldn’t load. Check your connection and try again.';retryButton.hidden=false;retryButton.focus();return;}
  completeArtworkLoading();
 }
 retryButton.addEventListener('click',()=>run(failed,true));run(entries);
}
if(typeof module!=='undefined')module.exports={waitForArtwork};
