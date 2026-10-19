const {test}=require('node:test');
const assert=require('node:assert/strict');
const {repairBakerPixels}=require('../sprite-repair.js');
function fixture(width,height){
 const data=new Uint8ClampedArray(width*height*4);
 return {data,set(x,y,color=[150,90,45,255]){data.set(color,(y*width+x)*4);}};
}
test('small interior pinholes become solid while all original opaque pixels remain exact',()=>{
 const {data,set}=fixture(8,8);
 for(let y=1;y<7;y++)for(let x=1;x<7;x++)set(x,y);
 set(3,3,[0,0,0,0]);set(4,3,[0,0,0,0]);
 const before=new Uint8ClampedArray(data),result=repairBakerPixels(data,8,8,8,8,[1]);
 assert.equal(result.repaired,2);assert.deepEqual(data,before);
 for(let p=0;p<data.length;p+=4)if(data[p+3])assert.deepEqual(result.pixels.slice(p,p+4),data.slice(p,p+4));
 assert.deepEqual([...result.pixels.slice((3*8+3)*4,(3*8+3)*4+4)],[150,90,45,255]);
 assert.equal(result.pixels[3],0);
});
test('exterior-connected limb gaps and large enclosed openings stay transparent',()=>{
 const {data,set}=fixture(16,16);
 for(let y=1;y<15;y++)for(let x=1;x<15;x++)set(x,y);
 for(let y=3;y<13;y++)for(let x=3;x<13;x++)set(x,y,[0,0,0,0]);
 assert.equal(repairBakerPixels(data,16,16,16,16,[1]).repaired,0);
 for(let y=0;y<=3;y++)set(7,y,[0,0,0,0]);
 assert.equal(repairBakerPixels(data,16,16,16,16,[1]).repaired,0);
});
test('pogo spring openings and unused atlas cells are preserved',()=>{
 const {data,set}=fixture(192,896);
 for(const ox of [0,96])for(let y=90;y<95;y++)for(let x=40;x<45;x++)set(ox+x,6*112+y);
 set(42,6*112+92,[0,0,0,0]);set(96+42,6*112+92,[0,0,0,0]);
 const result=repairBakerPixels(data,192,896,96,112,[0,0,0,0,0,0,1]);
 assert.equal(result.repaired,0);assert.deepEqual(result.pixels,data);
});
test('production loads the immutable repaired image without runtime canvas readback',()=>{
 const {game}=require('./game-harness.cjs');const {run}=game();
 assert.equal(run('assets.bakerAI.src'),'art/baker-ai-solid.png');
 assert.equal(run('assets.bakerAI.onload'),undefined);
 assert.doesNotMatch(require('node:fs').readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),/src="sprite-repair.js"/);
});
