const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function game(saved={},options={}) {
 const html=options.html??fs.readFileSync(path.join(root,'index.html'),'utf8');
 const storage=new Map(Object.entries(saved)),elements=new Map(),listeners={},windowListeners={},audio={toggles:0,effects:[]};
 const trace=[];
 // Normalize extracted fallback paths to their original data URI identity, so
 // pre-extraction draw baselines still compare the same image bytes.
 const clean=v=>{
  if(!v||typeof v!=='object')return v;
  if(!v.src)return 'gradient';
  const src=v.src.startsWith('art/fallback-')?'data:image/png;base64,'+fs.readFileSync(path.join(root,v.src)).toString('base64'):v.src;
  return {image:require('node:crypto').createHash('sha256').update(src).digest('hex')};
 };
 const gradient={addColorStop(...args){trace.push(['addColorStop',...args])}};
 const g=options.context??new Proxy({}, {get:(o,k)=>o[k]??((...args)=>{trace.push([k,...args.map(clean)]);return gradient}),set:(o,k,v)=>{trace.push(['set',k,clean(v)]);o[k]=v;return true}});
 for(const [,id] of html.matchAll(/id="([^"]+)"/g))elements.set(id,{style:{display:id==='verticalMap'?'none':''},textContent:'',listeners:{},getContext:()=>g,addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}});
 const touch=[...html.matchAll(/<button data-key="([^"]+)"/g)].map(([,key])=>({dataset:{key},style:{},listeners:{},setPointerCapture(){},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}}));
 const event=(target,type,props={})=>{for(const fn of target[type]??[])fn({key:'',button:0,pointerId:1,repeat:false,preventDefault(){},stopImmediatePropagation(){},...props})};
 const context={console,Math:Object.create(Math),Image:options.Image??class {complete=false;naturalWidth=0},document:{getElementById(id){assert.ok(elements.has(id),'Unknown element '+id);return elements.get(id)},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},querySelectorAll(){return touch}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(){},addEventListener(type,fn){(windowListeners[type]??=[]).push(fn)},AudioKit:{start(){},effect(name){audio.effects.push(name)},toggle(){audio.toggles++}}};
 context.Math.random=()=>0.5;context.window=context;context.location={search:options.search??'?pickups=off&supplies=off&signs=off&map=off&goals=off&enemies=off&baker=off&slinger=off&foreman=off&fungal=off&clockwork=off'};vm.createContext(context);
 for(const [,url]of html.matchAll(/<script src="([^"]+)"/g)){const src=url.split('?')[0];if(src!=='audio.js')vm.runInContext(fs.readFileSync(src==='art/vertical-bakery2-layout.js'&&(options.originalLayout||options.layoutFixture2)?path.join(__dirname,'fixtures',options.layoutFixture2||'bakery2-original.js'):src==='art/vertical-bakery1-layout.js'&&(options.originalLayout||options.layoutFixture)?path.join(__dirname,'fixtures',options.layoutFixture||'bakery1-original.js'):src==='art/vertical-bakery3-layout.js'&&(options.originalLayout||options.layoutFixture3)?path.join(__dirname,'fixtures',options.layoutFixture3||'bakery3-original.js'):path.join(root,src),'utf8'),context,{filename:src});}
 vm.runInContext(html.split('<script>').pop().split('</script>')[0],context);
 assert.ok(!elements.get('status').textContent.startsWith('Game error:'),elements.get('status').textContent);
 return {run:s=>vm.runInContext(s,context),storage,audio,elements,touch,trace,
  key(key,type='keydown',repeat=false){event(listeners,type,{key,repeat})},
  pointer(key,type,props={}){event(touch.find(b=>b.dataset.key===key).listeners,type,props)},
  blur(){event(windowListeners,'blur')},
  enter(){for(const fn of listeners.keydown??[])fn({key:'Enter',repeat:false,preventDefault(){},stopImmediatePropagation(){}})},
  tap(){for(const fn of elements.get('c').listeners.pointerdown??[])fn({})}};
}

module.exports={game};
