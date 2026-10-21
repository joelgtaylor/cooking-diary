const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const scenes=[[0,1252],[940,780],[1730,470],[1700,1130],[2400,1252]];
function ready(g){g.run('assets.fungalEnvironment.complete=true;assets.fungalEnvironment.naturalWidth=1536;assets.fungalEnvironment.naturalHeight=1024;');}
test('fungal atlas and all reviewed architectural/texture crops are valid',()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'../art/fungal-environment.png'));
 assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);
 assert.equal(bytes[25],6); // RGBA; preserve the generated transparency.
 for(const [x,y,w,h] of game().run('Object.values(FUNGAL_ENVIRONMENT_CROPS)'))
  assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1536&&y+h<=1024);
});
test('new environment is isolated to Bakery 2, with complete loading/error/off fallbacks',()=>{
 for(const stage of [1,2,3]){
  const g=game();g.run(`init(${stage})`);ready(g);
  assert.equal(g.run('!!fungalEnvironmentReady()'),stage===2);
 }
 for(const setup of ['assets.fungalEnvironment.complete=false','assets.fungalEnvironment.naturalWidth=512',
  'assets.fungalEnvironment.naturalHeight=512',"window.location.search='?environment=off'",'window.__crustWorldArtEnabled=false']){
  const g=game();g.run('init(2)');ready(g);g.run(setup);g.trace.length=0;
  g.run('drawFungalDepthVeil();drawFungalEnvironment();drawFungalPlatformBacking();drawFungalPlatformFaces()');
  assert.equal(g.trace.length,0);
 }
});
test('every new bright landing line aligns with existing one-way map cells',()=>{
 const g=game();g.run('init(2)');ready(g);g.trace.length=0;
 for(const [cx,cy] of scenes)g.run(`camera=${cx};cameraY=${cy};drawFungalPlatformFaces()`);
 let color,count=0;
 for(const c of g.trace){
  if(c[0]==='set'&&c[1]==='fillStyle')color=c[2];
  if(c[0]!=='fillRect'||color!=='#c5f6f4')continue;
  const [,x,y,w,h]=c;count++;
  assert.equal(x%32,0);assert.equal(y%32,0);assert.equal(w%32,0);assert.equal(h,2);
  assert.ok(g.run(`map[${y/32}].slice(${x/32},${(x+w)/32}).every(c=>c==='=')`));
 }
 assert.ok(count>20);
});
test('full and cropped environment pieces keep source proportions in all five sections',()=>{
 const hash=createHash('sha256').update('art/fungal-environment.png').digest('hex');
 const g=game();g.run('init(2)');ready(g);g.trace.length=0;
 for(const [cx,cy] of scenes)g.run(`camera=${cx};cameraY=${cy};drawFungalEnvironment();drawFungalPlatformBacking();drawFungalPlatformFaces()`);
 const draws=g.trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===hash);
 assert.ok(draws.length>50);
 for(const c of draws){
  const [sx,sy,sw,sh]=c.slice(2,6),dw=c[8],dh=c[9];
  assert.ok(sx>=0&&sy>=0&&sx+sw<=1536&&sy+sh<=1024);
  assert.ok(Math.abs(dw/sw-dh/sh)<=1/Math.min(sw,sh),JSON.stringify(c));
 }
});
test('environment rendering cannot change collision, relay progress, enemies, boss or saved recipes',()=>{
 const g=game();g.run('init(2)');ready(g);
 const snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,myceliumState,checkpointState,bloomrotState,unlocked})';
 for(const [cx,cy] of scenes){
  g.run(`camera=${cx};cameraY=${cy}`);const before=g.run(snapshot);
  const storage=JSON.stringify([...g.storage]),audio=JSON.stringify(g.audio.effects);
  g.run('drawWorld()');assert.equal(g.run(snapshot),before);
  assert.equal(JSON.stringify([...g.storage]),storage);assert.equal(JSON.stringify(g.audio.effects),audio);
  g.trace.length=0;
 }
});
test('approved fungal movement/combat is identical with environment art on and off',()=>{
 const on=game({}, {search:'?'}),off=game({}, {search:'?environment=off'});
 for(const g of [on,off]){g.run('init(2)');ready(g);}
 for(let frame=0;frame<180;frame++)for(const g of [on,off]){
  g.run(`keys={right:${frame<115},jump:${frame%60<20},shoot:${frame%17<2}};update();drawWorld()`);
  g.trace.length=0;
 }
 const snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,myceliumState,checkpointState,bloomrotState})';
 assert.equal(on.run(snapshot),off.run(snapshot));assert.deepEqual([...on.storage],[...off.storage]);
 assert.deepEqual(on.audio.effects,off.audio.effects);
});
test('fungal section shortcuts start paused without granting puzzle, culture or recipe progress',()=>{
 for(const scene of ['foothills','grotto','canopy','plunge','bloomrot']){
  const g=game({}, {search:'?scene=environment-'+scene});
  assert.equal(g.run('bakery'),2);assert.equal(g.run('state'),'pause');
  assert.equal(g.run('collected'),0);assert.equal(g.run('myceliumState.solved'),false);
  assert.equal(g.storage.size,0);
 }
});
