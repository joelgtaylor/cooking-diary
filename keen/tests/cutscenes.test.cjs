const {test}=require('node:test'),assert=require('node:assert/strict');
const {createCutsceneTimeline,createCampaignHandoff}=require('../cutscenes.js');
test('timeline fires sorted cues exactly once, freezes on suspension, and completes once',()=>{
 const cues=[],ends=[],frames=[];const scene=createCutsceneTimeline({cue:e=>cues.push(e.id),complete:e=>ends.push(e),render:(s,t,o)=>frames.push([t,o.reducedMotion])});
 const definition={duration:1000,events:[{at:900,id:3},{at:0,id:1},{at:500,id:2}]};scene.play(definition);
 scene.frame(100);scene.frame(700);assert.deepEqual(cues,[1,2]);scene.frame(1000,{suspended:true});scene.frame(6000);assert.equal(scene.elapsed,600);
 scene.frame(6400,{reducedMotion:true});scene.skip();scene.frame(7000);
 assert.deepEqual(cues,[1,2,3]);assert.deepEqual(ends,['completed']);assert.deepEqual(frames.at(-1),[1000,true]);assert.equal(scene.active,false);
 scene.play(definition);scene.skip();scene.skip();assert.deepEqual(ends,['completed','skipped']);
});
test('arrival token rejects malformed, wrong-world, expired and future data and removes each once',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 let now=100000;const token=createCampaignHandoff(storage,()=>now);assert.equal(token.write('vance-wick'),true);assert.equal(token.consume().character,'vance-wick');assert.equal(token.consume(),null);
 for(const raw of ['oops','null','{}',JSON.stringify({version:1,from:3,world:2,character:'loafy',at:now})]){
  storage.setItem('crustQuestCampaignArrival',raw);assert.equal(token.consume(),null);assert.equal(data.size,0);
 }
 token.write('loafy');now+=120001;assert.equal(token.consume(),null);assert.equal(token.write('other'),false);
 assert.equal(createCampaignHandoff(undefined).write('loafy'),false);assert.equal(createCampaignHandoff(undefined).consume(),null);
});

test('both page audio facades preserve mute without initializing audio on arrival',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const saved=new Map([['crustQuestMuted','true']]);
 for(const file of ['audio.js','sunken/flooded-entrance/audio.js']){
  let created=0;const button={};const engine={mute(){},visibility:async()=>{},pause(){},start(){},stop(){},effect(){}};
  const factory={create(){created++;return engine;}};const window={CrustSoundtrack:factory,SunkenPreviewAudio:factory};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{window,console,document:{hidden:false,getElementById:()=>button,addEventListener(){}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)}});
  const a=window.AudioKit;a.scene(1,'play');a.start();assert.equal(created,0);assert.equal(button.textContent,'♫ Sound: OFF');
  a.toggle();assert.equal(saved.get('crustQuestMuted'),'false');assert.equal(created,1);a.toggle();assert.equal(saved.get('crustQuestMuted'),'true');
 }
});
