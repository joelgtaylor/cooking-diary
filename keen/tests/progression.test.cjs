const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function game(saved={}) {
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const storage=new Map(Object.entries(saved)),elements=new Map(),listeners={},windowListeners={},audio={toggles:0};
 const gradient={addColorStop(){}};
 const g=new Proxy({}, {get:(o,k)=>o[k]??(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 for(const [,id] of html.matchAll(/id="([^"]+)"/g))elements.set(id,{style:{display:id==='verticalMap'?'none':''},textContent:'',listeners:{},getContext:()=>g,addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}});
 const touch=[...html.matchAll(/<button data-key="([^"]+)"/g)].map(([,key])=>({dataset:{key},style:{},listeners:{},setPointerCapture(){},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}}));
 const event=(target,type,props={})=>{for(const fn of target[type]??[])fn({key:'',button:0,pointerId:1,repeat:false,preventDefault(){},stopImmediatePropagation(){},...props})};
 const context={console,Math:Object.create(Math),Image:class {complete=false;naturalWidth=0},document:{getElementById(id){assert.ok(elements.has(id),'Unknown element '+id);return elements.get(id)},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},querySelectorAll(){return touch}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(){},addEventListener(type,fn){(windowListeners[type]??=[]).push(fn)},AudioKit:{start(){},effect(){},toggle(){audio.toggles++}}};
 context.Math.random=()=>0.5;context.window=context;vm.createContext(context);
 for(const [,src]of html.matchAll(/<script src="([^"]+)"/g))if(src!=='audio.js')vm.runInContext(fs.readFileSync(path.join(root,src),'utf8'),context,{filename:src});
 vm.runInContext(html.split('<script>').pop().split('</script>')[0],context);
 assert.ok(!elements.get('status').textContent.startsWith('Game error:'),elements.get('status').textContent);
 return {run:s=>vm.runInContext(s,context),storage,audio,elements,touch,
  key(key,type='keydown',repeat=false){event(listeners,type,{key,repeat})},
  pointer(key,type,props={}){event(touch.find(b=>b.dataset.key===key).listeners,type,props)},
  blur(){event(windowListeners,'blur')},
  enter(){for(const fn of listeners.keydown??[])fn({key:'Enter',repeat:false,preventDefault(){},stopImmediatePropagation(){}})},
  tap(){for(const fn of elements.get('c').listeners.pointerdown??[])fn({})}};
}
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
  run('player.x=currentVerticalLayout().oven.x*T;player.y=currentVerticalLayout().oven.y*T;updateWorldProgress();draw();');
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
 run('player.x=currentVerticalLayout().oven.x*T;player.y=currentVerticalLayout().oven.y*T;collected=4;updateWorldProgress()');
 assert.equal(run('state'),'play');assert.equal(storage.has('crustQuestCodex'),false);
 run('collected=5;player.x=0;player.y=0;updateWorldProgress()');
 assert.equal(run('state'),'play');
 run('player.x=currentVerticalLayout().oven.x*T;player.y=currentVerticalLayout().oven.y*T;player.score=1234;updateWorldProgress()');
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
