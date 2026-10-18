const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function game(saved={}) {
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const storage=new Map(Object.entries(saved)),elements=new Map(),listeners={};
 const gradient={addColorStop(){}};
 const g=new Proxy({}, {get:(o,k)=>o[k]??(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 for(const [,id] of html.matchAll(/id="([^"]+)"/g))elements.set(id,{style:{display:id==='verticalMap'?'none':''},textContent:'',listeners:{},getContext:()=>g,addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}});
 const context={console,Math:Object.create(Math),Image:class {complete=false;naturalWidth=0},document:{getElementById(id){assert.ok(elements.has(id),'Unknown element '+id);return elements.get(id)},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},querySelectorAll(){return []}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(){},addEventListener(){},AudioKit:{start(){},effect(){},toggle(){}}};
 context.Math.random=()=>0.5;context.window=context;vm.createContext(context);
 for(const [,src]of html.matchAll(/<script src="([^"]+)"/g))if(src!=='audio.js')vm.runInContext(fs.readFileSync(path.join(root,src),'utf8'),context,{filename:src});
 vm.runInContext(html.split('<script>').pop().split('</script>')[0],context);
 assert.ok(!elements.get('status').textContent.startsWith('Game error:'),elements.get('status').textContent);
 return {run:s=>vm.runInContext(s,context),storage,
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
