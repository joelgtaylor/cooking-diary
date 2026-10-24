const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const I=require('./ink-attack.js'),B=require('./master-of-deep.js'),{previewGame}=require('../sunken/test-harness.cjs');
const player=()=>({x:245,y:80,w:58,h:26,health:4,inv:0,vx:0,vy:0});
test('ink has a 72-tick cheek warning and damages neither player nor movement state',()=>{
 const e=I.create(),p=player();for(let i=0;i<71;i++){I.update(e,p);assert.equal(e.ink,null);}I.update(e,p);
 assert.equal(e.phase,'ink-spit');assert.equal(e.ink.age,0);for(let i=0;i<24;i++)I.update(e,p);
 assert.equal(e.phase,'prepare');assert.equal(p.health,4);assert.equal(p.waterPush,undefined);assert.equal(p.inv,0);
});
test('ink precedes alternating approved tools and remains during each active attack',()=>{
 const e=I.create(),p=player(),tools=[],active=new Set();let cycles=0;
 for(let i=0;i<1400;i++){I.update(e,p);if(e.inkCycles!==cycles){cycles=e.inkCycles;tools.push(e.attack);}
  if(e.phase==='sweep'||e.phase==='shove'){assert.ok(e.ink);assert.ok(I.overlay(e,p).opacity>.9);active.add(e.attack);}
 }
 assert.deepEqual(tools.slice(0,4),['lame','scraper','lame','scraper']);assert.deepEqual([...active],['lame','scraper']);assert.equal(p.health,4);
});
test('foreground ink expands from the boss to cover the arena, holds, then fades without flashing',()=>{
 const e=I.create(),p=player();e.ink={age:0};let previous=0;
 for(let age=0;age<=18;age++){e.ink.age=age;const a=I.overlay(e,p);assert.ok(a.opacity>=previous);previous=a.opacity;}
 e.ink.age=100;const full=I.overlay(e,p);assert.equal(full.opacity,.98);assert.ok(full.width>960&&full.height>540);
 for(let age=186;age<240;age++){e.ink.age=age;const a=I.overlay(e,p);assert.ok(a.opacity<=previous);previous=a.opacity;}
 I.update(e,p);assert.equal(e.ink,null);
});
test('full ink has no player opening; reduced keeps player visibility and a bounded orientation gap',()=>{
 const e=I.create(),p=player();
 for(let age=18;age<240;age++){e.ink={age};const a=I.overlay(e,p),r=I.overlay(e,p,true);
  assert.equal(a.clear,null);assert.equal(r.clear.x,p.x+p.w/2);assert.equal(r.clear.y,p.y+p.h/2);assert.ok(r.clear.r>Math.hypot(p.w/2,p.h/2));
  assert.ok(a.opening.x-a.opening.r>32&&a.opening.x+a.opening.r<928);assert.ok(a.opening.y-a.opening.r>=64);
  assert.ok(r.opacity<a.opacity&&r.opacity<=.275);assert.equal(r.clear.r,100);
 }
});
test('defeat instantly removes all obscuration and hazards and preserves the theatrical ending',()=>{
 const e=I.create(),p=player();Object.assign(e,{phase:'recover',hp:1,ink:{age:100},wave:{x:300}});
 assert.equal(I.shot(e,{x:730,y:250,w:10,h:6}),'defeat');assert.equal(e.ink,null);assert.equal(e.wave,null);assert.equal(I.overlay(e,p),null);
 for(let i=0;i<B.DEFEAT_DURATION;i++)I.update(e,p);assert.equal(B.defeatPose(e).frame,5);
});
const game=()=>previewGame({htmlPath:path.resolve(__dirname,'index.html'),search:'?attack=ink'});
test('full ink covers both heroes and warning lanes; reduced restores them and survives retry',()=>{
 for(const hero of ['loafy','vance-wick']){
  const a=game();a.click('shellResume');a.run(`selectCharacter('${hero}');init();player.inv=0;for(const a of prepareStartupArtwork())if(a.label==='Camera ink splatter')a.image.naturalWidth=1536;Object.assign(deepArena.boss,{phase:'prepare',locked:true,ink:{age:100}});`);
  const trace=`(()=>{const order=[],dp=drawPlayer,di=g.drawImage,st=g.stroke;drawPlayer=()=>order.push('player');g.stroke=()=>order.push('warning');g.drawImage=(image,...args)=>{if(image.width===960&&image.height===540)order.push('mask');};draw();drawPlayer=dp;g.drawImage=di;g.stroke=st;return order})()`;
  const full=a.run(trace);assert.ok(full.includes('mask'));const covered=full.slice(full.lastIndexOf('mask')+1);assert.ok(!covered.includes('player'));assert.ok(!covered.includes('warning'));
  assert.equal(a.doc.getElementById('inkObstructionBtn').hidden,false);a.click('inkObstructionBtn');assert.equal(a.storage.get('crustQuestPreviewInkReduced'),'true');
  const reduced=a.run(trace),visible=reduced.slice(reduced.lastIndexOf('mask')+1);assert.ok(visible.includes('player'));assert.ok(visible.includes('warning'));
  a.run('respawnCheckpoint();draw()');assert.equal(a.run('deepArena.boss.ink'),null);assert.match(a.doc.getElementById('inkObstructionBtn').textContent,/REDUCED/);
 }
});
test('pause freezes ink and tool timing together',()=>{
 const a=game();a.click('shellResume');a.run('for(let i=0;i<110;i++)simulationStep()');const before=a.run('JSON.stringify(deepArena.boss)');
 a.run("shellPause('manual');for(let i=0;i<100;i++)simulationStep()");assert.equal(a.run('JSON.stringify(deepArena.boss)'),before);
});
test('real swim and fire controls can defeat alternating ink-followup cycles without damage',()=>{
 const a=game();a.click('shellResume');a.run(`for(let i=0;i<5000&&!deepArena.victory;i++){
  const e=deepArena.boss;let target=270;
  if(!e.phase.startsWith('ink-')){
   if(e.attack==='scraper'){if(e.phase==='prepare'||e.phase==='shove'||e.wave&&e.wave.x>player.x-80)target=185;}
   else if(e.phase==='prepare'&&e.locked||e.phase==='sweep')target=e.lane+90;
  }
  const dy=target-player.y-player.h/2;keys={up:dy<-3,down:dy>3,shoot:true};simulationStep();
 }`);assert.equal(a.run('deepArena.victory'),true);assert.equal(a.run('player.health'),4);assert.ok(a.run('deepArena.boss.inkCycles')>=2);
});
