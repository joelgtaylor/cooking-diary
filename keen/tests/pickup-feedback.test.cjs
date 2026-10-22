const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function pickup(kind,health){
 const a=game();
 a.run(`gems=[];floaters=[];player.health=${health};powerups=[{kind:${JSON.stringify(kind)},x:player.x+14,y:player.y+19,got:false}];updatePickups();`);
 return a;
}
test('heart pickup reports actual recovery or full health and remains single-use',()=>{
 for(const health of [2,4,5]){
  const a=pickup('rye',health),expected=Math.min(5,health+1);
  assert.equal(a.run('player.health'),expected);
  assert.equal(a.run('floaters[0].txt'),health<5?'+1 HEART':'HEALTH FULL');
  assert.equal(a.run('powerups[0].got'),true);
  a.run('updatePickups()');assert.equal(a.run('player.health'),expected);assert.equal(a.run('floaters.length'),1);
 }
});
test('kefir pickup reports dash readiness without assuming a keyboard and grants one charge',()=>{
 const a=game();const before=a.run('player.kefirCharges||0');
 a.run("gems=[];floaters=[];powerups=[{kind:'kefir',x:player.x+14,y:player.y+19,got:false}];updatePickups();");
 assert.equal(a.run('floaters[0].txt'),'KEFIR STORED · DASH READY');
 assert.equal(a.run('player.kefirCharges'),before+1);
 a.run('updatePickups()');assert.equal(a.run('player.kefirCharges'),before+1);assert.equal(a.run('floaters.length'),1);
});
