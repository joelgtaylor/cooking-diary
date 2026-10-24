const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {previewGame}=require('../sunken/test-harness.cjs');
const game=(search='')=>previewGame({htmlPath:path.resolve(__dirname,'index.html'),search});
function collect(a){a.run('for(const gem of sunkenWorld.cultures)gem.got=true;collected=5');}
function finishBoss(a){a.run(`for(let i=0;i<7000&&!sunkenLevel.bossDefeated;i++){
 const e=deepArena.boss;let target=270;
 if(e.attack==='scraper'){if(e.phase==='prepare'||e.phase==='shove'||e.wave&&e.wave.x>player.x-80)target=185;}
 else if(e.phase==='prepare'&&e.locked||e.phase==='sweep')target=e.lane+90;
 const dy=target-player.y-player.h/2;keys={up:dy<-3,down:dy>3,shoot:true};simulationStep();
}`);assert.equal(a.run('sunkenLevel.bossDefeated'),true);}
function enterOven(a){a.run('keys={left:true};for(let i=0;i<250&&!sunkenLevel.complete;i++)simulationStep()');assert.equal(a.run('sunkenLevel.complete'),true);}
test('level starts on the approved route with one Rider and five cultures; boss requires all five',()=>{
 const a=game();a.click('shellResume');assert.equal(a.run('sunkenLevel.mode'),'route');assert.equal(a.run('sunkenWorld.actors.filter(a=>a.kind==="rider").length'),1);
 assert.equal(a.run('sunkenWorld.cultures.length'),5);assert.equal(a.run('sunkenLevel.enterBoss()'),false);
 a.run('player.x=99*T;player.y=20*T;updateWorldProgress()');assert.equal(a.run('sunkenLevel.mode'),'route');assert.equal(a.run('sunkenLevel.complete'),false);
});
test('both heroes carry cultures, score, kefir and route state into the arena and through direct boss retry',()=>{
 for(const hero of ['loafy','vance-wick']){
  const a=game();a.click('shellResume');a.run(`selectCharacter('${hero}');init();player.score=2345;player.kefirCharges=2;sunkenWorld.pumpOn=true;sunkenWorld.actors.find(a=>a.kind==='rider').e.alive=false;`);collect(a);
  a.run('sunkenLevel.enterBoss();draw()');assert.equal(a.run('sunkenLevel.mode'),'boss');assert.equal(a.run('player.swimming'),true);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
  assert.equal(a.run('selectedCharacter().id'),hero);assert.equal(a.run('player.score'),2345);assert.equal(a.run('collected'),5);
  a.run('deepArena.boss.hp=1;deepArena.boss.ink={age:100};player.health=0;respawnCheckpoint();draw()');
  assert.equal(a.run('deepArena.boss.hp'),36);assert.equal(a.run('deepArena.boss.ink'),null);assert.equal(a.run('player.health'),4);
  assert.equal(a.run('player.score'),2345);assert.equal(a.run('player.kefirCharges'),2);assert.equal(a.run('sunkenWorld.pumpOn'),true);assert.equal(a.run('sunkenWorld.actors.find(a=>a.kind==="rider").e.alive'),false);
 }
});
test('finishing oven waits for the entire defeat and completion requires entering its dry pocket',()=>{
 const a=game('?scene=boss');a.click('shellResume');a.run("Object.assign(deepArena.boss,{phase:'recover',hp:1,inv:0});CrustDeepFight.shot(deepArena.boss,{x:730,y:250,w:10,h:6});for(let i=0;i<239;i++)simulationStep()");
 assert.equal(a.run('sunkenLevel.bossDefeated'),false);assert.equal(a.run('sunkenLevel.complete'),false);
 a.run('simulationStep();draw()');assert.equal(a.run('sunkenLevel.mode'),'finish');assert.equal(a.run('sunkenWorld.complete'),false);
 enterOven(a);assert.equal(a.run('player.swimming'),false);assert.equal(a.run('sunkenWorld.complete'),true);const score=a.run('player.score');a.run('for(let i=0;i<200;i++)simulationStep();draw()');assert.equal(a.run('player.score'),score);a.run('respawnCheckpoint();player.x=210;player.y=410;player.w=29;player.h=38;player.swimming=false;updateWorldProgress()');assert.equal(a.run('player.score'),score);
 assert.equal(a.storage.has('crustQuestCodex'),false);assert.equal(a.storage.has('crustQuestBest'),false);
});
test('finishing room has safe wet/dry transitions and retry does not resurrect the defeated boss',()=>{
 const a=game('?scene=oven');a.click('shellResume');a.run('player.x=352;player.y=380;player.w=58;player.h=26;player.swimming=true;keys={left:true};for(let i=0;i<25;i++)updatePlayer()');
 assert.equal(a.run('player.swimming'),false);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 a.run('respawnCheckpoint();draw()');assert.equal(a.run('sunkenLevel.mode'),'finish');assert.equal(a.run('deepArena.boss.alive'),false);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
});
test('arena map, pause and full restart work without losing the route map',()=>{
 const a=game();a.click('shellResume');a.run("shellOpenSheet('map')");assert.match(a.doc.getElementById('sheetTitle').textContent,/route map/);
 a.run("state='play'");collect(a);a.run("sunkenLevel.enterBoss();shellOpenSheet('map')");assert.match(a.doc.getElementById('sheetTitle').textContent,/arena map/);
 a.run('restart();draw()');assert.equal(a.run('sunkenLevel.mode'),'route');assert.equal(a.run('collected'),0);assert.equal(a.run('sunkenWorld.pumpOn'),false);assert.equal(a.run('sunkenLevel.entered'),false);
});
test('real traversal, crab passage, full boss fight, bow and finishing oven connect end to end',()=>{
 const a=game();a.click('shellResume');
 // Approved enemy-specific combat has separate coverage. Isolate route continuity
 // from roaming enemies here, while retaining the physical crab gate and real boss.
 a.run('for(const a of sunkenWorld.actors)if(a.kind!=="crab"){a.e.alive=false;a.e.deathT=0;}');
 const points=[[13,30],[20,31],[26,32],[31,34],[45,35],[45,40],[40,40],[40,47],[44,48],[48,48],[53,48],[70,48],[70,30],[65,30],[60,31],[60,30],[65,29],[73,29]];
 function move(tx,ty){let arrived=false;for(let i=0;i<650;i++){
  const p=JSON.parse(a.run('JSON.stringify(player)')),dx=tx*32-p.x-p.w/2,dy=ty*32-p.y-p.h/2;
  if(Math.abs(dx)<12&&Math.abs(dy)<18){arrived=true;break;}
  a.run('keys='+JSON.stringify({left:dx<-5,right:dx>5,up:dy<-7&&(p.swimming||i%32<16),down:dy>7})+';simulationStep()');
 }assert.ok(arrived,`waypoint ${tx},${ty}`);}
 for(const p of points)move(...p);
 a.run('for(let i=0;i<400;i++){const dy=29*T+16-player.y-player.h/2;keys={shoot:true,down:dy>2,up:dy<-2};simulationStep()}');assert.equal(a.run('sunkenWorld.actors.find(a=>a.kind==="crab").e.alive'),false);
 for(const p of [[78,29],[82,34],[85.5,34],[85.5,43],[84,43],[96,49],[100,49],[100,34],[93,33],[93,21],[96,20]])move(...p);
 assert.equal(a.run('collected'),5);a.run("keys={right:true,up:true};for(let i=0;i<120&&sunkenLevel.mode==='route';i++)simulationStep()");assert.equal(a.run('sunkenLevel.mode'),'boss');
 const score=a.run('player.score');finishBoss(a);enterOven(a);assert.equal(a.run('collected'),5);assert.ok(a.run('player.score')>=score+1500);
});
