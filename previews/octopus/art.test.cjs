const {test}=require('node:test'),assert=require('node:assert/strict');
const Art=require('./boss-art.js'),B=require('./master-of-deep.js');
test('sprite razor follows approved live sweep tip without changing boss state',()=>{
 const e=B.create(),p={x:230,y:290,w:58,h:26,inv:0,health:4};
 for(let i=0;i<400;i++){B.update(e,p);const before=JSON.stringify(e),pose=Art.pose(e);
  if(e.phase==='sweep')assert.deepEqual(pose.tip,{x:e.tipX,y:e.lane});assert.equal(JSON.stringify(e),before);
 }
});
test('all attack phases draw body, textured tentacle and grip sprites without vector limb drawing',()=>{
 for(const phase of ['observe','prepare','sweep','recover','defeat']){
  const e={...B.create(),phase,alive:phase!=='defeat',timer:20},calls=[],transforms=[];
  const g={save(){},restore(){},translate(){},transform(...a){transforms.push(a);},drawImage(...a){calls.push(a);}};
  Art.draw(g,e,{naturalWidth:2172},{naturalWidth:2172});assert.equal(calls.length,3);
  assert.equal(g.imageSmoothingEnabled,false);assert.ok(calls.every(c=>c.slice(1).every(Number.isFinite)));
  const hand=transforms[1];assert.ok(Math.abs(Math.hypot(hand[0],hand[1])-.22)<1e-10);
  assert.ok(Math.abs(Math.hypot(hand[2],hand[3])-.22)<1e-10);
 }
});
test('missing images reveal no vector fallback arm',()=>{
 const g={save(){},restore(){},drawImage(){throw Error('unloaded image drawn');}};
 Art.draw(g,B.create(),{naturalWidth:0},{naturalWidth:0});
});
