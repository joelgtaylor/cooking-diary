const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {game}=require('./game-harness.cjs');
function fork(){const a=game();a.run('init(2);camera=1650;cameraY=650;');return a;}
function ready(a){a.run("window.location={search:'?signs=pilot'};plungeIndicatorReady();plungeIndicatorArt.complete=true;plungeIndicatorArt.naturalWidth=1105;plungeIndicatorArt.naturalHeight=1423;");}
function labels(a){return a.trace.filter(c=>c[0]==='fillText').map(c=>c[1]);}
test('route sign atlas has genuine alpha and expected source dimensions',()=>{
 const b=fs.readFileSync(path.join(__dirname,'../art/plunge-route-sign.png'));
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(b.readUInt32BE(16),1105);assert.equal(b.readUInt32BE(20),1423);assert.equal(b[25],6);
});
test('default path and nonmatching queries keep the original signs',()=>{
 const a=fork();
 for(const search of ['', '?signs=off','?signs=pilotish']){
  a.run('window.location={search:'+JSON.stringify(search)+'}');
  a.trace.length=0;a.run('drawBakeryArchitecture();drawPlungeWayfinding()');
  assert.ok(labels(a).includes('MAIN DESCENT  ↓'));assert.ok(labels(a).includes('BONUS / DANGER  ↑'));
  assert.equal(a.run('plungeIndicatorArt'),null);
 }
});
test('loading, failed and malformed sign assets retain readable fallback signage',()=>{
 const a=fork();a.run("window.location={search:'?signs=pilot'}");
 for(const setup of ['plungeIndicatorReady()','plungeIndicatorArt.complete=true;plungeIndicatorArt.naturalWidth=0','plungeIndicatorArt.naturalWidth=64;plungeIndicatorArt.naturalHeight=64']){
  a.run(setup);a.trace.length=0;a.run('drawBakeryArchitecture();drawPlungeWayfinding()');
  assert.ok(labels(a).includes('MAIN DESCENT  ↓'));assert.ok(labels(a).includes('BONUS / DANGER  ↑'));
 }
});
test('loaded fork signs replace both text labels without mutating the world',()=>{
 const a=fork();ready(a);
 const state='JSON.stringify({player,map,gems,enemies,powerups,collected,checkpointState,myceliumState})';
 const before=a.run(state);a.trace.length=0;a.run('drawBakeryArchitecture();drawPlungeWayfinding()');
 assert.deepEqual(labels(a),[]);
 assert.equal(a.trace.filter(c=>c[0]==='drawImage').length,2);
 assert.equal(a.run(state),before);
 const sprite=a.trace.find(c=>c[0]==='drawImage'&&c[2]===0&&c[3]===0&&c[4]===1105);
 assert.deepEqual(sprite.slice(6),[61*32-70,31*32-250,140,180]);
});
test('fork art draws before all terrain, enemies and collectibles',()=>{
 const a=fork();ready(a);
 a.run('assets.environmentDecor.complete=true;assets.environmentDecor.naturalWidth=256;');
 a.trace.length=0;a.run('drawWorld()');
 const sign=a.trace.findIndex(c=>c[0]==='drawImage'&&c[4]===1105&&c[5]===1423);
 const tile=a.trace.findIndex(c=>c[0]==='drawImage'&&c[2]===128&&c[3]===128&&c[4]===64&&c[5]===64);
 assert.ok(sign>=0&&tile>sign);
});
test('new signage remains scoped to Bakery 2 even with a preview URL',()=>{
 const a=fork();ready(a);
 for(const stage of [1,3]){
  a.run('init('+stage+');camera=1650;cameraY=650;');
  a.trace.length=0;a.run('drawPlungeIndicatorArt();drawPlungeWayfinding()');
  assert.equal(a.trace.length,0);
 }
});
test('explicit scene preview starts on the real fork and preserves recipe storage',()=>{
 for(const mode of ['pilot','off']){
  const a=game({'crustQuestCodex':'[0]','crustQuestBest':'1234'});
  const before=JSON.stringify([...a.storage]);
  a.run('window.location={search:'+JSON.stringify('?scene=plunge&signs='+mode)+'};prepareWayfindingPreview();');
  assert.equal(a.run('bakery'),2);assert.equal(a.run('collected'),2);
  assert.equal(a.run('player.y+player.h'),31*32);assert.equal(a.run('contactSurface(player)'),31*32);
  assert.equal(a.run('myceliumState.solved'),true);assert.equal(a.run('checkpointState.current'),1);
  assert.equal(JSON.stringify([...a.storage]),before);
 }
 const a=game();a.run("window.location={search:'?scene=plunge'};prepareWayfindingPreview()");
 assert.equal(a.run('bakery'),1);assert.equal(a.run('collected'),0);
});
