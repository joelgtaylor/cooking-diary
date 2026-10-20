const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function defeated(x=96){const a=game();a.run(`init(3);checkpointState.current=3;collected=5;devourerState.x=${x}*T;devourerState.health=1;hurtDevourer();`);return a;}
test('the collapse spits one oven, it arcs and lands before completion can unlock',()=>{
 const a=defeated();a.run('for(let i=0;i<29;i++)updateDevourer()');assert.equal(a.run('devourerState.finishOven'),undefined);
 a.run('updateDevourer()');assert.equal(a.run('devourerState.finishOven.age'),1);assert.equal(a.run('devourerState.finishOven.landed'),false);
 const shots=a.audio.effects.filter(x=>x==='shoot').length;
 a.run('for(let i=0;i<47;i++)updateDevourer()');assert.equal(a.run('devourerState.finishOven.landed'),true);assert.equal(a.run('devourerOvenReady()'),false);
 a.run('player.x=devourerState.finishOven.x-14;player.y=54*T-player.h;updateWorldProgress()');assert.equal(a.run('state'),'play');
 a.run('for(let i=0;i<43;i++)updateDevourer();updateWorldProgress()');assert.equal(a.run('state'),'clear');assert.equal(a.audio.effects.filter(x=>x==='shoot').length,shots);
 assert.equal(a.run('player.score'),2000);
});
test('the real oven lands clear of the wreck and platforms on either side; retry removes it',()=>{
 for(const x of [85,90,90.1,98]){
  const a=defeated(x);a.run('for(let i=0;i<120;i++)updateDevourer()');
  assert.ok(a.run('Math.abs(devourerState.finishOven.x-devourerState.x)>200'));
  assert.equal(a.run('hit(devourerState.finishOven.x-32.5,54*T-115,65,115)'),false);
  a.run('player.x=devourerState.x;player.y=54*T-player.h;updateWorldProgress()');assert.equal(a.run('state'),'play');
  a.run('respawnCheckpoint()');assert.equal(a.run('devourerState.finishOven'),undefined);assert.equal(a.run('devourerOvenReady()'),false);
 }
});
test('released oven animation pauses and drawing uses the real oven atlas without advancing state',()=>{
 const a=defeated();a.run("for(let i=0;i<45;i++)updateDevourer();assets.grandOvens.complete=true;assets.grandOvens.naturalWidth=288;assets.grandOvens.naturalHeight=176;state='pause';");
 const before=a.run('JSON.stringify(devourerState)');a.trace.length=0;a.run('for(let i=0;i<5;i++){updateDevourer();drawDevourer()}');
 assert.equal(a.run('JSON.stringify(devourerState)'),before);
 const hash=require('node:crypto').createHash('sha256').update('art/grand-ovens.png').digest('hex');
 assert.ok(a.trace.some(c=>c[0]==='drawImage'&&c[1]?.image===hash));
});
