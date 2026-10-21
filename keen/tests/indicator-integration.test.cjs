const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const families=['pickups','supplies','signs','map','goals'];
test('approved indicators enable without query parameters and retain explicit comparison overrides',()=>{
 const a=game({}, {search:''});
 for(const family of families){assert.equal(a.run(`visualIndicatorEnabled('${family}')`),true);
  for(const value of ['off','pilotish','']){a.run(`window.location.search='?${family}=${value}'`);assert.equal(a.run(`visualIndicatorEnabled('${family}')`),false);}
  a.run(`window.location.search='?${family}=pilot'`);assert.equal(a.run(`visualIndicatorEnabled('${family}')`),true);
 }
});
test('normal combined starts do not activate review scenes or grant progress',()=>{
 const a=game({}, {search:''});assert.equal(a.run('bakery'),1);assert.equal(a.run('collected'),0);
 assert.equal(a.run('unlocked.length'),0);assert.equal(a.storage.size,0);
 for(const scene of ['entrance','supplies','plunge','oven-ready-3']){
  a.run(`window.location.search='?scene=${scene}';prepareWayfindingPreview()`);assert.equal(a.run('bakery'),1);
 }
});
test('combined indicators preserve authored state and simulation in all three bakeries',()=>{
 const a=game({}, {search:''}),b=game();
 const expr='JSON.stringify({map,player,gems,enemies,powerups,collected,checkpointState,foremanState,bloomrotState,devourerState})';
 for(const stage of [1,2,3]){
  a.run(`init(${stage})`);b.run(`init(${stage})`);
  assert.equal(a.run(expr),b.run(expr));
  for(let i=0;i<30;i++){a.run('update();updateWorldProgress()');b.run('update();updateWorldProgress()');}
  assert.equal(a.run(expr),b.run(expr));
  const before=a.run(expr);a.run('draw();minimap.style.display="block";drawPhase3Map()');assert.equal(a.run(expr),before);
 }
});
