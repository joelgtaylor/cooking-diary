const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const scenes=[[0,1252],[800,850],[1640,400],[2400,750],[2400,1252]];
const artHash=name=>createHash('sha256').update('art/'+name+'.png').digest('hex');
function ready(g){g.run('assets.clockworkEnvironment.complete=true;assets.clockworkEnvironment.naturalWidth=1536;assets.clockworkEnvironment.naturalHeight=1024;');}
test('clockwork kit has transparent RGBA storage and in-bounds source crops',()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'../art/clockwork-environment.png'));
 assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);assert.equal(bytes[25],6);
 for(const [x,y,w,h] of game().run('Object.values(CLOCKWORK_ENVIRONMENT_CROPS)'))
  assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1536&&y+h<=1024);
});
test('new industrial art is Bakery 3 only and has full loading/error/disabled fallbacks',()=>{
 for(const stage of [1,2,3]){
  const g=game();g.run(`init(${stage})`);ready(g);
  assert.equal(g.run('!!clockworkEnvironmentReady()'),stage===3);
 }
 for(const setup of ['assets.clockworkEnvironment.complete=false','assets.clockworkEnvironment.naturalWidth=512',
  'assets.clockworkEnvironment.naturalHeight=512',"window.location.search='?environment=off'",'window.__crustWorldArtEnabled=false']){
  const g=game();g.run('init(3)');ready(g);g.run(setup);g.trace.length=0;
  g.run('drawClockworkDepthVeil();drawClockworkEnvironment();drawClockworkRoomBacking(currentVerticalLayout().entrance.room);drawClockworkPlatformBacking();drawClockworkPlatformFaces()');
  assert.equal(g.trace.length,0);
 }
});
test('flat metal landing edges match only existing authored one-way surfaces',()=>{
 const g=game();g.run('init(3)');ready(g);g.trace.length=0;
 for(const [cx,cy] of scenes)g.run(`camera=${cx};cameraY=${cy};drawClockworkPlatformFaces()`);
 let color,count=0;
 for(const c of g.trace){
  if(c[0]==='set'&&c[1]==='fillStyle')color=c[2];
  if(c[0]!=='fillRect'||color!=='#edcf9b')continue;
  const [,x,y,w,h]=c;count++;
  assert.equal(x%32,0);assert.equal(y%32,0);assert.equal(w%32,0);assert.equal(h,3);
  assert.ok(g.run(`map[${y/32}].slice(${x/32},${(x+w)/32}).every(c=>c==='=')`));
 }
 assert.ok(count>20);
});
test('decks, cropped ends, room panels and machinery keep their source proportions',()=>{
 const g=game();g.run('init(3)');ready(g);g.trace.length=0;
 for(const [cx,cy] of scenes)g.run(`camera=${cx};cameraY=${cy};drawClockworkEnvironment();drawFactoryEntrance();drawClockworkAscent();drawClockworkPlatformBacking();drawClockworkPlatformFaces()`);
 const draws=g.trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===artHash('clockwork-environment'));
 assert.ok(draws.length>50);
 for(const c of draws){
  const [sx,sy,sw,sh]=c.slice(2,6),dw=c[8],dh=c[9];
  assert.ok(sx>=0&&sy>=0&&sx+sw<=1536&&sy+sh<=1024);
  assert.ok(Math.abs(dw/sw-dh/sh)<=1/Math.min(sw,sh),JSON.stringify(c));
 }
});
test('rendering every industrial section preserves gameplay, encounter, audio and recipe state',()=>{
 const g=game();g.run('init(3)');ready(g);
 const snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,checkpointState,devourerState,unlocked})';
 for(const [cx,cy] of scenes){
  g.run(`camera=${cx};cameraY=${cy}`);const before=g.run(snapshot);
  const storage=JSON.stringify([...g.storage]),audio=JSON.stringify(g.audio.effects);
  g.run('drawWorld()');assert.equal(g.run(snapshot),before);
  assert.equal(JSON.stringify([...g.storage]),storage);assert.equal(JSON.stringify(g.audio.effects),audio);
  g.trace.length=0;
 }
});
test('Devourer attacks and oven release remain identical with the environment on and off',()=>{
 const on=game({}, {search:'?'}),off=game({}, {search:'?environment=off'});
 for(const g of [on,off]){
  g.run('init(3);checkpointState.current=3;resupplyDevourerCheckpoint();player.x=101*T;player.y=54*T-player.h;player.ground=true;camera=2400;cameraY=1252;');ready(g);
 }
 for(let frame=0;frame<240;frame++)for(const g of [on,off]){
  g.run('keys={};update();drawWorld()');g.trace.length=0;
 }
 const snapshot='JSON.stringify({map,player,gems,enemies,powerups,shots,collected,tick,checkpointState,devourerState})';
 assert.equal(on.run(snapshot),off.run(snapshot));
 for(const g of [on,off]){
  g.run("devourerState.health=0;devourerState.phase='defeated';devourerState.timer=0;devourerState.defeatAge=90;releaseDevourerOven(devourerState);");
  for(let i=0;i<48;i++){g.run('updateReleasedOven(devourerState);drawWorld()');g.trace.length=0;}
  assert.equal(g.run('devourerState.finishOven.landed'),true);
 }
 assert.equal(on.run(snapshot),off.run(snapshot));
 assert.deepEqual([...on.storage],[...off.storage]);assert.deepEqual(on.audio.effects,off.audio.effects);
});
test('all new industrial imagery stays behind the Devourer and its defeat posture',()=>{
 const g=game();g.run('init(3);camera=2400;cameraY=1252;assets.devourerForms.complete=true;assets.devourerForms.naturalWidth=2007;assets.devourerDefeated.complete=true;assets.devourerDefeated.naturalWidth=1536;');ready(g);
 for(const defeated of [false,true]){
  if(defeated)g.run("devourerState.health=0;devourerState.phase='defeated';devourerState.defeatAge=90;");
  g.trace.length=0;g.run('drawWorld()');
  const kit=g.trace.map((c,i)=>[c,i]).filter(([c])=>c[0]==='drawImage'&&c[1]?.image===artHash('clockwork-environment'));
  const actor=g.trace.findIndex(c=>c[0]==='drawImage'&&c[1]?.image===artHash(defeated?'devourer-defeated':'devourer-forms'));
  assert.ok(kit.length>0&&actor>kit.at(-1)[1]);
 }
});
test('industrial section shortcuts pause without progress, recipe or boss grants',()=>{
 for(const scene of ['boilerworks','shafts','skybridge','descent','ovenhall']){
  const g=game({}, {search:'?scene=environment-'+scene});
  assert.equal(g.run('bakery'),3);assert.equal(g.run('state'),'pause');assert.equal(g.run('collected'),0);
  assert.equal(g.run('devourerState.phase'),'disguise');assert.equal(g.storage.size,0);
 }
});
