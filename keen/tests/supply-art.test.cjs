const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');const {game}=require('./game-harness.cjs');
function gallery(mode='pilot'){const a=game();a.run('window.location={search:'+JSON.stringify('?scene=supplies&supplies='+mode)+'};prepareWayfindingPreview()');return a;}
function ready(a){a.run("drawSupplyPickup(powerups[0],powerups[0].y);supplyPickupArt.complete=true;supplyPickupArt.naturalWidth=1536;supplyPickupArt.naturalHeight=1024;");}
test('supply atlas source rectangles are valid and full/empty racks use identical dimensions',()=>{
 const b=fs.readFileSync(path.join(__dirname,'../art/supply-pickups.png'));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),1536);assert.equal(b.readUInt32BE(20),1024);assert.equal(b[25],6);
 const a=game();for(const s of a.run('Object.values(SUPPLY_PICKUP_SPRITES)')){const[x,y,w,h]=s.crop;assert.ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);}
 assert.equal(a.run('SUPPLY_PICKUP_SPRITES.ammo.w===SUPPLY_PICKUP_SPRITES.empty.w&&SUPPLY_PICKUP_SPRITES.ammo.h===SUPPLY_PICKUP_SPRITES.empty.h'),true);
});
test('supply art is opt-in and loading/failure preserves original rendering',()=>{
 const a=game();a.run('var supply={kind:"rye",x:100,y:100};');
 for(const query of ['?supplies=off','?supplies=pilotish']){a.run('window.location={search:'+JSON.stringify(query)+'}');assert.equal(a.run('drawSupplyPickup(supply,100)'),false);assert.equal(a.run('supplyPickupArt'),null);}
 a.run("window.location.search='?supplies=pilot'");assert.equal(a.run('drawSupplyPickup(supply,100)'),false);
 a.run('supplyPickupArt.complete=true;supplyPickupArt.naturalWidth=0');assert.equal(a.run('drawSupplyPickup(supply,100)'),false);
 a.run('supplyPickupArt.naturalWidth=64;supplyPickupArt.naturalHeight=64');assert.equal(a.run('drawSupplyPickup(supply,100)'),false);
});
test('supply rendering selects full/empty rack art and leaves cooldown/world state unchanged',()=>{
 const a=gallery();ready(a);a.run("var rack=powerups.find(u=>u.kind==='ammo')");
 for(const got of [false,true]){
  a.run('rack.got='+got+';rack.refreshT=180;');const before=a.run('JSON.stringify({player,powerups,collected,checkpointState})');
  a.trace.length=0;a.run('drawSupplyPickup(rack,rack.y)');
  const draw=a.trace.find(c=>c[0]==='drawImage');assert.equal(draw[2],got?524:12);assert.deepEqual(draw.slice(8),[40,28]);
  assert.equal(a.run('JSON.stringify({player,powerups,collected,checkpointState})'),before);
 }
});
test('five recharge segments track only the approved 300-tick cooldown',()=>{
 const a=game();assert.equal(a.run('supplyRechargeSegments({got:false})'),5);
 for(const [ticks,segments]of [[300,0],[240,1],[239,1],[180,2],[120,3],[60,4],[1,4],[0,5]]){
  const n=a.run('supplyRechargeSegments({got:true,refreshT:'+ticks+'})');
  assert.equal(n,segments);assert.equal(n===5,ticks===0);
 }
});
test('gallery uses real health, shield, one-use cache and replenishing ammo effects',()=>{
 const a=gallery();
 const collect=kind=>a.run('var item=powerups.find(u=>u.kind==='+JSON.stringify(kind)+');player.x=item.x-14;player.y=item.y-19;updatePickups();');
 collect('rye');assert.equal(a.run('player.health'),3);
 collect('banneton');a.run('damage()');assert.equal(a.run('player.shield'),false);assert.equal(a.run('player.health'),3);
 collect('cache');assert.equal(a.run('player.ammo'),25);assert.equal(a.run('player.score'),500);a.run('updatePickups()');assert.equal(a.run('player.score'),500);
 collect('ammo');assert.equal(a.run('player.ammo'),50);assert.equal(a.run('item.refreshT'),300);a.run('updatePickups()');assert.equal(a.run('player.ammo'),50);
 a.run('for(let i=0;i<300;i++)updateAmmoCaches();updatePickups();');assert.equal(a.run('player.ammo'),75);
});
test('both explicit supply scenes start safely without writing recipes or changing the real shelter supplies',()=>{
 for(const name of ['supplies','ammo']){
  const a=game();a.run('init(3)');const original=a.run('JSON.stringify(powerups)');
  a.run('window.location={search:'+JSON.stringify('?scene='+name+'&supplies=pilot')+'};prepareWayfindingPreview()');
  assert.equal(a.run('bakery'),3);assert.equal(a.run('contactSurface(player)'),54*32);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.storage.size,0);assert.equal(a.run('unlocked.length'),0);
  if(name==='ammo')assert.equal(a.run('JSON.stringify(powerups)'),original);
 }
 const a=game();a.run("window.location={search:'?scene=supplies'};prepareWayfindingPreview()");assert.equal(a.run('bakery'),1);
});
test('the supply audition leaves approved culture/kefir and checkpoint artwork untouched',()=>{
 const a=gallery();ready(a);a.run('var bottle={kind:"kefir",x:100,y:100}');assert.equal(a.run('drawSupplyPickup(bottle,100)'),false);
 a.run("window.location.search='?supplies=off';assets.checkpointFlags.complete=true;assets.checkpointFlags.naturalWidth=320");a.trace.length=0;a.run('drawCheckpoints()');const before=JSON.stringify(a.trace);
 a.run("window.location.search='?supplies=pilot'");a.trace.length=0;a.run('drawCheckpoints()');assert.equal(JSON.stringify(a.trace),before);
});
