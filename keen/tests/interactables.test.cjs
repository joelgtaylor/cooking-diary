const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const {createHash}=require('node:crypto');
const flagHash=createHash('sha256').update('checkpoint-flags-test').digest('hex');
function ready(h){h.run("assets.checkpointFlags.complete=true;assets.checkpointFlags.naturalWidth=320;assets.checkpointFlags.naturalHeight=240;assets.checkpointFlags.src='checkpoint-flags-test';assets.environmentDecor.complete=true;assets.environmentDecor.naturalWidth=256;");}
test('checkpoint cloth retains frame intervals without shifting its attachment or pedestal',()=>{
 const h=game();ready(h);let fixed;
 for(const t of [0,10,20,30]){
  h.run(`tick=${t}`);h.trace.length=0;h.run('drawCheckpoints()');
  const parts=h.trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===flagHash).slice(0,3);
  assert.equal(parts[0][2],Math.floor(t/10)*80+43);
  const destinations=parts.map(c=>c.slice(6));if(fixed)assert.deepEqual(destinations,fixed);else fixed=destinations;
 }
 h.run('checkpointState.current=0;tick=8');h.trace.length=0;h.run('drawCheckpoints()');
 const active=h.trace.find(c=>c[0]==='drawImage'&&c[1]?.image===flagHash);
 assert.equal(active[2],80+43);assert.equal(active[3],120);
});
test('jar sprites use integer positions while their objective badges stay steady',()=>{
 const h=game();ready(h);let badgeY;
 for(const t of [0,9,18,27]){
  h.run(`tick=${t}`);h.trace.length=0;h.run('drawYeastCollectibles()');
  const jar=h.trace.find(c=>c[0]==='drawImage');assert.ok(Number.isInteger(jar[6])&&Number.isInteger(jar[7]));
  const label=h.trace.find(c=>c[0]==='fillText'&&c[1]==='YEAST');
  if(badgeY!==undefined)assert.equal(label[3],badgeY);else badgeY=label[3];
 }
});
test('pickup feedback observes collection without changing score, state or sound',()=>{
 const h=game();ready(h);h.run('drawYeastCollectibles();tick=10;player.x=gems[0].x;player.y=gems[0].y;updatePickups();');
 const before=h.run('JSON.stringify({player,gems,collected,particles,floaters})'),sounds=h.audio.effects.length;
 h.trace.length=0;h.run('drawYeastCollectibles()');assert.equal(h.run('pickupVisual(gems[0]).at'),10);
 assert.ok(h.trace.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]==='#fff0ac'));
 assert.equal(h.run('JSON.stringify({player,gems,collected,particles,floaters})'),before);assert.equal(h.audio.effects.length,sounds);
 h.run('tick=28');h.trace.length=0;h.run('drawYeastCollectibles()');
 assert.ok(!h.trace.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]==='#fff0ac'));
});
test('checkpoint feedback follows actual activation and rendering consumes no gameplay randomness',()=>{
 const h=game();ready(h);h.run('drawCheckpoints();tick=12;var cp=currentVerticalLayout().checkpoints[0];player.x=cp[0]*T;player.y=cp[1]*T;updateWorldProgress();');
 assert.equal(h.run('checkpointState.current'),0);
 const before=h.run('JSON.stringify({player,checkpointState,gems,collected})'),sounds=h.audio.effects.length;
 h.run("Math.random=()=>{throw Error('Rendering consumed gameplay RNG')};drawCheckpoints();drawYeastCollectibles();");
 assert.equal(h.run('checkpointVisual().flashes.get(0)'),12);
 assert.equal(h.run('JSON.stringify({player,checkpointState,gems,collected})'),before);assert.equal(h.audio.effects.length,sounds);
 assert.ok(h.trace.some(c=>c[0]==='fillText'&&c[1]==='SAVED'));
});
