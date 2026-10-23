const {test}=require('node:test'),assert=require('node:assert/strict');
const crab=require('./pot-crab.js'),{pose}=require('./claw-animation.js');
test('visual grab matches every damaging tick and never changes the approved mechanics',()=>{
 const e=crab.create({x:832,y:896}),p={x:600,y:928,w:58,h:26,swimming:true};let warning=0,grab=0,retraction=0,lastReach=0;
 for(let i=0;i<172;i++){
  crab.update(e,p);const before=JSON.stringify(e),claw=pose(e);assert.equal(JSON.stringify(e),before);
  if(e.warning){warning++;assert.equal(claw.stage,'reach');assert.equal(claw.frame,0);assert.ok(claw.reach>=lastReach);lastReach=claw.reach;}
  if(e.jab){grab++;assert.equal(claw.stage,'grab');assert.equal(claw.reach,60);assert.ok(claw.frame>=1);}
  if(claw?.stage==='retract'){retraction++;assert.equal(e.jab,false);assert.ok(claw.reach<=60);}
 }
 assert.equal(warning,24);assert.equal(grab,12);assert.equal(retraction,14);
});
test('claws disappear after defeat and while pot is closed',()=>{
 for(const phase of ['shelter','rattle','tuck','defeat'])assert.equal(pose({alive:true,phase,timer:34}),null);
 assert.equal(pose({alive:false,phase:'open',timer:30}),null);
});
