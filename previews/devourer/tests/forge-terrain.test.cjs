const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const hash=createHash('sha256').update('art/forge-terrain.png').digest('hex');
function capture(stage,ready){
 const {run,trace}=game();
 run(`init(${stage});assets.forgeTerrain.complete=${ready};assets.forgeTerrain.naturalWidth=256;assets.forgeTerrain.naturalHeight=96;`);
 trace.length=0;run('drawWorld()');
 return trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===hash);
}
test('forge atlas is isolated to Bakery 3 and retains unloaded fallback rendering',()=>{
 assert.ok(capture(3,true).length>0);
 assert.equal(capture(3,false).length,0);
 assert.equal(capture(1,true).length,0);
 assert.equal(capture(2,true).length,0);
});
test('foundry ground fills solid cells and steel tread follows collision tops',()=>{
 const draws=capture(3,true),ground=draws.filter(c=>c[3]===64),tops=draws.filter(c=>c[3]===0);
 assert.ok(ground.length>0&&tops.length>0);
 for(const c of ground){assert.equal(c[8],32);assert.equal(c[9],32);}
 for(const c of tops){assert.equal(c[7]%32,0);assert.equal(c[8],32);assert.equal(c[9],7);}
});
