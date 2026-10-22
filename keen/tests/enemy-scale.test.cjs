const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const audition=()=>game({}, {search:'?enemyScale=pilot'});
test('audition scales nine small Moonlit enemies without changing terrain, foot anchors or other worlds',()=>{
 const a=audition(),b=game({}, {search:''});assert.equal(a.run('enemies.filter(e=>e.visualScale).length'),9);
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
  assert.equal(a.run('enemies.filter(e=>e.visualScale).every(e=>!hit(e.x,e.y,e.w,e.h)&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);
 }
});
test('both heroes can shoot the enlarged ground targets from either side while standing or running',()=>{
 for(const character of ['loafy','vance-wick'])for(const type of ['walker','hopper'])for(const face of [-1,1])for(const running of [false,true]){
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
