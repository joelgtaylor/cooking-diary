const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function ready(a){a.run('assets.moonlitArchitecture.complete=true;assets.moonlitArchitecture.naturalWidth=1536;assets.moonlitArchitecture.naturalHeight=1024;assets.moonlitTerrain.complete=true;assets.moonlitTerrain.naturalWidth=256;assets.moonlitTerrain.naturalHeight=96;');}
test('Moonlit architecture submits only visible masonry instead of the whole world',()=>{
 for(const [x,y,limit]of [[0,1252,220],[760,850,160],[1540,430,160],[2400,1252,500]]){
  const a=game();ready(a);a.run(`camera=${x};cameraY=${y}`);a.trace.length=0;
  a.run('drawMoonlitEnvironment();drawMoonlitPlatformFaces();drawMoonlitPlatformBacking()');
  const images=a.trace.filter(c=>c[0]==='drawImage');
  assert.ok(images.length<limit,`${x},${y}: ${images.length} draws`);
 }
});
test('fully offscreen buildings and masonry submit no drawing or filter operations',()=>{
 const a=game();ready(a);a.run('camera=0;cameraY=1252');a.trace.length=0;
 a.run('moonlitFacade(0,2000,100,256,900);moonlitMasonry(3000,0,64,1728)');
 assert.equal(a.trace.length,0);
});
test('partial masonry retains its original tile phase at fractional camera boundaries',()=>{
 const a=game();ready(a);a.run('camera=801.5;cameraY=1329.25');a.trace.length=0;
 a.run('moonlitMasonry(768,1280,256,448,.55)');
 const images=a.trace.filter(c=>c[0]==='drawImage');assert.ok(images.length>0);
 for(const c of images){
  const [sx,sy,sw,sh,x,y,w,h]=c.slice(2);
  assert.equal((x-768)%32,0);assert.equal((y-1280)%32,0);
  assert.equal(sx,((Math.floor(x/32)+Math.floor(y/32)*3)%8)*32);
  assert.equal(sy,64);assert.equal(sw,32);assert.equal(sh,32);assert.equal(w,32);assert.equal(h,32);
  assert.ok(x+32>800.5&&x<802.5+960&&y+32>1328.25&&y<1330.25+540);
 }
});
