const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const {createHash}=require('node:crypto');
const hash=createHash('sha256').update('art/spike-hazards.png').digest('hex');
test('world-specific spike art stays within existing 32px hazard cells',()=>{
 for(let stage=1;stage<=3;stage++){
  const {run,trace}=game();run(`init(${stage});assets.spikeHazards.complete=true;assets.spikeHazards.naturalWidth=96;assets.spikeHazards.naturalHeight=32;`);
  const before=run('JSON.stringify({map,player,enemies})');trace.length=0;run('drawWorld()');
  const spikes=trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===hash);assert.ok(spikes.length>0);
  for(const c of spikes){assert.equal(c[2],(stage-1)*32);assert.equal(c[8],32);assert.equal(c[9],32);assert.equal(run(`tile(${c[6]/32},${c[7]/32})`),'^');}
  assert.equal(run('JSON.stringify({map,player,enemies})'),before);
 }
});
test('procedural fallback spikes are drawn in the hazard row rather than legacy row 14',()=>{
 const {run,trace}=game();trace.length=0;run('drawWorld()');
 assert.ok(trace.some(c=>c[0]==='lineTo'&&c[1]===22*32+16&&c[2]===53*32));
 assert.ok(!trace.some(c=>c[0]==='lineTo'&&c[1]===22*32+16&&c[2]===14*32));
});
test('hazard collision boundaries are unchanged at tile edges',()=>{
 const {run}=game();assert.equal(run('spike(22*T-1,53*T,1,1)'),false);
 assert.equal(run('spike(22*T,53*T,1,1)'),true);
 assert.equal(run('spike(23*T,53*T,1,1)'),false);
 assert.equal(run('spike(22*T,53*T-1,1,1)'),false);
});
