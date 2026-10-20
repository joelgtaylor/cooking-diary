const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const {game}=require('./game-harness.cjs');
test('three vertical bakeries initialize, render, respawn, collect and unlock recipes',()=>{
 const {run,storage}=game();
 for(let stage=1;stage<=3;stage++){
  run(`init(${stage}); draw();`);
  assert.equal(run('rows'),56);assert.equal(run('gems.length'),5);
  assert.equal(run('state'),'play');
  // Activate the second checkpoint by entering its proximity, then recover there.
  run('var cp=currentVerticalLayout().checkpoints[1];player.x=cp[0]*T;player.y=cp[1]*T-22;updateWorldProgress();');
  assert.equal(run('checkpointState.current'),1);
  run('player.health=1;player.inv=0;damage();');
  assert.equal(run('player.health'),3);
  assert.equal(run('player.x'),run('checkpointState.spawns[1].x'));
  run('enemies=[];for(const gem of gems){player.x=gem.x;player.y=gem.y;player.vx=0;player.vy=0;keys={};update();}');
  assert.equal(run('collected'),5);
  run("if(foremanState){foremanState.health=0;foremanState.phase='defeated';foremanState.timer=0;}if(bloomrotState){bloomrotState.health=0;bloomrotState.timer=0;}if(devourerState){devourerState.health=0;devourerState.timer=0;devourerState.finishOven={x:98*T,foot:54*T,landed:true};}");
  run('player.x=worldOvenTarget().x*T;player.y=worldOvenTarget().y*T;updateWorldProgress();draw();');
  assert.equal(run('state'),'clear');
  assert.ok(JSON.parse(storage.get('crustQuestCodex')).includes(stage-1));
 }
 const restored=game(Object.fromEntries(storage));assert.equal(restored.run('unlocked.length'),3);
});
test('production no longer loads or exposes classic mode',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.doesNotMatch(html,/__crustCameraDemo|cameraNormalBtn|cameraDemoBtn|switchMode|src="art\/bakery1-layout.js"|src="art\/authored-bakeries-2-3.js"/);
});

test('keyboard and canvas advance all bakeries and finish at the final win',()=>{
 const {run,enter,tap}=game();
 run('advanceBakery()');assert.equal(run('bakery'),1);
 for(let stage=1;stage<=3;stage++){
  assert.equal(run('bakery'),stage);
  run("state='clear'");
  if(stage===2)tap();else enter();
  if(stage<3){assert.equal(run('state'),'play');assert.equal(run('collected'),0);assert.equal(run('checkpointState.current'),-1);}
 }
 assert.equal(run('bakery'),3);assert.equal(run('state'),'win');
 tap();enter();assert.equal(run('state'),'win');
});
test('completion requires five cultures and proximity; restart keeps persistent rewards',()=>{
 const {run,storage}=game();
 run("if(foremanState){foremanState.health=0;foremanState.phase='defeated';foremanState.timer=0;}if(bloomrotState){bloomrotState.health=0;bloomrotState.timer=0;}if(devourerState){devourerState.health=0;devourerState.timer=0;devourerState.finishOven={x:98*T,foot:54*T,landed:true};}");
  run('player.x=worldOvenTarget().x*T;player.y=worldOvenTarget().y*T;collected=4;updateWorldProgress()');
 assert.equal(run('state'),'play');assert.equal(storage.has('crustQuestCodex'),false);
 run("foremanState.health=0;foremanState.phase='defeated';foremanState.timer=0;");
 run('collected=5;player.x=0;player.y=0;updateWorldProgress()');
 assert.equal(run('state'),'play');
 run("if(foremanState){foremanState.health=0;foremanState.phase='defeated';foremanState.timer=0;}if(bloomrotState){bloomrotState.health=0;bloomrotState.timer=0;}if(devourerState){devourerState.health=0;devourerState.timer=0;devourerState.finishOven={x:98*T,foot:54*T,landed:true};}");
  run('player.x=worldOvenTarget().x*T;player.y=worldOvenTarget().y*T;player.score=1234;updateWorldProgress()');
 assert.equal(run('state'),'clear');assert.equal(storage.get('crustQuestBest'),'1234');
 run('updateWorldProgress()');assert.equal(storage.get('crustQuestCodex'),'[0]');
 run('restart()');assert.equal(run('state'),'play');assert.equal(run('collected'),0);
 assert.equal(run('best'),1234);assert.equal(run('unlocked.length'),1);
 assert.equal(run('player.health'),3);assert.equal(run('player.ammo'),35);
});

test('keyboard arrows and uppercase letters retain movement and release correctly',()=>{
 const {key,run}=game();
 for(const k of ['ArrowLeft','ArrowRight','ArrowUp','A','D','W','X','K','C',' ']){
  key(k);assert.equal(run(`keys[${JSON.stringify(k.length===1?k.toLowerCase():k)}]`),true);
  key(k,'keyup');assert.equal(run(`keys[${JSON.stringify(k.length===1?k.toLowerCase():k)}]`),false);
 }
});
test('mute and map are separate; repeat does not retrigger toggles',()=>{
 const {key,run,audio}=game();
 key('m');assert.equal(audio.toggles,1);assert.equal(run('minimap.style.display'),'none');
 key('m','keydown',true);assert.equal(audio.toggles,1);
 key('q');assert.equal(run('minimap.style.display'),'block');assert.equal(audio.toggles,1);
 key('q','keydown',true);assert.equal(run('minimap.style.display'),'block');
 key('q');assert.equal(run('minimap.style.display'),'none');
 key('p');assert.equal(run('state'),'pause');key('p','keydown',true);assert.equal(run('state'),'pause');
 key('p');assert.equal(run('state'),'play');
});
test('pointer controls release on cancel/capture loss and focus loss',()=>{
 const {pointer,run,blur,touch,key}=game();
 pointer('left','pointerdown');assert.equal(run('keys.left'),true);
 pointer('left','pointerdown',{pointerId:2});pointer('left','pointerup');assert.equal(run('keys.left'),true);
 pointer('left','pointercancel',{pointerId:2});assert.equal(run('keys.left'),false);
 pointer('right','pointerdown');pointer('right','lostpointercapture');assert.equal(run('keys.right'),false);
 pointer('jump','pointerdown');key('d');blur();assert.equal(run('Object.keys(keys).length'),0);
 assert.ok(touch.every(b=>b.style.background===''));
 assert.ok(touch.every(b=>!b.listeners.touchstart&&!b.listeners.mousedown));
});
test('touch codex arrows turn one page per pointer gesture',()=>{
 const {key,pointer,run}=game();key('t');assert.equal(run('state'),'codex');
 pointer('right','pointerdown');assert.equal(run('codexPage'),1);
 pointer('right','pointerup');assert.equal(run('codexPage'),1);
});
