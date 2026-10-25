const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
// This fixture exercises allocation, reuse and eviction; profile-fungal.cjs
// separately checks the same paths with real native canvas pixels.
class StampCanvas{
 constructor(width,height){this.width=width;this.height=height;
  this.brush=new Proxy({canvas:this,globalAlpha:1},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 }
 getContext(){return this.brush;}
}
function ready(){
 const a=game({}, {search:'?',globals:{OffscreenCanvas:StampCanvas}});
 a.run('init(2);assets.fungalEnvironment.complete=true;assets.fungalEnvironment.naturalWidth=1536;assets.fungalEnvironment.naturalHeight=1024;');return a;
}
const scenes=[[0,1252],[940,780],[1730,470],[1700,1130],[2400,1252],[0,1764]];
const scenery='drawFungalEnvironment();drawFungalPlatformBacking();drawFungalPlatformFaces()';
test('warm cavern scenery reuses bounded stamps without per-frame filters or allocations',()=>{
 const a=ready();
 for(const [x,y]of scenes){
  a.run(`camera=${x};cameraY=${y};${scenery}`);
  const misses=a.run('fungalStampCache.misses');a.trace.length=0;
  a.run(scenery);
  assert.equal(a.run('fungalStampCache.misses'),misses,'stationary frames allocate no stamps');
  assert.ok(a.trace.filter(c=>c[0]==='drawImage').length<40,`${x},${y}: bounded draw calls`);
  assert.equal(a.trace.filter(c=>c[0]==='set'&&c[1]==='filter'&&c[2]!=='none').length,0);
  assert.ok(a.run('fungalStampCache.pixels<=FUNGAL_STAMP_PIXELS&&fungalStampCache.entries.size<=128'));
 }
});
test('fully offscreen stems and cliffs submit no canvas operations and create no stamps',()=>{
 const a=ready();a.run('camera=0;cameraY=1252');a.trace.length=0;
 a.run('fungalStem(2400,600,1728,48,.5);fungalCliff(2400,600,64,1728,.5)');
 assert.equal(a.trace.length,0);assert.equal(a.run('fungalStampCache.entries.size'),0);
});
test('platform faces and backing perform zero tile reads on subsequent frames',()=>{
 const a=ready();
 a.run(`let mapReads=0;map=map.map(row=>new Proxy(row,{get(o,k){if(/^\\d+$/.test(String(k)))mapReads++;return o[k];}}));${scenery};mapReads=0;${scenery}`);
 assert.equal(a.run('mapReads'),0);
});
test('relay, cellar hatches, boss gates and restarts invalidate the geometry cache',()=>{
 const a=ready();a.run('fungalGeometryRuns();myceliumState.solved=true;syncMyceliumBloom()');
 assert.equal(a.run('fungalGeometryCache'),null);
 assert.ok(a.run("map.slice(28,35).every(row=>row[55]==='.')"));
 assert.ok(a.run('fungalGeometryRuns().surfaces.some(r=>r.x<=55&&r.x+r.w>55&&r.y===35)'));
 a.run('fungalGeometryRuns();player.x=10*32+34;player.y=54*32-player.h;player.ground=true;interactCavernExploration()');
 assert.equal(a.run('cavernExploration.opened.has(0)'),true);assert.equal(a.run('fungalGeometryCache'),null);
 assert.equal(a.run('fungalGeometryRuns().surfaces.some(r=>r.y===54&&r.x<=10&&r.x+r.w>10)'),false);
 a.run('bloomrotGate(84,true)');assert.equal(a.run('fungalGeometryCache'),null);
 assert.ok(a.run('fungalGeometryRuns().surfaces.some(r=>r.y===42&&r.x<=84&&r.x+r.w>84)'));
 a.run('bloomrotGate(84,true)');assert.notEqual(a.run('fungalGeometryCache'),null,'unchanged gates do not invalidate');
 a.run('bloomrotGate(84,false)');assert.equal(a.run('fungalGeometryCache'),null);
 a.run('fungalGeometryRuns();const priorGeometry=fungalGeometryCache;init(2);fungalGeometryRuns()');
 assert.equal(a.run('fungalGeometryCache===priorGeometry'),false);
});
test('stamp LRU stays bounded and rebuilds after source image replacement',()=>{
 const a=ready();
 a.run('camera=0;cameraY=0;for(let i=0;i<160;i++)fungalSprite(FUNGAL_ENVIRONMENT_CROPS.arch,0,0,180+i,.5)');
 assert.ok(a.run('fungalStampCache.pixels<=FUNGAL_STAMP_PIXELS&&fungalStampCache.entries.size<=128'));
 a.run('assets.fungalEnvironment={complete:true,naturalWidth:1536,naturalHeight:1024};fungalSprite(FUNGAL_ENVIRONMENT_CROPS.arch,0,0,200,.5)');
 assert.equal(a.run('fungalStampCache.entries.size'),1);
});
test('cached scenery does not mutate gameplay, audio or persistent progress',()=>{
 const a=ready(),snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,myceliumState,checkpointState,bloomrotState,unlocked})';
 const before=a.run(snapshot),storage=JSON.stringify([...a.storage]),audio=JSON.stringify(a.audio.effects);
 for(const [x,y]of scenes)a.run(`camera=${x};cameraY=${y};drawWorld();drawWorld()`);
 assert.equal(a.run(snapshot),before);assert.equal(JSON.stringify([...a.storage]),storage);assert.equal(JSON.stringify(a.audio.effects),audio);
});
