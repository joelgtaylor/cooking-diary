const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {game}=require('./game-harness.cjs');
function ready(g){g.run('assets.moonlitArchitecture.complete=true;assets.moonlitArchitecture.naturalWidth=1536;assets.moonlitArchitecture.naturalHeight=1024;');}
test('production architectural atlas and all reviewed crops are in bounds',()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'../art/moonlit-architecture.png'));
 assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);
 const g=game();
 for(const [x,y,w,h] of g.run('MOONLIT_ENVIRONMENT_CROPS')){
  assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1536&&y+h<=1024);
 }
});
test('new architecture is isolated to Bakery 1 and has a complete loading/error/off fallback',()=>{
 for(const stage of [1,2,3]){
  const g=game();g.run(`init(${stage})`);ready(g);
  assert.equal(g.run('!!moonlitEnvironmentReady()'),stage===1);
 }
 for(const setup of ['assets.moonlitArchitecture.complete=false','assets.moonlitArchitecture.naturalWidth=512',"window.location.search='?environment=off'",'window.__crustWorldArtEnabled=false']){
  const g=game();ready(g);g.run(setup);g.trace.length=0;
  assert.equal(g.run('!!moonlitEnvironmentReady()'),false);
  g.run('drawMoonlitEnvironment();drawMoonlitPlatformBacking();drawMoonlitPlatformFaces()');
  assert.equal(g.trace.length,0);
 }
});
test('new bright bridge edges match only contiguous authored one-way landings',()=>{
 const g=game();ready(g);g.run('camera=0;cameraY=0;');g.trace.length=0;
 // Check all sections at their real cameras, including the lower route.
 for(const [cx,cy] of [[0,1252],[760,850],[1540,430],[2400,1252]]){
  g.run(`camera=${cx};cameraY=${cy};drawMoonlitPlatformFaces()`);
 }
 const edges=g.trace.filter(c=>c[0]==='fillRect'&&c[4]===3);
 assert.ok(edges.length>0);
 for(const [,x,y,w] of edges){
  assert.equal(y%32,0);assert.equal(x%32,0);assert.equal(w%32,0);
  assert.ok(g.run(`map[${y/32}].slice(${x/32},${(x+w)/32}).every(c=>c==='=')`));
 }
});
test('drawing every section leaves gameplay, encounters, audio and persistence unchanged',()=>{
 const snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,checkpointState,foremanState,bloomrotState,devourerState})';
 const g=game();ready(g);
 for(const [cx,cy] of [[0,1252],[760,850],[1540,430],[2400,1252]]){
  g.run(`camera=${cx};cameraY=${cy};`);const before=g.run(snapshot);
  const storage=JSON.stringify([...g.storage]);const effects=JSON.stringify(g.audio.effects);
  g.run('drawWorld()');
  assert.equal(g.run(snapshot),before);assert.equal(JSON.stringify([...g.storage]),storage);
  assert.equal(JSON.stringify(g.audio.effects),effects);g.trace.length=0;
 }
});
test('enabled architectural rendering preserves a deterministic movement/combat simulation',()=>{
 const on=game(),off=game();off.run("window.location.search+='&environment=off'");ready(on);ready(off);
 for(let i=0;i<180;i++){
  for(const g of [on,off]){
   g.run(`keys={right:${i<110},jump:${i%60<20},shoot:${i%17<2}};update();drawWorld();`);
   g.trace.length=0;
  }
 }
 const snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,checkpointState,foremanState})';
 assert.equal(on.run(snapshot),off.run(snapshot));
 assert.deepEqual([...on.storage],[...off.storage]);assert.deepEqual(on.audio.effects,off.audio.effects);
});
test('section shortcuts pause for inspection and never grant progress or save recipes',()=>{
 for(const scene of ['courtyard','hall','towers','forecourt']){
  const g=game({}, {search:'?scene=environment-'+scene});
  assert.equal(g.run('bakery'),1);assert.equal(g.run('state'),'pause');
  assert.equal(g.run('collected'),0);assert.equal(g.storage.size,0);
 }
});
test('layout fitting adds only five one-way end cells and preserves all encounters and progression',()=>{
 const a=game(),b=game({}, {layoutFixture:'bakery1-environment-before-fitting.js'});
 const changes=[];
 for(let y=0;y<56;y++)for(let x=0;x<105;x++){
  const before=b.run(`map[${y}][${x}]`),after=a.run(`map[${y}][${x}]`);
  if(before!==after){assert.equal(before,'.');assert.equal(after,'=');changes.push([x,y]);}
 }
 assert.deepEqual(changes,[[72,27],[70,29],[61,33],[39,42],[32,45]]);
 for(const expr of ['enemies','gems','checkpointState','powerups','foremanGeometry()'])
  assert.equal(a.run(`JSON.stringify(${expr})`),b.run(`JSON.stringify(${expr})`));
 for(const r of a.run("moonlitPlatformRuns().filter(r=>moonlitPlatformKind(r.x,r.y)==='bridge')"))
  assert.equal(r.w%2,0);
});
test('architectural panels, tower faces and full/half truss bays retain source proportions',()=>{
 const {createHash}=require('node:crypto');
 const hash=createHash('sha256').update('art/moonlit-architecture.png').digest('hex');
 const g=game();ready(g);g.trace.length=0;
 for(const [cx,cy] of [[0,1252],[760,850],[1540,430],[2400,1252]])
  g.run(`camera=${cx};cameraY=${cy};drawMoonlitEnvironment();drawMoonlitPlatformBacking();drawMoonlitPlatformFaces()`);
 const images=g.trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===hash);
 assert.ok(images.length>20);
 for(const c of images){
  const sw=c[4],sh=c[5],dw=c[8],dh=c[9];
  assert.ok(Math.abs(dw/sw-dh/sh)<=1/Math.min(sw,sh),JSON.stringify(c));
 }
});
