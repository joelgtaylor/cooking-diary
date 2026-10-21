const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function scene(stage,state){const a=game();a.run(`window.location={search:'?goals=pilot&scene=oven-${state}-${stage}'};prepareWayfindingPreview()`);return a;}
function art(a){a.run('ovenGoalIndicatorReady();ovenGoalArt.complete=true;ovenGoalArt.naturalWidth=1254;ovenGoalArt.naturalHeight=1254');}
test('oven scenes preserve saves, put the player on safe ground, and use actual completion gates',()=>{
 for(const stage of [1,2,3])for(const state of ['missing','locked','ready']){
  const a=scene(stage,state);assert.equal(a.run('bakery'),stage);assert.equal(a.storage.size,0);
  assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
  assert.equal(a.run('contactSurface(player)'),54*32);
  assert.equal(Boolean(a.run('collected===5&&foremanOvenReady()&&bloomrotOvenReady()&&devourerOvenReady()')),state==='ready');
 }
});
test('plaque draws exactly five jars and a lock or loaf without mutating gameplay',()=>{
 for(const stage of [1,2,3])for(const state of ['missing','ready']){
  const a=scene(stage,state);art(a);const before=a.run('JSON.stringify({player,collected,gems,foremanState,bloomrotState,devourerState})');
  a.trace.length=0;a.run('drawOvenGoalIndicator(bakery===3?devourerState.finishOven:null)');
  const draws=a.trace.filter(c=>c[0]==='drawImage');assert.equal(draws.length,7);
  assert.equal(draws.slice(1,6).filter(c=>c[2]===48).length,state==='missing'?3:5);
  assert.equal(draws[6][2],state==='ready'?942:630);
  assert.equal(a.run('JSON.stringify({player,collected,gems,foremanState,bloomrotState,devourerState})'),before);
 }
});
test('no plaque appears on a disguised or airborne Clockwork oven',()=>{
 const a=scene(3,'locked');assert.equal(a.run('ovenGoalIndicatorReady()'),false);assert.equal(a.run('ovenGoalArt'),null);
 a.run('releaseDevourerOven(devourerState)');assert.equal(a.run('ovenGoalIndicatorReady()'),false);
});
test('loading and disabled goals retain fallback labels and default rendering',()=>{
 const a=game();for(const search of ['?goals=off','?goals=pilotish']){
  a.run('window.location={search:'+JSON.stringify(search)+'}');a.trace.length=0;
  assert.equal(a.run('drawOvenGoalIndicator()'),false);assert.equal(a.trace.length,0);
 }
 a.run("window.location.search='?goals=pilot'");assert.equal(a.run('ovenGoalIndicatorReady()'),false);
 a.run('ovenGoalArt.complete=true;ovenGoalArt.naturalWidth=0');assert.equal(a.run('ovenGoalIndicatorReady()'),false);
});
test('settling boss and airborne oven remain locked even with five cultures',()=>{
 for(const stage of [2,3]){const a=scene(stage,'ready');art(a);
  a.run((stage===2?'bloomrotState':'devourerState')+'.timer=1');a.trace.length=0;a.run('drawOvenGoalIndicator(bakery===3?devourerState.finishOven:null)');
  assert.equal(a.trace.filter(c=>c[0]==='drawImage').at(-1)[2],630);
 }
});
