const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {game}=require('./game-harness.cjs');
function scene(name='clockwork',mode='pilot'){
 const a=game();a.run('window.location={search:'+JSON.stringify('?scene='+name+'&signs='+mode)+'};prepareWayfindingPreview();');return a;
}
function ready(a){a.run('clockworkIndicatorReady();clockworkIndicatorArt.complete=true;clockworkIndicatorArt.naturalWidth=1536;clockworkIndicatorArt.naturalHeight=1024;');}
function labels(a){return a.trace.filter(c=>c[0]==='fillText').map(c=>c[1]);}
function plates(a){const crops=JSON.parse(a.run('JSON.stringify(CLOCKWORK_ROUTE_CROPS)'));return a.trace.filter(c=>c[0]==='drawImage'&&crops.some(s=>JSON.stringify(s)===JSON.stringify(c.slice(2,6))));}
test('Clockwork plate atlas and all six source rectangles are valid',()=>{
 const b=fs.readFileSync(path.join(__dirname,'../art/clockwork-route-plates.png'));
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(b.readUInt32BE(16),1536);assert.equal(b.readUInt32BE(20),1024);assert.equal(b[25],6);
 const a=game();assert.equal(a.run('CLOCKWORK_ROUTE_CROPS.length'),6);
 for(const [x,y,w,h]of a.run('CLOCKWORK_ROUTE_CROPS'))assert.ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);
});
test('loaded Clockwork fork has two text-free plates with direction order matching the route',()=>{
 const a=scene();ready(a);a.trace.length=0;a.run('drawClockworkAscent()');
 assert.equal(plates(a).length,2);
 assert.ok(!labels(a).some(s=>s.includes('MAIN →')||s.includes('BONUS ↑')));
 assert.equal(plates(a)[0][7],28*32-170);assert.equal(plates(a)[1][7],28*32-90);
});
test('all three return plaques replace the original route labels without mutating gameplay state',()=>{
 const a=scene('clockwork-return');ready(a);
 const expr='JSON.stringify({map,player,gems,enemies,powerups,checkpointState,collected,devourerState})';
 const before=a.run(expr);a.trace.length=0;a.run('drawFinalDescent()');
 assert.equal(plates(a).length,3);assert.deepEqual(labels(a),[]);assert.equal(a.run(expr),before);
});
test('original Clockwork labels remain for off, loading, failed or malformed art',()=>{
 for(const mode of ['off','pilot']){
  const a=scene('clockwork',mode);
  for(const setup of ['',...(mode==='pilot'?['clockworkIndicatorArt.complete=true;clockworkIndicatorArt.naturalWidth=0','clockworkIndicatorArt.naturalWidth=64;clockworkIndicatorArt.naturalHeight=64']:[])]){
   if(setup)a.run(setup);a.trace.length=0;a.run('drawClockworkAscent()');
   assert.ok(labels(a).includes('MAIN → / CULTURES'));assert.ok(labels(a).includes('BONUS ↑ / DANGER'));
  }
 }
 const a=scene('clockwork-return','off');a.trace.length=0;a.run('drawFinalDescent()');
 for(const s of ['SERVICE STAIRS ←','CHECKPOINT ←','OVEN FLOOR ↓'])assert.ok(labels(a).includes(s));
});
test('Clockwork shortcuts use existing safe support, do not unlock recipes, and require exact opt-in parameters',()=>{
 for(const name of ['clockwork','clockwork-return']){
  const a=scene(name);
  assert.equal(a.run('bakery'),3);assert.equal(a.run('contactSurface(player)'),(name==='clockwork'?28:32)*32);
  assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
  assert.equal(a.run('devourerState.phase'), 'disguise');
  assert.equal(a.run('unlocked.length'),0);assert.equal(a.storage.size,0);
 }
 for(const query of ['?scene=clockwork','?scene=clockwork&signs=pilotish','?scene=clockwork-returning&signs=pilot']){
  const a=game();a.run('window.location={search:'+JSON.stringify(query)+'};prepareWayfindingPreview();');assert.equal(a.run('bakery'),1);
 }
});
test('Clockwork art is scoped to Bakery 3 and checkpoint rendering is unchanged',()=>{
 const a=scene();ready(a);
 for(const stage of [1,2]){a.run('init('+stage+')');assert.equal(a.run('clockworkIndicatorReady()'),false);}
 a.run('init(3);assets.checkpointFlags.complete=true;assets.checkpointFlags.naturalWidth=320;');
 a.run("window.location.search='?signs=off'");a.trace.length=0;a.run('drawCheckpoints()');const before=JSON.stringify(a.trace);
 a.run("window.location.search='?signs=pilot'");a.trace.length=0;a.run('drawCheckpoints()');assert.equal(JSON.stringify(a.trace),before);
});
