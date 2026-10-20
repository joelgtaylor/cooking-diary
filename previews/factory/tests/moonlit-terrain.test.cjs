const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const terrainHash=createHash('sha256').update('art/moonlit-terrain.png').digest('hex');
function capture(stage,ready){
 const {run,trace}=game();
 run(`init(${stage});assets.moonlitTerrain.complete=${ready};assets.moonlitTerrain.naturalWidth=256;assets.moonlitTerrain.naturalHeight=96;`);
 trace.length=0;run('drawWorld()');
 return trace.filter(c=>c[0]==='drawImage'&&c[1]?.image===terrainHash);
}
test('moonlit terrain renders only in Bakery 1 after the complete atlas loads',()=>{
 assert.ok(capture(1,true).length>0);
 assert.equal(capture(1,false).length,0);
 assert.equal(capture(2,true).length,0);
 assert.equal(capture(3,true).length,0);
});
test('masonry fills solid cells and coping stays on the original collision surface',()=>{
 const draws=capture(1,true);
 const masonry=draws.filter(c=>c[3]===64);
 assert.ok(masonry.length>0);
 for(const c of masonry){assert.equal(c[8],32);assert.equal(c[9],32);}
 const coping=draws.filter(c=>c[3]===0);
 assert.ok(coping.length>0);
 for(const c of coping){assert.equal(c[7]%32,0);assert.equal(c[8],32);assert.equal(c[9],9);}
});
