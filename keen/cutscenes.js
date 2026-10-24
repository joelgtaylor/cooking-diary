/* Deterministic presentation timelines. No game state, physics, or wall-clock timers. */
'use strict';
function createCutsceneTimeline({render=()=>{},cue=()=>{},complete=()=>{}}={}){
 let scene=null,elapsed=0,previous=null,eventIndex=0,status='idle';
 function finish(reason){if(status!=='playing')return;status=reason;previous=null;complete(reason);}
 return {
  get active(){return status==='playing';},get status(){return status;},get elapsed(){return elapsed;},
  play(definition){
   if(status==='playing')throw Error('A cutscene is already playing');
   if(!Number.isFinite(definition.duration)||definition.duration<=0)throw Error('Invalid cutscene duration');
   scene={...definition,events:[...(definition.events||[])].sort((a,b)=>a.at-b.at)};
   elapsed=0;previous=null;eventIndex=0;status='playing';
  },
  frame(now,{suspended=false,reducedMotion=false}={}){
   if(status!=='playing'||!Number.isFinite(now))return;
   if(suspended){previous=null;return;}
   if(previous!==null)elapsed=Math.min(scene.duration,elapsed+Math.max(0,now-previous));
   previous=now;
   while(eventIndex<scene.events.length&&scene.events[eventIndex].at<=elapsed)cue(scene.events[eventIndex++]);
   render(scene,elapsed,{reducedMotion});
   if(elapsed>=scene.duration)finish('completed');
  },
  skip(){finish('skipped');}
 };
}
const CAMPAIGN_HANDOFF_KEY='crustQuestCampaignArrival';
function createCampaignHandoff(storage,now=()=>Date.now()){
 const valid=t=>t&&t.version===1&&t.from===3&&t.world===4&&['loafy','vance-wick'].includes(t.character)&&Number.isFinite(t.at)&&now()-t.at>=0&&now()-t.at<=120000;
 return {
  write(character){try{const token={version:1,from:3,world:4,character,at:now()};if(!valid(token))return false;storage.setItem(CAMPAIGN_HANDOFF_KEY,JSON.stringify(token));return true;}catch{return false;}},
  consume(){try{const raw=storage.getItem(CAMPAIGN_HANDOFF_KEY);storage.removeItem(CAMPAIGN_HANDOFF_KEY);const token=JSON.parse(raw||'null');return valid(token)?token:null;}catch{return null;}}
 };
}
if(typeof module!=='undefined')module.exports={createCutsceneTimeline,createCampaignHandoff,CAMPAIGN_HANDOFF_KEY};
