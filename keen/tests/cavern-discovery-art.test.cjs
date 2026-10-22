const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');const{game}=require('./game-harness.cjs');
function level(){const a=game();a.run('init(2);camera=0;cameraY=1700');return a;}
function ready(a){a.run('cavernDistrictArtReady();cavernDistrictArt.complete=true;cavernDistrictArt.naturalWidth=1536;cavernDistrictArt.naturalHeight=1024');}
const imageHash=createHash('sha256').update('art/cavern-discovery-atlas.webp').digest('hex');
test('district atlas is an external lossless WebP and every source rectangle is bounded',()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'../art/cavern-discovery-atlas.webp'));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.includes(Buffer.from('VP8L')));
 const a=level();for(const[x,y,w,h]of a.run('Object.values(CAVERN_DISTRICT_CROPS)'))assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1536&&y+h<=1024);
});
test('new artwork is scoped to discovery layouts and has disabled, loading and malformed fallbacks',()=>{
 const a=level();assert.equal(a.run('cavernDistrictArtReady()'),false);ready(a);assert.equal(a.run('cavernDistrictArtReady()'),true);
 for(const expr of ['cavernDistrictArt.complete=false','cavernDistrictArt.naturalHeight=999','window.__crustWorldArtEnabled=false',"window.location.search='?districtArt=off'"]){
  const b=level();ready(b);b.run(expr);b.trace.length=0;assert.equal(b.run('drawCavernCellarArt(cavernDiscoveryLayout())'),false);assert.equal(b.trace.length,0);
 }
 for(const stage of [1,3]){a.run(`init(${stage})`);assert.equal(a.run('cavernDistrictArtReady()'),false);}
});
test('generated architecture keeps source proportions; lift plank remains on the live support height',()=>{
 const a=level();ready(a);a.trace.length=0;
 a.run('drawCavernDiscoveryBackdrop();camera=69*T;cameraY=44*T;drawCavernDiscoveryBackdrop();drawCavernExploration();drawCavernRelic({x:72,y:49,kind:"compass"},false);');
 const draws=a.trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===imageHash);assert.ok(draws.length>12);
 for(const c of draws){assert.ok(Math.abs(c[8]/c[9]-c[4]/c[5])<1e-9);assert.ok(c[2]+c[4]<=1536&&c[3]+c[5]<=1024);}
 const car=draws.find(c=>c[2]===781&&c[3]===220);assert.ok(car);assert.equal(car[7],54*32);
});
test('art draws never alter route, lift, pickups, persistence or the simulation clock; offscreen rooms are culled',()=>{
 const a=level();ready(a);const expr='JSON.stringify({player,map,collected,tick,checkpointState,lift:cavernExploration.liftY})',before=a.run(expr),storage=JSON.stringify([...a.storage]);
 a.run('drawCavernDiscoveryBackdrop();drawCavernExploration()');assert.equal(a.run(expr),before);assert.equal(JSON.stringify([...a.storage]),storage);
 a.trace.length=0;a.run('camera=0;cameraY=0;drawCavernDiscoveryBackdrop();drawCavernExploration()');assert.equal(a.trace.length,0);
});
