const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const audition=()=>game({}, {search:'?enemyScale=pilot'});
test('audition scales all eleven Moonlit non-boss enemies without changing terrain, foot anchors or other worlds',()=>{
 const a=audition(),b=game({}, {search:''});assert.equal(a.run('enemies.filter(e=>e.visualScale).length'),11);
 assert.equal(a.run('JSON.stringify(map)'),b.run('JSON.stringify(map)'));
 for(let i=0;i<11;i++){
  const x=a.run(`enemies[${i}]`),y=b.run(`enemies[${i}]`);
  assert.equal(x.y+x.h,y.y+y.h);assert.equal(x.vx,y.vx);assert.equal(x.hopT,y.hopT);assert.equal(x.attackT,y.attackT);
  if(x.visualScale){assert.equal(x.h,54);assert.equal(x.w,40);assert.equal(a.run(`hit(enemies[${i}].x,enemies[${i}].y,enemies[${i}].w,enemies[${i}].h)`),false);}
  else assert.equal(JSON.stringify(x),JSON.stringify(y));
 }
 for(const n of [2,3]){a.run(`init(${n})`);b.run(`init(${n})`);assert.equal(a.run('JSON.stringify(enemies)'),b.run('JSON.stringify(enemies)'));}
});
test('wider patrols stay within original support envelopes and hop cadence stays unchanged',()=>{
 const a=audition(),b=game({}, {search:''});for(const v of[a,b])v.run('player.x=-1000');
 const vertical='JSON.stringify(enemies.map(e=>({foot:e.y+e.h,vy:e.vy,timer:e.hopT,alive:e.alive})))';
 for(let i=0;i<240;i++){
  for(const v of[a,b])v.run('updateEnemies()');assert.equal(a.run(vertical),b.run(vertical));
  assert.equal(a.run('enemies.filter(e=>e.visualScale).every(e=>!hit(e.x,e.y,e.w,e.h)&&(!e.encounter||e.x>=e.encounter.left&&e.x<=e.encounter.right))'),true);
 }
});
test('both heroes can shoot the enlarged ground targets from either side while standing or running',()=>{
 for(const character of ['loafy','vance-wick'])for(const type of ['walker','hopper','thrower'])for(const face of [-1,1])for(const running of [false,true]){
  const a=audition();
  a.run(`var target=enemies.find(e=>e.type==='${type}');enemies=[target];target.x=800;target.y=54*T-target.h;target.vx=0;map=map.map((row,y)=>row.map(()=>y>=54?'#':'.'));selectCharacter('${character}');player.x=${face===1?640:960};player.y=54*T-player.h;player.face=${face};player.vx=${running?face*3.6:0};player.ground=true;updateProjectiles(true);for(let i=0;i<30;i++)updateProjectiles(false)`);
  assert.equal(a.run('target.alive'),false,`${character} ${type} ${face} ${running}`);assert.equal(a.run('player.score'),100);
 }
});
test('enlarged bodies retain pogo kills and ordinary contact damage',()=>{
 for(const pogo of [false,true]){
  const a=audition();a.run(`var target=enemies.find(e=>e.type==='walker');enemies=[target];player.x=target.x;player.y=${pogo?'target.y-player.h+4':'target.y+target.h-player.h'};player.vy=${pogo?4:0};pogoOn=${pogo};updateEnemies()`);
  assert.equal(a.run('target.alive'),!pogo);assert.equal(a.run('player.health'),pogo?3:2);
  if(pogo)assert.equal(a.run('player.vy'),-11);
 }
});
test('scaled hopper anticipation stays foot anchored and covers the firing line',()=>{
 const a=audition();a.run("var target=enemies.find(e=>e.type==='hopper');drawOpeningEnemy(target);openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=1536;openingEnemyArt.naturalHeight=1024;target.hopT=1");
 a.trace.length=0;a.run('drawOpeningEnemy(target)');const c=a.trace.find(c=>c[0]==='drawImage');
 assert.equal(c[7],-c[9]);assert.ok(c[9]>=54);assert.ok(c[8]>=56);
});

test('scaled slingers retain perception range and attack timings, and their higher hand releases still hit',()=>{
 const a=audition(),b=game({}, {search:''});
 for(const c of [a,b])c.run("var slinger=enemies.find(e=>e.type==='thrower');camera=600;cameraY=1000;player.x=26*T;player.y=40*T-player.h;slinger.attackT=1;updateThrower(slinger)");
 assert.equal(a.run('slinger.windup'),b.run('slinger.windup'));
 for(const c of [a,b])c.run('for(let i=0;i<36;i++)updateThrower(slinger)');
 assert.equal(a.run('enemyShots.length'),1);assert.equal(a.run('slinger.attackT'),b.run('slinger.attackT'));
 assert.equal(a.run('enemyShots[0].vx'),b.run('enemyShots[0].vx'));
 assert.equal(a.run('enemyShots[0].y+4.5'),a.run('slinger.y+slinger.h-32'));
 a.run('for(let i=0;i<120;i++)updateEnemyShots()');assert.equal(a.run('player.health'),2);
 for(const face of [-1,1]){
  a.run(`slinger.face=${face};var body=throwerAimBody(slinger);player.x=body.x+body.w/2+${face}*280-player.w/2`);
  assert.equal(a.run('throwerCanSee(slinger)'),false);
 }
});
test('all slinger poses scale from their feet, with warnings above the enlarged head',()=>{
 const a=audition();a.run("var slinger=enemies.find(e=>e.type==='thrower');drawDoughSlinger(slinger);slingerArt.complete=true;slingerArt.naturalWidth=2172;slingerArt.naturalHeight=724");
 for(const phase of ['slinger.windup=0','slinger.windup=36','slinger.windup=0;rememberSlingerRelease(slinger)','tick+=8']){
  a.run(phase);a.trace.length=0;a.run('drawDoughSlinger(slinger)');const c=a.trace.find(c=>c[0]==='drawImage');
  assert.equal(c[7],-c[9]);assert.ok(c[9]>55);assert.ok(c[8]>55);
 }
});
