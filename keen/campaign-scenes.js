/* Presentation adapter for the classic-script game. Only this file owns scene UI. */
'use strict';
let campaignArrival=null,cutsceneReturn=null,cutsceneNavigating=false;
let campaignStorage;try{campaignStorage=window.sessionStorage;}catch{}
const campaignHandoff=createCampaignHandoff(campaignStorage);
const descentBackdrop=new Image();descentBackdrop.src='art/cinematic-sunken.webp';
const DESCENT_SCENE=Object.freeze({id:'descent',duration:11000,events:[
 {at:0,caption:'Below the Clockwork Ovens, a pressure hatch opens.',chapter:'THE LAST OVEN WASN’T THE LAST STOP'},
 {at:3200,caption:'hero',chapter:'ONE WAY DOWN'},
 {at:6800,caption:'The Sunken Patisserie. Something is still baking down here.',chapter:'WORLD 4 · THE SUNKEN PATISSERIE'}
]});
const campaignScene=createCutsceneTimeline({
 render:drawCampaignScene,
 cue:event=>{
  shellEl('cutsceneCaption').textContent=event.caption==='hero'?(selectedCharacterId==='vance-wick'?'Vance Wick: “Underwater bakery? I’m going in.”':'Loafy: “A pressure seal… someone’s keeping the ovens dry.”'):event.caption;
  shellEl('cutsceneChapter').textContent=event.chapter;
  if(event.at===3200)AudioKit.effect('pogo');
 },
 complete:()=>{
  shellClearInput();simulationClock.reset();
  if(cutsceneNavigating){
   // Mint at departure, not scene entry; a hidden tab cannot age the token out.
   campaignHandoff.write(selectedCharacterId);
   window.location.assign(window.CrustWorlds[3].href);return;
  }
  shellEl('cutsceneOverlay').hidden=true;shellEl('wrap').dataset.cutscene='false';
  state=cutsceneReturn.state;shellSavedState=cutsceneReturn.saved;
  shellEl('shellOverlay').hidden=state!=='shell-menu';
  syncGameShell();(state==='shell-menu'?shellEl('replayTransition'):shellEl('gameStage')).focus();
 }
});
function playCampaignDescent({navigate=false}={}){
 if(campaignScene.active||cutsceneNavigating||artworkLoading)return;
 cutsceneReturn={state,saved:shellSavedState};cutsceneNavigating=navigate;
 shellClearInput();simulationClock.reset();state='cutscene';
 shellEl('shellOverlay').hidden=true;shellEl('cutsceneOverlay').hidden=false;shellEl('wrap').dataset.cutscene='true';
 shellEl('cutsceneSkip').textContent=navigate?'Skip → World 4':'Skip scene';
 shellEl('cutsceneSkip').focus();campaignScene.play(DESCENT_SCENE);
 campaignScene.frame(0); // Initial caption and still frame are available immediately.
 // Rebase on the first browser frame; RAF timestamps do not start at zero.
 campaignScene.frame(0,{suspended:true});
}
function initCampaignScenes(world){
 if(world===4)campaignArrival=campaignHandoff.consume();
 else campaignHandoff.consume(); // Clear abandoned arrivals when returning to the dry campaign.
 if(campaignArrival)selectCharacter(campaignArrival.character);
 shellEl('cutsceneSkip').addEventListener('click',()=>campaignScene.skip());
 shellEl('replayTransition').addEventListener('click',()=>playCampaignDescent());
 // Capture before either dry or water input adapters; native button activation
 // remains available to keyboard and assistive technology.
 document.addEventListener('keydown',e=>{
  if(!campaignScene.active&&!cutsceneNavigating)return;
  if(e.key==='Tab'){e.preventDefault();shellEl('cutsceneSkip').focus();}
  else if(e.key==='Escape'){e.preventDefault();if(!e.repeat)campaignScene.skip();}
  else if(!((e.key==='Enter'||e.key===' ')&&e.target===shellEl('cutsceneSkip')))e.preventDefault();
  e.stopImmediatePropagation();
 },true);
 const pause=shellPause;
 shellPause=function(reason){if(campaignScene.active||cutsceneNavigating){shellClearInput();return;}pause(reason);};
 const loaded=completeArtworkLoading;
 completeArtworkLoading=function(){
  loaded();
  if(!campaignArrival)return;
  campaignArrival=null;
  // If interrupted while loading, preserve the usual explicit Resume boundary.
  if(document.hidden)return;
  shellSavedState='play';shellResume(false);
 };
}
function campaignSceneFrame(now){
 if(!campaignScene.active&&!cutsceneNavigating)return false;
 simulationClock.reset();
 campaignScene.frame(now,{suspended:document.hidden,reducedMotion:!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
 syncGameShell();return true;
}
function drawCampaignHero(x,y,row,frame,scale=1){
 const vance=selectedCharacterId==='vance-wick',art=vance?vanceWickArt:bakerPilotArt;
 const sprite=(vance?VANCE_WICK_SPRITES:BAKER_PILOT_SPRITES)[row][frame];
 if(!art?.complete||!art.naturalWidth)return;
 g.drawImage(art,...sprite.crop,x+(sprite.left??-sprite.w/2)*scale,y-sprite.h*scale,sprite.w*scale,sprite.h*scale);
}
function drawCampaignScene(scene,ms,{reducedMotion}){
 const t=ms/1000,still=reducedMotion;
 g.save();g.fillStyle='#08141e';g.fillRect(0,0,W,H);
 if(t<3.2){
  const bg=assets.generatedClockworkBG;
  if(bg?.complete&&bg.naturalWidth)g.drawImage(bg,0,0,W,H);
  g.fillStyle='#08111e88';g.fillRect(0,0,W,H);
  g.fillStyle='#292f35';g.fillRect(0,360,W,180);
  g.strokeStyle='#d5ac70';g.lineWidth=8;g.strokeRect(580,348,170,110);
  g.fillStyle='#04121f';g.fillRect(590,358,150,90);
  g.strokeStyle='#7ed6df';g.lineWidth=2;g.strokeRect(602,370,126,66);
  const x=still?540:370+Math.min(1,t/2.6)*230;
  drawCampaignHero(x,360,still?0:1,still?0:Math.floor(t*7)%4,1.7);
  // A tiny loaf-shaped float bobs through the hatch before the hero.
  g.fillStyle='#e7bc78';g.beginPath();g.ellipse(654,still?388:390+Math.sin(t*2)*5,18,9,0,0,7);g.fill();
 }else{
  const reveal=t>=6.8,p=still?.55:Math.max(0,Math.min(1,(t-6.8)/4.2));
  if(reveal&&descentBackdrop.complete&&descentBackdrop.naturalWidth){
   // Top panel only: no concept-sheet seams or labels.
   const z=still?1:1.08-p*.08;
   g.drawImage(descentBackdrop,0,0,descentBackdrop.naturalWidth,descentBackdrop.naturalHeight,-W*(z-1)/2,65,W*z,405*z);
   g.fillStyle='#06334644';g.fillRect(0,0,W,H);
  }else{
   const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#18434c');grad.addColorStop(1,'#071622');g.fillStyle=grad;g.fillRect(0,0,W,H);
   g.fillStyle='#263e48';for(let i=0;i<6;i++)g.fillRect(i*195-50,-60,66,700);
  }
  if(!still){g.strokeStyle='#c5f1ee66';g.lineWidth=2;for(let i=0;i<15;i++){const y=(i*67-t*36+1100)%540;g.beginPath();g.arc(100+i*57,y,3+i%4,0,7);g.stroke();}}
  const x=reveal?220+p*50:470,y=reveal?325:still?280:220+(t-3.2)*34;
  drawCampaignHero(x,y,2,2,1.6);
  if(!reveal){g.fillStyle='#e7bc78';g.beginPath();g.ellipse(x+75,y-65,18,9,0,0,7);g.fill();}
 }
 // Slow bookend fades; reduced motion uses stable compositions and hard cuts.
 if(!still){g.fillStyle='#07111c';g.globalAlpha=Math.max(0,1-ms/650,(ms-10400)/600);g.fillRect(0,0,W,H);}
 g.restore();
}
