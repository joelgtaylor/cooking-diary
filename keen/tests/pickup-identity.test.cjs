const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {game}=require('./game-harness.cjs');
const artPath='art/culture-kefir-pickups.png';
function labels(trace){return trace.filter(c=>c[0]==='fillText').map(c=>c[1]);}
function ready(run){
 run("window.location={search:'?pickups=pilot'};drawIdentityPickup('culture',0,0);pickupIdentityArt.complete=true;pickupIdentityArt.naturalWidth=1774;pickupIdentityArt.naturalHeight=887;");
}
test('identity atlas is RGBA PNG; crop rectangles are inside the actual image',()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'..',artPath));
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.readUInt32BE(16),1774);assert.equal(bytes.readUInt32BE(20),887);
 assert.equal(bytes[25],6);
 const {run}=game();
 for(const s of run('Object.values(PICKUP_IDENTITY_SPRITES)')){
  assert.ok(s.sx>=0&&s.sy>=0&&s.sx+s.sw<=1774&&s.sy+s.sh<=887);
 }
});
test('default and nonmatching preview queries preserve original art and labels',()=>{
 const {run,trace}=game();
 for(const search of ['?pickups=off','?pickups=pilotish']){
  run('window.location={search:'+JSON.stringify(search)+'}');
  trace.length=0;run('drawYeastCollectibles()');
  assert.equal(labels(trace).filter(s=>s==='YEAST').length,5);
  assert.equal(run('pickupIdentityArt'),null);
 }
});
test('loading, failed and unexpected-size identity artwork retain visible original items and labels',()=>{
 const {run,trace}=game();
 run("window.location={search:'?pickups=pilot'}");
 for(const state of [
  'drawIdentityPickup("culture",0,0)',
  'pickupIdentityArt.complete=true;pickupIdentityArt.naturalWidth=0;pickupIdentityArt.naturalHeight=0',
  'pickupIdentityArt.naturalWidth=64;pickupIdentityArt.naturalHeight=64'
 ]){
  run(state);trace.length=0;run('drawYeastCollectibles()');
  assert.equal(labels(trace).filter(s=>s==='YEAST').length,5);
  assert.equal(run("drawIdentityPickup('kefir',0,0)"),false);
 }
 assert.equal(run('pickupIdentityArt.src'),artPath);
});
test('all worlds show five broad cultures without badges and preserve gameplay state',()=>{
 const {run,trace}=game();ready(run);
 for(const stage of [1,2,3]){
  run('init('+stage+')');
  const before=run('JSON.stringify({player,gems,powerups,collected,checkpointState,enemies,map})');
  trace.length=0;run('drawYeastCollectibles()');
  assert.equal(labels(trace).filter(s=>s==='YEAST').length,0);
  assert.equal(trace.filter(c=>c[0]==='drawImage'&&c[2]===96&&c[3]===96&&c[8]===34&&c[9]===34).length,5);
  assert.equal(run('JSON.stringify({player,gems,powerups,collected,checkpointState,enemies,map})'),before);
 }
});
test('world rendering draws tall kefir bottles at existing anchors without changing pickups',()=>{
 const {run,trace}=game();ready(run);
 for(const stage of [1,2,3]){
  run('init('+stage+')');
  const before=run('JSON.stringify({player,gems,powerups,collected,checkpointState,enemies,map})');
  const bottles=run("powerups.filter(u=>u.kind==='kefir'&&!u.got).length");
  trace.length=0;run('drawWorld()');
  assert.equal(trace.filter(c=>c[0]==='drawImage'&&c[2]===1200&&c[3]===40&&c[8]===16&&c[9]===40).length,bottles);
  assert.equal(run('JSON.stringify({player,gems,powerups,collected,checkpointState,enemies,map})'),before);
 }
});
test('checkpoint animation and labels have identical traces with audition on and off',()=>{
 const {run,trace}=game();
 for(const stage of [1,2,3]){
  run('init('+stage+');assets.checkpointFlags.complete=true;assets.checkpointFlags.naturalWidth=320;');
  for(const active of [-1,0,1]){
   run('checkpointState.current='+active+';drawCheckpoints()');
   run("window.location={search:'?pickups=off'}");trace.length=0;run('drawCheckpoints()');
   const before=JSON.stringify(trace);
   run("window.location.search='?pickups=pilot'");trace.length=0;run('drawCheckpoints()');
   assert.equal(JSON.stringify(trace),before);
  }
 }
});
