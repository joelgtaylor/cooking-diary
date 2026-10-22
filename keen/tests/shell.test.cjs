const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{createShellInput}=require('../input-model.js');const{game}=require('./game-harness.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function shell(options={}){
 const elements=new Map(),listeners={},actions=[];let doc;
 const gradient={addColorStop(){}};const g=new Proxy({}, {get:(o,k)=>o[k]??(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 function element(id,attrs=''){
  const el={id,hidden:/\bhidden\b/.test(attrs),disabled:false,dataset:{},style:{display:attrs.match(/display:([^;"']+)/)?.[1]||'',setProperty(k,v){this[k]=v;}},textContent:'',value:'100',checked:false,clientWidth:1280,clientHeight:720,listeners:{},children:[],classList:{toggle(){},remove(){}},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},setAttribute(k,v){this[k]=v;},focus(){doc.activeElement=this;},matches(){return false;},getContext:()=>g,getClientRects(){return this.hidden?[]:[{}];},querySelectorAll(){return [...elements.values()].filter(x=>x.tag==='button'||x.tag==='input');},replaceChildren(){this.children=[];},append(x){this.children.push(x);},setPointerCapture(){},getBoundingClientRect(){const x=this.dataset.action==='left'?0:this.dataset.action==='right'?80:200;return{left:x,right:x+70,top:500,bottom:570};},closest(){return this.dataset.action?this:null;}};
  elements.set(id,el);return el;
 }
 for(const m of html.matchAll(/<([\w-]+)([^>]*\bid="([^"]+)"[^>]*)>/g)){const el=element(m[3],m[2]);el.tag=m[1];}
 for(const m of html.matchAll(/<button[^>]*data-action="([^"]+)"[^>]*>/g)){const el=element('action-'+m[1]);el.dataset.action=m[1];actions.push(el);}
 doc={hidden:false,fullscreenElement:null,activeElement:null,getElementById:id=>elements.get(id)||null,querySelectorAll:selector=>selector==='[data-action]'?actions:[],addEventListener(type,fn){(listeners[type]??=[]).push(fn);},createElement:tag=>element('created-'+Math.random()),elementFromPoint:x=>x<75?actions.find(x=>x.dataset.action==='left'):x<160?actions.find(x=>x.dataset.action==='right'):null};
 const a=game(options.saved||{}, {html,search:options.search,context:g,globals:{document:doc,innerWidth:1280,innerHeight:720,matchMedia:()=>({matches:false}),...options.globals}});
 // Synchronous DOM fixtures assume preloaded art; loading.test.cjs exercises the async gate.
 a.run('completeArtworkLoading()');
 const fire=(el,type,props={})=>{const event={button:0,pointerId:1,key:'',code:'',detail:1,clientX:30,clientY:530,repeat:false,target:el,preventDefault(){},stopPropagation(){},...props};for(const fn of el?.listeners?.[type]??[])fn(event);};
 const key=(key,code=key,type='keydown')=>{for(const fn of listeners[type]??[])fn({key,code,repeat:false,target:elements.get('gameStage'),preventDefault(){}});};
 return{...a,elements,actions,doc,fire,key,click:id=>fire(elements.get(id),'click'),emitDoc:type=>{for(const fn of listeners[type]??[])fn({});},pointer:(action,type,props)=>fire(actions.find(x=>x.dataset.action===action),type,props)};
}
test('input sources are independent; removing one finger never releases another source',()=>{
 const i=createShellInput();i.set('touch1','left');i.set('touch2','jump');i.set('touch3','shoot');assert.deepEqual(i.snapshot(),{left:true,jump:true,shoot:true});i.release('touch2');assert.deepEqual(i.snapshot(),{left:true,shoot:true});i.set('keyboard','left');i.release('touch1');assert.equal(i.snapshot().left,true);i.clear();assert.deepEqual(i.snapshot(),{});
});
test('Game boots paused, makes no simulation progress until Play, and keeps the existing game intact',()=>{
 const a=shell();assert.equal(a.run('state'),'shell-menu');const before=a.run('JSON.stringify({player,tick,enemies,collected})');a.run('for(let i=0;i<100;i++){update();updateWorldProgress()}');assert.equal(a.run('JSON.stringify({player,tick,enemies,collected})'),before);a.click('shellResume');assert.equal(a.run('state'),'play');a.run('update();syncGameShell()');assert.equal(a.run('tick'),1);
});
test('three-finger movement, jumping and firing work; direction slides transfer and cancel independently',()=>{
 const a=shell();a.click('shellResume');a.pointer('left','pointerdown',{pointerId:1});a.pointer('jump','pointerdown',{pointerId:2,clientX:220});a.pointer('shoot','pointerdown',{pointerId:3,clientX:220});assert.equal(a.run('keys.left&&keys.jump&&keys.shoot'),true);
 a.pointer('left','pointermove',{pointerId:1,clientX:100});assert.equal(a.run('!keys.left&&keys.right&&keys.jump&&keys.shoot'),true);
 a.pointer('left','pointermove',{pointerId:1,clientX:180});assert.equal(a.run('!keys.left&&!keys.right&&keys.jump&&keys.shoot'),true);
 a.pointer('jump','pointercancel',{pointerId:2});assert.equal(a.run('!!keys.jump'),false);assert.equal(a.run('!!keys.shoot'),true);
 a.run('update();syncGameShell()');assert.ok(a.run('shots.length')>0);a.pointer('shoot','pointerup',{pointerId:3});assert.equal(a.run('Object.keys(keys).length'),0);
});
test('a quick Jump or Shoot tap is consumed once even if released between simulation updates',()=>{
 const a=shell();a.click('shellResume');a.pointer('jump','pointerdown',{pointerId:1});a.pointer('jump','pointerup',{pointerId:1});a.run('update();syncGameShell()');assert.ok(a.run('player.vy')<0);
 a.pointer('shoot','pointerdown',{pointerId:2});a.pointer('shoot','pointerup',{pointerId:2});a.run('update();syncGameShell()');assert.equal(a.run('shots.length'),1);assert.equal(a.run('!!keys.shoot'),false);
});
test('keyboard and touch ownership coexist; menu and focus loss clear all held inputs',()=>{
 const a=shell();a.click('shellResume');a.key('a','KeyA');a.pointer('left','pointerdown',{pointerId:1});a.pointer('left','pointerup',{pointerId:1});assert.equal(a.run('keys.left'),true);a.key('a','KeyA','keyup');assert.equal(a.run('!!keys.left'),false);
 a.pointer('jump','pointerdown',{pointerId:2});a.blur();assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('shellInput.size()'),0);assert.equal(a.run('player.buffer'),0);a.click('shellResume');assert.equal(a.run('Object.keys(keys).length'),0);
});
test('map, recipes and character selection return to pause; restart requires a separate confirmation',()=>{
 const a=shell();a.click('shellResume');a.run('player.health=2;collected=2');a.click('mapButton');assert.equal(a.run('state'),'shell-menu');assert.equal(a.elements.get('verticalMap').style.display,'block');a.click('sheetBack');assert.equal(a.run('state'),'shell-menu');a.click('codexBtn');assert.equal(a.run('shellPage'),'recipes');a.click('sheetBack');a.click('characterButton');assert.equal(a.run('state'),'character-select');a.click('characterVance');assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('selectedCharacterId'),'vance-wick');a.click('restartBtn');assert.equal(a.run('player.health'),2);a.click('confirmCancel');assert.equal(a.run('collected'),2);a.click('restartBtn');a.click('confirmAction');assert.equal(a.run('collected'),0);assert.equal(a.run('state'),'shell-menu');
});
test('rotation pauses and fits the 960x540 view without changing gameplay coordinates',()=>{
 const a=shell();a.click('shellResume');a.run('player.x=400');a.elements.get('showTouch').checked=true;a.run('shellSettings()');const root=a.elements.get('wrap');root.clientWidth=390;root.clientHeight=844;a.run('shellFit()');assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('player.x'),400);const w=parseFloat(root.style['--canvas-width']),h=parseFloat(root.style['--canvas-height']);assert.ok(w<=390);assert.ok(h<=624);assert.ok(Math.abs(w/h-960/540)<1e-10);
});
test('fullscreen failure still starts a fitted game, while later fullscreen transitions stay paused',async()=>{
 const a=shell();await a.run('shellFullscreen(true)');assert.equal(a.run('state'),'play');assert.match(a.elements.get('shellNotice').textContent,/unavailable/);a.run('shellFullscreen(false)');assert.equal(a.run('state'),'shell-menu');
});
test('new input adapter produces the same movement and projectiles as the shipped controls',()=>{
 const a=shell(),b=game({}, {search:'?enemyScale=pilot'});a.click('shellResume');a.key('d','KeyD');a.key('x','KeyX');b.run('keys={right:true,shoot:true}');
 const state='JSON.stringify({player,shots,enemies,collected,checkpointState})';for(let i=0;i<150;i++){a.run('update();syncGameShell()');b.run('update()');assert.deepEqual(JSON.parse(a.run(state)),JSON.parse(b.run(state)));}
});

test('hidden-tab return requires Resume and successful fullscreen transitions preserve pause',async()=>{
 const a=shell();a.click('shellResume');a.key('d','KeyD');a.doc.hidden=true;a.emitDoc('visibilitychange');assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('shellInput.size()'),0);
 a.doc.hidden=false;a.emitDoc('visibilitychange');assert.equal(a.run('state'),'shell-menu');
 a.elements.get('wrap').requestFullscreen=async()=>{a.doc.fullscreenElement=a.elements.get('wrap');a.emitDoc('fullscreenchange');};
 await a.run('shellFullscreen(false)');assert.equal(a.run('state'),'shell-menu');assert.equal(a.doc.fullscreenElement,a.elements.get('wrap'));
 a.click('shellResume');a.doc.fullscreenElement=null;a.emitDoc('fullscreenchange');assert.equal(a.run('state'),'shell-menu');
});

test('production shell uses local assets and has no preview dependency or POC labels',()=>{
 assert.doesNotMatch(html, /<base|previews\/interface|INTERFACE POC|POC settings/);
 for(const file of ['shell.css','shell.js','input-model.js']){assert.ok(html.includes('"'+file+'?'));assert.ok(fs.existsSync(path.join(__dirname,'..',file)));}
});

test('final credits acknowledge both creators and support recipes, resume and a fresh full playthrough',()=>{
 const a=shell();a.click('shellResume');a.run("init(3);state='clear';advanceBakery();syncGameShell()");
 assert.equal(a.run('state'),'win');assert.equal(a.elements.get('endCredits').hidden,false);assert.equal(a.doc.activeElement.id,'creditsTitle');
 assert.match(html,/Producer &amp; Developer<\/p><p class="credit-name">Joel Taylor/);
 assert.match(html,/Designer &amp; Lead Play Tester<\/p><p class="credit-name">Vance/);
 a.click('creditsRecipes');a.run('syncGameShell()');assert.equal(a.elements.get('endCredits').hidden,true);assert.equal(a.run('shellPage'),'recipes');
 a.click('sheetBack');a.click('shellResume');a.run('syncGameShell()');assert.equal(a.elements.get('endCredits').hidden,false);
 a.click('creditsReplay');a.run('syncGameShell()');assert.equal(a.run('bakery'),1);assert.equal(a.run('state'),'play');assert.equal(a.elements.get('endCredits').hidden,true);
});


test('production bootstrap tolerates invalid saves and preserves valid recipe IDs',()=>{
 for(const value of ['null','{}','"oops"','[', '42']){
  const a=shell({saved:{crustQuestCodex:value,crustQuestBest:'Infinity'}});
  assert.equal(a.run('JSON.stringify(unlocked)'),'[]');assert.equal(a.run('best'),0);
  a.click('shellResume');a.click('codexBtn');assert.equal(a.run('shellPage'),'recipes');
 }
 const a=shell({saved:{crustQuestCodex:'[0,2,2,-1,3,1.5,"1",null]',crustQuestBest:'123.9'}});
 assert.equal(a.run('JSON.stringify(unlocked)'),'[0,2]');assert.equal(a.run('best'),123);
 assert.equal(a.storage.get('crustQuestCodex'),'[0,2,2,-1,3,1.5,"1",null]');
});
test('denied storage does not prevent starting, viewing recipes or selecting either hero',()=>{
 const a=shell({globals:{localStorage:{getItem(){throw Error('denied')},setItem(){throw Error('denied')}}}});
 a.click('shellResume');assert.equal(a.run('state'),'play');a.click('codexBtn');
 a.click('sheetBack');a.click('characterButton');a.click('characterVance');assert.equal(a.run('selectedCharacterId'),'vance-wick');
});
test('all environment previews start playing in place through the production shell',()=>{
 for(const scene of ['courtyard','hall','towers','forecourt','foothills','grotto','canopy','plunge','bloomrot','boilerworks','shafts','skybridge','descent','ovenhall']){
  const a=shell({search:'?scene=environment-'+scene});
  const before=a.run('JSON.stringify({x:player.x,y:player.y,camera,cameraY,bakery})');
  assert.equal(a.run('state'),'shell-menu');a.click('shellResume');assert.equal(a.run('state'),'play',scene);
  assert.equal(a.run('JSON.stringify({x:player.x,y:player.y,camera,cameraY,bakery})'),before,scene);
  a.run('update();syncGameShell()');assert.equal(a.run('tick'),1,scene);
 }
});
test('Escape closes Sporekeeper dialogue and cancels held input without opening pause',()=>{
 const a=shell();a.click('shellResume');a.run("init(2);myceliumState.dialogue='meet';state='dialogue'");
 a.key('Escape');assert.equal(a.run('state'),'play');assert.equal(a.run('myceliumState.dialogue'),null);
 assert.equal(a.run('shellInput.size()'),0);assert.equal(a.elements.get('shellOverlay').hidden,true);
 a.key('Escape');assert.equal(a.run('state'),'shell-menu');
});
test('mute shortcut works in both play and pause and is documented',()=>{
 const a=shell();a.key('m');assert.equal(a.audio.toggles,1);a.click('shellResume');a.key('m');assert.equal(a.audio.toggles,2);
 assert.match(html,/M mute/);
});

test('normal production starts use approved enemy scale in every world without preview parameters',()=>{
 const a=shell({search:''});
 for(const stage of[1,2,3]){a.run(`init(${stage})`);assert.equal(a.run("enemies.filter(e=>e.type!=='flyer').every(e=>e.w===40&&e.h===54)"),true);}
 const b=shell({search:'?enemyScale=off'});assert.equal(b.run('enemies.every(e=>e.w===25&&e.h===25)'),true);
});
test('loading gate blocks play and simulation until artwork is ready',()=>{
 const a=shell();a.run('artworkLoading=true');const before=a.run('JSON.stringify({player,tick,enemies})');
 a.click('shellResume');a.key('Enter');a.key('Escape');a.run('loop(0);loop(1000)');
 assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('JSON.stringify({player,tick,enemies})'),before);
 a.run('completeArtworkLoading()');a.click('shellResume');assert.equal(a.run('state'),'play');
});
