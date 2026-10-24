const {test}=require('node:test'),assert=require('node:assert/strict');
const Art=require('./boss-art.js'),B=require('./master-of-deep.js');
test('sprite razor follows approved live sweep tip without changing boss state',()=>{
 const e=B.create(),p={x:230,y:290,w:58,h:26,inv:0,health:4};
 for(let i=0;i<400;i++){B.update(e,p);const before=JSON.stringify(e),pose=Art.pose(e);
  if(e.phase==='sweep')assert.deepEqual(pose.tip,{x:e.tipX,y:e.lane});assert.equal(JSON.stringify(e),before);
 }
});
test('generated inbetweens use one uniform scale, render behind body, and never stretch',()=>{
 const used=new Set();
 for(const phase of ['observe','prepare','sweep','recover'])for(let timer=1;timer<=100;timer++){
  const e={...B.create(),phase,alive:phase!=='defeat',timer,tipX:80+610*timer/100},calls=[];
  const g={save(){},restore(){},translate(){},rotate(){},beginPath(){},rect(){},clip(){},drawImage(...a){calls.push(a);}};
  const body={naturalWidth:2172},arm={naturalWidth:1452};Art.draw(g,e,body,arm);
  assert.equal(calls.length,2);assert.equal(calls[0][0],arm);assert.equal(calls[1][0],body);
  const c=calls[0];assert.equal(c[7]/c[3],Art.scale);assert.equal(c[8]/c[4],Art.scale);
  assert.equal(g.imageSmoothingEnabled,false);assert.ok(c.slice(1).every(Number.isFinite));used.add(Art.pose(e).arm);
 }
 assert.ok(used.size>=6,'attack must select distinct generated intermediate poses');
});
test('missing images reveal no vector fallback arm',()=>{
 const g={save(){},restore(){},drawImage(){throw Error('unloaded image drawn');}};
 Art.draw(g,B.create(),{naturalWidth:0},{naturalWidth:0});
});
test('defeat uses six generated poses, drops both tools and stays opaque on the final frame',()=>{
 const body={naturalWidth:2172},arm={naturalWidth:1452},defeat={naturalWidth:1536};
 for(const remaining of [240,210,175,130,80,0]){
  const e={...B.create(),alive:false,phase:'defeat',deathT:remaining},calls=[];
  const g={save(){},restore(){},translate(){},rotate(){},drawImage(...a){calls.push(a);}};
  Art.draw(g,e,body,arm,defeat);assert.equal(calls.length,3);assert.equal(calls[0][0],defeat);
  assert.ok(calls.every(c=>c.slice(1).every(Number.isFinite)));assert.equal(g.globalAlpha,undefined);
 }
});
