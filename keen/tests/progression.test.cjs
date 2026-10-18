const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function game(saved={}) {
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const storage=new Map(Object.entries(saved)),elements=new Map();
 const gradient={addColorStop(){}};
 const g=new Proxy({}, {get:(o,k)=>o[k]??(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 for(const [,id] of html.matchAll(/id="([^"]+)"/g))elements.set(id,{style:{display:id==='verticalMap'?'none':''},textContent:'',listeners:{},getContext:()=>g,addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}});
 const context={console,Math:Object.create(Math),Image:class {complete=false;naturalWidth=0},document:{getElementById(id){assert.ok(elements.has(id),'Unknown element '+id);return elements.get(id)},addEventListener(){},querySelectorAll(){return []}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(){},addEventListener(){},AudioKit:{start(){},effect(){},toggle(){}}};
 context.Math.random=()=>0.5;context.window=context;vm.createContext(context);
 for(const [,src]of html.matchAll(/<script src="([^"]+)"/g))if(src!=='audio.js')vm.runInContext(fs.readFileSync(path.join(root,src),'utf8'),context,{filename:src});
 vm.runInContext(html.split('<script>').pop().split('</script>')[0],context);
 assert.ok(!elements.get('status').textContent.startsWith('Game error:'),elements.get('status').textContent);
 return {run:s=>vm.runInContext(s,context),storage};
}
test('three vertical bakeries initialize, render, respawn, collect and unlock recipes',()=>{
 const {run,storage}=game();
 for(let stage=1;stage<=3;stage++){
  run(`init(${stage}); draw();`);
  assert.equal(run('rows'),56);assert.equal(run('gems.length'),5);
  assert.equal(run('state'),'play');
  // Activate the second checkpoint by entering its proximity, then recover there.
  run('var cp=currentVerticalLayout().checkpoints[1];player.x=cp[0]*T;player.y=cp[1]*T-22;tickPhase3();');
  assert.equal(run('phase3State.current'),1);
  run('player.health=1;player.inv=0;damage();');
  assert.equal(run('player.health'),3);
  assert.equal(run('player.x'),run('phase3State.spawns[1].x'));
  run('enemies=[];for(const gem of gems){player.x=gem.x;player.y=gem.y;player.vx=0;player.vy=0;keys={};update();}');
  assert.equal(run('collected'),5);
  run('player.x=currentVerticalLayout().oven.x*T;player.y=currentVerticalLayout().oven.y*T;tickPhase3();draw();');
  assert.equal(run('state'),'clear');
  assert.ok(JSON.parse(storage.get('crustQuestCodex')).includes(stage-1));
 }
 const restored=game(Object.fromEntries(storage));assert.equal(restored.run('unlocked.length'),3);
});
test('production no longer loads or exposes classic mode',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.doesNotMatch(html,/__crustCameraDemo|cameraNormalBtn|cameraDemoBtn|switchMode|src="art\/bakery1-layout.js"|src="art\/authored-bakeries-2-3.js"/);
});
