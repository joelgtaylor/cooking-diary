const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {game}=require('./game-harness.cjs');
test('pre-shaded masonry uses the original tile dimensions and preserves all nine tint choices',()=>{
 const a=game();const brightness=a.run('CrustMoonlitShading.terrainBrightness');
 assert.deepEqual(Array.from(brightness),[.92,.9,.55,.48,.58,.95,.5,.65,.8]);
 for(let i=0;i<brightness.length;i++){
  const bytes=fs.readFileSync(path.join(__dirname,`../art/moonlit-shade-${i}.png`));
  assert.equal(bytes.readUInt32BE(16),256);assert.equal(bytes.readUInt32BE(20),96);
 }
});
test('loaded masonry tints remove per-tile filters while retaining exact source phase',()=>{
 const a=game();a.run('assets.moonlitTerrain.complete=true;assets.moonlitTerrain.naturalWidth=256;assets.moonlitTerrain.naturalHeight=96;camera=2400;cameraY=1252;for(let i=0;i<9;i++){const t=assets["moonlitShadedTerrain"+i];t.complete=true;t.naturalWidth=256;t.naturalHeight=96;}');
 for(const brightness of [.5,.65,.8]){
  a.trace.length=0;a.run(`moonlitMasonry(87*T,45*T,8*T,9*T,${brightness})`);
  assert.ok(a.trace.some(c=>c[0]==='drawImage'));
  assert.ok(a.trace.filter(c=>c[0]==='set'&&c[1]==='filter').every(c=>c[2]==='none'));
  for(const c of a.trace.filter(c=>c[0]==='drawImage')){assert.equal(c[3],64);assert.equal(c[4],32);assert.equal(c[5],32);}
 }
});
test('loading, malformed and failed shaded images retain the working direct renderer',()=>{
 for(const setup of ['t.complete=false','t.naturalWidth=0','t.naturalHeight=32']){
  const a=game();a.run('camera=2400;cameraY=1252;assets.moonlitTerrain.complete=true;assets.moonlitTerrain.naturalWidth=256;assets.moonlitTerrain.naturalHeight=96;var t=assets.moonlitShadedTerrain6;t.complete=true;t.naturalWidth=256;t.naturalHeight=96;');a.run(setup);a.trace.length=0;
  a.run('moonlitMasonry(87*T,45*T,8*T,9*T,.5)');
  assert.ok(a.trace.some(c=>c[0]==='set'&&c[1]==='filter'&&c[2]==='brightness(0.5)'));
 }
});
test('frame monitor is opt-in and reports known frame and CPU timings without changing gameplay',()=>{
 let time=0,output=null;const c={window:{location:{search:'?perf=1'}},document:{createElement:()=>({style:{},setAttribute(){}}),getElementById:()=>({appendChild:e=>output=e})},performance:{now:()=>time},assets:{},bakery:1,state:'play'};
 vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../performance.js'),'utf8'),c);
 vm.runInContext('var monitor=createFrameMonitor()',c);
 for(let i=0;i<60;i++){c.now=i*1000/60;vm.runInContext('monitor.begin(now)',c);time+=2;vm.runInContext('monitor.end()',c);}
 assert.match(output.textContent,/60 FPS/);assert.match(output.textContent,/p95 16.7 ms/);assert.match(output.textContent,/CPU 2.0 ms/);
 c.window.location.search='';assert.equal(vm.runInContext('createFrameMonitor()',c),null);assert.equal(c.state,'play');
});
test('filtered architectural pieces are built once, bounded in memory, and invalidated on asset replacement',()=>{
 let builds=0,closed=0;
 class Surface{
  getContext(){return {filter:'none',drawImage(){builds++;}};}
  transferToImageBitmap(){return {close(){closed++;}};}
 }
 const a=game({}, {globals:{OffscreenCanvas:Surface}});
 a.run('assets.moonlitArchitecture.complete=true;assets.moonlitArchitecture.naturalWidth=1536;assets.moonlitArchitecture.naturalHeight=1024;camera=2400;cameraY=1252;');
 a.trace.length=0;a.run('moonlitPiece(2,91*T,43*T,12*T,11*T,.67);moonlitPiece(2,91*T,43*T,12*T,11*T,.67)');
 assert.equal(builds,1);assert.equal(a.trace.filter(c=>c[0]==='drawImage').length,2);
 assert.ok(a.trace.filter(c=>c[0]==='set'&&c[1]==='filter').every(c=>c[2]==='none'));
 a.run('assets.moonlitArchitecture={complete:true,naturalWidth:1536,naturalHeight:1024};moonlitPiece(2,91*T,43*T,12*T,11*T,.67)');
 assert.equal(builds,2);assert.equal(closed,1);
 a.run('for(let i=0;i<8;i++)moonlitPreparedPiece(MOONLIT_ENVIRONMENT_CROPS[0],.5+i*.01,512,512)');
 assert.ok(a.run('moonlitPiecePixels')<=1024*1024);assert.ok(closed>1);
});
